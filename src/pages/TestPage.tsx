import React from 'react';

const TestPage = () => {
  console.log('TestPage component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f0f0', 
      maxWidth: '500px',
      margin: '100px auto',
      border: '2px solid black',
      borderRadius: '8px'
    }}>
      <h1>Test Page Is Working</h1>
      <p>If you can see this, React rendering is working properly.</p>
      <p>The issue might be with the Login component specifically or authentication setup.</p>
    </div>
  );
};

export default TestPage;
