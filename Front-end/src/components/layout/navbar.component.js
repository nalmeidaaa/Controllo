import { estaLogado, deslogarUsuario } from "../../storage/usuario/dados.storage.js";

export default function criarNavbar() {
    const header = document.querySelector('header');
    
    // Evita duplicar a navbar caso a função seja chamada mais de uma vez
    if (document.querySelector('.custom-navbar')) return;

    const nav = document.createElement('nav');
    nav.className = 'custom-navbar';

    // 1. Define o botão de ação (Login ou Sair) ANTES de montar o HTML completo
    const botaoAcaoHTML = estaLogado() 
        ? `<button class="nav-btn-action" id="navBtnSair">Sair</button>`
        : `<button class="nav-btn-action" id="navBtnLogin">Login</button>`;

    // 2. Controla a exibição do botão de usuários para Admin
    const tipoUsuario = localStorage.getItem('tipo_usuario'); 
    const eAdmin = tipoUsuario === 'administracao';

    const botaoUsuariosHTML = eAdmin ? `
        <li>
            <button class="nav-btn-link" id="btnUsuarios">Usuários</button>
        </li>
    ` : '';

    // 3. MONTA TUDO JUNTO EM UM ÚNICO BLOCO (Logo, Menu e o Botão correto)
    nav.innerHTML = `
        <div class="nav-container">
            <a class="nav-logo" id="btnLogo">
                Controllo
            </a>

            <ul class="nav-menu">
                <li>
                    <button class="nav-btn-link active" id="btnHome">Home</button>
                </li>
                
                ${botaoUsuariosHTML}
            </ul>

            <div class="nav-actions">
                ${botaoAcaoHTML}
            </div>
        </div>
    `;

    // 4. Injeta a navbar completa de uma vez só no header
    header.appendChild(nav);

    // 5. Configura todos os eventos de clique de forma segura
    document.getElementById('btnLogo')?.addEventListener('click', () => {
        window.location.href = '/';
    });

    document.getElementById('btnHome')?.addEventListener('click', () => {
        window.location.href = '/';
    });

    document.getElementById('btnUsuarios')?.addEventListener('click', () => {
        // Lógica para abrir a página de gerenciamento de usuários, se houver
        console.log('Navegando para usuários...');
    });

    document.getElementById('navBtnLogin')?.addEventListener('click', () => {
        window.location.href = './login.html'; 
    });

    document.getElementById('navBtnSair')?.addEventListener('click', () => {
        deslogarUsuario();
        window.location.reload(); 
    });
}