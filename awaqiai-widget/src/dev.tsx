import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WidgetConfig } from './types/config';
import './styles/globals.css';

const devConfig: WidgetConfig = {
  id: import.meta.env.VITE_BLUEYEAI_WIDGET_ID,
  token: import.meta.env.VITE_BLUEYEAI_TOKEN,
  theme: {
    primaryColor: '#1e3a8a',
    position: 'right'
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App config={devConfig} />
  </React.StrictMode>
);