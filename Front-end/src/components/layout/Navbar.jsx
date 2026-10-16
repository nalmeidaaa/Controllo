
import { useState, useEffect } from 'react';
import {
    obterUsuarioAtual,
    deslogarUsuario
} from '../../storage/usuario/dados.storage.js';
import { api } from '../../services/api.js';

export default function Navbar({
    paginaAtiva,
    navegarPara,
    onLogout,
    onSidebarChange,
    pendentes = 0
}) {
    const [sidebarClosed, setSidebarClosed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [perfilAberto, setPerfilAberto] = useState(false);
    const [usuario, setUsuario] = useState(() => obterUsuarioAtual());

    // Atualiza os dados do usuário armazenados no navegador
    useEffect(() => {
        setUsuario(obterUsuarioAtual());
    }, []);

    // Dados do usuário
    const nomeUsuario =
        usuario?.nome ||
        usuario?.name ||
        'Não informado';

    // Converte o tipo de usuário para um nome legível
    const tipoUsuario = {
        administracao: 'Administração',
        manutencao: 'Manutenção',
        geral: 'Geral'
    }[usuario?.tipo_usuario] ||
        usuario?.tipo_usuario ||
        'Não informado';

    const emailUsuario =
        usuario?.email ||
        'Não informado';

    // Monta o endereço da foto salva no backend
    const caminhoImagem = usuario?.caminho_imagem;

    const fotoUsuario = caminhoImagem
        ? `${api.defaults.baseURL}${caminhoImagem}`
        : null;

    // Informa ao App.jsx quando a sidebar abre ou fecha
    useEffect(() => {
        onSidebarChange?.(sidebarClosed);
    }, [sidebarClosed, onSidebarChange]);

    // Fecha a janela do perfil ao pressionar Escape
    useEffect(() => {
        function fecharComEscape(evento) {
            if (evento.key === 'Escape') {
                setPerfilAberto(false);
            }
        }

        window.addEventListener('keydown', fecharComEscape);

        return () => {
            window.removeEventListener('keydown', fecharComEscape);
        };
    }, []);

    // Alterna o menu no computador e no celular
    function alternarMenu() {
        const isDesktop = window.innerWidth >= 769;

        if (isDesktop) {
            setSidebarClosed((estado) => {
                const novoEstado = !estado;
                onSidebarChange?.(novoEstado);
                return novoEstado;
            });
        } else {
            setSidebarOpen((estado) => !estado);
        }
    }

    // Encerra a sessão do usuário
    function sair() {
        deslogarUsuario();
        setUsuario(null);

        if (typeof onLogout === 'function') {
            onLogout();
        }
    }

    // Abre o perfil e fecha o menu mobile
    function abrirPerfil() {
        setSidebarOpen(false);
        setUsuario(obterUsuarioAtual());
        setPerfilAberto(true);
    }

    // Fecha a janela do perfil
    function fecharPerfil() {
        setPerfilAberto(false);
    }

    // Exibe a foto ou o ícone padrão
    function exibirFoto(tamanho = 'normal') {
        if (fotoUsuario) {
            return (
                <img
                    src={fotoUsuario}
                    alt={`Foto de ${nomeUsuario || 'usuário'}`}
                    className={`foto-perfil-usuario foto-perfil-${tamanho}`}
                    onError={(evento) => {
                        evento.currentTarget.style.display = 'none';
                    }}
                />
            );
        }

        return (
            <ion-icon
                name="person-circle-outline"
                className={`foto-perfil-icone foto-perfil-${tamanho}`}
            ></ion-icon>
        );
    }

    // Itens do menu
    const itensMenu = [
        {
            id: 'dashboard',
            icone: 'grid-outline',
            label: 'Página Inicial'
        },
        {
            id: 'salas',
            icone: 'log-in-outline',
            label: 'Gerenciar Salas'
        },
        {
            id: 'usuarios',
            icone: 'people-outline',
            label: 'Gerenciar Usuários'
        },
        {
            id: 'aprovacoes',
            icone: 'person-add-outline',
            label: 'Aprovar Cadastros'
        },
        {
            id: 'historico',
            icone: 'time-outline',
            label: 'Histórico'
        }
    ];

    return (
        <>
            {/* Barra superior */}
            <nav className="custom-navbar">
                <div className="nav-left">
                    <button
                        type="button"
                        className="nav-toggle"
                        aria-label="Menu"
                        aria-expanded={sidebarOpen}
                        onClick={alternarMenu}
                    >
                        <ion-icon
                            name="menu-outline"
                            style={{ fontSize: '24px' }}
                        ></ion-icon>
                    </button>

                    {/* Nome Controllo sem botão */}
                    <div className="nav-logo">
                        <span className="logo-dot"></span>
                        Controllo
                    </div>
                </div>

                {/* Informações e saída na barra superior */}
                <div className="nav-right">
                    {usuario && (
                        <div className="nav-user-info">
                            <div className="nav-user-name">
                                {nomeUsuario}
                            </div>

                            <div className="nav-user-role">
                                {tipoUsuario}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="nav-btn-action btn-sair"
                        onClick={sair}
                    >
                        Sair
                    </button>
                </div>
            </nav>

            {/* Fundo para fechar o menu no celular */}
            {sidebarOpen && (
                <div
                    className="sidebar-mobile-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Menu lateral */}
            <aside
                className={`custom-sidebar ${
                    sidebarClosed ? 'closed' : ''
                } ${sidebarOpen ? 'open' : ''}`}
            >
                {/* Área de navegação */}
                <div className="sidebar-section">
                    <div className="sidebar-section-label">
                        Navegação
                    </div>

                    <ul className="side-menu">
                        {itensMenu.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className={`side-btn-link ${
                                        paginaAtiva === item.id
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        navegarPara[item.id]?.();
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <span className="menu-icon">
                                        <ion-icon
                                            name={item.icone}
                                            style={{ fontSize: '20px' }}
                                        ></ion-icon>
                                    </span>

                                    <span className="side-btn-label">
                                        {item.label}
                                    </span>

                                    {item.id === 'aprovacoes' &&
                                        pendentes > 0 && (
                                            <span
                                                aria-label={`${pendentes} cadastros pendentes`}
                                                className="sidebar-pendentes"
                                            >
                                                {pendentes}
                                            </span>
                                        )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Perfil fixado no final da navegação */}
                <div className="sidebar-perfil">
                    <button
                        type="button"
                        className="sidebar-perfil-botao"
                        onClick={abrirPerfil}
                        aria-label="Abrir meu perfil"
                    >
                        {exibirFoto('lateral')}

                        <span className="sidebar-perfil-texto">
                            <strong>Meu perfil</strong>
                        </span>
                    </button>
                </div>
            </aside>

            {/* Janela com os dados do perfil */}
            {perfilAberto && (
                <div
                    className="perfil-modal-overlay"
                    onClick={fecharPerfil}
                >
                    <div
                        className="perfil-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="perfil-modal-titulo"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        {/* Botão para fechar */}
                        <button
                            type="button"
                            className="perfil-modal-fechar"
                            onClick={fecharPerfil}
                            aria-label="Fechar perfil"
                        >
                            <ion-icon name="close-outline"></ion-icon>
                        </button>

                        {/* Cabeçalho do perfil */}
                        <div className="perfil-modal-cabecalho">
                            {exibirFoto('modal')}

                            <h2 id="perfil-modal-titulo">
                                Meu perfil
                            </h2>

                            <p>Informações da sua conta</p>
                        </div>

                        {/* Informações do usuário */}
                        <div className="perfil-modal-informacoes">
                            <div className="perfil-modal-campo">
                                <span>Nome</span>
                                <strong>{nomeUsuario}</strong>
                            </div>

                            <div className="perfil-modal-campo">
                                <span>Perfil de acesso</span>
                                <strong>{tipoUsuario}</strong>
                            </div>

                            <div className="perfil-modal-campo">
                                <span>E-mail</span>
                                <strong>{emailUsuario}</strong>
                            </div>
                        </div>

                        {/* Botão para fechar a janela */}
                        <button
                            type="button"
                            className="perfil-modal-botao"
                            onClick={fecharPerfil}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
