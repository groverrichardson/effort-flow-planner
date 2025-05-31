
import { parseWithGemini } from './natural-language/geminiParser';
import { parseWithTraditional } from './natural-language/traditionalParser';
import { debounce } from './natural-language/parserUtils';
import { ParsedTaskDetails } from '../types'; // Added import

// Main entry point for natural language parsing
export const naturalLanguageToTask = async (input: string, isLiveTyping: boolean = false): Promise<ParsedTaskDetails | null> => {
  try {
    // First try the Gemini-enhanced parsing
    const enhancedTaskData = await parseWithGemini(input, isLiveTyping);
    return enhancedTaskData;
  } catch (error) {
    console.error('Error in enhanced parsing, falling back to traditional parsing:', error);
    // Fall back to traditional parsing if Gemini fails
    return parseWithTraditional(input);
  }
};

// Re-export the debounce utility function
export { debounce };
