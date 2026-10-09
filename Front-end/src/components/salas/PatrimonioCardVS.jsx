import { urlImagemPatrimonio } from '../../services/imagemService';

export default function PatrimonioCardVS({
    patrimonio,
    selecionado,
    onToggleSelecionado,
    onEditar,
    onExcluir,
    onTransferir,
    onHistorico
}) {
    const nome = patrimonio.nome || 'Sem nome';

    const id = String(
        patrimonio.id_patrimonio || patrimonio.id || ''
    );

    const tombo = patrimonio.numero_patrimonio || '—';

    const srcImagem = urlImagemPatrimonio(patrimonio);

    // ============================================================
    // CLIQUE NO CARD
    // ============================================================

    function handleCardClick(e) {
        if (
            e.target.closest('.vs-pat-actions') ||
            e.target.closest('.vs-pat-checkbox-label')
        ) {
            return;
        }

        onToggleSelecionado(id);
    }

    // ============================================================
    // TRANSFERIR PATRIMÔNIO
    // ============================================================

    function handleTransferir(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log(
            'TRANSFERIR PATRIMÔNIO:',
            patrimonio
        );

        if (!onTransferir) {
            console.error(
                'ERRO: onTransferir não foi recebido pelo PatrimonioCardVS'
            );
            return;
        }

        onTransferir(patrimonio);
    }

    // ============================================================
    // HISTÓRICO
    // ============================================================

    function handleHistorico(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!onHistorico) {
            console.error(
                'ERRO: onHistorico não foi recebido pelo PatrimonioCardVS'
            );
            return;
        }

        onHistorico(patrimonio);
    }

    return (
        <div
            className={`vs-patrimonio-card ${
                selecionado ? 'selecionado' : ''
            }`}
            onClick={handleCardClick}
        >

            {/* ============================================================
                CHECKBOX
                ============================================================ */}

            <label
                className="vs-pat-checkbox-label"
                title="Selecionar"
            >
                <input
                    type="checkbox"
                    className="vs-pat-checkbox"
                    checked={selecionado}
                    onChange={() =>
                        onToggleSelecionado(id)
                    }
                />

                <span className="vs-pat-checkbox-custom"></span>
            </label>


            {/* ============================================================
                IMAGEM
                ============================================================ */}

            <div className="vs-pat-img-area">
                {srcImagem && (
                    <img
                        className="patrimonio-card-img"
                        alt={nome}
                        src={srcImagem}

                        // Se o link falhar (404), oculta a imagem quebrada
                        onError={(e) =>
                            e.target.style.display = 'none'
                        }
                    />
                )}
            </div>


            {/* ============================================================
                INFORMAÇÕES
                ============================================================ */}

            <div className="vs-pat-info">

                <div className="vs-pat-nome">
                    {nome}
                </div>

                <div className="vs-pat-meta">
                    Tombo: {tombo}
                </div>

                <div className="vs-pat-meta">
                    ID: #{id}
                </div>

            </div>


            {/* ============================================================
                AÇÕES
                ============================================================ */}

            <div className="vs-pat-actions">

                {/* EDITAR */}

                <button
                    type="button"
                    className="btn-pat-editar"
                    title="Editar patrimônio"
                    aria-label="Editar patrimônio"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        onEditar(patrimonio);
                    }}
                >
                    ✏️
                </button>


                {/* EXCLUIR */}

                <button
                    type="button"
                    className="btn-pat-excluir"
                    title="Excluir patrimônio"
                    aria-label="Excluir patrimônio"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        onExcluir(id, nome);
                    }}
                >
                    🗑️
                </button>


                {/* TRANSFERIR */}

                <button
                    type="button"
                    className="btn-pat-transferir"
                    title="Transferir patrimônio"
                    aria-label="Transferir patrimônio"
                    onClick={handleTransferir}
                >
                    ⇄
                </button>


                {/* HISTÓRICO */}

                <button
                    type="button"
                    className="btn-pat-historico"
                    title="Ver histórico de transferências"
                    aria-label="Ver histórico de transferências"
                    onClick={handleHistorico}
                >
                    📋
                </button>

            </div>

        </div>
    );
}