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

    const handleLogout = () => {
        deslogarUsuario();
        setLogado(false);
        setPagina('dashboard');
    };

    const navegarPara = {
        dashboard: () => { setPagina('dashboard'); setParamsPagina({}); },
        usuarios: () => { setPagina('usuarios'); setParamsPagina({}); },
        salas: () => { setPagina('salas'); setParamsPagina({}); },
        criarSala: () => { setPagina('criarSala'); setParamsPagina({}); },
        editarSala: (id) => { setPagina('editarSala'); setParamsPagina({ id }); },
        visualizarSala: (id) => { setPagina('visualizarSala'); setParamsPagina({ id }); },
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