export default function DashboardPage({ navegarPara, pendentes = 0 }) {
    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-inner">
                <header className="dashboard-welcome">
                    <h1>
                        Olá, seja bem-vindo(a) !
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
                        className="menu-card"
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
                                Controle de acessos, permissões e perfis do sistema.
                            </p>
                        </div>
                    </div>

                    <div className="menu-card" onClick={() => navegarPara?.aprovacoes?.()}>
                        <div className="card-icon">
                            <ion-icon name="person-add-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>

                        <div className="card-info">
                            <h3>Aprovar Cadastros</h3>
                            <p>
                                {pendentes > 0
                                    ? `${pendentes} cadastro${pendentes === 1 ? '' : 's'} aguardando aprovação.`
                                    : 'Nenhum cadastro aguardando aprovação.'}
                            </p>
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

