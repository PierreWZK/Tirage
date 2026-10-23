import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Six pages statiques : chacune a sa propre adresse, sans routeur ni réécriture côté serveur
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                accueil: resolve(import.meta.dirname, 'index.html'),
                calculateur: resolve(import.meta.dirname, 'calculateur/index.html'),
                entrainement: resolve(import.meta.dirname, 'entrainement/index.html'),
                jeu: resolve(import.meta.dirname, 'jeu/index.html'),
                lecons: resolve(import.meta.dirname, 'lecons/index.html'),
                progres: resolve(import.meta.dirname, 'progres/index.html'),
            },
        },
    },
});
