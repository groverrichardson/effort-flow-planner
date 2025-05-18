import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { debounce } from '@/utils/natural-language/parserUtils';
import { GeminiResponse } from './TokenTypes';

export const useGeminiHighlighting = (value: string) => {
  const [isGeminiProcessing, setIsGeminiProcessing] = useState(false);
  const [geminiEntities, setGeminiEntities] = useState<{people: string[], tags: string[]}>({people: [], tags: []});

  // Create a debounced version of the Gemini call
  const debouncedGeminiCall = useCallback(
    debounce(async (inputText: string) => {
      if (!inputText || inputText.length < 3) {
        return;
      }
      
      // If no @ or # symbols, don't bother calling Gemini during live typing
      if (!inputText.includes('@') && !inputText.includes('#')) {
        return;
      }
      
      try {
        setIsGeminiProcessing(true);
        console.log("Calling Gemini for live suggestions...");
        
        const { data, error } = await supabase.functions.invoke('parse-natural-language', {
          body: { 
            text: inputText,
            isLiveTyping: true 
          },
        });

        if (error) {
          console.error("Error calling Gemini during typing:", error);
          return;
        }
        
        if (data && data.success) {
          console.log("Received Gemini live suggestions:", data);
          setGeminiEntities({
            people: data.people || [],
            tags: data.tags || []
          });
        }
      } catch (err) {
        console.error("Exception in live Gemini processing:", err);
      } finally {
        setIsGeminiProcessing(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  // Trigger Gemini processing on specific events
  useEffect(() => {
    // Call when value changes and has @ or # symbol
    if (value && (value.includes('@') || value.includes('#'))) {
      debouncedGeminiCall(value);
    }
  }, [value, debouncedGeminiCall]);

  return { isGeminiProcessing, geminiEntities };
};

export default useGeminiHighlighting;
