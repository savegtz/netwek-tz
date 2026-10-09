import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MusicPlayerProvider>
        <App />
      </MusicPlayerProvider>
    </ThemeProvider>
  </StrictMode>,
);
