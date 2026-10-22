// Partager un score : partage natif sur téléphone, presse-papiers sur ordinateur.

/** @returns {Promise<'partage'|'copie'|'echec'>} */
export async function shareText(text) {
    const touch = matchMedia('(pointer: coarse)').matches;
    try {
        if (touch && navigator.share) {
            await navigator.share({ text });
            return 'partage';
        }
        await navigator.clipboard.writeText(text);
        return 'copie';
    } catch {
        return 'echec';
    }
}

/** Lecture et écriture sûres dans le navigateur (navigation privée : on joue sans mémoire) */
export function stored(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

export function store(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // stockage indisponible
    }
}
