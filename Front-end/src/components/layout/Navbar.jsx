import { useState } from 'react';
import { obterUsuarioAtual, deslogarUsuario } from '../../storage/usuario/dados.storage.js';

export default function Navbar({ paginaAtiva, navegarPara, onLogout, onSidebarChange, pendentes = 0 }) { // ALTERADO: adicionei onSidebarChange
    const [sidebarClosed, setSidebarClosed] = useState(false); // desktop: sidebar recolhida
    const [sidebarOpen, setSidebarOpen] = useState(false);     // mobile: sidebar aberta

    const usuario = obterUsuarioAtual();
    const nomeUsuario = usuario?.nome || usuario?.name || '';
    const tipoUsuario = usuario?.tipo_usuario || '';

    function alternarMenu() {
        const isDesktop = window.innerWidth >= 769;

        if (isDesktop) {
            setSidebarClosed((v) => {
                const novoEstado = !v;

                // ALTERADO: avisa o App.jsx se a sidebar foi aberta/fechada
                onSidebarChange?.(novoEstado);

                return novoEstado;
            });
        } else {
            setSidebarOpen((v) => !v);
        }
    }

    function sair() {
        deslogarUsuario();
        if (typeof onLogout === 'function') onLogout();
    }
    const itensMenu = [
        { id: 'dashboard', icone: 'grid-outline', label: 'Página Inicial' },
        { id: 'salas', icone: 'log-in-outline', label: 'Gerenciar Salas' },
        { id: 'usuarios', icone: 'people-outline', label: 'Gerenciar Usuários' },
        { id: 'aprovacoes', icone: 'person-add-outline', label: 'Aprovar Cadastros' },
        { id: 'historico', icone: 'time-outline', label: 'Histórico' },
    ];

    return (
        <>
            <nav className="custom-navbar">
                <div className="nav-left">
                    <button
                        className="nav-toggle"
                        aria-label="Menu"
                        onClick={alternarMenu}
                    >
                        <ion-icon name="menu-outline" style={{ fontSize: '24px' }}></ion-icon>
                    </button>

                    <a
                        className="nav-logo"
                        role="button"
                        onClick={() => navegarPara.dashboard()}
                    >
                        <span className="logo-dot"></span>
                        Controllo
                    </a>
                </div>

                <div className="nav-right">
                    {nomeUsuario && (
                        <div className="nav-user-info">
                            <div className="nav-user-name">{nomeUsuario}</div>
                            <div className="nav-user-role">{tipoUsuario}</div>
                        </div>
                    )}

                    <button
                        className="nav-btn-action btn-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>
                </div>
            </nav>

            <aside
                className={`custom-sidebar ${sidebarClosed ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`}
            >
                <div className="sidebar-section">
                    <div className="sidebar-section-label">
                        Navegação
                    </div>

                    <ul className="side-menu">
                        {itensMenu.map((item) => (
                            <li key={item.id}>
                                <button
                                    className={`side-btn-link ${paginaAtiva === item.id ? 'active' : ''}`}
                                    onClick={() => navegarPara[item.id]?.()}
                                >
                                    <span className="menu-icon">
                                        <ion-icon name={item.icone} style={{ fontSize: '20px' }}></ion-icon>
                                    </span>

                                    {item.label}

                                    {item.id === 'aprovacoes' && pendentes > 0 && (
                                        <span
                                            aria-label={`${pendentes} cadastros pendentes`}
                                            style={{
                                                marginLeft: 'auto',
                                                minWidth: 20,
                                                padding: '1px 7px',
                                                borderRadius: 999,
                                                background: '#c9131c',
                                                color: '#fff',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {pendentes}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}