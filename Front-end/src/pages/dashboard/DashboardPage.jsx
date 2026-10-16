export default function DashboardPage({ navegarPara, pendentes = 0 }) {
    const modulos = [
        {
            id: 'salas',
            titulo: 'Gerenciar Salas',
            descricao: 'Cadastro, edição e controle de patrimônios por sala.',
            icone: 'log-in-outline',
            acao: () => navegarPara?.salas?.(),
        },
        {
            id: 'usuarios',
            titulo: 'Gerenciar Usuários',
            descricao: 'Controle de acessos, permissões e perfis do sistema.',
            icone: 'people-outline',
            acao: () => navegarPara?.usuarios?.(),
        },
        {
            id: 'aprovacoes',
            titulo: 'Aprovar Cadastros',
            descricao: pendentes > 0 
                ? `${pendentes} cadastro${pendentes === 1 ? '' : 's'} aguardando aprovação.` 
                : 'Nenhum cadastro aguardando aprovação.',
            icone: 'person-add-outline',
            badge: pendentes > 0 ? `${pendentes} pendente${pendentes > 1 ? 's' : ''}` : null,
            badgeClass: pendentes > 0 ? 'badge-alert' : '',
            acao: () => navegarPara?.aprovacoes?.(),
        },
        {
            id: 'historico',
            titulo: 'Histórico',
            descricao: 'Consulte aberturas, andamentos e finalizações de manutenção.',
            icone: 'time-outline',
            acao: () => navegarPara?.historico?.(),
        },
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-inner">
                <header className="dashboard-welcome">
                    <h1>Olá, seja bem-vindo(a)! </h1>
                    <p className="welcome-sub">Selecione um módulo para gerenciar o sistema</p>
                </header>

                <div className="dashboard-section-label">Módulos do Sistema</div>

                <div className="dashboard-menu-grid">
                    {modulos.map((item) => (
                        <div key={item.id} className="menu-card" onClick={item.acao}>
                            <div className="card-top">
                                <div className="card-icon">
                                    <ion-icon name={item.icone}></ion-icon>
                                </div>
                                {item.badge && (
                                    <span className={`card-badge ${item.badgeClass}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <div className="card-info">
                                <h3>{item.titulo}</h3>
                                <p>{item.descricao}</p>
                            </div>

                            <div className="card-arrow">
                                <span>Acessar</span>
                                <ion-icon name="arrow-forward-outline"></ion-icon>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}