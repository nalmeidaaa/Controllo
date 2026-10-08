import { useEffect, useState } from 'react';
import { obterLinhaDoTempo } from '../../services/historicoService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import BadgeAcao from '../../../../../../Downloads/files/BadgeAcao.jsx';
import { PRIORIDADES, formatarDataHora, nomeUsuario } from '../../../../../../Downloads/files/rotulos.js';

export default function ModalLinhaDoTempo({ idRequisicao, onFechar }) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    async function carregar() {
        try {
            setCarregando(true);
            setErro('');
            const resposta = await obterLinhaDoTempo(obterToken(), idRequisicao);
            setDados(resposta?.result ?? null);
        } catch (error) {
            setErro(
                error.response?.data?.message ||
                (error.response ? 'Não foi possível carregar a linha do tempo.' : 'Não foi possível conectar ao servidor.')
            );
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idRequisicao]);

    const req = dados?.requisicao;

    return (
        <div
            className="modal-overlay visible"
            onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
        >
            <div className="modal-box" style={{ maxWidth: 560, height: 'auto', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h5>Linha do tempo da requisição #{idRequisicao}</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar}>&times;</button>
                </div>

                <div className="modal-body">
                    {carregando ? (
                        <p className="hist-estado">Carregando...</p>
                    ) : erro ? (
                        <div className="hist-estado">
                            <p>{erro}</p>
                            <button className="btn-primary-custom" onClick={carregar}>Tentar novamente</button>
                        </div>
                    ) : !req ? (
                        <p className="hist-estado">Requisição não encontrada.</p>
                    ) : (
                        <>
                            <div className="hist-resumo">
                                <div><strong>{req.patrimonio?.nome}</strong> ({req.patrimonio?.numero_patrimonio || '—'})</div>
                                <div className="user-meta">{req.sala?.descricao}{req.sala?.bloco ? ` • Bloco ${req.sala.bloco}` : ''}</div>
                                <div className="hist-resumo-linha">
                                    <span>Prioridade: <strong>{PRIORIDADES[req.prioridade] || req.prioridade}</strong></span>
                                    <span>Status atual: <strong>{req.status_requisicao}</strong></span>
                                </div>
                                <div className="hist-resumo-linha">
                                    <span>Solicitante: {nomeUsuario(req.solicitante)}</span>
                                    <span>Responsável: {req.responsavel ? req.responsavel.nome : '—'}</span>
                                </div>
                                <p className="hist-resumo-descricao">{req.descricao}</p>
                            </div>

                            <ol className="hist-timeline">
                                {(dados.eventos ?? []).map((ev) => (
                                    <li key={ev.id_historico} className="hist-timeline-item">
                                        <span className="hist-timeline-ponto"></span>
                                        <div className="hist-timeline-topo">
                                            <BadgeAcao acao={ev.acao} />
                                            <span className="user-meta">{formatarDataHora(ev.horario)}</span>
                                        </div>
                                        <div className="user-meta">por {nomeUsuario(ev.usuario_acao)}</div>
                                        {ev.descricao && <p className="hist-timeline-descricao">{ev.descricao}</p>}
                                    </li>
                                ))}
                            </ol>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onFechar}>Fechar</button>
                </div>
            </div>
        </div>
    );
}
