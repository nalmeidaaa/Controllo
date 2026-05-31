import { buscarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from '../../services/usuarios/usuario.api.js';
import { obterToken, obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import criarNavbar, { ativarItemMenu } from '../../components/layout/navbar.component.js';

import {
    renderizarTabela,
    criarPaginacao,
    criarBarraFiltros
} from '../../components/usuario/tabelaUsuarios.component.js';

import criarModalUsuario from '../../components/usuario/modalUsuario.component.js';

// Estado local padronizado para controle de listagem, filtros e paginação
const estado = {
    todos: [],          // Lista completa de usuários obtida da API
    filtrados: [],      // Lista de usuários após aplicação de filtros
    paginaAtual: 1,     // Página atual na paginação
    termoBusca: '',     // Termo de busca para filtro textual
    filtroTipo: 'todos' // Filtro de tipo de usuário (ex: admin, cliente, etc.)
};

// Página principal
export async function usuariosPage(container, navegarPara = {}) {
    container.innerHTML = '';

    // Navbar (só cria se ainda não existir — já pode ter sido montada pelo dashboardPage)
    if (!document.querySelector('.custom-navbar')) {
        criarNavbar(navegarPara);
    }
    ativarItemMenu('usuarios');

    container.innerHTML = `
        <div class="page-usuarios-container">

            <header class="header-usuarios">
                <div>
                    <h1>Gerenciar Usuários</h1>
                    <p class="page-subtitle">Visualização de cadastros e modificações em tempo real.</p>
                </div>
                <button class="btn-primary-custom" id="btnNovoUsuario">+ Novo Usuário</button>
            </header>

            <div id="container-filtros"></div>
            <div id="container-tabela"></div>
            <div id="container-paginacao"></div>

        </div>
        <div id="container-modal"></div>
    `;

    const containerFiltros = container.querySelector('#container-filtros');
    const containerTabela = container.querySelector('#container-tabela');
    const containerPaginacao = container.querySelector('#container-paginacao');
    const containerModal = container.querySelector('#container-modal');

    const token = obterToken();
    if (!token) {
        containerTabela.innerHTML = `
            <div class="tabela-card">
                <div class="tabela-empty">
                    <div class="tabela-empty-icon">🔒</div>
                    <p>Sessão inválida. <a href="/" style="color:var(--dark-green)">Faça login novamente.</a></p>
                </div>
            </div>
        `;
        return;
    }

    // Modal (instanciado uma vez)
    const modal = criarModalUsuario();
    containerModal.appendChild(modal);

    // Barra de filtros
    const barraFiltros = criarBarraFiltros({
        onBusca: (termo) => {
            estado.termoBusca = termo;
            estado.paginaAtual = 1;
            aplicarFiltros();
            renderizarPagina(containerTabela, containerPaginacao);
        },
        onFiltro: (tipo) => {
            estado.filtroTipo = tipo;
            estado.paginaAtual = 1;
            aplicarFiltros();
            renderizarPagina(containerTabela, containerPaginacao);
        }
    });
    containerFiltros.appendChild(barraFiltros);

    // Novo usuário
    container.querySelector('#btnNovoUsuario').addEventListener('click', () => {
        modal.abrir(null, async (payload) => {
            await executarComFeedback(async () => {
                await criarUsuario(token, payload.nome, payload.cpf, payload.email, payload.tipo_usuario, payload.senha);
                await recarregarUsuarios(token, containerTabela, containerPaginacao);
            }, modal);
        });
    });

    await recarregarUsuarios(token, containerTabela, containerPaginacao);
}

// Dados
async function recarregarUsuarios(token, containerTabela, containerPaginacao) {
    try {
        const resposta = await buscarUsuarios(token);
        estado.todos = resposta?.result ?? [];
        estado.paginaAtual = 1;
        aplicarFiltros();
        renderizarPagina(containerTabela, containerPaginacao);
    } catch (error) {
        // 401 já é tratado pelo interceptor do axios (auto-logout)
        console.error('Erro ao carregar usuários:', error);
        containerTabela.innerHTML = `
            <div class="tabela-card">
                <div class="tabela-empty">
                    <div class="tabela-empty-icon">⚠️</div>
                    <p>Não foi possível carregar os usuários. Verifique a conexão com a API.</p>
                </div>
            </div>
        `;
    }
}

function aplicarFiltros() {
    const { todos, termoBusca, filtroTipo } = estado;

    estado.filtrados = todos.filter(usuario => {
        const termo = termoBusca.toLowerCase();

        const bateTexto = !termo || [
            usuario.nome || '',
            usuario.cpf || '',
            usuario.email || '',
        ].some(campo => campo.toLowerCase().includes(termo));

        const bateTipo = filtroTipo === 'todos'
            || (usuario.tipo_usuario || '').toLowerCase().includes(filtroTipo);

        return bateTexto && bateTipo;
    });
}

// Renderização
function renderizarPagina(containerTabela, containerPaginacao) {
    const { filtrados, paginaAtual } = estado;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const pagina = filtrados.slice(inicio, fim);

    renderizarTabela(containerTabela, pagina, {
        onEditar: (usuario) => abrirEdicao(usuario),
        onExcluir: (id) => confirmarExclusao(id),
    });

    containerPaginacao.innerHTML = '';

    const contador = criarContador(filtrados.length, paginaAtual);
    containerPaginacao.appendChild(contador);

    const nav = criarPaginacao({
        totalItens: filtrados.length,
        itensPorPagina: ITENS_POR_PAGINA,
        paginaAtual,
        onPageChange: (novaPagina) => {
            estado.paginaAtual = novaPagina;
            renderizarPagina(containerTabela, containerPaginacao);
            containerTabela.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    containerPaginacao.appendChild(nav);
}

function criarContador(total, paginaAtual) {
    const div = document.createElement('div');
    div.className = 'paginacao-contador';

    if (total === 0) {
        div.textContent = 'Nenhum resultado encontrado.';
        return div;
    }

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA + 1;
    const fim = Math.min(paginaAtual * ITENS_POR_PAGINA, total);
    div.textContent = `Exibindo ${inicio}–${fim} de ${total} usuários`;

    return div;
}

// Ações
function abrirEdicao(usuario) {
    const token = obterToken();
    const modal = document.querySelector('#modalUsuarioOverlay');
    if (!modal || typeof modal.abrir !== 'function') return;

    modal.abrir(usuario, async (payload) => {
        await executarComFeedback(async () => {
            await atualizarUsuario(
                token,
                payload.id,
                payload.nome,
                payload.cpf,
                payload.email,
                payload.tipo_usuario,
                payload.senha || undefined
            );
            const containerTabela = document.querySelector('#container-tabela');
            const containerPaginacao = document.querySelector('#container-paginacao');
            await recarregarUsuarios(token, containerTabela, containerPaginacao);
        }, modal);
    });
}

async function confirmarExclusao(id) {
    // Trava: usuário ativo não pode se excluir
    const usuarioAtual = obterUsuarioAtual();
    if (String(usuarioAtual?.id_usuario) === String(id)) {
        alert('Você não pode excluir a sua própria conta enquanto está logado.');
        return;
    }

    if (!confirm('Tem certeza que deseja remover este usuário permanentemente?')) return;

    const token = obterToken();
    try {
        await deletarUsuario(token, id);
        const containerTabela = document.querySelector('#container-tabela');
        const containerPaginacao = document.querySelector('#container-paginacao');
        await recarregarUsuarios(token, containerTabela, containerPaginacao);
    } catch (error) {
        alert('Não foi possível excluir o usuário. Tente novamente.');
        console.error('Erro ao excluir:', error);
    }
}

// Helper: feedback no modal durante submit
async function executarComFeedback(fn, modal) {
    const btnSalvar = document.querySelector('#btnSalvarModal');
    const textoOriginal = btnSalvar?.textContent;

    try {
        if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando…'; }
        await fn();
        modal.fechar();
    } catch (error) {
        alert(error?.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
        console.error('Erro ao salvar usuário:', error);
    } finally {
        if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = textoOriginal; }
    }
}
