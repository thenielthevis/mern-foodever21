// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import { AuthProvider } from './context/AuthContext.jsx';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>
//     <App />
//     </AuthProvider>
//   </React.StrictMode>,
// );

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)