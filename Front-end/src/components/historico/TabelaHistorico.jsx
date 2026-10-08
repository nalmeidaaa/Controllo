import BadgeAcao from '../../../../../../Downloads/files/BadgeAcao.jsx';
import { formatarDataHora, nomeUsuario } from '../../../../../../Downloads/files/rotulos.js';

export default function TabelaHistorico({ eventos, onSelecionar }) {
    return (
        <div className="tabela-card hist-tabela-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Data e hora</th>
                        <th>Ação</th>
                        <th>Patrimônio</th>
                        <th>Sala</th>
                        <th>Solicitante</th>
                        <th>Responsável</th>
                        <th>Feito por</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    {eventos.map((e) => (
                        <tr
                            key={e.id_historico}
                            className="hist-linha"
                            tabIndex={0}
                            onClick={() => onSelecionar(e.requisicao?.id_requisicao)}
                            onKeyDown={(ev) => {
                                if (ev.key === 'Enter') onSelecionar(e.requisicao?.id_requisicao);
                            }}
                        >
                            <td className="user-meta">{formatarDataHora(e.horario)}</td>
                            <td><BadgeAcao acao={e.acao} /></td>
                            <td>
                                <div className="user-name">{e.patrimonio?.nome}</div>
                                <div className="user-meta">{e.patrimonio?.numero_patrimonio || '—'}</div>
                            </td>
                            <td>{e.sala?.descricao}</td>
                            <td>{nomeUsuario(e.solicitante)}</td>
                            <td>{e.responsavel ? e.responsavel.nome : '—'}</td>
                            <td>{nomeUsuario(e.usuario_acao)}</td>
                            <td className="hist-descricao">{e.descricao || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
