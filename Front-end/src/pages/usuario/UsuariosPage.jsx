import { useEffect, useMemo, useRef, useState } from 'react';
import {
    criarUsuario,
    atualizarUsuario,
    desativarUsuario,
    ativarUsuario,
    aprovarCadastro,
    recusarCadastro
} from '../../services/usuarioService.js';

import { obterToken, obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useUsuarios } from '../../hooks/useUsuarios.jsx';
import { usePendentes } from '../../hooks/usePendentes.jsx';
import { idDoUsuario } from '../../utils/usuario.js';
import BarraFiltros from '../../components/usuario/BarraFiltros.jsx';
import TabelaUsuarios from '../../components/usuario/TabelaUsuarios.jsx';
import ModalUsuario from '../../components/usuario/ModalUsuario.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';
import TabelaPendentes from '../../components/aprovacao/TabelaPendentes.jsx';
import ModalAprovar from '../../components/aprovacao/ModalAprovar.jsx';
import ModalRecusar from '../../components/aprovacao/ModalRecusar.jsx';
import './UsuariosPage.css';

const semAcento = (texto = '') =>
    String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

// abaInicial: 'pendentes' abre direto na fila de aprovação (ex.: vindo do aviso do dashboard)
export default function UsuariosPage({ abaInicial, onPendentesAtualizados }) {
    const token = obterToken();
    const usuarioLogado = obterUsuarioAtual();
    const idLogado = idDoUsuario(usuarioLogado);

    // somente a administração enxerga/gerencia cadastros pendentes
    const ehAdmin = semAcento(usuarioLogado?.tipo_usuario) === 'administracao';

    const {
        usuarios: todos,
        loading: carregando,
        erro: erroCarregar,
        recarregar
    } = useUsuarios();

    const {
        pendentes,
        carregando: carregandoPendentes,
        erro: erroPendentes,
        recarregar: recarregarPendentes
    } = usePendentes({ ativo: ehAdmin });

    const [termoBusca, setTermoBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState(
        ehAdmin && abaInicial === 'pendentes' ? 'pendentes' : 'todos'
    );
    const abaPendentes = filtroTipo === 'pendentes';

    // fluxo de aprovação / recusa
    const [aprovando, setAprovando] = useState(null);
    const [recusando, setRecusando] = useState(null);
    const [executando, setExecutando] = useState(false);
    const [erroModal, setErroModal] = useState('');
    const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }
    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const tabelaRef = useRef(null);

    const filtrados = useMemo(() => {
        const termo = termoBusca.toLowerCase();

        return todos.filter((usuario) => {

            // 0. A própria conta nunca aparece na lista (é editada em "Meu perfil")
            if (idLogado != null && String(usuario.id_usuario ?? usuario.id) === String(idLogado)) {
                return false;
            }

            // 1. Verifica se o usuário está inativo/desativado
            const estaInativo =
                usuario.status?.toLowerCase() === 'inativo' ||
                usuario.status?.toLowerCase() === 'desativado' ||
                usuario.tipo_usuario?.toLowerCase() === 'desativado' ||
                usuario.ativo === false;

            // 2. Filtro por texto (Nome, CPF ou E-mail)
            const bateTexto =
                !termo ||
                [
                    usuario.nome || '',
                    usuario.cpf || '',
                    usuario.email || ''
                ].some((campo) =>
                    campo.toLowerCase().includes(termo)
                );

            if (!bateTexto) return false;

            // 3. Regra dos Filtros por aba
            if (filtroTipo === 'todos') {
                return !estaInativo;
            }

            if (filtroTipo === 'desativado') {
                return estaInativo;
            }

            // Para as demais abas (Admin, Manutenção, Geral)
            const tipo = (usuario.tipo_usuario || '').toLowerCase();

            return !estaInativo && tipo.includes(filtroTipo);
        });

    }, [todos, termoBusca, filtroTipo, idLogado]);

    // Cadastros pendentes, com a mesma busca por nome / CPF / e-mail
    const pendentesFiltrados = useMemo(() => {
        const termo = termoBusca.toLowerCase();
        if (!termo) return pendentes;
        return pendentes.filter((u) =>
            [u.nome || '', u.cpf || '', u.email || ''].some((c) => c.toLowerCase().includes(termo))
        );
    }, [pendentes, termoBusca]);

    // Lista exibida depende da aba
    const listaAtual = abaPendentes ? pendentesFiltrados : filtrados;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    const paginaDados = listaAtual.slice(
        inicio,
        inicio + ITENS_POR_PAGINA
    );


    // ============================================================
    // APROVAR / RECUSAR CADASTROS
    // ============================================================
    function mensagemDeErro(error, padrao) {
        if (error.response?.status === 403) return 'Você não tem permissão para esta ação.';
        return error.response?.data?.message || (error.response ? padrao : 'Não foi possível conectar ao servidor.');
    }

    // atualiza a fila, a lista de usuários (quem foi aprovado entra nela) e o contador do menu
    async function depoisDaAcao() {
        await Promise.all([recarregarPendentes(), recarregar()]);
        onPendentesAtualizados?.();
    }

    async function confirmarAprovacao(perfil) {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await aprovarCadastro(token, aprovando.id_usuario, perfil);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro aprovado com sucesso.' });
            setAprovando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível aprovar o cadastro.'));
            // 404/409: o cadastro já foi tratado por outra pessoa; atualiza a lista
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    async function confirmarRecusa() {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await recusarCadastro(token, recusando.id_usuario);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro recusado e excluído.' });
            setRecusando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível recusar o cadastro.'));
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    function abrirAprovar(usuario) {
        setMensagem(null);
        setErroModal('');
        setAprovando(usuario);
    }

    function abrirRecusar(usuario) {
        setMensagem(null);
        setErroModal('');
        setRecusando(usuario);
    }

    function trocarFiltro(tipo) {
        setFiltroTipo(tipo);
        setPaginaAtual(1);
        if (tipo !== 'pendentes') setMensagem(null);
    }

    // Terminou a fila: volta sozinho para a lista de usuários
    useEffect(() => {
        if (abaPendentes && !carregandoPendentes && pendentes.length === 0 && mensagem?.tipo === 'sucesso') {
            setFiltroTipo('todos');
            setPaginaAtual(1);
        }
    }, [abaPendentes, carregandoPendentes, pendentes.length, mensagem]);


    // ============================================================
    // ABRIR NOVO USUÁRIO
    // ============================================================
    function abrirNovo() {
        setUsuarioEditando(null);
        setModalAberto(true);
    }


    // ============================================================
    // ABRIR EDIÇÃO
    // ============================================================
    function abrirEdicao(usuario) {
        setUsuarioEditando(usuario);
        setModalAberto(true);
    }


    // ============================================================
    // DESATIVAR USUÁRIO
    // ============================================================
    async function desativaroUsuario(id, nome) {

        const usuarioAtual = obterUsuarioAtual();

        if (String(usuarioAtual?.id_usuario) === String(id)) {
            alert(
                'Você não pode desativar a sua própria conta enquanto está logado.'
            );
            return;
        }

        const confirmacao = confirm(
            `Tem certeza que deseja desativar o usuário ${nome ? `"${nome}"` : ''}?`
        );

        if (!confirmacao) return;

        try {

            await desativarUsuario(token, id);

            await recarregar();

        } catch (error) {

            alert(
                'Não foi possível desativar o usuário. Tente novamente.'
            );

            console.error(
                'Erro ao desativar:',
                error
            );
        }
    }


    // ============================================================
    // ATIVAR USUÁRIO
    // ============================================================
    async function ativaroUsuario(id, nome, tipoUsuarioAntigo) {

        const usuarioAtual = obterUsuarioAtual();

        if (String(usuarioAtual?.id_usuario) === String(id)) {
            alert(
                'Você não pode alterar a sua própria conta enquanto está logado.'
            );
            return;
        }

        const confirmacao = confirm(
            `Tem certeza que deseja ativar o usuário ${nome ? `"${nome}"` : ''}?`
        );

        if (!confirmacao) return;

        try {

            // Retorna o usuário para o tipo_usuario_antigo.
            // Se não houver um tipo antigo válido, ele será ativado como Geral.
            const tiposValidos = [
                'administracao',
                'manutencao',
                'geral'
            ];

            const tipoNormalizado = (tipoUsuarioAntigo || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();

            const tipoOriginal = tiposValidos.includes(tipoNormalizado)
                ? tipoNormalizado
                : 'geral';

            await ativarUsuario(
                token,
                id,
                tipoOriginal
            );

            await recarregar();

            // Mantém o usuário na aba de desativados,
            // apenas atualizando a tabela.
            setPaginaAtual(1);

        } catch (error) {

            alert(
                'Não foi possível ativar o usuário. Tente novamente.'
            );

            console.error(
                'Erro ao ativar:',
                error
            );
        }
    }


    // ============================================================
    // SALVAR USUÁRIO
    // ============================================================
    async function salvarUsuarioModal(formData) {

        // Verifica se é edição
        // pegando o ID diretamente de dentro do formData
        const id = formData.get('id');

        if (id) {

            await atualizarUsuario(
                token,
                id,
                formData
            );

        } else {

            await criarUsuario(
                token,
                formData
            );
        }

        setModalAberto(false);

        await recarregar();
    }


    // ============================================================
    // VERIFICA TOKEN
    // ============================================================
    if (!token) {
        return (
            <div className="page-usuarios-container">

                <div className="tabela-card">

                    <div className="tabela-empty">

                        <div className="tabela-empty-icon">
                            🔒
                        </div>

                        <p>
                            Sessão inválida. Faça login novamente.
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // TELA
    // ============================================================
    return (
        <div className="page-usuarios-container">

            <header className="header-usuarios">

                <div>

                    <h1>
                        Gerenciar Usuários
                    </h1>

                    <p className="page-subtitle">
                        Gerencie acessos e libere os novos cadastros em um só lugar.
                    </p>

                </div>

                <button
                    className="btn-primary-custom"
                    onClick={abrirNovo}
                >
                    + Novo Usuário
                </button>

            </header>


            {/* AVISO: há cadastros esperando e a pessoa está em outra aba */}
            {ehAdmin && !abaPendentes && pendentes.length > 0 && (
                <div className="aprov-banner" role="status">
                    <span className="aprov-banner-texto">
                        <strong>
                            {pendentes.length} cadastro{pendentes.length === 1 ? '' : 's'}
                        </strong>{' '}
                        aguardando aprovação
                    </span>
                    <button
                        type="button"
                        className="aprov-banner-btn"
                        onClick={() => trocarFiltro('pendentes')}
                    >
                        Revisar agora
                    </button>
                </div>
            )}

            {/* Resultado da última aprovação / recusa */}
            {mensagem && (
                <div className={`aprov-mensagem ${mensagem.tipo}`} role="status">
                    {mensagem.texto}
                </div>
            )}


            {/* FILTROS */}
            <BarraFiltros
                filtroAtivo={filtroTipo}
                pendentes={ehAdmin && !erroPendentes ? pendentes.length : undefined}
                onBusca={(termo) => {
                    setTermoBusca(termo);
                    setPaginaAtual(1);
                }}
                onFiltro={trocarFiltro}
            />


            {/* TABELA */}
            <div ref={tabelaRef}>

                {abaPendentes ? (

                    carregandoPendentes ? (
                        <div className="tabela-card">
                            <div className="aprov-estado">Carregando cadastros...</div>
                        </div>
                    ) : erroPendentes ? (
                        <div className="tabela-card">
                            <div className="aprov-estado">
                                <p>{erroPendentes}</p>
                                <button className="btn-primary-custom" onClick={recarregarPendentes}>
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    ) : pendentesFiltrados.length === 0 ? (
                        <div className="tabela-card">
                            <div className="aprov-estado">
                                {pendentes.length === 0
                                    ? 'Nenhum cadastro aguardando aprovação.'
                                    : 'Nenhum cadastro pendente corresponde à busca.'}
                            </div>
                        </div>
                    ) : (
                        <TabelaPendentes
                            pendentes={paginaDados}
                            ocupado={executando}
                            onAprovar={abrirAprovar}
                            onRecusar={abrirRecusar}
                        />
                    )

                ) : carregando ? (

                    <div className="tabela-card">

                        <div className="tabela-empty">

                            <p>
                                Carregando usuários...
                            </p>

                        </div>

                    </div>

                ) : erroCarregar ? (

                    <div className="tabela-card">

                        <div className="tabela-empty">

                            <div className="tabela-empty-icon">
                                ⚠️
                            </div>

                            <p>
                                Não foi possível carregar os usuários.
                                Verifique a conexão com a API.
                            </p>

                        </div>

                    </div>

                ) : (

                    <TabelaUsuarios
                        usuarios={paginaDados}
                        onEditar={abrirEdicao}
                        onDesativar={desativaroUsuario}
                        onAtivar={ativaroUsuario}
                    />

                )}

            </div>


            {/* PAGINAÇÃO */}
            <div>

                <div className="paginacao-contador">

                    {listaAtual.length === 0

                        ? 'Nenhum resultado encontrado.'

                        : `Exibindo ${inicio + 1}–${Math.min(
                            paginaAtual * ITENS_POR_PAGINA,
                            listaAtual.length
                        )} de ${listaAtual.length} ${abaPendentes ? 'cadastros' : 'usuários'}`

                    }

                </div>


                <Paginacao
                    totalItens={listaAtual.length}
                    paginaAtual={paginaAtual}

                    onPageChange={(nova) => {

                        setPaginaAtual(nova);

                        tabelaRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                    }}
                />

            </div>


            {/* MODAL USUÁRIO */}
            <ModalUsuario
                aberto={modalAberto}
                usuario={usuarioEditando}
                onSalvar={salvarUsuarioModal}
                onFechar={() => setModalAberto(false)}
            />

            {/* MODAIS DE APROVAÇÃO */}
            {aprovando && (
                <ModalAprovar
                    usuario={aprovando}
                    salvando={executando}
                    erro={erroModal}
                    onConfirmar={confirmarAprovacao}
                    onFechar={() => !executando && setAprovando(null)}
                />
            )}

            {recusando && (
                <ModalRecusar
                    usuario={recusando}
                    salvando={executando}
                    erro={erroModal}
                    onConfirmar={confirmarRecusa}
                    onFechar={() => !executando && setRecusando(null)}
                />
            )}

        </div>
    );
}