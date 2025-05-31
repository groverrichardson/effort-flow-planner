
import React from 'react';
import { Token } from './TokenTypes';

interface TokenHighlighterProps {
  tokens: Token[];
}

const TokenHighlighter: React.FC<TokenHighlighterProps> = ({ tokens }) => {
  // Get token color based on type
  const getTokenColor = (type: Token['type']) => {
    switch (type) {
      case 'tag':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
      case 'person':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
      case 'priority':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      case 'date':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100';
      case 'effort':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-100';
      default:
        return '';
    }
  };

  const hasDisplayableTokens = tokens.some(token => token.type !== 'text');
  if (!hasDisplayableTokens) {
    return null;
  }
  
  return (
    <div className="mt-2 text-sm rounded-md border border-transparent dark:border-slate-700 dark:bg-slate-800 p-1 flex flex-wrap gap-1">
      {tokens.map((token, index) => (
        token.type !== 'text' ? (
          <span 
            key={index}
            className={`rounded-sm px-1 ${getTokenColor(token.type)}`}
          >
            {token.value}
          </span>
        ) : null
      ))}
    </div>
  );
};

export default TokenHighlighter;
