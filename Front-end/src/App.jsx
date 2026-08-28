import { useState, useEffect } from 'react';
import { estaLogado, deslogarUsuario } from './storage/usuario/dados.storage.js';
import Navbar from './components/layout/Navbar.jsx';
import LoginPage from './pages/usuario/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import UsuariosPage from './pages/usuario/UsuariosPage.jsx';
import SalasPage from './pages/salas/SalasPage.jsx';
import CriarSalaPage from './pages/salas/CriarSalaPage.jsx';
import EditarSalaPage from './pages/salas/EditarSalaPage.jsx';
import VisualizarSalaPage from './pages/salas/VisualizarSalaPage.jsx';

export default function App() {
    const [logado, setLogado] = useState(false);
    const [pagina, setPagina] = useState('dashboard');
    const [paramsPagina, setParamsPagina] = useState({});
    
    // ALTERADO: estado para saber se a sidebar está fechada
    const [sidebarClosed, setSidebarClosed] = useState(false);

    // Sincroniza e valida se há uma sessão ativa ao carregar o app
    useEffect(() => {
        if (estaLogado()) {
            setLogado(true);
        } else {
            setLogado(false);
        }
    }, []);

    // Gerencia o histórico do navegador e cria a trava no Dashboard
    useEffect(() => {
        if (!logado) return;

        // Função para prender a navegação quando estiver no Dashboard
        const aplicarTravaDashboard = () => {
            window.history.pushState({ pagina: 'dashboard', paramsPagina: {} }, '');
        };

        // Garante que o estado inicial seja a trava do Dashboard
        if (!window.history.state || window.history.state.pagina === 'dashboard') {
            aplicarTravaDashboard();
        }

        const handlePopState = (event) => {
            if (event.state && event.state.pagina) {
                setPagina(event.state.pagina);
                setParamsPagina(event.state.paramsPagina || {});

                // Se ao voltar a pessoa chegou no Dashboard, injeta a trava para bloquear novas voltas
                if (event.state.pagina === 'dashboard') {
                    aplicarTravaDashboard();
                }
            } else {
                // Se o usuário tentar voltar além do histórico interno, força a permanência no Dashboard
                setPagina('dashboard');
                setParamsPagina({});
                aplicarTravaDashboard();
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [logado]);

    // Registra cada alteração de página na pilha de histórico do navegador
    const mudarPagina = (novaPagina, novosParams = {}) => {
        setPagina(novaPagina);
        setParamsPagina(novosParams);
        window.history.pushState({ pagina: novaPagina, paramsPagina: novosParams }, '');
    };

    const handleLogout = () => {
        deslogarUsuario();
        setLogado(false);
        setPagina('dashboard');
    };

    const navegarPara = {
        dashboard: () => mudarPagina('dashboard'),
        usuarios: () => mudarPagina('usuarios'),
        salas: () => mudarPagina('salas'),
        criarSala: () => mudarPagina('criarSala'),
        editarSala: (id) => mudarPagina('editarSala', { id }),
        visualizarSala: (id) => mudarPagina('visualizarSala', { id }),
    };

    if (!logado) {
        return (
            <LoginPage
                onLoginSucesso={() => {
                    setLogado(true);
                    setPagina('dashboard');
                }}
            />
        );
    }

    function renderPagina() {
        switch (pagina) {
            case 'usuarios':
                return <UsuariosPage />;
            case 'salas':
                return <SalasPage navegarPara={navegarPara} />;
            case 'criarSala':
                return <CriarSalaPage navegarPara={navegarPara} />;
            case 'editarSala':
                return <EditarSalaPage navegarPara={navegarPara} idSala={paramsPagina.id} />;
            case 'visualizarSala':
                return <VisualizarSalaPage navegarPara={navegarPara} idSala={paramsPagina.id} />;
            case 'dashboard':
            default:
                return <DashboardPage navegarPara={navegarPara} />;
        }
    }

    return (
        <>
            <header>
                <Navbar
                    paginaAtiva={['criarSala', 'editarSala', 'visualizarSala'].includes(pagina) ? 'salas' : pagina}
                    navegarPara={navegarPara}
                    onLogout={handleLogout}
                    
                    // ALTERADO: recebe do Navbar a informação de que a sidebar fechou/abriu
                    onSidebarChange={setSidebarClosed}
                />
            </header>

            {/* ALTERADO: adiciona a classe sidebar-closed quando a sidebar estiver fechada */}
            <main className={`conteudo-principal ${sidebarClosed ? 'sidebar-closed' : ''}`}>
                <div id="app">{renderPagina()}</div>
            </main>
        </>
    );
}