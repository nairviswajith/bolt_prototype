import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize IndexedDB
import { initDB } from './lib/db';

// Initialize the database before rendering the app
initDB().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch(error => {
  console.error('Failed to initialize the database:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <h1>Failed to initialize the application</h1>
      <p>Please make sure your browser supports IndexedDB and try again.</p>
    </div>
  `;
});