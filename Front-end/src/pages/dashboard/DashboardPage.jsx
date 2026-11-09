import { useState, useRef } from 'react';
import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import { usePendentes } from '../../hooks/usePendentes.jsx';
import { aprovarCadastro, recusarCadastro } from '../../services/usuarioService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import TabelaPendentes from '../../components/aprovacao/TabelaPendentes.jsx';
import ModalAprovar from '../../components/aprovacao/ModalAprovar.jsx';
import ModalRecusar from '../../components/aprovacao/ModalRecusar.jsx';
import { primeiroNome } from '../../utils/usuario.js';
import { gsap, useGSAP } from '../../animations/gsap.js';
import NumeroAnimado from '../../animations/NumeroAnimado.jsx';
import './DashboardPage.css';

export default function DashboardPage({ navegarPara }) {
    const nomeUsuario = primeiroNome(useUsuarioLogado());
    const { pendentes, carregando, erro, recarregar } = usePendentes();

    const [aprovando, setAprovando] = useState(null);
    const [recusando, setRecusando] = useState(null);
    const [executando, setExecutando] = useState(false);
    const [erroModal, setErroModal] = useState('');
    const [mensagem, setMensagem] = useState(null);

    function mensagemDeErro(error, padrao) {
        if (error.response?.status === 403) return 'Você não tem permissão para esta ação.';
        return error.response?.data?.message || (error.response ? padrao : 'Não foi possível conectar ao servidor.');
    }

    async function depoisDaAcao() {
        await recarregar();
    }

    async function confirmarAprovacao(perfil) {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await aprovarCadastro(obterToken(), aprovando.id_usuario, perfil);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro aprovado com sucesso.' });
            setAprovando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível aprovar o cadastro.'));
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    async function confirmarRecusa() {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await recusarCadastro(obterToken(), recusando.id_usuario);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro recusado e excluído.' });
            setRecusando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível recusar o cadastro.'));
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    function abrirAprovar(usuario) {
        setMensagem(null);
        setErroModal('');
        setAprovando(usuario);
    }

    function abrirRecusar(usuario) {
        setMensagem(null);
        setErroModal('');
        setRecusando(usuario);
    }

    const qtdPendentes = Array.isArray(pendentes) ? pendentes.length : 0;
    const wrapperRef = useRef(null);

    // Ícones dos módulos flutuam de leve, cada um em um ritmo
    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.to('.menu-card .card-icon', {
                y: -4,
                duration: 1.8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1.2,
                stagger: { each: 0.35, from: 'start' },
            });
        });
        return () => mm.revert();
    }, { scope: wrapperRef });

    // Selo de "cadastros aguardando" emite um pulso
    useGSAP(() => {
        if (qtdPendentes <= 0) return;
        gsap.fromTo(
            '.menu-card-aviso',
            { boxShadow: '0 0 0 0 rgba(201, 19, 28, 0.45)' },
            { boxShadow: '0 0 0 10px rgba(201, 19, 28, 0)', duration: 1.6, repeat: -1, ease: 'power1.out' }
        );
    }, { dependencies: [qtdPendentes > 0], scope: wrapperRef });

    return (
        <div className="dashboard-wrapper" ref={wrapperRef}>
            <div className="dashboard-inner">
                <header className="dashboard-welcome">
                    <h1>
                        {nomeUsuario ? `Olá, ${nomeUsuario}!` : 'Olá, seja bem-vindo(a)!'}
                    </h1>
                    <p className="welcome-sub">
                        O que você deseja fazer hoje?
                    </p>
                </header>

                {mensagem && (
                    <div className={`aprov-mensagem ${mensagem.tipo}`} role="status">
                        {mensagem.texto}
                    </div>
                )}

                <div className="dashboard-section-label">
                    Módulos do sistema
                </div>

                <div className="dashboard-menu-grid">
                    <div
                        className="menu-card"
                        onClick={() => navegarPara?.salas?.()}
                    >
                        <div className="card-icon">
                            <ion-icon
                                name="log-in-outline"
                                style={{ fontSize: "28px" }}
                            ></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Gerenciar Salas</h3>
                            <p>
                                Cadastro, edição e controle de patrimônios por sala.
                            </p>
                        </div>
                    </div>

                    <div
                        className={`menu-card ${qtdPendentes > 0 ? 'menu-card--aviso' : ''}`}
                        onClick={() => navegarPara?.usuarios?.()}
                    >
                        <div className="card-icon">
                            <ion-icon
                                name="people-outline"
                                style={{ fontSize: "28px" }}
                            ></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Gerenciar Usuários</h3>
                            <p>
                                Controle de acessos, permissões, perfis e aprovação de novos cadastros.
                            </p>
                            {qtdPendentes > 0 && (
                                <span className="menu-card-aviso">
                                    <NumeroAnimado valor={qtdPendentes} formatar={String} /> cadastro{qtdPendentes === 1 ? '' : 's'} aguardando aprovação
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="menu-card" onClick={() => navegarPara?.historico?.()}>
                        <div className="card-icon">
                            <ion-icon name="time-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Histórico</h3>
                            <p>Consulte aberturas, andamentos e finalizações de manutenção.</p>
                        </div>
                    </div>
                </div>

                {/* Seção de Aprovações Pendentes */}
                <br/>
                <div className="dashboard-section-label dashboard-section-pendentes">
                    Aprovações Pendentes
                </div>

                {carregando ? (
                    <div className="tabela-card dashboard-card-pendentes">
                        <div className="aprov-estado">Carregando cadastros...</div>
                    </div>
                ) : erro ? (
                    <div className="tabela-card dashboard-card-pendentes">
                        <div className="aprov-estado">
                            <p>{erro}</p>
                            <button className="btn-primary-custom" onClick={recarregar}>Tentar novamente</button>
                        </div>
                    </div>
                ) : qtdPendentes === 0 ? (
                    <div className="tabela-card dashboard-card-pendentes dashboard-card-vazio">
                        <div className="aprov-estado">Nenhum cadastro pendente no momento.</div>
                    </div>
                ) : (
                    <div className="dashboard-tabela-wrapper">
                        <TabelaPendentes
                            pendentes={pendentes}
                            ocupado={executando}
                            onAprovar={abrirAprovar}
                            onRecusar={abrirRecusar}
                        />
                    </div>
                )}

                {/* Modais de Aprovação e Recusa */}
                {aprovando && (
                    <ModalAprovar
                        usuario={aprovando}
                        salvando={executando}
                        erro={erroModal}
                        onConfirmar={confirmarAprovacao}
                        onFechar={() => !executando && setAprovando(null)}
                    />
                )}

                {recusando && (
                    <ModalRecusar
                        usuario={recusando}
                        salvando={executando}
                        erro={erroModal}
                        onConfirmar={confirmarRecusa}
                        onFechar={() => !executando && setRecusando(null)}
                    />
                )}
            </div>
        </div>
    );
}