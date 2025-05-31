
import { supabase } from "@/integrations/supabase/client";
import { Priority, EffortLevel, ParsedTaskDetails } from '@/types';
import { 
  parseDateFromString,
  mapEffortLevel,
  mapPriority 
} from './parserUtils';

export interface GeminiResponse {
  success: boolean;
  people: string[];
  tags: string[];
  priority: string | null;
  dueDate: string | null;
  effort: string | null;
  originalDatePhrase: string | null;
  taskTitle: string | null; 
}

// Helper function to use Gemini for enhanced parsing
export async function enhanceWithGemini(input: string, isLiveTyping: boolean = false): Promise<GeminiResponse | null> {
  try {
    const requestType = isLiveTyping ? "live typing update" : "final task submission";
    console.log(`Calling Gemini for ${requestType}...`);
    const { data, error } = await supabase.functions.invoke('parse-natural-language', {
      body: { 
        text: input,
        isLiveTyping: isLiveTyping // Pass the flag here
      },
    });

    if (error) {
      console.error('Error calling parse-natural-language function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Parse function unsuccessful:', data);
      return null;
    }

    console.log("Gemini function raw output:", data);

    if (data.rawResponse && typeof data.rawResponse === 'string') {
      console.log('>>> DEBUG: enhanceWithGemini - data.rawResponse before replace:', JSON.stringify(data.rawResponse)); // Log the exact string
      try {
        // The rawResponse is a string that might be wrapped in ```json ... ```
        // Regex explained: 
        // ^```json\s* : Matches starting ```json followed by any whitespace (including newlines)
        // |             : OR
        // \s*```\s*$   : Matches optional whitespace, then ```, then any trailing whitespace (including newlines) at the end
        const jsonString = data.rawResponse.replace(/^```json\s*|\s*```\s*$/g, '');
        const parsedRawResponse = JSON.parse(jsonString);

        // Combine the parsed rawResponse with other top-level fields from data
        const result: GeminiResponse = {
          success: data.success !== undefined ? data.success : parsedRawResponse.success,
          people: parsedRawResponse.people || data.people || [],
          tags: parsedRawResponse.tags || data.tags || [],
          priority: parsedRawResponse.priority || data.priority || null,
          dueDate: parsedRawResponse.dueDate || data.dueDate || null,
          effort: parsedRawResponse.effort || data.effort || null,
          originalDatePhrase: parsedRawResponse.originalDatePhrase || null,
          taskTitle: parsedRawResponse.taskTitle || null,
        };
        console.log("Processed GeminiResponse to be returned:", result);
        return result;
      } catch (parseError) {
        console.error('Error parsing rawResponse from Gemini function:', parseError);
        // Fallback for parsing error. Return a GeminiResponse-like object.
        return {
          success: data.success || false,
          people: data.people || [],
          tags: data.tags || [],
          priority: data.priority || null,
          dueDate: data.dueDate || null,
          effort: data.effort || null,
          originalDatePhrase: null,
          taskTitle: null,
        } as GeminiResponse;
      }
    } else {
      console.error('rawResponse is missing or not a string in Gemini function output.');
      // Fallback for missing/bad rawResponse. Return a GeminiResponse-like object.
      return {
        success: data.success || false,
        people: data.people || [],
        tags: data.tags || [],
        priority: data.priority || null,
        dueDate: data.dueDate || null,
        effort: data.effort || null,
        originalDatePhrase: null,
        taskTitle: null,
      } as GeminiResponse;
    }
    // NOTE: The main function's 'catch' block and closing '}' are outside this replaced content.
  } catch (error) {
    console.error('Error in enhanceWithGemini:', error);
    return null;
  }
}

