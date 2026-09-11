import { urlImagemSala } from '../../services/imagemService.js';
import { excluirSala } from '../../services/salaService.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

export default function CardSala({
    sala,
    selecionado,
    onToggleSelecionado,
    onVisualizar,
    onEditar,
    onExcluir,
    onDuplicar
}) {
    const id = sala.id_sala || sala.id || '—';

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
     * Os botões e o checkbox não entram aqui.
     */
    function handleCardClick(e) {
        const clicouEmBotao =
            e.target.closest('button');

        const clicouNoCheckbox =
            e.target.closest(
                '.sala-card-checkbox-label'
            );

        if (
            clicouEmBotao ||
            clicouNoCheckbox
        ) {
            return;
        }

        onVisualizar?.(sala);
    }

    /*
     * =====================================================
     * EXCLUIR
     * =====================================================
     */
    async function handleExcluir(e) {
        e.preventDefault();
        e.stopPropagation();

        if (
            !confirm(
                `Deseja realmente excluir a sala ${id}?`
            )
        ) {
            return;
        }

        try {
            const usuario =
                obterUsuarioAtual();

            const token =
                usuario?.token;

            if (!token) {
                alert(
                    'Sessão expirada. Faça login novamente.'
                );
                return;
            }

            await excluirSala(
                id,
                token
            );

            onExcluir?.(id);

        } catch (erro) {
            console.error(
                'Erro ao excluir a sala:',
                erro
            );

            alert(
                'Não foi possível excluir a sala. Verifique suas permissões.'
            );
        }
    }

    /*
     * =====================================================
     * DUPLICAR
     * =====================================================
     *
     * O botão chama a função da SalasPage.
     */
    function handleDuplicar(e) {
        e.preventDefault();
        e.stopPropagation();

        onDuplicar?.(sala);
    }

    return (
        <div
            className={`sala-card-item ${
                selecionado
                    ? 'selecionada'
                    : ''
            }`}

            onClick={handleCardClick}

            style={{
                cursor: 'pointer'
            }}
        >

            {/* =================================================
                IMAGEM DA SALA
               ================================================= */}

            <div className="sala-card-imagem-wrapper">

                {/* Checkbox de seleção múltipla */}
                <label
                    className="sala-card-checkbox-label"
                    title="Selecionar sala"
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                >
                    <input
                        type="checkbox"

                        checked={
                            Boolean(
                                selecionado
                            )
                        }

                        onChange={() =>
                            onToggleSelecionado?.(
                                String(id)
                            )
                        }
                    />

                    <span className="sala-card-checkbox-custom"></span>
                </label>

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
                    BOTÕES
                   ================================================= */}

                <div className="sala-card-acoes">

                    {/* DUPLICAR */}
                    <button
                        type="button"
                        className="btn-card-action btn-card-duplicar"
                        onClick={handleDuplicar}
                    >
                        Duplicar
                    </button>

                    {/* EDITAR */}
                    <button
                        type="button"
                        className="btn-card-action btn-card-editar"

                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            onEditar?.(sala);
                        }}
                    >
                        Editar
                    </button>

                    {/* EXCLUIR */}
                    <button
                        type="button"
                        className="btn-card-action btn-card-excluir"

                        onClick={handleExcluir}
                    >
                        Excluir
                    </button>

                </div>

            </div>

        </div>
    );
}