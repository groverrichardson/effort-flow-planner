
import { Token } from './TokenTypes';

// Process text for tokenization and highlighting
export const regexHighlighting = (text: string, geminiEntities: {people: string[], tags: string[]}) => {
  const allTokens: Token[] = [];
  let currentPosition = 0;

  const geminiMatches: { start: number; end: number; text: string; type: Token['type'] }[] = [];

  // 1. Collect all Gemini entity matches from the text
  if (geminiEntities.people && geminiEntities.people.length > 0) {
    for (const personName of geminiEntities.people) {
      const escapedPersonName = personName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const personRegex = new RegExp(`@${escapedPersonName}\\b`, 'gi');
      let match;
      while ((match = personRegex.exec(text)) !== null) {
        geminiMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: 'person',
        });
      }
    }
  }

  if (geminiEntities.tags && geminiEntities.tags.length > 0) {
    for (const tagName of geminiEntities.tags) {
      const escapedTagName = tagName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const tagRegex = new RegExp(`#${escapedTagName}\\b`, 'gi');
      let match;
      while ((match = tagRegex.exec(text)) !== null) {
        geminiMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: 'tag',
        });
      }
    }
  }

  // 2. Deduplicate and sort Gemini matches: by start position, then longer matches first
  let uniqueGeminiMatches = geminiMatches.filter((match, index, self) =>
    index === self.findIndex((m) => (
      m.start === match.start && m.end === match.end && m.type === match.type
    ))
  );
  uniqueGeminiMatches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.end - a.end; // Longer matches first if starts are the same
  });

  const tokenPatternsForSegments = [
    { regex: /#([^\s#@]+)/g, type: 'tag' },
    { regex: /@([^\s#@]+(?:\s+[^\s#@]+)*)/g, type: 'person' },
    { regex: /\b(high priority|normal priority|medium priority|low priority|lowest priority|urgent|important|not urgent|when you have time|whenever)\b/gi, type: 'priority' },
    { regex: /\b(tomorrow|today|next week|next month|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(st|nd|rd|th)?|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|due (tomorrow|today|next week|on|by|this) ?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)?|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi, type: 'date' },
    { regex: /\b((\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo)|(an?|one)\s*(minute|min|m|hour|hr|h|day|d|week|w|month|mo)|(a\s+)?(half\s+hour|half\s+day)|(a\s+)?(couple|few|several)\s*(hours?|hrs?|h|days?|d|weeks?|w)|(all\s+day|full\s+day|one\s+day|long\s+term|big\s+project))\b/gi, type: 'effort' }
  ];

  if (uniqueGeminiMatches.length === 0) {
    // 5. No Gemini entities, process entire text with all patterns
    allTokens.push(...processTextWithRegex(text, 0, tokenPatternsForSegments));
  } else {
    // 3. Iterate through sorted Gemini matches
    for (const geminiMatch of uniqueGeminiMatches) {
      // Process text segment *before* the current Gemini match (if any new text)
      if (geminiMatch.start > currentPosition) {
        const segment = text.substring(currentPosition, geminiMatch.start);
        if (segment.length > 0) {
          allTokens.push(...processTextWithRegex(segment, currentPosition, tokenPatternsForSegments));
        }
      }

      // Add the Gemini entity token itself, only if it's not already covered
      if (geminiMatch.start >= currentPosition) {
         allTokens.push({
            type: geminiMatch.type,
            value: geminiMatch.text,
            original: geminiMatch.text,
            start: geminiMatch.start,
            end: geminiMatch.end,
         });
         currentPosition = geminiMatch.end;
      } else if (geminiMatch.end > currentPosition) {
        // This handles cases where a shorter Gemini match (already sorted later)
        // might have been partially covered by segment processing of a longer one.
        // We effectively advance currentPosition to the end of the longest processed match.
        currentPosition = geminiMatch.end;
      }
    }

    // 4. Process any remaining text at the end
    if (currentPosition < text.length) {
      const segment = text.substring(currentPosition);
      if (segment.length > 0) {
        allTokens.push(...processTextWithRegex(segment, currentPosition, tokenPatternsForSegments));
      }
    }
  }
  
  // The processTextWithRegex function sorts its own results, and the main loop processes in order.
  // A final sort can ensure correctness if complex overlaps occur, but should ideally not be needed.
  allTokens.sort((a, b) => a.start - b.start);
  
  // Filter out fully duplicate tokens that might arise from Gemini + regex finding the same thing.
  const finalFilteredTokens = allTokens.filter((token, index, self) =>
    index === self.findIndex((t) => (
      t.start === token.start && t.end === token.end && t.type === token.type && t.value === token.value
    ))
  );

  return finalFilteredTokens;
};

// Helper function to process text with regex patterns
const processTextWithRegex = (text: string, startOffset: number, patterns: {regex: RegExp, type: string}[]) => {
  const tokens: Token[] = [];
  const matches: {start: number, end: number, text: string, type: string}[] = [];
  
  // Find all matches for all patterns
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index + startOffset,
        end: match.index + match[0].length + startOffset,
        text: match[0],
        type: pattern.type
      });
    }
  });
  
  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);
  
  // Process matches in order
  let lastEnd = startOffset;
  matches.forEach(match => {
    if (match.start > lastEnd) {
      // Add regular text token for text between matches
      tokens.push({
        type: 'text',
        value: text.substring(lastEnd - startOffset, match.start - startOffset),
        original: text.substring(lastEnd - startOffset, match.start - startOffset),
        start: lastEnd,
        end: match.start
      });
    }
    
    // Add the token
    tokens.push({
      type: match.type as Token['type'],
      value: match.text,
      original: match.text,
      start: match.start,
      end: match.end
    });
    
    lastEnd = match.end;
  });
  
  // Add any remaining text
  if (lastEnd < text.length + startOffset) {
    tokens.push({
      type: 'text',
      value: text.substring(lastEnd - startOffset),
      original: text.substring(lastEnd - startOffset),
      start: lastEnd,
      end: text.length + startOffset
    });
  }
  
  return tokens;
};
