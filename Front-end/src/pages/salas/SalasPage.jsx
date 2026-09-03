import { useRef, useState } from 'react';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useSalas } from '../../hooks/useSalas.jsx';
import { criarSala } from '../../services/salaService.js';
import { criarPatrimonio } from '../../services/patrimonioService.js';
import { urlImagemSala, urlImagemPatrimonio } from '../../services/imagemService.js';
import CardSala from '../../components/salas/CardSala.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';

export default function SalasPage({ navegarPara }) {
    const token = obterToken();

    const { salas: todas, setSalas: setTodas, loading: carregando, erro: erroCarregar, recarregar } = useSalas();
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [selecionadas, setSelecionadas] = useState(new Set());
    const [duplicando, setDuplicando] = useState(false);

    const gridRef = useRef(null);

    function handleExcluir(id) {
        setTodas((atual) => atual.filter((s) => (s.id_sala || s.id) !== id));
        setSelecionadas((atual) => {
            const novo = new Set(atual);
            novo.delete(String(id));
            return novo;
        });
    }

    if (!token) {
        return (
            <div className="page-salas-container">
                <div className="sala-empty"><div>
                    <ion-icon name="lock-closed-outline" style={{ fontSize: '32px' }}></ion-icon>
                </div><p>Sessão inválida. Faça login novamente.</p></div>
            </div>
        );
    }

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pagina = todas.slice(inicio, inicio + ITENS_POR_PAGINA);

    function toggleSelecionada(id) {
        setSelecionadas((atual) => {
            const novo = new Set(atual);
            if (novo.has(id)) novo.delete(id); else novo.add(id);
            return novo;
        });
    }

    function selecionarPagina(marcar) {
        setSelecionadas((atual) => {
            const novo = new Set(atual);
            pagina.forEach((s) => {
                const id = String(s.id_sala || s.id);
                if (marcar) novo.add(id); else novo.delete(id);
            });
            return novo;
        });
    }

    const todosDaPaginaSelecionados = pagina.length > 0 && pagina.every((s) => selecionadas.has(String(s.id_sala || s.id)));

    async function duplicarImagemComoBlob(src) {
        try {
            const resposta = await fetch(src);
            return await resposta.blob();
        } catch (erroImagem) {
            console.warn('Não foi possível copiar a imagem ao duplicar:', erroImagem);
            return null;
        }
    }

    async function duplicarSala(sala) {
        const formData = new FormData();
        formData.append('descricao', `${sala.descricao || sala.nome || 'Sala'} (Cópia)`);
        formData.append('bloco', sala.bloco ?? '');

        const srcImagemSala = urlImagemSala(sala);
        if (srcImagemSala) {
            const blob = await duplicarImagemComoBlob(srcImagemSala);
            if (blob) formData.append('imagem_sala', blob, 'imagem.jpg');
        }

        const resposta = await criarSala(formData, token);
        const salaCriadaRaw = resposta?.result ?? resposta;
        const salaCriada = Array.isArray(salaCriadaRaw) ? salaCriadaRaw[0] : salaCriadaRaw;
        const novoIdSala = salaCriada?.id_sala ?? salaCriada?.id;

        const patrimoniosOriginais = sala.patrimonios || [];
        let errosPatrimonios = 0;

        if (novoIdSala && patrimoniosOriginais.length > 0) {
            for (const pat of patrimoniosOriginais) {
                try {
                    const patFormData = new FormData();
                    patFormData.append('nome', pat.nome || 'Patrimônio');
                    patFormData.append('status', pat.status || 'Ok');
                    patFormData.append('id_sala', novoIdSala);
                    if (pat.numero_patrimonio) patFormData.append('numero_patrimonio', pat.numero_patrimonio);

                    const srcImagemPat = urlImagemPatrimonio(pat);
                    if (srcImagemPat) {
                        const blob = await duplicarImagemComoBlob(srcImagemPat);
                        if (blob) patFormData.append('imagem', blob, 'imagem.jpg');
                    }

                    await criarPatrimonio(patFormData, token);
                } catch (erroPatrimonio) {
                    console.error('Erro ao duplicar patrimônio:', erroPatrimonio);
                    errosPatrimonios++;
                }
            }
        }

        return { novoIdSala, errosPatrimonios };
    }

    async function handleDuplicarLote() {
        const ids = [...selecionadas];
        if (ids.length === 0) return;

        const confirmMsg = ids.length === 1
            ? 'Duplicar a sala selecionada com seus patrimônios?'
            : `Duplicar ${ids.length} salas selecionadas com seus patrimônios?`;
        if (!confirm(confirmMsg)) return;

        setDuplicando(true);
        let erros = 0;
        let errosPatrimoniosTotal = 0;

        for (const id of ids) {
            const salaOriginal = todas.find((s) => String(s.id_sala || s.id) === id);
            if (!salaOriginal) continue;
            try {
                const { errosPatrimonios } = await duplicarSala(salaOriginal);
                errosPatrimoniosTotal += errosPatrimonios;
            } catch (erroDuplicar) {
                console.error('Erro ao duplicar sala:', erroDuplicar);
                erros++;
            }
        }

        setDuplicando(false);
        setSelecionadas(new Set());
        await recarregar();

        if (erros > 0) alert(`${erros} sala(s) não puderam ser duplicadas.`);
        else if (errosPatrimoniosTotal > 0) alert(`${errosPatrimoniosTotal} patrimônio(s) não puderam ser duplicados.`);
    }

    return (
        <div className="page-salas-container">
            <header className="header-usuarios">
                <div>
                    <h1>Gerenciar Salas</h1>
                    <p className="page-subtitle">Visualização e modificação de salas em tempo real.</p>
                </div>
                <button className="btn-primary-custom" onClick={() => navegarPara.criarSala()}>+ Nova Sala</button>
            </header>

            {!carregando && !erroCarregar && todas.length > 0 && (
                <div className="salas-selecao-header">
                    <label className="vs-selecionar-todos-label" title="Selecionar todos desta página">
                        <input
                            type="checkbox" className="vs-cb-todos"
                            checked={todosDaPaginaSelecionados}
                            onChange={(e) => selecionarPagina(e.target.checked)}
                        />
                        <span>Selecionar página</span>
                    </label>
                </div>
            )}

            <div ref={gridRef}>
                {carregando ? (
                    <div className="sala-empty"><p>Carregando salas...</p></div>
                ) : erroCarregar ? (
                    <div className="sala-empty"><div>
                        <ion-icon name="warning-outline" style={{ fontSize: '32px' }}></ion-icon>
                    </div><p>Não foi possível carregar as salas. Verifique a conexão com a API.</p></div>
                ) : todas.length === 0 ? (
                    <div className="tabela-card">
                        <div className="tabela-empty">
                            <div className="tabela-empty-icon">
                                <ion-icon name="log-in-outline" style={{ fontSize: '32px' }}></ion-icon>
                            </div>
                            <p>Nenhuma sala encontrada.</p>
                        </div>
                    </div>
                ) : (
                    <div className="salas-grid-container">
                        {pagina.map((sala) => {
                            const id = String(sala.id_sala || sala.id);
                            return (
                                <CardSala
                                    key={id}
                                    sala={sala}
                                    selecionado={selecionadas.has(id)}
                                    onToggleSelecionado={toggleSelecionada}
                                    onVisualizar={(s) => navegarPara.visualizarSala(s.id_sala || s.id)}
                                    onEditar={(s) => navegarPara.editarSala(s.id_sala || s.id)}
                                    onExcluir={handleExcluir}
                                />
                            );
                        })}
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

            {selecionadas.size > 0 && (
                <div className="vs-selecao-barra vs-selecao-barra--visivel">
                    <div className="vs-selecao-barra-inner">
                        <span className="vs-selecao-info">
                            <span className="vs-selecao-icone">☑</span>
                            {selecionadas.size} sala(s) selecionada(s)
                        </span>
                        <div className="vs-selecao-acoes">
                            <button className="vs-btn-cancelar-selecao" onClick={() => setSelecionadas(new Set())}>Cancelar</button>
                            <button className="btn-duplicar-lote" disabled={duplicando} onClick={handleDuplicarLote}>
                                {duplicando ? 'Duplicando...' : '⧉ Duplicar selecionadas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}