import { useRef, useState } from 'react';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useSalas } from '../../hooks/useSalas.jsx';
import CardSala from '../../components/salas/CardSala.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';

export default function SalasPage({ navegarPara }) {
    const token = obterToken();

    const { salas: todas, setSalas: setTodas, loading: carregando, erro: erroCarregar } = useSalas();
    const [paginaAtual, setPaginaAtual] = useState(1);

    const gridRef = useRef(null);

    function handleExcluir(id) {
        setTodas((atual) => atual.filter((s) => (s.id_sala || s.id) !== id));
    }

    if (!token) {
        return (
            <div className="page-salas-container">
                <div className="sala-empty"><div>🔒</div><p>Sessão inválida. Faça login novamente.</p></div>
            </div>
        );
    }

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pagina = todas.slice(inicio, inicio + ITENS_POR_PAGINA);

    return (
        <div className="page-salas-container">
            <header className="header-usuarios">
                <div>
                    <h1>Gerenciar Salas</h1>
                    <p className="page-subtitle">Visualização e modificação de salas em tempo real.</p>
                </div>
                <button className="btn-primary-custom" onClick={() => navegarPara.criarSala()}>+ Nova Sala</button>
            </header>

            <div ref={gridRef}>
                {carregando ? (
                    <div className="sala-empty"><p>Carregando salas...</p></div>
                ) : erroCarregar ? (
                    <div className="sala-empty"><div>⚠️</div><p>Não foi possível carregar as salas. Verifique a conexão com a API.</p></div>
                ) : todas.length === 0 ? (
                    <div className="tabela-card">
                        <div className="tabela-empty">
                            <div className="tabela-empty-icon">🚪</div>
                            <p>Nenhuma sala encontrada.</p>
                        </div>
                    </div>
                ) : (
                    <div className="salas-grid-container">
                        {pagina.map((sala) => (
                            <CardSala
                                key={sala.id_sala || sala.id}
                                sala={sala}
                                onVisualizar={(s) => navegarPara.visualizarSala(s.id_sala || s.id)}
                                onExcluir={handleExcluir}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="paginacao-contador">
                    {todas.length === 0
                        ? 'Nenhuma sala encontrada.'
                        : `Exibindo ${inicio + 1}–${Math.min(paginaAtual * ITENS_POR_PAGINA, todas.length)} de ${todas.length} salas`}
                </div>
                <Paginacao
                    totalItens={todas.length}
                    paginaAtual={paginaAtual}
                    onPageChange={(nova) => {
                        setPaginaAtual(nova);
                        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                />
            </div>
        </div>
    );
}