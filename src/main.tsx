import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PosProvider } from './store.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PosProvider>
      <App />
    </PosProvider>
  </StrictMode>,
);
