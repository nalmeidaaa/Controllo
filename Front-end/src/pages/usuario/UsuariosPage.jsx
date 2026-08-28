import { useMemo, useRef, useState } from 'react';
import { criarUsuario, atualizarUsuario, desativarUsuario } from '../../services/usuarioService.js';
import { obterToken, obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import { useUsuarios } from '../../hooks/useUsuarios.jsx';
import BarraFiltros from '../../components/usuario/BarraFiltros.jsx';
import TabelaUsuarios from '../../components/usuario/TabelaUsuarios.jsx';
import ModalUsuario from '../../components/usuario/ModalUsuario.jsx';
import Paginacao from '../../components/shared/Paginacao.jsx';

export default function UsuariosPage() {
    const token = obterToken();

    const { usuarios: todos, loading: carregando, erro: erroCarregar, recarregar } = useUsuarios();
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [paginaAtual, setPaginaAtual] = useState(1);

    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const tabelaRef = useRef(null);

   const filtrados = useMemo(() => {
    const termo = termoBusca.toLowerCase();

    return todos.filter((usuario) => {
        // 1. Verifica se o usuário está inativo/desativado
        const estaInativo =
            usuario.status?.toLowerCase() === 'inativo' ||
            usuario.status?.toLowerCase() === 'desativado' ||
            usuario.tipo_usuario?.toLowerCase() === 'desativado' ||
            usuario.ativo === false;

        // 2. Filtro por texto (Nome, CPF ou E-mail)
        const bateTexto =
            !termo ||
            [usuario.nome || '', usuario.cpf || '', usuario.email || ''].some((campo) =>
                campo.toLowerCase().includes(termo)
            );

        if (!bateTexto) return false;

        // 3. Regra dos Filtros por aba
        if (filtroTipo === 'todos') {
            return !estaInativo; // Esconde os desativados na aba "Todos"
        }

        if (filtroTipo === 'desativado') {
            return estaInativo; // Mostra APENAS os desativados na aba "Desativados"
        }

        // Para as demais abas (Admin, Manutenção, Geral)
        const tipo = (usuario.tipo_usuario || '').toLowerCase();
        return !estaInativo && tipo.includes(filtroTipo);
    });
}, [todos, termoBusca, filtroTipo]);
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const paginaDados = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

    function abrirNovo() {
        setUsuarioEditando(null);
        setModalAberto(true);
    }

    function abrirEdicao(usuario) {
        setUsuarioEditando(usuario);
        setModalAberto(true);
    }

    // Função ajustada para aceitar (id, nome) conforme disparado pelo TabelaUsuarios
    async function desativaroUsuario(id, nome) {
        const usuarioAtual = obterUsuarioAtual();
        if (String(usuarioAtual?.id_usuario) === String(id)) {
            alert('Você não pode desativar a sua própria conta enquanto está logado.');
            return;
        }
        const confirmacao = confirm(`Tem certeza que deseja desativar o usuário ${nome ? `"${nome}"` : ''}?`);
        if (!confirmacao) return;

        try {
            await desativarUsuario(token, id);
            await recarregar();
        } catch (error) {
            alert('Não foi possível desativar o usuário. Tente novamente.');
            console.error('Erro ao desativar:', error);
        }
    }

    async function salvarUsuarioModal(formData) {
        // Verifica se é edição (pegando o ID diretamente de dentro do formData)
        const id = formData.get('id');

        if (id) {
            await atualizarUsuario(token, id, formData);
        } else {
            await criarUsuario(token, formData);
        }
        setModalAberto(false);
        await recarregar();
    }

    if (!token) {
        return (
            <div className="page-usuarios-container">
                <div className="tabela-card">
                    <div className="tabela-empty">
                        <div className="tabela-empty-icon">🔒</div>
                        <p>Sessão inválida. Faça login novamente.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-usuarios-container">
            <header className="header-usuarios">
                <div>
                    <h1>Gerenciar Usuários</h1>
                    <p className="page-subtitle">Visualização de cadastros e modificações em tempo real.</p>
                </div>
                <button className="btn-primary-custom" onClick={abrirNovo}>+ Novo Usuário</button>
            </header>

            <BarraFiltros
                onBusca={(termo) => { setTermoBusca(termo); setPaginaAtual(1); }}
                onFiltro={(tipo) => { setFiltroTipo(tipo); setPaginaAtual(1); }}
            />

            <div ref={tabelaRef}>
                {carregando ? (
                    <div className="tabela-card"><div className="tabela-empty"><p>Carregando usuários...</p></div></div>
                ) : erroCarregar ? (
                    <div className="tabela-card">
                        <div className="tabela-empty">
                            <div className="tabela-empty-icon">⚠️</div>
                            <p>Não foi possível carregar os usuários. Verifique a conexão com a API.</p>
                        </div>
                    </div>
                ) : (
                    /* Corrigido aqui: trocado onExcluir por onDesativar */
                    <TabelaUsuarios 
                        usuarios={paginaDados} 
                        onEditar={abrirEdicao} 
                        onDesativar={desativaroUsuario} 
                    />
                )}
            </div>

            <div>
                <div className="paginacao-contador">
                    {filtrados.length === 0
                        ? 'Nenhum resultado encontrado.'
                        : `Exibindo ${inicio + 1}–${Math.min(paginaAtual * ITENS_POR_PAGINA, filtrados.length)} de ${filtrados.length} usuários`}
                </div>
                <Paginacao
                    totalItens={filtrados.length}
                    paginaAtual={paginaAtual}
                    onPageChange={(nova) => {
                        setPaginaAtual(nova);
                        tabelaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                />
            </div>

            <ModalUsuario
                aberto={modalAberto}
                usuario={usuarioEditando}
                onSalvar={salvarUsuarioModal}
                onFechar={() => setModalAberto(false)}
            />
        </div>
    );
}