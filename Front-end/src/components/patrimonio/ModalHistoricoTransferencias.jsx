import { useEffect } from 'react';

export default function ModalHistoricoTransferencias({
    aberto,
    patrimonio,
    historico = [],
    carregando = false,
    onFechar
}) {
    useEffect(() => {
        if (!aberto) {
            return;
        }

        function handleEsc(e) {
            if (e.key === 'Escape') {
                onFechar();
            }
        }

        document.addEventListener(
            'keydown',
            handleEsc
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleEsc
            );
        };
    }, [aberto, onFechar]);

    if (!aberto || !patrimonio) {
        return null;
    }

    const nomePatrimonio =
        patrimonio.nome || 'Patrimônio';

    return (
        <div
            className="historico-modal-overlay"
            onClick={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !carregando
                ) {
                    onFechar();
                }
            }}
        >

            <div className="historico-modal">

                {/* ============================================================
                    CABEÇALHO
                    ============================================================ */}

                <div className="historico-modal-header">

                    <div>
                        <h2>
                            Histórico de transferências
                        </h2>

                        <p>
                            Consulte as movimentações deste patrimônio.
                        </p>
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


                {/* ============================================================
                    PATRIMÔNIO
                    ============================================================ */}

                <div className="historico-modal-body">

                    <div className="historico-patrimonio">

                        <span>
                            Patrimônio
                        </span>

                        <strong>
                            {nomePatrimonio}
                        </strong>

                        <small>
                            ID #{patrimonio.id_patrimonio ||
                                patrimonio.id ||
                                '—'}
                        </small>

                    </div>


                    {/* ========================================================
                        CARREGANDO
                        ======================================================== */}

                    {carregando && (
                        <div className="historico-carregando">
                            Carregando histórico...
                        </div>
                    )}


                    {/* ========================================================
                        SEM HISTÓRICO
                        ======================================================== */}

                    {!carregando &&
                        historico.length === 0 && (
                            <div className="historico-vazio">

                                <div className="historico-vazio-icone">
                                    📋
                                </div>

                                <strong>
                                    Nenhuma transferência registrada
                                </strong>

                                <span>
                                    Este patrimônio ainda não possui
                                    histórico de transferências.
                                </span>

                            </div>
                        )}


                    {/* ========================================================
                        HISTÓRICO
                        ======================================================== */}

                    {!carregando &&
                        historico.length > 0 && (

                            <div className="historico-lista">

                                {historico.map(
                                    (item, index) => {

                                        const origem =
                                            item.descricao_sala_origem ||
                                            `Sala #${item.sala_origem}`;

                                        const destino =
                                            item.descricao_sala_destino ||
                                            `Sala #${item.sala_destino}`;

                                        const data =
                                            item.data_transferencia
                                                ? new Date(
                                                    item.data_transferencia
                                                ).toLocaleString(
                                                    'pt-BR'
                                                )
                                                : '—';

                                        return (
                                            <div
                                                className="historico-item"
                                                key={
                                                    item.id_transferencia ||
                                                    index
                                                }
                                            >

                                                <div className="historico-item-topo">

                                                    <span className="historico-item-numero">
                                                        Transferência #{item.id_transferencia}
                                                    </span>

                                                    <span className="historico-item-data">
                                                        {data}
                                                    </span>

                                                </div>


                                                <div className="historico-movimentacao">

                                                    <div className="historico-local origem">

                                                        <span>
                                                            Sala de origem
                                                        </span>

                                                        <strong>
                                                            {origem}
                                                        </strong>

                                                        <small>
                                                            Bloco{' '}
                                                            {item.bloco_origem ||
                                                                '—'}
                                                        </small>

                                                    </div>


                                                    <div className="historico-seta">
                                                        →
                                                    </div>


                                                    <div className="historico-local destino">

                                                        <span>
                                                            Sala de destino
                                                        </span>

                                                        <strong>
                                                            {destino}
                                                        </strong>

                                                        <small>
                                                            Bloco{' '}
                                                            {item.bloco_destino ||
                                                                '—'}
                                                        </small>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                </div>


                {/* ============================================================
                    RODAPÉ
                    ============================================================ */}

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