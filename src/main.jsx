import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import './styles/pages.css';
import { Calculator } from './pages/Calculator.jsx';
import { Daily } from './pages/Daily.jsx';
import { Landing } from './pages/Landing.jsx';
import { Training } from './pages/Training.jsx';

// Chaque page HTML dit laquelle elle est (data-page) : un seul point d'entrée pour les quatre
const PAGES = { accueil: Landing, calculateur: Calculator, entrainement: Training, jeu: Daily };
const Page = PAGES[document.body.dataset.page] ?? Landing;

createRoot(document.getElementById('app')).render(<StrictMode><Page /></StrictMode>);
