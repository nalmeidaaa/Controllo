import { ACOES } from './rotulos.js';

export default function BadgeAcao({ acao }) {
    const a = ACOES[acao];
    return (
        <span className={`hist-badge ${a ? `hist-acao--${a.classe}` : 'hist-acao--outra'}`}>
            <span className="hist-badge-ponto" aria-hidden="true" />
            {a?.label || acao || '—'}
        </span>
    );
}
