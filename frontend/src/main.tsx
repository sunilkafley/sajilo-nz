import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { createLocalRepository } from './features/checklist/repository';
import './style.css';
const repository = createLocalRepository(() => window.localStorage);
createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><App repository={repository}/></HashRouter></React.StrictMode>);
