import { useEffect } from 'react';
import BadgeAcao from '../historico/BadgeAcao.jsx';
import { formatarDataHora, nomeUsuario } from '../historico/rotulos.js';

export default function ModalHistoricoPatrimonio({
    aberto,
    patrimonio,
    historico = [],
    carregando = false,
    erro = '',
    onFechar
}) {
    useEffect(() => {
        if (!aberto) return undefined;

        function handleEsc(e) {
            if (e.key === 'Escape') onFechar();
        }

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [aberto, onFechar]);

    if (!aberto || !patrimonio) return null;

    const nomePatrimonio = patrimonio.nome || 'Patrimônio';
    const semHistorico = !carregando && !erro && historico.length === 0;

    return (
        <div
            className="historico-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onFechar();
            }}
        >
            <div className="historico-modal">

                <div className="historico-modal-header">
                    <div>
                        <h2>Histórico do patrimônio</h2>
                        <p>Consulte tudo o que já aconteceu com este item.</p>
                    </div>

                    <button
                        type="button"
                        className="historico-modal-close"
                        onClick={onFechar}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <div className="historico-modal-body">

                    <div className="historico-patrimonio">
                        <span>Patrimônio</span>
                        <strong>{nomePatrimonio}</strong>
                        <small>
                            ID #{patrimonio.id_patrimonio || patrimonio.id || '—'}
                        </small>
                    </div>

                    {carregando && (
                        <div className="historico-carregando">
                            Carregando histórico...
                        </div>
                    )}

                    {!carregando && erro && (
                        <div className="historico-vazio">
                            <div className="historico-vazio-icone">⚠️</div>
                            <strong>Não foi possível carregar</strong>
                            <span>{erro}</span>
                        </div>
                    )}

                    {semHistorico && (
                        <div className="historico-vazio">
                            <div className="historico-vazio-icone">📋</div>
                            <strong>Este item não tem histórico</strong>
                            <span>
                                Ainda não há nenhum registro vinculado a este patrimônio.
                            </span>
                        </div>
                    )}

                    {!carregando && !erro && historico.length > 0 && (
                        <div className="historico-lista">
                            {historico.map((item, index) => {
                                const idReq = item.requisicao?.id_requisicao;
                                const sala = item.sala
                                    ? `${item.sala.descricao}${item.sala.bloco ? ` • Bloco ${item.sala.bloco}` : ''}`
                                    : '';

                                return (
                                    <div
                                        className="historico-item"
                                        key={item.id_historico ?? index}
                                    >
                                        <div className="historico-item-topo">
                                            <span className="historico-item-numero">
                                                <BadgeAcao acao={item.acao} />
                                                {idReq != null && (
                                                    <> &nbsp;Requisição #{idReq}</>
                                                )}
                                            </span>

                                            <span className="historico-item-data">
                                                {formatarDataHora(item.horario)}
                                            </span>
                                        </div>

                                        <div style={{ marginTop: 8 }}>
                                            {item.descricao || <em>Sem descrição</em>}
                                        </div>

                                        <small style={{ display: 'block', marginTop: 6, opacity: 0.75 }}>
                                            Feito por {nomeUsuario(item.usuario_acao)}
                                            {sala && ` • ${sala}`}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                <div className="historico-modal-footer">
                    <button
                        type="button"
                        className="historico-btn-fechar"
                        onClick={onFechar}
                    >
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
}
