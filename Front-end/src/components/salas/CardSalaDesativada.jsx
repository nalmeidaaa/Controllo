import { urlImagemSala } from '../../services/imagemService.js';

export default function CardSalaDesativada({
    sala,
    onVisualizar,
    onReativar
}) {
    const id =
        sala.id_sala ||
        sala.id ||
        '—';

    const descricao =
        sala.descricao ||
        sala.nome ||
        'Sem descrição';

    const bloco =
        sala.bloco ||
        '—';

    const srcImagem =
        urlImagemSala(sala);

    /*
     * =====================================================
     * CLIQUE NO CARD
     * =====================================================
     *
     * Clicar no card abre as informações da sala.
     *
     * Os botões não entram aqui.
     */
    function handleCardClick(e) {
        const clicouEmBotao =
            e.target.closest('button');

        if (clicouEmBotao) {
            return;
        }

        onVisualizar?.(sala);
    }

    /*
     * =====================================================
     * REATIVAR
     * =====================================================
     *
     * A função de reativação será controlada pela SalasPage.
     */
    function handleReativar(e) {
        e.preventDefault();
        e.stopPropagation();

        onReativar?.(sala);
    }

    return (
        <div
            className="sala-card-item sala-card-desativada"
            onClick={handleCardClick}
            style={{
                cursor: 'pointer'
            }}
        >

            {/* =================================================
                IMAGEM DA SALA
               ================================================= */}

            <div className="sala-card-imagem-wrapper">

                {srcImagem && (
                    <img
                        className="sala-card-img"
                        alt={descricao}
                        src={srcImagem}
                    />
                )}

                <span className="sala-card-badge-bloco">
                    Bloco {bloco}
                </span>

            </div>


            {/* =================================================
                INFORMAÇÕES BÁSICAS
               ================================================= */}

            <div className="sala-card-conteudo">

                <div className="sala-card-id">
                    ID DA SALA: {id}
                </div>

                <p className="sala-card-descricao">
                    {descricao}
                </p>


                {/* =================================================
                    STATUS
                   ================================================= */}

                <div className="sala-card-status">

                    <span className="sala-card-status-ponto">
                        ●
                    </span>

                    <span>
                        Desativada
                    </span>

                </div>


                {/* =================================================
                    BOTÕES
                   ================================================= */}

                <div className="sala-card-acoes">

                    {/* VISUALIZAR */}

                    <button
                        type="button"
                        className="btn-card-action btn-card-editar"
                        onClick={(e) => {

                            e.preventDefault();
                            e.stopPropagation();

                            onVisualizar?.(sala);

                        }}
                    >
                        Visualizar
                    </button>


                    {/* REATIVAR */}

                    <button
                        type="button"
                        className="btn-card-action btn-card-reativar"
                        onClick={handleReativar}
                    >
                        Reativar
                    </button>

                </div>

            </div>

        </div>
    );
}