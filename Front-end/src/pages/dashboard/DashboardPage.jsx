import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import './DashboardPage.css';
import { primeiroNome } from '../../utils/usuario.js';

export default function DashboardPage({ navegarPara, pendentes = 0 }) {
    // Lê o usuário salvo no login; atualiza sozinho se o perfil for editado
    const nomeUsuario = primeiroNome(useUsuarioLogado());

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-inner">
                <header className="dashboard-welcome">
                    <h1>
                        {nomeUsuario ? `Olá, ${nomeUsuario}!` : 'Olá, seja bem-vindo(a)!'}
                    </h1>

                    <p className="welcome-sub">
                        O que você deseja fazer hoje?
                    </p>
                </header>

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
                        className={`menu-card ${pendentes > 0 ? 'menu-card--aviso' : ''}`}
                        onClick={() => (pendentes > 0 ? navegarPara?.aprovacoes?.() : navegarPara?.usuarios?.())}
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
                            {pendentes > 0 && (
                                <span className="menu-card-aviso">
                                    {pendentes} cadastro{pendentes === 1 ? '' : 's'} aguardando aprovação
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
            </div>
        </div>
    );
}