// Enhanced natural language task parser using Gemini
export const parseWithGemini = async (input: string, isLiveTyping: boolean = false): Promise<ParsedTaskDetails | null> => {
  const taskData: Partial<ParsedTaskDetails> = {};
  let title = input; 
  let geminiCleanedTitleUsed = false;
  
  // Try to enhance with Gemini
  try {
    const enhancedData = await enhanceWithGemini(input, isLiveTyping);
    
    if (enhancedData) {
      console.log('Enhanced data from Gemini (raw object):', enhancedData);
      console.log('>>> DIAGNOSTIC: Gemini raw dueDate string:', enhancedData.dueDate);
      console.log('>>> PARSER CHECK: enhancedData.taskTitle:', enhancedData.taskTitle);
      console.log('>>> PARSER CHECK: enhancedData.originalDatePhrase:', enhancedData.originalDatePhrase);

      // Use Gemini's cleaned title if available (only for final submission)
      if (!isLiveTyping && enhancedData.taskTitle && enhancedData.taskTitle.trim() !== "") {
        title = enhancedData.taskTitle.trim();
        taskData.title = title;
        geminiCleanedTitleUsed = true;
        console.log('Using Gemini-cleaned title:', title);
      } else if (isLiveTyping) {
        // For live typing, the primary title is the input itself, as we don't ask Gemini to clean it.
        // We are mostly interested in entities like originalDatePhrase, people, tags.
        taskData.title = input; 
      } else {
        // Fallback if not live typing and Gemini title is not available
        taskData.title = input;
      }

      // Capture originalDatePhrase for potential UI use (e.g., pills)
      if (enhancedData.originalDatePhrase) {
        taskData.originalDatePhrase = enhancedData.originalDatePhrase;
      }
      
      // Process people (full names supported through Gemini)
      if (enhancedData.people && enhancedData.people.length > 0) {
        // Limit to 2 people
        const limitedPeople = enhancedData.people.slice(0, 2);
        taskData.peopleNames = limitedPeople;
        
        // Remove the @mentions from the title IF Gemini's title wasn't used
        if (!geminiCleanedTitleUsed) {
          limitedPeople.forEach(person => {
            const personWithAt = `@${person}`;
            const personRegex = new RegExp(personWithAt.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'gi'); // Escape special characters
            title = title.replace(personRegex, '').trim();
          });
        }
      }
      
      // Process tags
      if (enhancedData.tags && enhancedData.tags.length > 0) {
        taskData.tagNames = enhancedData.tags;
        
        // Remove the hashtags from the title IF Gemini's title wasn't used
        if (!geminiCleanedTitleUsed) {
          enhancedData.tags.forEach(tag => {
            const tagWithHash = `#${tag}`;
            // No need to escape # for regex in this simple case, but good practice for complex patterns
            const tagRegex = new RegExp(tagWithHash.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'gi'); 
            title = title.replace(tagRegex, '').trim();
          });
        }
      }
      
      // Process priority
      const priority = mapPriority(enhancedData.priority);
      if (priority) {
        taskData.priority = priority;
        
        // Remove priority mentions from title IF Gemini's title wasn't used
        if (!geminiCleanedTitleUsed && enhancedData.priority) {
          const priorityPattern = `\\b(${enhancedData.priority}(\\s+priority)?)\\b`;
          const priorityRegex = new RegExp(priorityPattern, 'gi');
          title = title.replace(priorityRegex, '').trim();
        }
      }
      
      // Process due date
      const dueDate = parseDateFromString(enhancedData.dueDate);
      if (dueDate) {
        taskData.dueDate = dueDate;
        
        // Remove originalDatePhrase from title IF Gemini's title wasn't used and originalDatePhrase exists
        if (!geminiCleanedTitleUsed && enhancedData.originalDatePhrase) {
          // Escape special characters in originalDatePhrase for use in regex
          const escapedDatePhrase = enhancedData.originalDatePhrase.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
          const datePhraseRegex = new RegExp(escapedDatePhrase, 'gi');
          title = title.replace(datePhraseRegex, '').trim();
        }
      }
      
      // Process effort level
      console.log('[geminiParser] Raw effort string from Gemini:', enhancedData.effort); // DEBUG LOG
      const effortLevel = mapEffortLevel(enhancedData.effort);
      console.log('[geminiParser] Calculated EffortLevel from mapEffortLevel:', effortLevel); // DEBUG LOG
      if (effortLevel) {
        taskData.effortLevel = effortLevel;
        
        // Remove effort mentions from title IF Gemini's title wasn't used
        if (!geminiCleanedTitleUsed && enhancedData.effort) {
          const effortPattern = `\\b${enhancedData.effort}\\b`;
          const effortRegex = new RegExp(effortPattern, 'gi');
          title = title.replace(effortRegex, '').trim();
        }
      }
    }

    // If Gemini's title wasn't used, do final cleanup on manually adjusted title.
    // If Gemini's title WAS used, it's already in taskData.title.
    if (!geminiCleanedTitleUsed) {
      title = title.replace(/\s+/g, ' ').trim();
      taskData.title = title;
    }
    // Ensure title is set if it somehow became empty and Gemini's title was primary
    if (geminiCleanedTitleUsed && (!taskData.title || taskData.title.trim() === "")) {
       taskData.title = input; // Fallback to original input if gemini's clean title was empty
    }
    
    // Add a description if the original input is significantly different from the title
    if (input.length > title.length + 10) {
      taskData.description = `Original input: ${input}`;
    }
    
    return taskData as ParsedTaskDetails;
  } catch (error) {
    console.error('Error in Gemini parsing:', error);
    return null;
  }
};
