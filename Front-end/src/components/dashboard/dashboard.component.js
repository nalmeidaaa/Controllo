import { obterUsuarioAtual, deslogarUsuario } from "../../storage/usuario/dados.storage.js";


export function criarPaginaInicial(navegarPara = {}) {
    const usuario = obterUsuarioAtual();

    if (!usuario || !usuario.token) {
        deslogarUsuario();
        window.location.href = '/';
        return document.createElement('div');
    }

    const painel = document.createElement('div');
    painel.className = 'dashboard-wrapper';

    painel.innerHTML = `
        <div class="dashboard-inner">
            <header class="dashboard-welcome">
                <h1>Olá, seja Bem-Vindo(a) !</h1>
                <p class="welcome-sub">O que você deseja fazer hoje?</p>
            </header>

            <div class="dashboard-section-label">Módulos do sistema</div>

            <div class="dashboard-menu-grid">

                <div class="menu-card" id="cardUsuarios">
                    <div class="card-icon">👥</div>
                    <div class="card-info">
                        <h3>Gerenciar Usuários</h3>
                        <p>Controle de acessos, permissões e perfis do sistema.</p>
                    </div>
                </div>

                <div class="menu-card" id="cardTarefas" disabled>
                    <div class="card-icon">📋</div>
                    <div class="card-info">
                        <h3>Aplicar Tarefas</h3>
                        <p>Crie, distribua e acompanhe ordens de serviço.</p>
                    </div>
                </div>

                <div class="menu-card" id="cardRegistros" disabled>
                    <div class="card-icon">📊</div>
                    <div class="card-info">
                        <h3>Ver Registros</h3>
                        <p>Consulte históricos, relatórios e logs de atividade.</p>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Card "Gerenciar Usuários" navega para a página de usuários
    painel.querySelector('#cardUsuarios')?.addEventListener('click', () => {
        navegarPara.usuarios?.();
    });

    return painel;
}
