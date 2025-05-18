
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-natural-language function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function callGeminiApi(text: string, apiKey: string, isLiveTyping = false) {
  try {
    // Optimize prompt based on request type
    const prompt = isLiveTyping 
      ? getLiveTypingPrompt(text)
      : getFullSubmissionPrompt(text);

    const maxTokens = isLiveTyping ? 256 : 1024;
    const temperature = isLiveTyping ? 0.1 : 0.2;

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
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
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: maxTokens,
        },
      }),
    });

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
      rawResponse: isLiveTyping ? null : textResponse, // Include full response only for final submissions
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Optimized prompt for live typing - focuses on parsing entities only
function getLiveTypingPrompt(text: string) {
  return `
    You are a task parsing assistant. Extract structured information from this text as the user is typing it.
    
    Text: "${text}"
    
    Extract only these entities in JSON format:
    1. People mentioned (with @ symbol): Extract full names after @ symbols (like @John Smith, @Mary Johnson). 
       Capture COMPLETE names with spaces (e.g. "@Kyle Dudley" should be extracted as "Kyle Dudley", not just "Kyle").
    2. Tags mentioned (with # symbol): Extract all hashtags (like #work, #personal).
    
    Return ONLY valid JSON in this format:
    {
      "people": ["Full Name 1", "Full Name 2"],
      "tags": ["tag1", "tag2"]
    }

    If any field is not found, use an empty array.
  `;
}

// Comprehensive prompt for final submission - extracts all entities in detail
function getFullSubmissionPrompt(text: string) {
  return `
    You are a task parser assistant. Extract structured information from the following task description.
    
    Task: "${text}"
    
    Extract the following information in JSON format:
    1. People mentioned (with @ symbol): Identify all full names after @ symbols (like @John Smith, @Mary Johnson). 
       Extract these as an array of complete names including all words until the next @ symbol, hashtag, or end of text.
       For example, in "@Kyle Dudley needs to review the report", extract "Kyle Dudley" as a complete name.
    2. Tags mentioned (with # symbol): Extract all hashtags (like #work, #personal).
    3. Priority level: High, Normal, Low, or Lowest.
    4. Due date or deadline: Any date or time reference. Be extremely thorough in finding date references like "next Friday", "tomorrow", "next Tuesday", etc. 
       Always pay special attention to phrases with "next" followed by a day of the week.
    5. Effort level: Extract mentions of time effort (quick, 30 minutes, few hours, day, week, etc.)

    Return ONLY valid JSON in this format:
    {
      "people": ["Full Name 1", "Full Name 2"],
      "tags": ["tag1", "tag2"],
      "priority": "high|normal|low|lowest",
      "dueDate": "extracted date string or null",
      "effort": "extracted effort or null"
    }

    If any field is not found, use null or an empty array as appropriate.
    
    IMPORTANT: Pay special attention to date phrases like "next Friday" or any day of the week with "next" before it,
    as these are critical due date indicators that must be captured accurately.
  `;
}
