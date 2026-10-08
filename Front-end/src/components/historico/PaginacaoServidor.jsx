// Paginação controlada pelo servidor (usa o total devolvido pela API)
export default function PaginacaoServidor({ total, limite, pagina, onMudar }) {
    const totalPaginas = Math.max(1, Math.ceil(total / limite));
    if (total <= 0) return null;

    return (
        <nav className="hist-paginacao" aria-label="Paginação do histórico">
            <button
                type="button"
                className="btn-modal-cancel"
                disabled={pagina <= 1}
                onClick={() => onMudar(pagina - 1)}
            >
                &laquo; Anterior
            </button>

            <span className="hist-paginacao-info">
                Página {pagina} de {totalPaginas} &middot; {total} registro{total === 1 ? '' : 's'}
            </span>

            <button
                type="button"
                className="btn-modal-cancel"
                disabled={pagina >= totalPaginas}
                onClick={() => onMudar(pagina + 1)}
            >
                Próxima &raquo;
            </button>
        </nav>
    );
}
