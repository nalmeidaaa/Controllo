import './kit.css';
import { useRef } from 'react';

/*
 * abas: [{ id, rotulo, contador?, destaque? }]
 * ativa: id da aba ativa · onChange(id)
 * Setas ←/→, Home e End navegam entre as abas.
 */
export default function Abas({ abas, ativa, onChange, rotulo = 'Abas' }) {
    const refs = useRef({});

    function focar(indice) {
        const alvo = abas[(indice + abas.length) % abas.length];
        onChange(alvo.id);
        refs.current[alvo.id]?.focus();
    }

    function handleKeyDown(e, indice) {
        if (e.key === 'ArrowRight') { e.preventDefault(); focar(indice + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); focar(indice - 1); }
        else if (e.key === 'Home') { e.preventDefault(); focar(0); }
        else if (e.key === 'End') { e.preventDefault(); focar(abas.length - 1); }
    }

    return (
        <div className="kit-abas" role="tablist" aria-label={rotulo}>
            {abas.map((aba, i) => {
                const selecionada = aba.id === ativa;
                return (
                    <button
                        key={aba.id}
                        ref={(el) => { refs.current[aba.id] = el; }}
                        type="button"
                        role="tab"
                        id={`kit-aba-${aba.id}`}
                        aria-selected={selecionada}
                        tabIndex={selecionada ? 0 : -1}
                        className={`kit-aba${aba.destaque ? ' kit-aba--destaque' : ''}`}
                        onClick={() => onChange(aba.id)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                    >
                        {aba.rotulo}
                        {aba.contador !== undefined && aba.contador !== null && (
                            <span className="kit-aba-contador">{aba.contador}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
