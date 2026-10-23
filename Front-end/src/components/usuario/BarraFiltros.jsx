import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react'; // Importa o ícone de lupa profissional

const FILTROS = [
    { id: 'todos', label: 'Todos' },
    { id: 'administração', label: 'Admin' },
    { id: 'manutenção', label: 'Manutenção' },
    { id: 'geral', label: 'Geral' },
    { id: 'desativado', label: 'Desativados' },
];

/**
 * filtroAtivo  - (opcional) controla o chip selecionado a partir da página
 * pendentes    - (opcional) nº de cadastros aguardando aprovação; quando informado
 *                (inclusive 0) aparece o chip "Pendentes". Omitir para ocultá-lo.
 */
export default function BarraFiltros({ onBusca, onFiltro, filtroAtivo: filtroControlado, pendentes }) {
    const [termo, setTermo] = useState('');
    const [filtroInterno, setFiltroInterno] = useState('todos');
    const debounceRef = useRef(null);

    const filtroAtivo = filtroControlado ?? filtroInterno;

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onBusca?.(termo.trim()), 300);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [termo]);

    function selecionar(id) {
        setFiltroInterno(id);
        onFiltro?.(id);
    }

    return (
        <div className="filtros-barra">
            <div className="filtros-busca">
                <span className="filtros-busca-icon">
                    <Search size={23} color="#99a1b1" />
                </span>
                <input
                    type="text"
                    className="filtros-input"
                    placeholder="Buscar por nome, CPF ou e-mail…"
                    autoComplete="off"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                />
            </div>

            <div className="filtros-chips">
                {FILTROS.map((f) => (
                    <button
                        key={f.id}
                        className={`filtro-chip ${filtroAtivo === f.id ? 'ativo' : ''}`}
                        onClick={() => selecionar(f.id)}
                    >
                        {f.label}
                    </button>
                ))}

                {typeof pendentes === 'number' && (
                    <>
                        <span className="filtros-divisor" aria-hidden="true" />
                        <button
                            className={`filtro-chip filtro-chip--pendentes ${filtroAtivo === 'pendentes' ? 'ativo' : ''} ${pendentes > 0 ? 'tem-pendentes' : ''}`}
                            onClick={() => selecionar('pendentes')}
                        >
                            Pendentes
                            {pendentes > 0 && <span className="filtro-chip-contador">{pendentes}</span>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
