
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
        return 'bg-purple-100 text-purple-800';
      case 'person':
        return 'bg-blue-100 text-blue-800';
      case 'priority':
        return 'bg-red-100 text-red-800';
      case 'date':
        return 'bg-orange-100 text-orange-800';
      case 'effort':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return '';
    }
  };

  if (tokens.length === 0) return null;
  
  return (
    <div className="mt-2 text-sm rounded-md border border-transparent p-1 flex flex-wrap gap-1">
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
