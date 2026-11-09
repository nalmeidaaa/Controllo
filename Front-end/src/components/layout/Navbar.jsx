import { useEffect, useRef, useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { deslogarUsuario } from '../../storage/usuario/dados.storage.js';
import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import { nomeDoUsuario, urlFotoUsuario, rotuloTipoUsuario, sincronizarUsuarioLogado } from '../../utils/usuario.js';
import { gsap, useGSAP } from '../../animations/gsap.js';
import NumeroAnimado from '../../animations/NumeroAnimado.jsx';
import Avatar from '../shared/Avatar.jsx';
import PerfilDrawer from '../usuario/PerfilDrawer.jsx';
import './Navbar.css';

export default function Navbar({ paginaAtiva, navegarPara, onLogout, onSidebarChange, pendentes = 0 }) {
    // Começa fechada (true) para poder abrir com animação na entrada
    const [sidebarClosed, setSidebarClosed] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const navRef = useRef(null);
    const asideRef = useRef(null);
    const indicadorRef = useRef(null);
    const ultimaPagina = useRef(null);

    // Estado para controlar a gaveta de perfil
    const [drawerPerfilAberto, setDrawerPerfilAberto] = useState(false);

    // Usuário logado (atualiza sozinho quando o perfil é editado)
    const usuario = useUsuarioLogado();
    const nomeUsuario = nomeDoUsuario(usuario);
    const tipoUsuario = rotuloTipoUsuario(usuario?.tipo_usuario);
    const fotoPerfil = urlFotoUsuario(usuario);

    // Sincroniza dados e dispara a abertura da sidebar com o atraso solicitado (+0.5s)
    useEffect(() => {
        sincronizarUsuarioLogado();

        const timer = setTimeout(() => {
            setSidebarClosed(false);
            onSidebarChange?.(false);
        }, 250); 
        return () => clearTimeout(timer);
    }, []);

    // Entrada: navbar desce, logo gira e os itens do menu entram em sequência
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from(navRef.current, { yPercent: -100, opacity: 0, duration: 0.6, clearProps: 'transform,opacity' })
            .from('.nav-logo .logo-mark', { rotation: -200, scale: 0, duration: 0.8, ease: 'back.out(2)', clearProps: 'transform' }, 0.15)
            .from('.nav-perfil', { x: 30, opacity: 0, duration: 0.5, clearProps: 'transform,opacity' }, 0.3)
            .from('.side-menu li', { x: -34, opacity: 0, duration: 0.5, stagger: 0.07, clearProps: 'transform,opacity' }, 0.35)
            .from('.sidebar-section-label', { opacity: 0, x: -12, duration: 0.4, clearProps: 'transform,opacity' }, 0.3);
    });

    // Barrinha vermelha que desliza até o item ativo + "pop" no ícone
    useGSAP(() => {
        const aside = asideRef.current;
        const ativo = aside?.querySelector('.side-btn-link.active');
        const barra = indicadorRef.current;
        if (!ativo || !barra) return;

        const y = ativo.offsetTop + (ativo.offsetHeight - barra.offsetHeight) / 2;

        const mudou = ultimaPagina.current !== null && ultimaPagina.current !== paginaAtiva;
        ultimaPagina.current = paginaAtiva;

        if (!mudou) {
            gsap.set(barra, { y, opacity: 1 });
            return;
        }

        gsap.to(barra, { y, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.6)' });

        const icone = ativo.querySelector('.menu-icon');
        if (icone) {
            gsap.fromTo(icone, { scale: 0.5, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(3)', clearProps: 'transform' });
        }
    }, { dependencies: [paginaAtiva], scope: asideRef });

    // Selo de pendências pulsando para chamar atenção
    useGSAP(() => {
        if (pendentes <= 0) return;
        gsap.to('.nav-badge-pend', { scale: 1.18, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }, { dependencies: [pendentes], scope: asideRef });

    function alternarMenu(e) {
        const icone = e?.currentTarget?.querySelector('ion-icon');
        if (icone) gsap.fromTo(icone, { rotation: -90, scale: 0.7 }, { rotation: 0, scale: 1, duration: 0.5, ease: 'back.out(2.5)', clearProps: 'transform' });

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
        { id: 'historico', icone: 'time-outline', label: 'Histórico' },
    ];

    return (
        <>
            <nav className="custom-navbar" ref={navRef}>
                <div className="nav-left">
                    <button className="nav-toggle" aria-label="Menu" onClick={alternarMenu}>
                        <ion-icon name="menu-outline" style={{ fontSize: '24px' }}></ion-icon>
                    </button>

                    <a 
                        className="nav-logo" 
                        role="button" 
                        onClick={() => navegarPara.dashboard?.()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <div 
                            className="logo-mark" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                overflow: 'hidden',
                                width: '24px', 
                                height: '24px'
                            }}
                        >
                            <img 
                                src='../assets/controllo.svg' 
                                alt="Controllo Logo"
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain' 
                                }} 
                            />
                        </div>
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

            <aside ref={asideRef} className={`custom-sidebar ${sidebarClosed ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-section">
                    <div className="sidebar-section-label">Navegação</div>
                    <span className="side-indicador" ref={indicadorRef} aria-hidden="true" />
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
                                    {item.id === 'usuarios' && pendentes > 0 && (
                                        <span className="nav-badge-pend" style={{ marginLeft: 'auto', minWidth: 20, padding: '1px 7px', borderRadius: 999, background: '#c9131c', color: '#fff', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                                            <NumeroAnimado valor={pendentes} formatar={String} />
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