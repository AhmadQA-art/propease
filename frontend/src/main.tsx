import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Starting application...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
}
