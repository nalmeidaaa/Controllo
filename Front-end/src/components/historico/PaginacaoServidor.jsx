import { ChevronLeft, ChevronRight } from 'lucide-react';

// Paginação controlada pelo servidor (usa o total devolvido pela API)
export default function PaginacaoServidor({ total, limite, pagina, onMudar }) {
    const totalPaginas = Math.max(1, Math.ceil(total / limite));
    if (total <= 0) return null;

    const inicio = (pagina - 1) * limite + 1;
    const fim = Math.min(pagina * limite, total);

    return (
        <nav className="hist-paginacao" aria-label="Paginação do histórico">
            <span className="hist-paginacao-info">
                Exibindo <strong>{inicio}–{fim}</strong> de <strong>{total.toLocaleString('pt-BR')}</strong> registro{total === 1 ? '' : 's'}
            </span>

            <div className="hist-paginacao-botoes">
                <button type="button" className="hist-pag-btn" disabled={pagina <= 1} onClick={() => onMudar(pagina - 1)}>
                    <ChevronLeft size={16} /> Anterior
                </button>
                <span className="hist-pag-atual">{pagina} / {totalPaginas}</span>
                <button type="button" className="hist-pag-btn" disabled={pagina >= totalPaginas} onClick={() => onMudar(pagina + 1)}>
                    Próxima <ChevronRight size={16} />
                </button>
            </div>
        </nav>
    );
}
