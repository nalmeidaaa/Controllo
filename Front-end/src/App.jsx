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

    // Sincroniza e valida se há uma sessão ativa ao carregar o app
    useEffect(() => {
        if (estaLogado()) {
            setLogado(true);
        } else {
            setLogado(false);
        }
    }, []);

    // Escuta a seta de voltar do navegador e atualiza o estado para a tela anterior do histórico
    useEffect(() => {
        if (!logado) return;

        // Salva o estado inicial (Dashboard) ao logar
        if (!window.history.state) {
            window.history.replaceState({ pagina: 'dashboard', paramsPagina: {} }, '');
        }

        const handlePopState = (event) => {
            if (event.state && event.state.pagina) {
                // Restaura a página exatamente anterior guardada na pilha do navegador
                setPagina(event.state.pagina);
                setParamsPagina(event.state.paramsPagina || {});
            } else {
                setPagina('dashboard');
                setParamsPagina({});
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [logado]);

    // Função central que muda a página E adiciona o passo no histórico do navegador
    const mudarPagina = (novaPagina, novosParams = {}) => {
        setPagina(novaPagina);
        setParamsPagina(novosParams);
        // Adiciona um novo item na pilha de voltar do navegador
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
        return <LoginPage onLoginSucesso={() => { setLogado(true); setPagina('dashboard'); }} />;
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
                />
            </header>
            <main className="conteudo-principal">
                <div id="app">{renderPagina()}</div>
            </main>
        </>
    );
}