import { useEffect, useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { deslogarUsuario } from '../../storage/usuario/dados.storage.js';
import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import { nomeDoUsuario, urlFotoUsuario, rotuloTipoUsuario, sincronizarUsuarioLogado } from '../../utils/usuario.js';
import Avatar from '../shared/Avatar.jsx';
import PerfilDrawer from '../usuario/PerfilDrawer.jsx';
import './Navbar.css';

export default function Navbar({ paginaAtiva, navegarPara, onLogout, onSidebarChange, pendentes = 0 }) {
    const [sidebarClosed, setSidebarClosed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Estado para controlar a gaveta de perfil
    const [drawerPerfilAberto, setDrawerPerfilAberto] = useState(false);

    // Usuário logado (atualiza sozinho quando o perfil é editado)
    const usuario = useUsuarioLogado();
    const nomeUsuario = nomeDoUsuario(usuario);
    const tipoUsuario = rotuloTipoUsuario(usuario?.tipo_usuario);
    const fotoPerfil = urlFotoUsuario(usuario);

    // Se o login não trouxe nome/foto, completa os dados uma única vez
    useEffect(() => {
        sincronizarUsuarioLogado();
    }, []);

    function alternarMenu() {
        const isDesktop = window.innerWidth >= 769;
        if (isDesktop) {
            setSidebarClosed((v) => {
                const novoEstado = !v;
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
                    <button className="nav-toggle" aria-label="Menu" onClick={alternarMenu}>
                        <ion-icon name="menu-outline" style={{ fontSize: '24px' }}></ion-icon>
                    </button>

                    <a className="nav-logo" role="button" onClick={() => navegarPara.dashboard?.()}>
                        <span className="logo-dot"></span>
                        Controllo
                    </a>
                </div>

                <div className="nav-right">
                    <button
                        type="button"
                        className="nav-perfil"
                        onClick={() => setDrawerPerfilAberto(true)}
                        title="Meu perfil"
                        aria-haspopup="dialog"
                        aria-expanded={drawerPerfilAberto}
                    >
                        <Avatar nome={nomeUsuario} src={fotoPerfil} tamanho={36} />

                        <span className="nav-perfil-texto">
                            <span className="nav-perfil-nome">{nomeUsuario || 'Minha conta'}</span>
                            {tipoUsuario && <span className="nav-perfil-cargo">{tipoUsuario}</span>}
                        </span>

                        <IoChevronDownOutline className="nav-perfil-seta" size={14} />
                    </button>
                </div>
            </nav>

            <aside className={`custom-sidebar ${sidebarClosed ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-section">
                    <div className="sidebar-section-label">Navegação</div>
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
                                        <span style={{ marginLeft: 'auto', minWidth: 20, padding: '1px 7px', borderRadius: 999, background: '#c9131c', color: '#fff', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                                            {pendentes}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Gaveta de perfil: editar perfil, modo escuro e sair */}
            <PerfilDrawer
                aberto={drawerPerfilAberto}
                onFechar={() => setDrawerPerfilAberto(false)}
                onSair={sair}
            />
        </>
    );
}