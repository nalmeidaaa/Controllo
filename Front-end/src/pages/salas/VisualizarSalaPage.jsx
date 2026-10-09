import ModalTransferenciaPatrimonio from '../../components/patrimonio/ModalTransferenciaPatrimonio.jsx';
import ModalHistoricoTransferencias from '../../components/patrimonio/ModalHistoricoTransferencias.jsx';

import { useEffect, useRef, useState } from 'react';

import {
    obterToken,
    obterUsuarioAtual
} from '../../storage/usuario/dados.storage.js';

import { urlImagemSala } from '../../services/imagemService.js';

import {
    excluirPatrimonio,
    transferirPatrimonio,
    obterHistoricoTransferencias
} from '../../services/patrimonioService.js';

import {
    listarSalas
} from '../../services/salaService.js';

import { ITENS_POR_PAGINA } from '../../config/app.config.js';

import { useSalaDetalhe } from '../../hooks/useSalaDetalhe.jsx';

import PatrimonioCardVS from '../../components/salas/PatrimonioCardVS.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';
import ModalPatrimonio from '../../components/patrimonio/ModalPatrimonio.jsx';


export default function VisualizarSalaPage({
    navegarPara,
    idSala
}) {

    const token = obterToken();

    const {
        sala,
        setSala,
        loading: carregando,
        erro
    } = useSalaDetalhe(idSala);


    /*
     * ============================================================
     * ESTADOS
     * ============================================================
     */

    const [paginaAtual, setPaginaAtual] =
        useState(1);

    const [selecionados, setSelecionados] =
        useState(new Set());

    const [excluindoLote, setExcluindoLote] =
        useState(false);


    /*
     * Salas disponíveis para transferência
     */

    const [salasDisponiveis, setSalasDisponiveis] =
        useState([]);


    /*
     * Patrimônio que será transferido
     */

    const [
        patrimonioTransferencia,
        setPatrimonioTransferencia
    ] = useState(null);


    /*
     * Controla o carregamento da transferência
     */

    const [transferindo, setTransferindo] =
        useState(false);


    /*
     * Controla o estado do modal:
     *
     * null = fechado
     *
     * { id_sala: ... } = novo patrimônio
     *
     * patrimonioObj = editando
     */

    const [modalPatrimonio, setModalPatrimonio] =
        useState(null);


    /*
     * ============================================================
     * HISTÓRICO DE TRANSFERÊNCIAS
     * ============================================================
     */

    /*
     * Patrimônio cujo histórico está sendo visualizado
     */

    const [patrimonioHistorico, setPatrimonioHistorico] =
        useState(null);


    /*
     * Lista de transferências do patrimônio
     */

    const [historicoTransferencias, setHistoricoTransferencias] =
        useState([]);


    /*
     * Controla carregamento do histórico
     */

    const [carregandoHistorico, setCarregandoHistorico] =
        useState(false);


    const containerRef = useRef(null);


    /*
     * ============================================================
     * VOLTAR PARA SALAS
     * ============================================================
     */

    const voltarParaSalas = () =>
        navegarPara.salas();


    /*
     * ============================================================
     * PATRIMÔNIOS
     * ============================================================
     */

    const patrimonios =
        sala?.patrimonios || [];

    const total =
        patrimonios.length;

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                total / ITENS_POR_PAGINA
            )
        );


    /*
     * ============================================================
     * PAGINAÇÃO
     * ============================================================
     */

    useEffect(() => {

        if (
            paginaAtual >
            totalPaginas
        ) {

            setPaginaAtual(
                totalPaginas
            );

        }

    }, [
        totalPaginas,
        paginaAtual
    ]);


    const inicio =
        (paginaAtual - 1) *
        ITENS_POR_PAGINA;


    const pagina =
        patrimonios.slice(
            inicio,
            inicio + ITENS_POR_PAGINA
        );


    /*
     * ============================================================
     * CARREGAR SALAS PARA TRANSFERÊNCIA
     * ============================================================
     */

    useEffect(() => {

        async function carregarSalas() {

            if (!token) {
                return;
            }

            try {

                const resposta =
                    await listarSalas(token);


                /*
                 * O backend pode retornar:
                 *
                 * array
                 *
                 * ou:
                 *
                 * { result: [...] }
                 *
                 * ou:
                 *
                 * { data: [...] }
                 */

                const dados =
                    resposta?.result ??
                    resposta?.data?.result ??
                    resposta?.data ??
                    resposta ??
                    [];


                setSalasDisponiveis(
                    Array.isArray(dados)
                        ? dados
                        : []
                );


            } catch (erro) {

                console.error(
                    'Erro ao carregar salas para transferência:',
                    erro
                );

                setSalasDisponiveis([]);

            }

        }


        carregarSalas();

    }, [token]);


    /*
     * ============================================================
     * SELECIONAR PATRIMÔNIO
     * ============================================================
     */

    function toggleSelecionado(id) {

        setSelecionados((atual) => {

            const novo =
                new Set(atual);


            if (novo.has(id)) {

                novo.delete(id);

            } else {

                novo.add(id);

            }


            return novo;

        });

    }


    /*
     * ============================================================
     * SELECIONAR PÁGINA
     * ============================================================
     */

    function selecionarPagina(marcar) {

        setSelecionados((atual) => {

            const novo =
                new Set(atual);


            pagina.forEach((p) => {

                const id =
                    String(
                        p.id_patrimonio ||
                        p.id
                    );


                if (marcar) {

                    novo.add(id);

                } else {

                    novo.delete(id);

                }

            });


            return novo;

        });

    }


    /*
     * ============================================================
     * VERIFICAR SE TODOS ESTÃO SELECIONADOS
     * ============================================================
     */

    const todosDaPaginaSelecionados =
        pagina.length > 0 &&
        pagina.every(
            (p) =>
                selecionados.has(
                    String(
                        p.id_patrimonio ||
                        p.id
                    )
                )
        );


    /*
     * ============================================================
     * EXCLUIR PATRIMÔNIO INDIVIDUAL
     * ============================================================
     */

    async function excluirIndividual(
        id,
        nome
    ) {

        if (
            !confirm(
                `Excluir o patrimônio "${nome}"?`
            )
        ) {

            return;

        }


        try {

            const usuario =
                obterUsuarioAtual();

            const tkn =
                usuario?.token;


            if (!tkn) {

                alert(
                    'Sessão expirada.'
                );

                return;

            }


            await excluirPatrimonio(
                id,
                tkn
            );


            /*
             * Remove da sala atual
             */

            setSala((s) => ({

                ...s,

                patrimonios:
                    s.patrimonios.filter(
                        (p) =>
                            (p.id_patrimonio ||
                                p.id) != id
                    )

            }));


            /*
             * Remove da seleção
             */

            setSelecionados((atual) => {

                const novo =
                    new Set(atual);

                novo.delete(id);

                return novo;

            });


        } catch (err) {

            console.error(
                'Erro ao excluir patrimônio:',
                err
            );

            alert(
                'Não foi possível excluir o patrimônio.'
            );

        }

    }


    /*
     * ============================================================
     * EXCLUIR EM LOTE
     * ============================================================
     */

    async function excluirLote() {

        const ids =
            [...selecionados];


        const nomes =
            ids.map((id) => {

                const p =
                    sala.patrimonios.find(
                        (p) =>
                            (p.id_patrimonio ||
                                p.id) == id
                    );


                return (
                    p?.nome ||
                    `#${id}`
                );

            });


        const confirmMsg =
            ids.length === 1
                ? `Excluir o patrimônio "${nomes[0]}"?`
                : `Excluir ${ids.length} patrimônios selecionados?\n\n${nomes.join('\n')}`;


        if (!confirm(confirmMsg)) {
            return;
        }


        const usuario =
            obterUsuarioAtual();

        const tkn =
            usuario?.token;


        if (!tkn) {

            alert(
                'Sessão expirada.'
            );

            return;

        }


        setExcluindoLote(true);


        let erros = 0;

        let salaAtualizada =
            sala;


        for (
            const id of ids
        ) {

            try {

                await excluirPatrimonio(
                    id,
                    tkn
                );


                salaAtualizada = {

                    ...salaAtualizada,

                    patrimonios:
                        salaAtualizada.patrimonios.filter(
                            (p) =>
                                (p.id_patrimonio ||
                                    p.id) != id
                        )

                };


            } catch {

                erros++;

            }

        }


        setSala(
            salaAtualizada
        );


        setSelecionados(
            new Set()
        );


        setExcluindoLote(
            false
        );


        if (erros > 0) {

            alert(
                `${erros} item(ns) não puderam ser excluídos.`
            );

        }

    }


    /*
     * ============================================================
     * ABRIR NOVO PATRIMÔNIO
     * ============================================================
     */

    function abrirNovoPatrimonio() {

        setModalPatrimonio({

            id_sala:
                sala.id_sala ||
                sala.id

        });

    }


    /*
     * ============================================================
     * EDITAR PATRIMÔNIO
     * ============================================================
     */

    function editarPatrimonio(
        patrimonio
    ) {

        setModalPatrimonio(
            patrimonio
        );

    }


    /*
     * ============================================================
     * ABRIR TRANSFERÊNCIA
     * ============================================================
     */

    function abrirTransferencia(
        patrimonio
    ) {

        setPatrimonioTransferencia(
            patrimonio
        );

    }


    /*
     * ============================================================
     * REALIZAR TRANSFERÊNCIA
     * ============================================================
     */

    async function realizarTransferencia(
        patrimonio,
        idSalaDestino
    ) {

        const idPatrimonio =
            patrimonio.id_patrimonio ||
            patrimonio.id;


        if (!idPatrimonio) {

            alert(
                'Não foi possível identificar o patrimônio.'
            );

            return;

        }


        if (!idSalaDestino) {

            alert(
                'Selecione uma sala de destino.'
            );

            return;

        }


        try {

            setTransferindo(
                true
            );


            /*
             * Pega o token atualizado
             * no momento da transferência
             */

            const usuario =
                obterUsuarioAtual();

            const tkn =
                usuario?.token ||
                obterToken();


            if (!tkn) {

                alert(
                    'Sessão expirada.'
                );

                return;

            }


            /*
             * Chama a API
             */

            await transferirPatrimonio(
                idPatrimonio,
                idSalaDestino,
                tkn
            );


            /*
             * Remove o patrimônio da sala atual,
             * pois ele foi transferido.
             */

            setSala((atual) => ({

                ...atual,

                patrimonios:
                    atual.patrimonios.filter(
                        (p) =>
                            String(
                                p.id_patrimonio ||
                                p.id
                            ) !==
                            String(
                                idPatrimonio
                            )
                    )

            }));


            /*
             * Remove da seleção
             */

            setSelecionados((atual) => {

                const novo =
                    new Set(atual);

                novo.delete(
                    String(
                        idPatrimonio
                    )
                );

                return novo;

            });


            /*
             * Fecha o modal
             */

            setPatrimonioTransferencia(
                null
            );


            alert(
                'Patrimônio transferido com sucesso!'
            );


        } catch (erro) {

            console.error(
                'Erro ao transferir patrimônio:',
                erro
            );


            const mensagemErro =
                erro?.response?.data?.erro ||
                erro?.response?.data?.message ||
                erro?.response?.data?.mensagem ||
                erro?.response?.data?.errorMessage ||
                'Não foi possível transferir o patrimônio.';


            alert(
                mensagemErro
            );


        } finally {

            setTransferindo(
                false
            );

        }

    }


    /*
     * ============================================================
     * ABRIR HISTÓRICO
     * ============================================================
     */

    async function abrirHistorico(
        patrimonio
    ) {

        const idPatrimonio =
            patrimonio?.id_patrimonio ||
            patrimonio?.id;


        if (!idPatrimonio) {

            alert(
                'Não foi possível identificar o patrimônio.'
            );

            return;

        }


        /*
         * Abre o modal imediatamente
         */

        setPatrimonioHistorico(
            patrimonio
        );


        /*
         * Limpa o histórico anterior
         */

        setHistoricoTransferencias(
            []
        );


        /*
         * Mostra carregamento
         */

        setCarregandoHistorico(
            true
        );


        try {

            /*
             * Pega o token atualizado
             */

            const usuario =
                obterUsuarioAtual();

            const tkn =
                usuario?.token ||
                obterToken();


            if (!tkn) {

                alert(
                    'Sessão expirada.'
                );

                setPatrimonioHistorico(
                    null
                );

                return;

            }


            /*
             * Busca o histórico no backend
             */

            const resposta =
                await obterHistoricoTransferencias(
                    idPatrimonio,
                    tkn
                );


            /*
             * Aceita diferentes formatos
             * de resposta da API
             */

            const dados =
                resposta?.result ??
                resposta?.data?.result ??
                resposta?.data ??
                resposta ??
                [];


            setHistoricoTransferencias(
                Array.isArray(dados)
                    ? dados
                    : []
            );


        } catch (erro) {

            console.error(
                'Erro ao carregar histórico:',
                erro
            );


            const mensagemErro =
                erro?.response?.data?.erro ||
                erro?.response?.data?.message ||
                erro?.response?.data?.mensagem ||
                erro?.response?.data?.errorMessage ||
                'Não foi possível carregar o histórico.';


            alert(
                mensagemErro
            );


            setPatrimonioHistorico(
                null
            );


        } finally {

            setCarregandoHistorico(
                false
            );

        }

    }


    /*
     * ============================================================
     * FECHAR HISTÓRICO
     * ============================================================
     */

    function fecharHistorico() {

        if (carregandoHistorico) {
            return;
        }


        setPatrimonioHistorico(
            null
        );

        setHistoricoTransferencias(
            []
        );

    }


    /*
     * ============================================================
     * PATRIMÔNIO SALVO
     * ============================================================
     */

    function handlePatrimonioSalvo(
        patrimonioSalvo
    ) {

        const idSalvo =
            patrimonioSalvo.id_patrimonio ||
            patrimonioSalvo.id;


        setSala((s) => {

            const jaExiste =
                s.patrimonios.some(
                    (p) =>
                        (p.id_patrimonio ||
                            p.id) ===
                        idSalvo
                );


            if (jaExiste) {

                /*
                 * Se já existia,
                 * atualiza os dados na lista.
                 */

                return {

                    ...s,

                    patrimonios:
                        s.patrimonios.map(
                            (p) =>
                                (p.id_patrimonio ||
                                    p.id) ===
                                    idSalvo

                                    ? {
                                        ...p,
                                        ...patrimonioSalvo
                                    }

                                    : p
                        )

                };

            } else {

                /*
                 * Se é novo,
                 * adiciona à lista atual da sala.
                 */

                return {

                    ...s,

                    patrimonios: [
                        patrimonioSalvo,
                        ...s.patrimonios
                    ]

                };

            }

        });


        setModalPatrimonio(
            null
        );

    }


    /*
     * ============================================================
     * SESSÃO INVÁLIDA
     * ============================================================
     */

    if (!token) {

        return (

            <div className="sala-empty">

                <div>

                    <ion-icon
                        name="lock-closed-outline"
                        style={{
                            fontSize: '32px'
                        }}
                    ></ion-icon>

                </div>

                <p>
                    Sessão inválida.
                </p>

            </div>

        );

    }


    /*
     * ============================================================
     * CARREGANDO
     * ============================================================
     */

    if (carregando) {

        return (

            <div className="page-salas-container">

                <div className="editar-sala-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Carregando sala...
                    </p>

                </div>

            </div>

        );

    }


    /*
     * ============================================================
     * ERRO
     * ============================================================
     */

    if (
        erro ||
        !sala
    ) {

        return (

            <div className="page-salas-container">

                <div className="vs-empty">

                    <span className="vs-empty-icon">

                        <ion-icon
                            name="warning-outline"
                            style={{
                                fontSize: '20px'
                            }}
                        ></ion-icon>

                    </span>

                    <p>
                        Não foi possível carregar a sala.
                    </p>

                    <button
                        className="btn-action"
                        onClick={
                            voltarParaSalas
                        }
                    >
                        ← Voltar para Salas
                    </button>

                </div>

            </div>

        );

    }


    /*
     * ============================================================
     * IMAGEM DA SALA
     * ============================================================
     */

    const srcImagemSala =
        urlImagemSala(sala);


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <div
            className="page-salas-container"
            ref={containerRef}
        >

            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <header className="header-usuarios">

                <div>

                    <div className="breadcrumb-nav">

                        <button
                            className="breadcrumb-link"
                            onClick={
                                voltarParaSalas
                            }
                        >
                            Salas
                        </button>

                        <span className="breadcrumb-sep">
                            ›
                        </span>

                        <span className="breadcrumb-current">
                            Visualizar Sala
                        </span>

                    </div>

                    <h1>
                        {sala.descricao}
                    </h1>

                    <p className="page-subtitle">
                        Bloco {sala.bloco}
                        {' · '}
                        ID #{sala.id_sala || sala.id}
                    </p>

                </div>


                <div className="header-actions-group">

                    <button
                        className="btn-action"
                        onClick={
                            voltarParaSalas
                        }
                    >
                        ← Voltar
                    </button>

                    <button
                        className="btn-primary-custom"
                        onClick={() =>
                            navegarPara.editarSala(
                                sala.id_sala ||
                                sala.id
                            )
                        }
                    >
                        ✏ Editar Sala
                    </button>

                </div>

            </header>


            {/* =====================================================
                INFORMAÇÕES DA SALA
            ===================================================== */}

            <div className="visualizar-sala-layout">

                <aside className="visualizar-sala-info-card">

                    <div className="vs-img-wrapper">

                        {srcImagemSala && (

                            <img
                                className="sala-card-img"
                                alt={
                                    sala.descricao
                                }
                                src={
                                    srcImagemSala
                                }
                            />

                        )}

                    </div>


                    <div className="vs-meta">

                        <div className="vs-meta-row">

                            <span className="vs-meta-label">
                                Bloco
                            </span>

                            <span className="vs-meta-value">
                                {sala.bloco || '—'}
                            </span>

                        </div>


                        <div className="vs-meta-row">

                            <span className="vs-meta-label">
                                Identificador
                            </span>

                            <span className="vs-meta-value">
                                #{sala.id_sala || sala.id}
                            </span>

                        </div>


                        <div className="vs-meta-row">

                            <span className="vs-meta-label">
                                Patrimônios
                            </span>

                            <span className="vs-meta-value">

                                <span className="badge-patrimonio">

                                    {total}
                                    {' '}
                                    {total === 1
                                        ? 'item'
                                        : 'itens'}

                                </span>

                            </span>

                        </div>

                    </div>

                </aside>


                {/* =====================================================
                    PATRIMÔNIOS
                ===================================================== */}

                <section className="visualizar-sala-patrimonios-col">

                    <div className="vs-patrimonios-header">

                        <h2>
                            Patrimônios Vinculados
                            {' '}

                            <span className="vs-count">
                                {total}
                            </span>

                        </h2>


                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center'
                            }}
                        >

                            {total > 0 && (

                                <label
                                    className="vs-selecionar-todos-label"
                                    title="Selecionar todos desta página"
                                >

                                    <input
                                        type="checkbox"
                                        className="vs-cb-todos"
                                        checked={
                                            todosDaPaginaSelecionados
                                        }
                                        onChange={(e) =>
                                            selecionarPagina(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span>
                                        Selecionar página
                                    </span>

                                </label>

                            )}


                            <button
                                className="btn-primary-custom"
                                onClick={
                                    abrirNovoPatrimonio
                                }
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px'
                                }}
                            >
                                + Adicionar
                            </button>

                        </div>

                    </div>


                    <div>

                        {total === 0 ? (

                            <div className="vs-empty">

                                <span className="vs-empty-icon">

                                    <ion-icon
                                        name="cube-outline"
                                        style={{
                                            fontSize: '28px'
                                        }}
                                    ></ion-icon>

                                </span>

                                <p>
                                    Nenhum patrimônio vinculado a esta sala.
                                </p>

                            </div>

                        ) : (

                            <div className="vs-patrimonios-grid">

                                {pagina.map(
                                    (pat) => {

                                        const id =
                                            String(
                                                pat.id_patrimonio ||
                                                pat.id
                                            );


                                        return (

                                            <PatrimonioCardVS

                                                key={id}

                                                patrimonio={
                                                    pat
                                                }

                                                selecionado={
                                                    selecionados.has(
                                                        id
                                                    )
                                                }

                                                onToggleSelecionado={
                                                    toggleSelecionado
                                                }

                                                onEditar={
                                                    editarPatrimonio
                                                }

                                                onExcluir={
                                                    excluirIndividual
                                                }

                                                onTransferir={
                                                    abrirTransferencia
                                                }

                                                onHistorico={
                                                    abrirHistorico
                                                }

                                            />

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {totalPaginas > 1 && (

                        <Paginacao

                            totalItens={
                                total
                            }

                            paginaAtual={
                                paginaAtual
                            }

                            onPageChange={(
                                nova
                            ) => {

                                setPaginaAtual(
                                    nova
                                );

                                containerRef.current?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });

                            }}

                        />

                    )}

                </section>

            </div>


            {/* =====================================================
                BARRA DE SELEÇÃO
            ===================================================== */}

            {selecionados.size > 0 && (

                <div className="vs-selecao-barra vs-selecao-barra--visivel">

                    <div className="vs-selecao-barra-inner">

                        <span className="vs-selecao-info">

                            <span className="vs-selecao-icone">
                                ☑
                            </span>

                            {selecionados.size}
                            {' '}
                            patrimônio(s)
                            {' '}
                            selecionado(s)

                        </span>


                        <div className="vs-selecao-acoes">

                            <button
                                className="vs-btn-cancelar-selecao"
                                onClick={() =>
                                    setSelecionados(
                                        new Set()
                                    )
                                }
                            >
                                Cancelar
                            </button>


                            <button
                                className="vs-btn-excluir-lote"
                                disabled={
                                    excluindoLote
                                }
                                onClick={
                                    excluirLote
                                }
                            >

                                {excluindoLote
                                    ? 'Excluindo...'
                                    : '🗑 Excluir selecionados'}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                MODAL DE PATRIMÔNIO
            ===================================================== */}

            <ModalPatrimonio

                aberto={
                    Boolean(
                        modalPatrimonio
                    )
                }

                patrimonio={
                    modalPatrimonio
                }

                salas={[
                    sala
                ]}

                onSalvar={
                    handlePatrimonioSalvo
                }

                onFechar={() =>
                    setModalPatrimonio(
                        null
                    )
                }

            />


            {/* =====================================================
                MODAL DE TRANSFERÊNCIA
            ===================================================== */}

            <ModalTransferenciaPatrimonio

                aberto={
                    Boolean(
                        patrimonioTransferencia
                    )
                }

                patrimonio={
                    patrimonioTransferencia
                }

                salaAtual={
                    sala
                }

                salas={
                    salasDisponiveis
                }

                onTransferir={
                    realizarTransferencia
                }

                onFechar={() =>
                    setPatrimonioTransferencia(
                        null
                    )
                }

                transferindo={
                    transferindo
                }

            />


            {/* =====================================================
                MODAL DE HISTÓRICO
            ===================================================== */}

            <ModalHistoricoTransferencias

                aberto={
                    Boolean(
                        patrimonioHistorico
                    )
                }

                patrimonio={
                    patrimonioHistorico
                }

                historico={
                    historicoTransferencias
                }

                carregando={
                    carregandoHistorico
                }

                onFechar={
                    fecharHistorico
                }

            />

        </div>

    );

}