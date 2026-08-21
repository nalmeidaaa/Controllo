import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';
import { urlImagemUsuario } from '../../services/imagemService.js';

function getBadge(tipo) {
    const type = (tipo || '').toLowerCase();
    if (type === 'administração' || type === 'administracao') return { cls: 'badge-admin', texto: 'Admin' };
    if (type === 'manutenção' || type === 'manutencao') return { cls: 'badge-manutencao', texto: 'Manutenção' };
    return { cls: 'badge-geral', texto: 'Geral' };
}

function buscarInicial(nome) {
    if (!nome || nome === '—') return '?';
    return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function TabelaUsuarios({ usuarios = [], onEditar, onExcluir }) {
    const usuarioAtual = obterUsuarioAtual();

    if (!usuarios || usuarios.length === 0) {
        return (
            <div className="tabela-card">
                <div className="tabela-empty">
                    <div className="tabela-empty-icon">👤</div>
                    <p>Nenhum usuário encontrado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tabela-card">
            <table>
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>CPF</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => {
                        const nome = usuario.nome || '—';
                        const cpf = usuario.cpf || '—';
                        const email = usuario.email || '—';
                        const id = usuario.id_usuario;
                        const badge = getBadge(usuario.tipo_usuario);
                        const srcImagem = urlImagemUsuario(usuario);
                        const ehVoce = String(usuarioAtual?.id_usuario) === String(id);

                        return (
                            <tr key={id} className={ehVoce ? 'linha-usuario-ativo' : ''}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="user-avatar" title={nome}>
                                            {srcImagem
                                                ? <img className="usuario-card-img" alt={nome} src={srcImagem} />
                                                : buscarInicial(nome)}
                                        </div>
                                        <div>
                                            <span className="user-name">{nome}</span>
                                            {ehVoce && <span className="badge-voce">você</span>}
                                        </div>
                                    </div>
                                </td>
                                <td><span className="user-cpf">{cpf}</span></td>
                                <td><span className="user-email">{email}</span></td>
                                <td><span className={`badge-perfil ${badge.cls}`}>{badge.texto}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn-action" style={{ marginRight: 6 }} onClick={() => onEditar?.(usuario)}>
                                        Editar
                                    </button>
                                    {ehVoce ? (
                                        <button className="btn-action btn-action-danger" disabled title="Você não pode excluir sua própria conta" style={{ opacity: 0.35, cursor: 'not-allowed' }}>
                                            Excluir
                                        </button>
                                    ) : (
                                        <button className="btn-action btn-action-danger" onClick={() => onExcluir?.(id)}>
                                            Excluir
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
