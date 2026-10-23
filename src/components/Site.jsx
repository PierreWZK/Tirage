const PAGES = [
    ['/calculateur/', 'Calculateur', 'calculateur'],
    ['/entrainement/', 'Entraînement', 'entrainement'],
    ['/jeu/', 'Main du jour', 'jeu'],
    ['/lecons/', 'Leçons', 'lecons'],
    ['/progres/', 'Progrès', 'progres'],
];

export function Logo() {
    // Deux cartes qui se chevauchent : la main du joueur, comme dans le coin de l'écran à la télé
    return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect x="4" y="6" width="15" height="21" rx="2.5" fill="#f6f3ea" transform="rotate(-10 11 16)" />
            <rect x="13" y="5" width="15" height="21" rx="2.5" fill="#ffd21f" transform="rotate(8 20 15)" />
            <path d="M20.5 11.5l2.6 4.2-2.6 4.2-2.6-4.2z" fill="#1229b8" />
        </svg>
    );
}

export function SiteHeader({ page }) {
    return (
        <header className="site-head">
            <div className="wrap">
                <a href="/" className="wordmark" aria-label="Tirage, accueil"><Logo />TIRAGE</a>
                <nav className="site-nav" aria-label="Navigation principale">
                    {PAGES.map(([href, label, id]) => (
                        <a key={id} href={href} aria-current={page === id ? 'page' : undefined}>{label}</a>
                    ))}
                </nav>
                {page !== 'calculateur' && <a className="btn btn-signal" href="/calculateur/">Calculer une main</a>}
            </div>
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="site-foot">
            <div className="wrap">
                <span>Tirage · Jour 10 du défi <a href="https://projectp.fr/">30 jours, 30 projets</a></span>
                <span>Fait avec React et Vite · <a href="https://github.com/PierreWZK/Tirage" target="_blank" rel="noopener">Code sur GitHub ↗</a></span>
            </div>
        </footer>
    );
}
