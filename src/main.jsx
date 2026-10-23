import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import './styles/pages.css';
import { Calculator } from './pages/Calculator.jsx';
import { Daily } from './pages/Daily.jsx';
import { Landing } from './pages/Landing.jsx';
import { Lessons } from './pages/Lessons.jsx';
import { Progress } from './pages/Progress.jsx';
import { Training } from './pages/Training.jsx';

// Chaque page HTML dit laquelle elle est (data-page) : un seul point d'entrée pour toutes
const PAGES = { accueil: Landing, calculateur: Calculator, entrainement: Training, jeu: Daily, lecons: Lessons, progres: Progress };
const Page = PAGES[document.body.dataset.page] ?? Landing;

createRoot(document.getElementById('app')).render(<StrictMode><Page /></StrictMode>);
