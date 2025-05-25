import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BlogProvider } from './Context/blog';
import { AuthProvider } from './Context/auth';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
  <BlogProvider>
    <App />
  </BlogProvider>
  </AuthProvider>
);

reportWebVitals();
