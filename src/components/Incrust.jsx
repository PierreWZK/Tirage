import { useEffect, useRef, useState } from 'react';
import { num, pct } from '../lib/analyse.js';

/** Fait clignoter un chiffre quand sa valeur change, comme une incrustation mise à jour à l'antenne */
function Live({ value, children }) {
    const [key, setKey] = useState(0);
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        setKey((k) => k + 1);
    }, [value]);
    return <span key={key} className={key ? 'chiffre-change' : undefined}>{children}</span>;
}

/**
 * Le bandeau bas de la retransmission : outs, probabilité exacte, règle du 2 et du 4, cotes et verdict.
 * @param {{ result: ReturnType<import('../lib/analyse.js').analyse>, title?: string }} props
 */
export function Incrust({ result, title = 'Analyse en direct' }) {
    if (!result) {
        return (
            <div className="incrust">
                <p className="incrust-titre"><span className="direct" aria-hidden="true" />{title}</p>
                <div className="incrust-corps">
                    <div className="incrust-outs"><strong>–</strong><span>outs</span></div>
                    <p className="incrust-stats" style={{ display: 'flex', alignItems: 'center' }}>Choisissez votre main et le flop.</p>
                    <div className="incrust-verdict attente">En attente</div>
                </div>
            </div>
        );
    }

    const { count, toCome, exact, rule, odds, verdict } = result;
    const street = toCome === 2 ? "jusqu'à la river" : 'à la prochaine carte';

    return (
        <div className="incrust entre" aria-live="polite">
            <p className="incrust-titre"><span className="direct" aria-hidden="true" />{title}</p>
            <div className="incrust-corps">
                <div className="incrust-outs">
                    <strong><Live value={count}>{count}</Live></strong>
                    <span>out{count > 1 ? 's' : ''}</span>
                </div>
                <dl className="incrust-stats">
                    <div className="stat exact">
                        <dt>Exact</dt>
                        <dd><Live value={exact}>{pct(exact)}</Live></dd>
                    </div>
                    <div className="stat">
                        <dt>Règle du {toCome === 2 ? '4' : '2'}</dt>
                        <dd>{pct(rule)} {Math.round((rule - exact) * 1000) !== 0 && <small>{rule > exact ? '+' : '−'}{num(Math.abs(Math.round((rule - exact) * 1000) / 10))} pt</small>}</dd>
                    </div>
                    <div className="stat">
                        <dt>À payer</dt>
                        <dd>{odds ? pct(odds.required) : '–'}</dd>
                    </div>
                    <div className="barre" role="img" aria-label={`Probabilité ${pct(exact)} ${street}${odds ? `, équité nécessaire ${pct(odds.required)}` : ''}`}>
                        <i style={{ width: `${Math.min(100, exact * 100)}%` }} />
                        {odds && <b style={{ left: `${Math.min(100, odds.required * 100)}%` }} />}
                    </div>
                </dl>
                <div className={`incrust-verdict ${verdict ?? 'attente'}`}>
                    {verdict ? <><small>Verdict</small>{verdict}</> : 'Pot et mise ?'}
                </div>
            </div>
            <p className="incrust-legende">Probabilité de toucher {street}. Barre jaune : vos chances ; trait blanc : ce que demandent les cotes du pot.</p>
        </div>
    );
}
