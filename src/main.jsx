import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Suppress React 18 createRoot warning from PlayroomKit
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  if (args.length > 0 && typeof args[0] === 'string' && 
      args[0].includes('You are importing createRoot from "react-dom"')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
