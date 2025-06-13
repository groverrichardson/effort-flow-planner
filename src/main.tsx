import { createRoot } from 'react-dom/client'
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css'

// DEBUGGING: Track initialization phases with timestamps
const now = new Date();
console.log(`%c[${now.toISOString()}] MAIN.TSX: Script execution started`, 'color: green; font-weight: bold');

// DEBUGGING: Check for fundamental DOM elements
const rootElement = document.getElementById('root');
console.log(`%c[MAIN] Root element found:`, 'color: blue; font-weight: bold', rootElement);
console.log(`%c[MAIN] Document state:`, 'color: blue', {
  readyState: document.readyState,
  URL: document.URL,
  location: window.location.href,
});

// DEBUGGING: Log imports
console.log(`%c[MAIN] Imports loaded:`, 'color: purple', {
  createRoot: typeof createRoot,
  App: typeof App,
  ThemeProvider: typeof ThemeProvider,
});

try {
  console.log(`%c[MAIN] Creating Root...`, 'color: orange');
  const reactRoot = createRoot(rootElement!);
  console.log(`%c[MAIN] Root created successfully`, 'color: green');
  
  console.log(`%c[MAIN] Starting render...`, 'color: orange');
  reactRoot.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  console.log(`%c[MAIN] Render method called - React should now be rendering`, 'color: green; font-weight: bold');
} catch (error) {
  console.error(`%c[MAIN] CRITICAL ERROR: Failed to render React application:`, 'color: red; font-weight: bold', error);
  
  // Emergency fallback rendering to show something if React fails
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 20px; border: 2px solid red; font-family: sans-serif;">
        <h2 style="color: red;">React Rendering Error</h2>
        <p>The application failed to render properly.</p>
        <p>Please check your browser console for details.</p>
        <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${error?.message || 'Unknown error'}</pre>
      </div>
    `;
  }
}
