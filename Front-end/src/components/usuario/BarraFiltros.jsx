import { useEffect, useRef, useState } from 'react';

const FILTROS = [
    { id: 'todos', label: 'Todos' },
    { id: 'administracao', label: 'Admin' },
    { id: 'manutencao', label: 'Manutenção' },
    { id: 'geral', label: 'Geral' },
];

export default function BarraFiltros({ onBusca, onFiltro }) {
    const [termo, setTermo] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('todos');
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onBusca?.(termo.trim()), 300);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [termo]);

    return (
        <div className="filtros-barra">
            <div className="filtros-busca">
                <span className="filtros-busca-icon">🔍</span>
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
                        onClick={() => { setFiltroAtivo(f.id); onFiltro?.(f.id); }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
