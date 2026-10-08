import React from 'react';
import ReactDOM from 'react-dom/client';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TDSMobileAITProvider brandPrimaryColor="#3182F6" fontScaleAvailable>
      <App />
    </TDSMobileAITProvider>
  </React.StrictMode>,
);
