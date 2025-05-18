
import { supabase } from "@/integrations/supabase/client";
import { Priority, EffortLevel } from '@/types';
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
}

// Helper function to use Gemini for enhanced parsing
export async function enhanceWithGemini(input: string): Promise<GeminiResponse | null> {
  try {
    console.log("Calling Gemini for final task submission...");
    const { data, error } = await supabase.functions.invoke('parse-natural-language', {
      body: { 
        text: input,
        isLiveTyping: false // This is a full submission
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

    console.log("Gemini extraction results:", data);
    return data as GeminiResponse;
  } catch (error) {
    console.error('Error in enhanceWithGemini:', error);
    return null;
  }
}

// Enhanced natural language task parser using Gemini
export const parseWithGemini = async (input: string) => {
  const taskData: any = {};
  let title = input;
  
  // Try to enhance with Gemini
  try {
    const enhancedData = await enhanceWithGemini(input);
    
    if (enhancedData) {
      console.log('Enhanced data from Gemini:', enhancedData);
      
      // Process people (full names supported through Gemini)
      if (enhancedData.people && enhancedData.people.length > 0) {
        // Limit to 2 people
        const limitedPeople = enhancedData.people.slice(0, 2);
        taskData.peopleNames = limitedPeople;
        
        // Remove the @mentions from the title
        limitedPeople.forEach(person => {
          const personWithAt = `@${person}`;
          const personRegex = new RegExp(personWithAt, 'gi');
          title = title.replace(personRegex, '').trim();
        });
      }
      
      // Process tags
      if (enhancedData.tags && enhancedData.tags.length > 0) {
        taskData.tagNames = enhancedData.tags;
        
        // Remove the hashtags from the title
        enhancedData.tags.forEach(tag => {
          const tagWithHash = `#${tag}`;
          const tagRegex = new RegExp(tagWithHash, 'gi');
          title = title.replace(tagRegex, '').trim();
        });
      }
      
      // Process priority
      const priority = mapPriority(enhancedData.priority);
      if (priority) {
        taskData.priority = priority;
        
        // Remove priority mentions from title
        const priorityRegex = new RegExp(`\\b(${enhancedData.priority} priority|${enhancedData.priority})\\b`, 'gi');
        title = title.replace(priorityRegex, '').trim();
      }
      
      // Process due date
      const dueDate = parseDateFromString(enhancedData.dueDate);
      if (dueDate) {
        taskData.dueDate = dueDate;
        
        // Remove due date mentions from title (this is a simplification, actual implementation would be more complex)
        if (enhancedData.dueDate) {
          const dueDateRegex = new RegExp(`\\bdue\\s+${enhancedData.dueDate}\\b|\\b${enhancedData.dueDate}\\b`, 'gi');
          title = title.replace(dueDateRegex, '').trim();
        }
      }
      
      // Process effort level
      const effortLevel = mapEffortLevel(enhancedData.effort);
      if (effortLevel) {
        taskData.effortLevel = effortLevel;
        
        // Remove effort mentions from title (also a simplification)
        if (enhancedData.effort) {
          const effortRegex = new RegExp(`\\b${enhancedData.effort}\\b`, 'gi');
          title = title.replace(effortRegex, '').trim();
        }
      }
    }

    // Clean up the title by removing extra spaces and trimming
    title = title.replace(/\s+/g, ' ').trim();
    taskData.title = title;
    
    // Add a description if the original input is significantly different from the title
    if (input.length > title.length + 10) {
      taskData.description = `Original input: ${input}`;
    }
    
    return taskData;
  } catch (error) {
    console.error('Error in Gemini parsing:', error);
    throw error;
  }
};
