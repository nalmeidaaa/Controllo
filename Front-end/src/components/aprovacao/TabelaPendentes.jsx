import { urlImagemUsuario } from '../../services/imagemService.js';

function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function iniciais(nome = '') {
    return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export default function TabelaPendentes({ pendentes, ocupado, onAprovar, onRecusar }) {
    return (
        <div className="tabela-card aprov-tabela-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>CPF</th>
                        <th>E-mail</th>
                        <th>Cadastro</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pendentes.map((u) => {
                        const foto = urlImagemUsuario(u);
                        return (
                            <tr key={u.id_usuario}>
                                <td>
                                    <div className="aprov-usuario">
                                        <div className="user-avatar">
                                            {foto ? <img src={foto} alt={u.nome} /> : iniciais(u.nome)}
                                        </div>
                                        <span className="user-name">{u.nome}</span>
                                    </div>
                                </td>
                                <td className="user-cpf">{u.cpf}</td>
                                <td className="user-email">{u.email || '—'}</td>
                                <td className="user-meta">{formatarData(u.data_cadastro)}</td>
                                <td>
                                    <div className="aprov-acoes">
                                        <button
                                            className="btn-action"
                                            disabled={ocupado}
                                            onClick={() => onAprovar(u)}
                                        >
                                            Aprovar
                                        </button>
                                        <button
                                            className="btn-action btn-action-danger"
                                            disabled={ocupado}
                                            onClick={() => onRecusar(u)}
                                        >
                                            Recusar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
