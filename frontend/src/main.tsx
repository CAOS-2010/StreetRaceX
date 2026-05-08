import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles reset
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
  a { text-decoration: none; }
  button { font-family: inherit; }
  input, textarea, select { font-family: inherit; outline: none; }
  input:focus, textarea:focus, select:focus { border-color: #FF4500 !important; }
`;
document.head.appendChild(globalStyle);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
