import { useState, useEffect, useRef } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { logar, verificarSetup } from '../../services/usuarioService.js';
import { salvarUsuario } from '../../storage/usuario/dados.storage.js';
import SetupPage from './SetupPage.jsx';
import { gsap, useGSAP } from '../../animations/gsap.js';

// 1. Importe as imagens (ou utilize os caminhos diretos dependendo do seu bundler como Vite/Webpack)
const logoEscuro = '../assets/controllo.svg';
const logoClaro = '../assets/controlloalt.svg';

export default function LoginPage({ onLoginSucesso }) {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [semAdmin, setSemAdmin] = useState(false);
    const [verificandoSetup, setVerificandoSetup] = useState(true);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const cenaRef = useRef(null);
    const cardRef = useRef(null);

    // Estado para controlar se o tema atual é escuro
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Efeito para detectar o tema atual da aplicação ou do sistema
    useEffect(() => {
        // Exemplo 1: Verificando se a tag <html> ou <body> possui uma classe de tema (ex: 'dark')
        const checkTheme = () => {
            const htmlTheme = document.documentElement.getAttribute('data-theme') || document.documentElement.className;
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // Ajuste esta condição de acordo com como seu app define o tema escuro
            if (htmlTheme.includes('dark') || (!htmlTheme.includes('light') && prefersDark)) {
                setIsDarkMode(true);
            } else {
                setIsDarkMode(false);
            }
        };

        checkTheme();

        // Opcional: Observer caso o tema mude dinamicamente em tempo de execução
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

        return () => observer.disconnect();
    }, []);

    // Entrada do login: blobs surgem, card sobe com "pop" e os campos entram em cascata
    useGSAP(() => {
        if (!cardRef.current) return undefined;

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const card = cardRef.current;

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from('.login-blob', { scale: 0, opacity: 0, duration: 1.6, stagger: 0.15, ease: 'expo.out' })
                .from(card, { y: 70, opacity: 0, scale: 0.9, duration: 0.9, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }, 0.1)
                .from('.card-login-logo .logo-mark', { rotation: -180, scale: 0, duration: 0.9, ease: 'back.out(2)' }, 0.35)
                .from('.card-login-logo .logo-name', { x: -18, opacity: 0, duration: 0.6 }, 0.5)
                .from(
                    '.card-login h2, .card-login .subtitle, .card-login .form-group, .card-login .btn-submit',
                    { y: 20, opacity: 0, duration: 0.55, stagger: 0.08, clearProps: 'transform,opacity' },
                    0.55
                );

            // blobs à deriva + logo flutuando
            gsap.utils.toArray('.login-blob').forEach((b) => {
                gsap.to(b, { x: 'random(-70, 70)', y: 'random(-70, 70)', duration: 'random(6, 10)', repeat: -1, yoyo: true, ease: 'sine.inOut' });
            });
            gsap.to('.card-login-logo .logo-mark', { y: -4, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.4 });

            // parallax: o card inclina e os blobs seguem o mouse
            const cena = cenaRef.current;
            let rotY; let rotX;
            const aoMover = (e) => {
                if (tl.isActive()) return;
                const nx = e.clientX / window.innerWidth - 0.5;
                const ny = e.clientY / window.innerHeight - 0.5;
                if (!rotY) {
                    gsap.set(card, { transformPerspective: 1000 });
                    rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
                    rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
                }
                rotY(nx * 8);
                rotX(-ny * 8);
                gsap.to('.login-blobs', { x: nx * -40, y: ny * -40, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
            };
            cena?.addEventListener('pointermove', aoMover);

            return () => cena?.removeEventListener('pointermove', aoMover);
        });

        return () => mm.revert();
    }, { dependencies: [verificandoSetup, semAdmin], scope: cenaRef });

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        
        try {
            const dados = await logar(login.trim(), senha);
            if (dados && dados.token) {
                salvarUsuario(dados);
                if (cardRef.current) {
                    await new Promise((resolve) => {
                        gsap.to(cardRef.current, { y: -40, scale: 0.94, opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: resolve });
                    });
                }
                onLoginSucesso();
            } else {
                throw new Error('Resposta inválida do servidor.');
            }
        } catch (error) {
            const textoErro = error.response?.data?.message || error.message || 'Não foi possível conectar ao servidor.';
            setErro(textoErro);
        } finally {
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

    if (semAdmin) {
        return (
            <SetupPage
                onSetupConcluido={() => setSemAdmin(false)}
            />
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center style-container-login" data-sem-auto ref={cenaRef} style={{ minHeight: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
            <div className="login-blobs" aria-hidden="true">
                <span className="login-blob login-blob--1" />
                <span className="login-blob login-blob--2" />
                <span className="login-blob login-blob--3" />
            </div>
            <div className="w-100 d-flex justify-content-center">
                <div className="col-sm-12 col-md-6 col-lg-4 col-xl-3 mb-4 d-flex justify-content-center">
                    <div className="card-login w-100" ref={cardRef}>
                        <div className="card-login-logo">
                            <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img
                                    // 2. Alterna a imagem dinamicamente com base no estado do tema
                                    src={isDarkMode ? logoEscuro : logoClaro}
                                    alt="Controllo Logo"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                            <span className="logo-name">Controllo</span>
                        </div>
                        
                        <h2>Boas-vindas</h2>
                        <span className="subtitle">Acesse o painel de gerenciamento</span>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="login">Acesso ou E-mail</label>
                                <input
                                    id="login"
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
                                <label className="form-label" htmlFor="senha">Senha</label>
                                <div className="input-group-password" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                    <input
                                        id="senha"
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

                            {erro && <div className="alert-error mt-2">{erro}</div>}
                            
                            <button type="submit" className="btn-submit mt-3" disabled={carregando}>
                                {carregando ? 'Entrando…' : 'Entrar no Painel'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}