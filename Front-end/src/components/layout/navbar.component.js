import { estaLogado, deslogarUsuario, obterUsuarioAtual } from "../../storage/usuario/dados.storage.js";

// `navegarPara` é injetado pelo main.js para que a navbar não precise
// conhecer a lógica de roteamento — mantém o acoplamento baixo.
export default function criarNavbar(navegarPara = {}) {
    const header = document.querySelector('header');

    // Evita duplicar navbar se já existir
    if (document.querySelector('.custom-navbar')) return;

    const usuario = obterUsuarioAtual();
    const nomeUsuario = usuario?.nome || usuario?.name || '';
    const tipoUsuario = usuario?.tipo_usuario || '';

    const botaoAcaoHTML = estaLogado()
        ? `<button class="nav-btn-action btn-sair" id="navBtnSair">Sair</button>`
        : `<button class="nav-btn-action" id="navBtnLogin">Login</button>`;

    // Navbar
    const nav = document.createElement('nav');
    nav.className = 'custom-navbar';
    nav.innerHTML = `
        <div class="nav-left">
            <button class="nav-toggle" id="navToggle" aria-label="Menu">&#9776;</button>
            <a class="nav-logo" id="btnLogo">
                <span class="logo-dot"></span>
                Controllo
            </a>
        </div>
        <div class="nav-right">
            ${nomeUsuario ? `
            <div class="nav-user-info">
                <div class="nav-user-name">${nomeUsuario}</div>
                <div class="nav-user-role">${tipoUsuario}</div>
            </div>` : ''}
            ${botaoAcaoHTML}
        </div>
    `;
    header.appendChild(nav);

    // Sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'custom-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-section">
            <div class="sidebar-section-label">Navegação</div>
            <ul class="side-menu">
                <li>
                    <button class="side-btn-link" id="btnPaginaInicial" data-pagina="dashboard">
                        <span class="menu-icon">⊞</span> Página Inicial
                    </button>
                </li>
                <li>
                    <button class="side-btn-link" id="btnGerenciarUsuarios" data-pagina="usuarios">
                        <span class="menu-icon">👤</span> Gerenciar Usuários
                    </button>
                </li>
            </ul>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-section">
            <div class="sidebar-section-label">Em breve</div>
            <ul class="side-menu">
                <li>
                    <button class="side-btn-link" data-pagina="tarefas" disabled>
                        <span class="menu-icon">📋</span> Aplicar Tarefas
                    </button>
                </li>
                <li>
                    <button class="side-btn-link" data-pagina="registros" disabled>
                        <span class="menu-icon">📊</span> Ver Registros
                    </button>
                </li>
            </ul>
        </div>
    `;
    header.appendChild(sidebar);

    // Toggle do menu
    document.getElementById('navToggle')?.addEventListener('click', () => {
        const isDesktop = window.innerWidth >= 769;
        if (isDesktop) {
            sidebar.classList.toggle('closed');
            document.querySelector('.conteudo-principal')?.classList.toggle('sidebar-closed');
        } else {
            sidebar.classList.toggle('open');
        }
    });

    // Logo -> dashboard
    document.getElementById('btnLogo')?.addEventListener('click', () => {
        ativarItemMenu('dashboard');
        navegarPara.dashboard?.();
    });

    // Itens do menu
    document.getElementById('btnPaginaInicial')?.addEventListener('click', () => {
        ativarItemMenu('dashboard');
        navegarPara.dashboard?.();
    });

    document.getElementById('btnGerenciarUsuarios')?.addEventListener('click', () => {
        ativarItemMenu('usuarios');
        navegarPara.usuarios?.();
    });

    // Sair
    document.getElementById('navBtnSair')?.addEventListener('click', () => {
        deslogarUsuario();
        window.location.reload();
    });
}

// Marca o item da sidebar correspondente à página atual como ativo
export function ativarItemMenu(pagina) {
    document.querySelectorAll('.side-btn-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pagina === pagina);
    });
}
