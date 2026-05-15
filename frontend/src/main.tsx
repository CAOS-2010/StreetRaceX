import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Rajdhani', 'Segoe UI', system-ui, sans-serif;
    background: #080808;
    color: #f0f0f0;
    min-height: 100vh;
  }
  a { text-decoration: none; }
  button { font-family: inherit; transition: opacity 0.15s, transform 0.15s; }
  button:hover:not(:disabled) { opacity: 0.88; }
  input, textarea, select { font-family: inherit; outline: none; }
  input:focus, textarea:focus, select:focus { border-color: #FF4500 !important; box-shadow: 0 0 0 2px rgba(255,69,0,0.15) !important; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #FF4500; border-radius: 3px; }
  .orbitron { font-family: 'Orbitron', monospace !important; }
`;
document.head.appendChild(globalStyle);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
