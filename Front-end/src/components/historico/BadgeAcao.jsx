import { ACOES } from './rotulos.js';

export default function BadgeAcao({ acao }) {
    const a = ACOES[acao] || { label: acao || '—', bg: '#f4f4f6', cor: '#333338', borda: '#d1d1d6' };

    return (
        <span
            className="badge-perfil"
            style={{ background: a.bg, color: a.cor, border: `1px solid ${a.borda}` }}
        >
            {a.label}
        </span>
    );
}
