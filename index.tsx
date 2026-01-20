import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Root element not found in DOM.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.debug("Portfolio: System operational.");
  } catch (error) {
    console.error("React Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: black; color: white; font-family: sans-serif; text-align: center; padding: 20px;">
        <div style="border: 1px solid #333; padding: 40px; background: #080808;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #f00;">System Boot Failed</h1>
          <p style="opacity: 0.6; font-size: 0.9rem; max-width: 400px; margin: 0 auto; font-family: monospace;">${error instanceof Error ? error.message : 'Unknown initialization error'}</p>
          <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 12px 24px; background: white; color: black; border: none; cursor: pointer; font-weight: bold; text-transform: uppercase;">Retry Initialization</button>
        </div>
      </div>
    `;
  }
}