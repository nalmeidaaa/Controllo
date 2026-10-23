import { urlImagemSala } from '../../services/imagemService.js';

export default function SalaDesativadaLinha({ sala, onVisualizar, onReativar }) {
    const nome = sala.descricao || sala.nome || 'Sem descrição';
    const bloco = sala.bloco || '—';
    const src = urlImagemSala(sala);

    // Campos opcionais: só aparecem se a API enviar.
    const desativadaEm = sala.data_desativacao || sala.desativada_em || sala.updated_at || null;
    const totalPatrimonios = sala.total_patrimonios ?? sala.qtd_patrimonios ?? null;

    function handleLinhaClick(e) {
        if (e.target.closest('button')) return;
        onVisualizar?.(sala);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && e.target === e.currentTarget) {
            onVisualizar?.(sala);
        }
    }

    return (
        <li
            className="sdes-linha"
            tabIndex={0}
            onClick={handleLinhaClick}
            onKeyDown={handleKeyDown}
        >
            <div className="sdes-miniatura">
                {src ? (
                    <img className="sdes-miniatura-img" src={src} alt="" />
                ) : (
                    <span className="sdes-sem-imagem" aria-hidden="true">
                        <ion-icon name="image-outline"></ion-icon>
                    </span>
                )}
            </div>

            <div className="sdes-info">
                <p className="sdes-nome">{nome}</p>
                <p className="sdes-meta">
                    <span>Bloco {bloco}</span>
                    {desativadaEm && <span>Desativada em {new Date(desativadaEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>}
                    {totalPatrimonios !== null && (
                        <span>{totalPatrimonios} {Number(totalPatrimonios) === 1 ? 'patrimônio' : 'patrimônios'}</span>
                    )}
                </p>
            </div>

            <div className="sdes-acoes">
                <button
                    type="button"
                    className="sdes-btn sdes-btn--sec"
                    onClick={(e) => { e.stopPropagation(); onVisualizar?.(sala); }}
                >
                    Ver
                </button>
                <button
                    type="button"
                    className="sdes-btn sdes-btn--prim"
                    onClick={(e) => { e.stopPropagation(); onReativar?.(sala); }}
                >
                    Reativar
                </button>
            </div>
        </li>
    );
}
