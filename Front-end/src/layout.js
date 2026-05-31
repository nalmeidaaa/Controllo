import { obterUsuarioAtual, obterTipoUsuario, deslogarUsuario } from './storage/usuario/dados.storage.js';

export function montarLayout(navegarPara) {
    const header = document.querySelector('header');
    if (document.querySelector('.custom-navbar')) return;

    const usuario = obterUsuarioAtual();
    const tipo = obterTipoUsuario();

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
            <div class="nav-user-info">
                <div class="nav-user-role">${tipo}</div>
            </div>
            <button class="nav-btn-action btn-sair" id="navBtnSair">Sair</button>
        </div>
    `;
    header.appendChild(nav);

    const sidebar = document.createElement('aside');
    sidebar.className = 'custom-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-section">
            <div class="sidebar-section-label">Navegação</div>
            <ul class="side-menu">
                <li>
                    <button class="side-btn-link" data-pagina="dashboard" id="menuDashboard">
                        <span class="menu-icon">⊞</span> Página Inicial
                    </button>
                </li>
                <li>
                    <button class="side-btn-link" data-pagina="usuarios" id="menuUsuarios">
                        <span class="menu-icon">👤</span> Gerenciar Usuários
                    </button>
                </li>
            </ul>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-section">
            <div class="sidebar-section-label">Em breve</div>
            <ul class="side-menu">
                <li><button class="side-btn-link" disabled><span class="menu-icon">📋</span> Aplicar Tarefas</button></li>
                <li><button class="side-btn-link" disabled><span class="menu-icon">📊</span> Ver Registros</button></li>
            </ul>
        </div>
    `;
    header.appendChild(sidebar);

    nav.querySelector('#navToggle').addEventListener('click', () => {
        const isDesktop = window.innerWidth >= 769;
        if (isDesktop) {
            sidebar.classList.toggle('closed');
            document.querySelector('.conteudo-principal')?.classList.toggle('sidebar-closed');
        } else {
            sidebar.classList.toggle('open');
        }
    });

    nav.querySelector('#btnLogo').addEventListener('click', () => navegarPara.dashboard());
    nav.querySelector('#navBtnSair').addEventListener('click', () => { deslogarUsuario(); window.location.reload(); });
    sidebar.querySelector('#menuDashboard').addEventListener('click', () => navegarPara.dashboard());
    sidebar.querySelector('#menuUsuarios').addEventListener('click', () => navegarPara.usuarios());
}

export function mostrarPagina(pagina) {
    document.querySelectorAll('.side-btn-link[data-pagina]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pagina === pagina);
    });
}
