import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BlogProvider } from './Context/blog';
import { AuthProvider } from './Context/auth';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
  <BlogProvider>
  <Toaster/>
    <App />
  </BlogProvider>
  </AuthProvider>
);

reportWebVitals();
