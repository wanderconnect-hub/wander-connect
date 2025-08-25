// File: TestPage.tsx
import React from 'react';

const TestPage: React.FC = () => {
  // This line attempts to read the variable from Vercel.
  const message = import.meta.env.VITE_TEST_MESSAGE;

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', fontSize: '24px' }}>
      <h1>Environment Variable Test</h1>
      <p>
        The message from Vercel is: <strong>{message || '...UNDEFINED...'}</strong>
      </p>
      {message ? (
        <p style={{ color: 'green' }}>It worked! The connection is successful.</p>
      ) : (
        <p style={{ color: 'red' }}>
          It failed. The variable is still undefined. The problem is definitely with the Vercel + Vite build configuration.
        </p>
      )}
    </div>
  );
};

export default TestPage;