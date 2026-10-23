import { useState, useEffect } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { logar, verificarSetup } from '../../services/usuarioService.js';
import { salvarUsuario } from '../../storage/usuario/dados.storage.js';
import SetupPage from './SetupPage.jsx'; // Import do novo componente de Setup

export default function LoginPage({ onLoginSucesso }) {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [semAdmin, setSemAdmin] = useState(false);
    const [verificandoSetup, setVerificandoSetup] = useState(true);
    
    // Estado para controlar a visibilidade da senha
    const [mostrarSenha, setMostrarSenha] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        try {
            const dados = await logar(login.trim(), senha);
            if (dados && dados.token) {
                salvarUsuario(dados);
                onLoginSucesso();
            } else {
                throw new Error('Resposta inválida do servidor.');
            }
        } catch (error) {
            const textoErro = error.response?.data?.message || error.message || 'Não foi possível conectar ao servidor.';
            setErro(textoErro);
            setCarregando(false);
        }
    }

    useEffect(() => {
        async function inicializacao() {
            try {
                const setup = await verificarSetup();
                if (setup?.result === true || setup?.necessario === true) {
                    setSemAdmin(true);
                }
            } catch (error) {
                const textoErro = error.response?.data?.message || error.message || 'Não foi possível conectar ao servidor.';
                setErro(textoErro);
            } finally {
                setVerificandoSetup(false);
            }
        }
        inicializacao();
    }, []);

    if (verificandoSetup) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    // Quando não houver administradores cadastrados no sistema
    if (semAdmin) {
        return (
            <SetupPage 
                onSetupConcluido={() => {
                    // Após criar o admin, altera o estado para recarregar a tela de login normal
                    setSemAdmin(false);
                }} 
            />
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center style-container-login" style={{ minHeight: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3 mb-4 w-100 d-flex justify-content-center">
                    <div className="card-login">
                        <div className="card-login-logo">
                            <div className="logo-mark"><span>C</span></div>
                            <span className="logo-name">Controllo</span>
                        </div>
                        <h2>Boas-vindas</h2>
                        <span className="subtitle">Acesse o painel de gerenciamento</span>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Acesso ou E-mail</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="exemplo@controllo.com"
                                    required
                                    autoComplete="username"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Senha</label>
                                {/* Container flex para alinhar o input e o botão do olho */}
                                <div className="input-group-password" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            position: 'absolute', 
                                            right: '12px', 
                                            color: '#6c757d', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            padding: 0
                                        }}
                                        title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                                    >
                                        {mostrarSenha ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
                                    </button>
                                </div>
                            </div>

                            {erro && <div className="alert-error">{erro}</div>}
                            <button type="submit" className="btn-submit" disabled={carregando}>
                                {carregando ? 'Entrando…' : 'Entrar no Painel'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}