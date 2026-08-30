export default function DashboardPage({ navegarPara }) {
    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-inner">
                <header className="dashboard-welcome">
                    <h1>Olá, seja Bem-Vindo(a) !</h1>
                    <p className="welcome-sub">O que você deseja fazer hoje?</p>
                </header>

                <div className="dashboard-section-label">Módulos do sistema</div>

                <div className="dashboard-menu-grid">
                    <div className="menu-card" onClick={() => navegarPara?.salas?.()}>
                        <div className="card-icon">
                            <ion-icon name="log-in-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Gerenciar Salas</h3>
                            <p>Cadastro, edição e controle de patrimônios por sala.</p>
                        </div>
                    </div>

                    <div className="menu-card" onClick={() => navegarPara?.usuarios?.()}>
                        <div className="card-icon">
                            <ion-icon name="people-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Gerenciar Usuários</h3>
                            <p>Controle de acessos, permissões e perfis do sistema.</p>
                        </div>
                    </div>

                    <div className="menu-card disabled" aria-disabled="true">
                        <div className="card-icon">
                            <ion-icon name="clipboard-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Aplicar Tarefas</h3>
                            <p>Crie, distribua e acompanhe ordens de serviço.</p>
                        </div>
                    </div>

                    <div className="menu-card disabled" aria-disabled="true">
                        <div className="card-icon">
                            <ion-icon name="bar-chart-outline" style={{ fontSize: '28px'}}></ion-icon>
                        </div>
                        <div className="card-info">
                            <h3>Ver Registros</h3>
                            <p>Consulte históricos, relatórios e logs de atividade.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}