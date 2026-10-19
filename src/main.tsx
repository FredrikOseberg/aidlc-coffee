import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { FlagProvider } from '@unleash/proxy-client-react';
import './styles.css';
import App from './App';
import { FlagSnapshot } from './components/FlagSnapshot';
import { unleashConfig } from './lib/flags';

const withFlags = (children: ReactNode) =>
  unleashConfig ? (
    <FlagProvider config={unleashConfig}>
      <FlagSnapshot />
      {children}
    </FlagProvider>
  ) : (
    children
  );

createRoot(document.getElementById('root')!).render(<StrictMode>{withFlags(<App />)}</StrictMode>);
