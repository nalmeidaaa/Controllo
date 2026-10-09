import { useEffect, useRef, useState } from 'react';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useSalas } from '../../hooks/useSalas.jsx';

import {
    criarSala,
    listarSalasDesativadas,
    ativarSala
} from '../../services/salaService.js';

import { criarPatrimonio } from '../../services/patrimonioService.js';

import {
    urlImagemSala,
    urlImagemPatrimonio
} from '../../services/imagemService.js';

import CardSala from '../../components/salas/CardSala.jsx';
import CardSalaDesativada from '../../components/salas/CardSalaDesativada.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';


export default function SalasPage({ navegarPara }) {

    const token = obterToken();

    /*
     * =====================================================
     * SALAS ATIVAS
     * =====================================================
     */
    const {
        salas: todas,
        setSalas: setTodas,
        loading: carregando,
        erro: erroCarregar,
        recarregar
    } = useSalas();


    /*
     * =====================================================
     * ESTADOS
     * =====================================================
     */

    const [salasDesativadas, setSalasDesativadas] = useState([]);

    /*
     * A aba é recuperada do sessionStorage.
     * Assim, quando o usuário entra em uma sala e volta,
     * ele permanece na mesma aba em que estava.
     */
    const [abaAtual, setAbaAtual] = useState(() => {
        return sessionStorage.getItem('salas_aba_atual') || 'ativas';
    });

    const [carregandoDesativadas, setCarregandoDesativadas] = useState(false);

    const [erroDesativadas, setErroDesativadas] = useState(false);

    const [paginaAtual, setPaginaAtual] = useState(() => {
        const paginaSalva = sessionStorage.getItem('salas_pagina_atual');

        return paginaSalva
            ? Number(paginaSalva)
            : 1;
    });

    const [selecionadas, setSelecionadas] = useState(new Set());

    const [duplicando, setDuplicando] = useState(false);

    const gridRef = useRef(null);


    /*
     * =====================================================
     * SALVAR ABA E PÁGINA ATUAIS
     * =====================================================
     */

    useEffect(() => {

        sessionStorage.setItem(
            'salas_aba_atual',
            abaAtual
        );

    }, [abaAtual]);


    useEffect(() => {

        sessionStorage.setItem(
            'salas_pagina_atual',
            String(paginaAtual)
        );

    }, [paginaAtual]);


    /*
     * =====================================================
     * LISTAR SALAS DESATIVADAS
     * =====================================================
     */

    async function carregarSalasDesativadas() {

        if (!token) {
            return;
        }

        try {

            setCarregandoDesativadas(true);
            setErroDesativadas(false);

            const resposta =
                await listarSalasDesativadas(token);

            /*
             * O backend pode retornar diretamente um array
             * ou um objeto contendo result.
             */

            const dados =
                resposta?.result ??
                resposta ??
                [];

            setSalasDesativadas(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch (erro) {

            console.error(
                'Erro ao carregar salas desativadas:',
                erro
            );

            setErroDesativadas(true);

        } finally {

            setCarregandoDesativadas(false);

        }
    }


    /*
     * =====================================================
     * CARREGAR DESATIVADAS AO ABRIR A ABA
     * =====================================================
     */

    useEffect(() => {

        if (abaAtual === 'desativadas') {
            carregarSalasDesativadas();
        }

    }, [abaAtual]);


    /*
     * =====================================================
     * TROCAR ABA
     * =====================================================
     */

   
function trocarAba(aba) {

    setAbaAtual(aba);

    /*
     * Salva imediatamente a aba escolhida.
     */
    sessionStorage.setItem(
        'salas_aba_atual',
        aba
    );

    /*
     * Volta para a primeira página ao trocar de aba.
     */
    setPaginaAtual(1);

    sessionStorage.setItem(
        'salas_pagina_atual',
        '1'
    );

    /*
     * Limpa as salas selecionadas.
     */
    setSelecionadas(new Set());

    /*
     * Volta ao início da página.
     */
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
    });

}

    /*
     * =====================================================
     * EXCLUIR DA LISTA DE ATIVAS
     * =====================================================
     *
     * A exclusão aqui é somente visual.
     *
     * O CardSala já chama a API para desativar.
     */

    function handleExcluir(id) {

        setTodas((atual) =>
            atual.filter(
                (s) =>
                    (s.id_sala || s.id) !== id
            )
        );

        setSelecionadas((atual) => {

            const novo = new Set(atual);

            novo.delete(String(id));

            return novo;

        });

    }


    /*
     * =====================================================
     * REATIVAR SALA
     * =====================================================
     */

    async function handleReativar(sala) {

        const id =
            sala.id_sala ||
            sala.id;

        if (!id) {

            alert(
                'Não foi possível identificar a sala.'
            );

            return;

        }


        const confirmar = confirm(
            'Deseja reativar esta sala?'
        );

        if (!confirmar) {
            return;
        }


        try {

            if (!token) {

                alert(
                    'Sessão inválida. Faça login novamente.'
                );

                return;

            }


            /*
             * Reativa a sala no backend
             */

            await ativarSala(
                id,
                token
            );


            /*
             * Remove imediatamente a sala
             * da lista de salas desativadas
             */

            setSalasDesativadas(
                (atual) =>
                    atual.filter(
                        (s) =>
                            String(
                                s.id_sala || s.id
                            ) !== String(id)
                    )
            );


            /*
             * Atualiza a lista de salas ativas
             */

            await recarregar();


            /*
             * Volta automaticamente para
             * a aba de salas ativas
             */

            setAbaAtual('ativas');

            sessionStorage.setItem(
                'salas_aba_atual',
                'ativas'
            );


            /*
             * Volta para a primeira página
             */

            setPaginaAtual(1);

            sessionStorage.setItem(
                'salas_pagina_atual',
                '1'
            );


            /*
             * Limpa qualquer seleção anterior
             */

            setSelecionadas(
                new Set()
            );


            /*
             * Mensagem de sucesso
             */

            alert(
                'Sala reativada com sucesso!'
            );


        } catch (erro) {

            console.error(
                'Erro ao reativar sala:',
                erro
            );

            alert(
                erro?.response?.data?.message ||
                'Não foi possível reativar a sala.'
            );

        }

    }


    /*
     * =====================================================
     * SESSÃO INVÁLIDA
     * =====================================================
     */

    if (!token) {

        return (
            <div className="page-salas-container">

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
                        Faça login novamente.
                    </p>

                </div>

            </div>
        );

    }


    /*
     * =====================================================
     * LISTA ATUAL
     * =====================================================
     */

    const listaAtual =
        abaAtual === 'ativas'
            ? todas
            : salasDesativadas;


    /*
     * =====================================================
     * PAGINAÇÃO
     * =====================================================
     */

    const inicio =
        (paginaAtual - 1) *
        ITENS_POR_PAGINA;

    const pagina =
        listaAtual.slice(
            inicio,
            inicio + ITENS_POR_PAGINA
        );


    /*
     * =====================================================
     * SELECIONAR SALA
     * =====================================================
     */

    function toggleSelecionada(id) {

        setSelecionadas((atual) => {

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
     * =====================================================
     * SELECIONAR PÁGINA
     * =====================================================
     */

    function selecionarPagina(marcar) {

        setSelecionadas((atual) => {

            const novo =
                new Set(atual);

            pagina.forEach((s) => {

                const id =
                    String(
                        s.id_sala ||
                        s.id
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
     * =====================================================
     * TODAS DA PÁGINA SELECIONADAS
     * =====================================================
     */

    const todosDaPaginaSelecionados =
        abaAtual === 'ativas' &&
        pagina.length > 0 &&
        pagina.every(
            (s) =>
                selecionadas.has(
                    String(
                        s.id_sala ||
                        s.id
                    )
                )
        );


    /*
     * =====================================================
     * DUPLICAR IMAGEM
     * =====================================================
     */

    async function duplicarImagemComoBlob(src) {

        try {

            const resposta =
                await fetch(src);

            return await resposta.blob();

        } catch (erroImagem) {

            console.warn(
                'Não foi possível copiar a imagem ao duplicar:',
                erroImagem
            );

            return null;

        }

    }


    /*
     * =====================================================
     * DUPLICAR SALA
     * =====================================================
     */

    async function duplicarSala(sala) {

        const formData =
            new FormData();

        formData.append(
            'descricao',
            `${sala.descricao || sala.nome || 'Sala'} (Cópia)`
        );

        formData.append(
            'bloco',
            sala.bloco ?? ''
        );


        /*
         * Copiar imagem da sala
         */

        const srcImagemSala =
            urlImagemSala(sala);

        if (srcImagemSala) {

            const blob =
                await duplicarImagemComoBlob(
                    srcImagemSala
                );

            if (blob) {

                formData.append(
                    'imagem_sala',
                    blob,
                    'imagem.jpg'
                );

            }

        }


        const resposta =
            await criarSala(
                formData,
                token
            );


        const salaCriadaRaw =
            resposta?.result ??
            resposta;


        const salaCriada =
            Array.isArray(salaCriadaRaw)
                ? salaCriadaRaw[0]
                : salaCriadaRaw;


        const novoIdSala =
            salaCriada?.id_sala ??
            salaCriada?.id;


        /*
         * Duplicar patrimônios
         */

        const patrimoniosOriginais =
            sala.patrimonios || [];

        let errosPatrimonios = 0;


        if (
            novoIdSala &&
            patrimoniosOriginais.length > 0
        ) {

            for (
                const pat
                of patrimoniosOriginais
            ) {

                try {

                    const patFormData =
                        new FormData();


                    patFormData.append(
                        'nome',
                        pat.nome ||
                        'Patrimônio'
                    );


                    patFormData.append(
                        'status',
                        pat.status ||
                        'Ok'
                    );


                    patFormData.append(
                        'id_sala',
                        novoIdSala
                    );


                    if (
                        pat.numero_patrimonio
                    ) {

                        patFormData.append(
                            'numero_patrimonio',
                            pat.numero_patrimonio
                        );

                    }


                    const srcImagemPat =
                        urlImagemPatrimonio(
                            pat
                        );


                    if (srcImagemPat) {

                        const blob =
                            await duplicarImagemComoBlob(
                                srcImagemPat
                            );


                        if (blob) {

                            patFormData.append(
                                'imagem',
                                blob,
                                'imagem.jpg'
                            );

                        }

                    }


                    await criarPatrimonio(
                        patFormData,
                        token
                    );


                } catch (
                    erroPatrimonio
                ) {

                    console.error(
                        'Erro ao duplicar patrimônio:',
                        erroPatrimonio
                    );

                    errosPatrimonios++;

                }

            }

        }


        return {
            novoIdSala,
            errosPatrimonios
        };

    }


    /*
     * =====================================================
     * DUPLICAR EM LOTE
     * =====================================================
     */

    async function handleDuplicarLote() {

        const ids =
            [...selecionadas];


        if (ids.length === 0) {
            return;
        }


        const confirmMsg =
            ids.length === 1
                ? 'Duplicar a sala selecionada com seus patrimônios?'
                : `Duplicar ${ids.length} salas selecionadas com seus patrimônios?`;


        if (!confirm(confirmMsg)) {
            return;
        }


        setDuplicando(true);


        let erros = 0;

        let errosPatrimoniosTotal = 0;


        for (const id of ids) {

            const salaOriginal =
                todas.find(
                    (s) =>
                        String(
                            s.id_sala ||
                            s.id
                        ) === id
                );


            if (!salaOriginal) {
                continue;
            }


            try {

                const {
                    errosPatrimonios
                } =
                    await duplicarSala(
                        salaOriginal
                    );


                errosPatrimoniosTotal +=
                    errosPatrimonios;


            } catch (erroDuplicar) {

                console.error(
                    'Erro ao duplicar sala:',
                    erroDuplicar
                );

                erros++;

            }

        }


        setDuplicando(false);

        setSelecionadas(
            new Set()
        );


        await recarregar();


        if (erros > 0) {

            alert(
                `${erros} sala(s) não puderam ser duplicadas.`
            );

        } else if (
            errosPatrimoniosTotal > 0
        ) {

            alert(
                `${errosPatrimoniosTotal} patrimônio(s) não puderam ser duplicados.`
            );

        }

    }


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (

        <div className="page-salas-container">

            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <header className="header-usuarios">

                <div>

                    <h1>
                        Gerenciar Salas
                    </h1>

                    <p className="page-subtitle">
                        Visualização e modificação
                        de salas em tempo real.
                    </p>

                </div>


                {/* BOTÃO NOVA SALA */}

                <button
                    className="btn-primary-custom"
                    onClick={() =>
                        navegarPara.criarSala()
                    }
                >
                    + Nova Sala
                </button>

            </header>


            {/* =====================================================
                ABAS
            ===================================================== */}

            <div className="salas-abas">

                <button
                    type="button"
                    className={
                        abaAtual === 'ativas'
                            ? 'sala-aba ativa'
                            : 'sala-aba'
                    }
                    onClick={() =>
                        trocarAba('ativas')
                    }
                >
                    Salas Ativas

                    <span className="salas-aba-contador">
                        {todas.length}
                    </span>

                </button>


                <button
                    type="button"
                    className={
                        abaAtual === 'desativadas'
                            ? 'sala-aba ativa'
                            : 'sala-aba'
                    }
                    onClick={() =>
                        trocarAba('desativadas')
                    }
                >
                    Salas Desativadas

                    <span className="salas-aba-contador">
                        {salasDesativadas.length}
                    </span>

                </button>

            </div>


            {/* =====================================================
                SELEÇÃO
            ===================================================== */}

            {abaAtual === 'ativas' &&
                !carregando &&
                !erroCarregar &&
                todas.length > 0 && (

                    <div className="salas-selecao-header">

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

                    </div>

                )}


            {/* =====================================================
                GRID
            ===================================================== */}

            <div ref={gridRef}>

                {/* =========================
                    SALAS ATIVAS
                ========================= */}

                {abaAtual === 'ativas' && (

                    carregando ? (

                        <div className="sala-empty">

                            <p>
                                Carregando salas...
                            </p>

                        </div>

                    ) : erroCarregar ? (

                        <div className="sala-empty">

                            <div>

                                <ion-icon
                                    name="warning-outline"
                                    style={{
                                        fontSize: '32px'
                                    }}
                                ></ion-icon>

                            </div>

                            <p>
                                Não foi possível
                                carregar as salas.
                                Verifique a conexão
                                com a API.
                            </p>

                        </div>

                    ) : todas.length === 0 ? (

                        <div className="tabela-card">

                            <div className="tabela-empty">

                                <div className="tabela-empty-icon">

                                    <ion-icon
                                        name="log-in-outline"
                                        style={{
                                            fontSize: '32px'
                                        }}
                                    ></ion-icon>

                                </div>

                                <p>
                                    Nenhuma sala encontrada.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="salas-grid-container">

                            {pagina.map((sala) => {

                                const id =
                                    String(
                                        sala.id_sala ||
                                        sala.id
                                    );


                                return (

                                    <CardSala

                                        key={id}

                                        sala={sala}

                                        selecionado={
                                            selecionadas.has(
                                                id
                                            )
                                        }

                                        onToggleSelecionado={
                                            toggleSelecionada
                                        }

                                        onVisualizar={(s) =>
                                            navegarPara.visualizarSala(
                                                s.id_sala ||
                                                s.id
                                            )
                                        }

                                        onEditar={(s) =>
                                            navegarPara.editarSala(
                                                s.id_sala ||
                                                s.id
                                            )
                                        }

                                        onExcluir={
                                            handleExcluir
                                        }

                                    />

                                );

                            })}

                        </div>

                    )

                )}


                {/* =========================
                    SALAS DESATIVADAS
                ========================= */}

                {abaAtual === 'desativadas' && (

                    carregandoDesativadas ? (

                        <div className="sala-empty">

                            <p>
                                Carregando salas desativadas...
                            </p>

                        </div>

                    ) : erroDesativadas ? (

                        <div className="sala-empty">

                            <div>

                                <ion-icon
                                    name="warning-outline"
                                    style={{
                                        fontSize: '32px'
                                    }}
                                ></ion-icon>

                            </div>

                            <p>
                                Não foi possível
                                carregar as salas
                                desativadas.
                            </p>

                        </div>

                    ) : salasDesativadas.length === 0 ? (

                        <div className="tabela-card">

                            <div className="tabela-empty">

                                <div className="tabela-empty-icon">

                                    <ion-icon
                                        name="checkmark-circle-outline"
                                        style={{
                                            fontSize: '32px'
                                        }}
                                    ></ion-icon>

                                </div>

                                <p>
                                    Nenhuma sala desativada.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="salas-grid-container">

                            {pagina.map((sala) => {

                                const id =
                                    String(
                                        sala.id_sala ||
                                        sala.id
                                    );


                                return (

                                    <CardSalaDesativada

                                        key={id}

                                        sala={sala}

                                        onVisualizar={(s) =>
                                            navegarPara.visualizarSala(
                                                s.id_sala ||
                                                s.id
                                            )
                                        }

                                        onReativar={
                                            handleReativar
                                        }

                                    />

                                );

                            })}

                        </div>

                    )

                )}

            </div>


            {/* =====================================================
                CONTADOR
            ===================================================== */}

            <div>

                <div className="paginacao-contador">

                    {listaAtual.length === 0

                        ? (
                            abaAtual === 'ativas'
                                ? 'Nenhuma sala encontrada.'
                                : 'Nenhuma sala desativada.'
                        )

                        : (
                            `Exibindo ${inicio + 1}–${Math.min(
                                paginaAtual *
                                ITENS_POR_PAGINA,
                                listaAtual.length
                            )} de ${listaAtual.length} salas`
                        )

                    }

                </div>


                <Paginacao

                    totalItens={
                        listaAtual.length
                    }

                    paginaAtual={
                        paginaAtual
                    }

                    onPageChange={(nova) => {

                        setPaginaAtual(nova);

                        sessionStorage.setItem(
                            'salas_pagina_atual',
                            String(nova)
                        );

                        gridRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                    }}

                />

            </div>


            {/* =====================================================
                BARRA DE SELEÇÃO
            ===================================================== */}

            {abaAtual === 'ativas' &&
                selecionadas.size > 0 && (

                    <div className="vs-selecao-barra vs-selecao-barra--visivel">

                        <div className="vs-selecao-barra-inner">

                            <span className="vs-selecao-info">

                                <span className="vs-selecao-icone">
                                    ☑
                                </span>

                                {selecionadas.size}
                                {' '}
                                sala(s)
                                selecionada(s)

                            </span>


                            <div className="vs-selecao-acoes">

                                <button
                                    className="vs-btn-cancelar-selecao"
                                    onClick={() =>
                                        setSelecionadas(
                                            new Set()
                                        )
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    className="btn-duplicar-lote"
                                    disabled={
                                        duplicando
                                    }
                                    onClick={
                                        handleDuplicarLote
                                    }
                                >

                                    {duplicando

                                        ? 'Duplicando...'

                                        : '⧉ Duplicar selecionadas'

                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );

}