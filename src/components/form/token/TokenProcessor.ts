
import { Token } from './TokenTypes';

// Process text for tokenization and highlighting
export const regexHighlighting = (text: string, geminiEntities: {people: string[], tags: string[]}) => {
  const newTokens: Token[] = [];
  let currentPosition = 0;
  
  // First, handle Gemini entities for more accurate highlighting
  if (geminiEntities.people && geminiEntities.people.length > 0) {
    for (const personName of geminiEntities.people) {
      const personPattern = new RegExp(`@${personName}\\b`, 'i');
      const match = text.match(personPattern);
      
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + match[0].length;
        
        // Add text before the entity if needed
        if (start > currentPosition) {
          newTokens.push({
            type: 'text',
            value: text.substring(currentPosition, start),
            original: text.substring(currentPosition, start),
            start: currentPosition,
            end: start
          });
        }
        
        // Add the entity token
        newTokens.push({
          type: 'person',
          value: match[0],
          original: match[0],
          start: start,
          end: end
        });
        
        currentPosition = end;
      }
    }
  }
  
  if (geminiEntities.tags && geminiEntities.tags.length > 0) {
    for (const tagName of geminiEntities.tags) {
      const tagPattern = new RegExp(`#${tagName}\\b`, 'i');
      const match = text.match(tagPattern);
      
      if (match && match.index !== undefined) {
        const start = match.index;
        const end = start + match[0].length;
        
        // Add text before the entity if needed
        if (start > currentPosition) {
          newTokens.push({
            type: 'text',
            value: text.substring(currentPosition, start),
            original: text.substring(currentPosition, start),
            start: currentPosition,
            end: start
          });
        }
        
        // Add the entity token
        newTokens.push({
          type: 'tag',
          value: match[0],
          original: match[0],
          start: start,
          end: end
        });
        
        currentPosition = end;
      }
    }
  }

  // Then match all other tokens with regex for the rest of the text
  const tokenPatterns = [
    // Tags (#tag)
    { 
      regex: /#([^\s#@]+)/g, 
      type: 'tag' 
    },
    // People (@person - improved to handle full names better)
    { 
      regex: /@([^\s#@]+(?:\s+[^\s#@]+)*)/g,
      type: 'person' 
    },
    // Priority keywords
    { 
      regex: /\b(high priority|normal priority|medium priority|low priority|lowest priority|urgent|important|not urgent|when you have time|whenever)\b/gi, 
      type: 'priority' 
    },
    // Date keywords
    { 
      regex: /\b(tomorrow|today|next week|next month|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(st|nd|rd|th)?|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|due (tomorrow|today|next week|on|by|this) ?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)?|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi, 
      type: 'date' 
    },
    // Effort keywords
    { 
      regex: /\b(5 minutes|15 minutes|30 minutes|half hour|couple hours|few hours|all day|one day|full day|this week|several days|couple weeks|few weeks|month|long term|big project)\b/gi, 
      type: 'effort' 
    }
  ];
  
  // Handle remaining text with regex patterns
  if (currentPosition < text.length) {
    const remainingText = text.substring(currentPosition);
    const remainingTokens = processTextWithRegex(remainingText, currentPosition, tokenPatterns);
    newTokens.push(...remainingTokens);
  }
  
  return newTokens;
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
