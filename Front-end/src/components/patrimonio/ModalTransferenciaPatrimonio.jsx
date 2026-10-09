import { useEffect, useState } from 'react';

export default function ModalTransferenciaPatrimonio({
    aberto,
    patrimonio,
    salas = [],
    salaAtual,
    onTransferir,
    onFechar,
    transferindo = false
}) {
    const [salaDestino, setSalaDestino] = useState('');

    useEffect(() => {
        if (aberto) {
            setSalaDestino('');
        }
    }, [aberto, patrimonio]);

    if (!aberto || !patrimonio) {
        return null;
    }

    const idSalaAtual =
        salaAtual?.id_sala ||
        salaAtual?.id ||
        patrimonio?.id_sala;

    const nomePatrimonio =
        patrimonio.nome || 'Patrimônio';

    const blocoAtual =
        salaAtual?.bloco || '—';

    function handleSubmit(e) {
        e.preventDefault();

        if (!salaDestino) {
            alert('Selecione uma sala de destino.');
            return;
        }

        if (
            String(salaDestino) ===
            String(idSalaAtual)
        ) {
            alert(
                'O patrimônio já está nesta sala.'
            );
            return;
        }

        onTransferir(
            patrimonio,
            salaDestino
        );
    }

    return (
        <div
            className="transfer-modal-overlay"
            onClick={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !transferindo
                ) {
                    onFechar();
                }
            }}
        >

            <div className="transfer-modal-box">

                {/* ============================================================
                    CABEÇALHO
                    ============================================================ */}

                <div className="transfer-modal-header">

                    <div className="transfer-modal-header-text">

                        <h2>
                            Transferir patrimônio
                        </h2>

                        <p>
                            Escolha a sala de destino do patrimônio.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="transfer-modal-close"
                        onClick={onFechar}
                        disabled={transferindo}
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </div>


                {/* ============================================================
                    CONTEÚDO
                    ============================================================ */}

                <form
                    className="transfer-modal-form"
                    onSubmit={handleSubmit}
                >

                    <div className="transfer-modal-body">

                        {/* ====================================================
                            PATRIMÔNIO ATUAL
                            ==================================================== */}

                        <div className="transfer-patrimonio">

                            <div className="transfer-patrimonio-label">
                                Patrimônio
                            </div>

                            <div className="transfer-patrimonio-nome">
                                {nomePatrimonio}
                            </div>

                            <div className="transfer-patrimonio-dados">

                                <div>
                                    <span>
                                        Sala atual
                                    </span>

                                    <strong>
                                        {salaAtual?.descricao || '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Bloco
                                    </span>

                                    <strong>
                                        {blocoAtual}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* ====================================================
                            SALA DE DESTINO
                            ==================================================== */}

                        <div className="transfer-destino">

                            <label
                                htmlFor="salaDestino"
                            >
                                Sala de destino
                            </label>

                            <select
                                id="salaDestino"
                                value={salaDestino}
                                onChange={(e) =>
                                    setSalaDestino(
                                        e.target.value
                                    )
                                }
                                disabled={transferindo}
                                required
                            >

                                <option value="">
                                    Selecione uma sala
                                </option>

                                {salas.map((sala) => {

                                    const id =
                                        sala.id_sala ||
                                        sala.id;

                                    if (
                                        String(id) ===
                                        String(idSalaAtual)
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <option
                                            key={id}
                                            value={id}
                                        >
                                            {sala.descricao ||
                                                sala.nome ||
                                                `Sala #${id}`}
                                            {' — Bloco '}
                                            {sala.bloco ||
                                                '—'}
                                        </option>
                                    );
                                })}

                            </select>

                        </div>

                    </div>


                    {/* ============================================================
                        RODAPÉ
                        ============================================================ */}

                    <div className="transfer-modal-footer">

                        <button
                            type="button"
                            className="transfer-btn-cancelar"
                            onClick={onFechar}
                            disabled={transferindo}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="transfer-btn-confirmar"
                            disabled={
                                transferindo ||
                                !salaDestino
                            }
                        >
                            {transferindo
                                ? 'Transferindo...'
                                : '⇄ Transferir'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}