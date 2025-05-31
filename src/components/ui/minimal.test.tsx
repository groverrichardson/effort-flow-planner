import { render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';

const BasicComponent = () => {
  const [text, setText] = useState('Initial');

  const changeText = () => {
    setText('Updated');
  };

  return (
    <div>
      <p>{text}</p>
      <button onClick={changeText}>Change</button>
    </div>
  );
};

describe('Minimal Act Test', () => {
  it('should not warn when act is used for synchronous update', () => {
    render(<BasicComponent />);
    const button = screen.getByText('Change');
    
    // Intentionally using React's act directly for this test
    // to see if the environment flag is the issue.
    React.act(() => {
      button.click();
    });

    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
