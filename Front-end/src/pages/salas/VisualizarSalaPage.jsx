import { useEffect, useRef, useState } from 'react';
import { obterToken, obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';
import { urlImagemSala } from '../../services/imagemService.js';
import { excluirPatrimonio } from '../../services/patrimonioService.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useSalaDetalhe } from '../../hooks/useSalaDetalhe.jsx';
import PatrimonioCardVS from '../../components/salas/PatrimonioCardVS.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';
import ModalPatrimonio from '../../components/patrimonio/ModalPatrimonio.jsx';

export default function VisualizarSalaPage({ navegarPara, idSala }) {
    const token = obterToken();

    const { sala, setSala, loading: carregando, erro } = useSalaDetalhe(idSala);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [selecionados, setSelecionados] = useState(new Set());
    const [excluindoLote, setExcluindoLote] = useState(false);

    // Controla o estado do modal: null = fechado, { id_sala: ... } = novo patrimonio, patrimonioObj = editando
    const [modalPatrimonio, setModalPatrimonio] = useState(null);

    const containerRef = useRef(null);

    const voltarParaSalas = () => navegarPara.salas();

    const patrimonios = sala?.patrimonios || [];
    const total = patrimonios.length;
    const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));

    useEffect(() => {
        if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
    }, [totalPaginas, paginaAtual]);

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pagina = patrimonios.slice(inicio, inicio + ITENS_POR_PAGINA);

    function toggleSelecionado(id) {
        setSelecionados((atual) => {
            const novo = new Set(atual);
            if (novo.has(id)) novo.delete(id); else novo.add(id);
            return novo;
        });
    }

    function selecionarPagina(marcar) {
        setSelecionados((atual) => {
            const novo = new Set(atual);
            pagina.forEach((p) => {
                const id = String(p.id_patrimonio || p.id);
                if (marcar) novo.add(id); else novo.delete(id);
            });
            return novo;
        });
    }

    const todosDaPaginaSelecionados = pagina.length > 0 && pagina.every((p) => selecionados.has(String(p.id_patrimonio || p.id)));

    async function excluirIndividual(id, nome) {
        if (!confirm(`Excluir o patrimônio "${nome}"?`)) return;
        try {
            const usuario = obterUsuarioAtual();
            const tkn = usuario?.token;
            if (!tkn) { alert('Sessão expirada.'); return; }
            await excluirPatrimonio(id, tkn);
            setSala((s) => ({ ...s, patrimonios: s.patrimonios.filter((p) => (p.id_patrimonio || p.id) != id) }));
            setSelecionados((atual) => { const novo = new Set(atual); novo.delete(id); return novo; });
        } catch (err) {
            console.error('Erro ao excluir patrimônio:', err);
            alert('Não foi possível excluir o patrimônio.');
        }
    }

    async function excluirLote() {
        const ids = [...selecionados];
        const nomes = ids.map((id) => {
            const p = sala.patrimonios.find((p) => (p.id_patrimonio || p.id) == id);
            return p?.nome || `#${id}`;
        });
        const confirmMsg = ids.length === 1
            ? `Excluir o patrimônio "${nomes[0]}"?`
            : `Excluir ${ids.length} patrimônios selecionados?\n\n${nomes.join('\n')}`;
        if (!confirm(confirmMsg)) return;

        const usuario = obterUsuarioAtual();
        const tkn = usuario?.token;
        if (!tkn) { alert('Sessão expirada.'); return; }

        setExcluindoLote(true);
        let erros = 0;
        let salaAtualizada = sala;
        for (const id of ids) {
            try {
                await excluirPatrimonio(id, tkn);
                salaAtualizada = { ...salaAtualizada, patrimonios: salaAtualizada.patrimonios.filter((p) => (p.id_patrimonio || p.id) != id) };
            } catch {
                erros++;
            }
        }
        setSala(salaAtualizada);
        setSelecionados(new Set());
        setExcluindoLote(false);

        if (erros > 0) alert(`${erros} item(ns) não puderam ser excluídos.`);
    }

    // Abre o modal para ADICIONAR um novo patrimônio (passando a sala atual)
    function abrirNovoPatrimonio() {
        setModalPatrimonio({ id_sala: sala.id_sala || sala.id });
    }

    // Abre o modal para EDITAR um patrimônio existente
    function editarPatrimonio(patrimonio) {
        setModalPatrimonio(patrimonio);
    }

    function handlePatrimonioSalvo(patrimonioSalvo) {
        const idSalvo = patrimonioSalvo.id_patrimonio || patrimonioSalvo.id;

        setSala((s) => {
            const jaExiste = s.patrimonios.some((p) => (p.id_patrimonio || p.id) === idSalvo);

            if (jaExiste) {
                // Se já existia, atualiza os dados na lista
                return {
                    ...s,
                    patrimonios: s.patrimonios.map((p) =>
                        (p.id_patrimonio || p.id) === idSalvo ? { ...p, ...patrimonioSalvo } : p
                    ),
                };
            } else {
                // Se é novo, adiciona à lista atual da sala
                return {
                    ...s,
                    patrimonios: [patrimonioSalvo, ...s.patrimonios],
                };
            }
        });

        setModalPatrimonio(null);
    }

    if (!token) {
        return <div className="sala-empty"><div>🔒</div><p>Sessão inválida.</p></div>;
    }

    if (carregando) {
        return (
            <div className="page-salas-container">
                <div className="editar-sala-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando sala...</p>
                </div>
            </div>
        );
    }

    if (erro || !sala) {
        return (
            <div className="page-salas-container">
                <div className="vs-empty">
                    <span className="vs-empty-icon">⚠️</span>
                    <p>Não foi possível carregar a sala.</p>
                    <button className="btn-action" onClick={voltarParaSalas}>← Voltar para Salas</button>
                </div>
            </div>
        );
    }

    const srcImagemSala = urlImagemSala(sala);

    return (
        <div className="page-salas-container" ref={containerRef}>
            <header className="header-usuarios">
                <div>
                    <div className="breadcrumb-nav">
                        <button className="breadcrumb-link" onClick={voltarParaSalas}>Salas</button>
                        <span className="breadcrumb-sep">›</span>
                        <span className="breadcrumb-current">Visualizar Sala</span>
                    </div>
                    <h1>{sala.descricao}</h1>
                    <p className="page-subtitle">Bloco {sala.bloco} · ID #{sala.id_sala || sala.id}</p>
                </div>
                <div className="header-actions-group">
                    <button className="btn-action" onClick={voltarParaSalas}>← Voltar</button>
                    <button className="btn-primary-custom" onClick={() => navegarPara.editarSala(sala.id_sala || sala.id)}>✏ Editar Sala</button>
                </div>
            </header>

            <div className="visualizar-sala-layout">
                <aside className="visualizar-sala-info-card">
                    <div className="vs-img-wrapper">
                        {srcImagemSala && <img className="sala-card-img" alt={sala.descricao} src={srcImagemSala} />}
                    </div>
                    <div className="vs-meta">
                        <div className="vs-meta-row">
                            <span className="vs-meta-label">Bloco</span>
                            <span className="vs-meta-value">{sala.bloco || '—'}</span>
                        </div>
                        <div className="vs-meta-row">
                            <span className="vs-meta-label">Identificador</span>
                            <span className="vs-meta-value">#{sala.id_sala || sala.id}</span>
                        </div>
                        <div className="vs-meta-row">
                            <span className="vs-meta-label">Patrimônios</span>
                            <span className="vs-meta-value">
                                <span className="badge-patrimonio">{total} {total === 1 ? 'item' : 'itens'}</span>
                            </span>
                        </div>
                    </div>
                </aside>

                <section className="visualizar-sala-patrimonios-col">
                    <div className="vs-patrimonios-header">
                        <h2>Patrimônios Vinculados <span className="vs-count">{total}</span></h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {total > 0 && (
                                <label className="vs-selecionar-todos-label" title="Selecionar todos desta página">
                                    <input
                                        type="checkbox" className="vs-cb-todos"
                                        checked={todosDaPaginaSelecionados}
                                        onChange={(e) => selecionarPagina(e.target.checked)}
                                    />
                                    <span>Selecionar página</span>
                                </label>
                            )}
                            <button className="btn-primary-custom" onClick={abrirNovoPatrimonio} style={{ padding: '6px 12px', fontSize: '13px' }}>
                                + Adicionar
                            </button>
                        </div>
                    </div>

                    <div>
                        {total === 0 ? (
                            <div className="vs-empty">
                                <span className="vs-empty-icon">📦</span>
                                <p>Nenhum patrimônio vinculado a esta sala.</p>
                            </div>
                        ) : (
                            <div className="vs-patrimonios-grid">
                                {pagina.map((pat) => {
                                    const id = String(pat.id_patrimonio || pat.id);
                                    return (
                                        <PatrimonioCardVS
                                            key={id}
                                            patrimonio={pat}
                                            selecionado={selecionados.has(id)}
                                            onToggleSelecionado={toggleSelecionado}
                                            onEditar={editarPatrimonio}
                                            onExcluir={excluirIndividual}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {totalPaginas > 1 && (
                        <Paginacao
                            totalItens={total}
                            paginaAtual={paginaAtual}
                            onPageChange={(nova) => {
                                setPaginaAtual(nova);
                                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        />
                    )}
                </section>
            </div>

            {selecionados.size > 0 && (
                <div className="vs-selecao-barra vs-selecao-barra--visivel">
                    <div className="vs-selecao-barra-inner">
                        <span className="vs-selecao-info">
                            <span className="vs-selecao-icone">☑</span>
                            {selecionados.size} patrimônio(s) selecionado(s)
                        </span>
                        <div className="vs-selecao-acoes">
                            <button className="vs-btn-cancelar-selecao" onClick={() => setSelecionados(new Set())}>Cancelar</button>
                            <button className="vs-btn-excluir-lote" disabled={excluindoLote} onClick={excluirLote}>
                                {excluindoLote ? 'Excluindo...' : '🗑 Excluir selecionados'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModalPatrimonio
                aberto={Boolean(modalPatrimonio)}
                patrimonio={modalPatrimonio}
                salas={[sala]}
                onSalvar={handlePatrimonioSalvo}
                onFechar={() => setModalPatrimonio(null)}
            />
        </div>
    );
}