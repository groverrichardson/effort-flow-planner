import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
};
// Request handler
serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders,
        });
    }
    try {
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not found');
        }
        const { text, isLiveTyping = false } = await req.json();
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text field is required');
        }
        const requestType = isLiveTyping ? 'live typing' : 'final submission';
        console.log(`Parsing text with Gemini (${requestType}): ${text}`);
        // Call Gemini API to extract entities with optimized settings based on request type
        const response = await callGeminiApi(text, geminiApiKey, isLiveTyping);
        return new Response(JSON.stringify(response), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error in parse-natural-language function:', error);
        return new Response(
            JSON.stringify({
                error: error.message,
                success: false,
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            }
        );
    }
});
async function callGeminiApi(text, apiKey, isLiveTyping = false) {
    try {
        // Optimize prompt based on request type
        const prompt = isLiveTyping
            ? getLiveTypingPrompt(text)
            : getFullSubmissionPrompt(text);
        const maxTokens = isLiveTyping ? 256 : 1024;
        const temperature = isLiveTyping ? 0.1 : 0.2;
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: temperature,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: maxTokens,
                    },
                }),
            }
        );
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            throw new Error(`Gemini API error: ${response.status}`);
        }
        const data = await response.json();
        // Extract the JSON from the response
        const textResponse = data.candidates[0]?.content?.parts?.[0]?.text;
        if (!textResponse) {
            throw new Error('Invalid response from Gemini API');
        }
        // Extract JSON content from the response
        let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from Gemini response');
        }
        const extractedJson = JSON.parse(jsonMatch[0]);
        // Ensure the response has the expected format
        return {
            success: true,
            people: extractedJson.people || [],
            tags: extractedJson.tags || [],
            priority: extractedJson.priority || null,
            dueDate: extractedJson.dueDate || null,
            effort: extractedJson.effort || null,
            rawResponse: textResponse, // Always return the raw response string
        };
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}
// Optimized prompt for live typing - focuses on parsing entities only
function getLiveTypingPrompt(text) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDateYYYYMMDD = `${year}-${month}-${day}`;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[now.getDay()];
    const fullCurrentDateInfo = `${dayName}, ${currentDateYYYYMMDD}`;

    return `
    You are a task parsing assistant. As the user types, quickly extract key entities from the text.
    
    Current Date: ${fullCurrentDateInfo}
    Text (potentially incomplete as user is typing): "${text}"
    
    Extract the following in JSON format:
    1. People mentioned (e.g., @JohnSmith): Extract full names after @.
    2. Tags mentioned (e.g., #project): Extract all hashtags.
    3. Date Phrase (originalDatePhrase): Identify any phrase that refers to a date or deadline (e.g., "next Friday", "tomorrow", "June 15th", "the last friday of this month"). Extract it *exactly* as it appears. If multiple date-like phrases appear, pick the most complete or longest one that seems like a distinct due date.
    4. Due Date (dueDate): If an 'originalDatePhrase' is found, you MAY attempt to convert it to 'YYYY-MM-DD' format. If unsure or cannot convert, 'dueDate' MUST be null. Accurate 'originalDatePhrase' is most important.

    Return ONLY valid JSON in this format (ensure 'originalDatePhrase' and 'dueDate' are null if not found, not empty strings):
    {
      "people": ["FullName1", "FullName2"],
      "tags": ["tag1", "tag2"],
      "originalDatePhrase": "the exact phrase identified or null",
      "dueDate": "YYYY-MM-DD or null"
    }

    Prioritize speed and extracting 'originalDatePhrase' accurately. Do not extract priority, effort, or attempt to clean a taskTitle for this live typing request.
    If a field is not found, use null for 'originalDatePhrase' and 'dueDate', and an empty array [] for 'people' and 'tags'.
  `;
}
// Comprehensive prompt for final submission - extracts all entities in detail
function getFullSubmissionPrompt(text) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDateYYYYMMDD = `${year}-${month}-${day}`;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[now.getDay()];
    const fullCurrentDateInfo = `${dayName}, ${currentDateYYYYMMDD}`;
    return `
    You are a task parser assistant. Extract structured information from the following task description.
    
    Task: "${text}"
    
    Extract the following information in JSON format:
    1. People mentioned (with @ symbol): Identify all full names after @ symbols (like @John Smith, @Mary Johnson). 
       Extract these as an array of complete names including all words until the next @ symbol, hashtag, or end of text.
       For example, in "@Kyle Dudley needs to review the report", extract "Kyle Dudley" as a complete name.
    2. Tags mentioned (with # symbol): Extract all hashtags (like #work, #personal).
    3. Priority level: High, Normal, Low, or Lowest.
    4. Date Information:
       - Primary Task: Identify any phrase in the task description that refers to a date or deadline (e.g., "next Friday", "tomorrow", "June 15th", "the last friday of this month").
       - Output 'originalDatePhrase': If such a phrase is found, extract it *exactly* as it appears in the input and place it in the 'originalDatePhrase' field. Example: if input is 'call mom next Friday at 3pm', originalDatePhrase MUST be 'next Friday at 3pm'. If no date phrase is identified, 'originalDatePhrase' MUST be null.
       - Output 'dueDate': You MAY attempt to convert the 'originalDatePhrase' to a 'YYYY-MM-DD' format for the 'dueDate' field using the current date ${fullCurrentDateInfo} for relative calculations. If you are unsure or cannot convert, 'dueDate' MUST be null. Accurate 'originalDatePhrase' is more important than 'dueDate'.
       Examples of 'originalDatePhrase' extraction:
         - Input: "finish report by last Friday of this month", originalDatePhrase: "last Friday of this month"
         - Input: "meeting on June 10th", originalDatePhrase: "June 10th"
         - Input: "submit tomorrow", originalDatePhrase: "tomorrow"
    5. Effort level: Extract mentions of time effort (quick, 30 minutes, few hours, day, week, etc.)

    Return ONLY valid JSON in this format:
    {
      "people": ["Full Name 1", "Full Name 2"],
      "tags": ["string"],
    "effort": "string or null",
    "priority": "High | Normal | Low | Lowest",
    "dueDate": "YYYY-MM-DD or null if no date is found",
    "originalDatePhrase": "The exact text segment identified as the date phrase (e.g., 'next Friday', 'the last friday of this month') or null if no date phrase is found.",
    "taskTitle": "The essential task description. CRITICAL: From the original task input, you MUST remove the text that you placed in 'originalDatePhrase'. Also remove any identified people (full names after @) and tags (words starting with #). The result is the taskTitle. It should be clean and concise.",
    "success": true
  }

    If any field is not found, use null or an empty array as appropriate for that field.
    
    IMPORTANT: Pay special attention to date phrases like "next Friday" or any day of the week with "next" before it,
    as these are critical due date indicators that must be captured accurately.
  `;
}
