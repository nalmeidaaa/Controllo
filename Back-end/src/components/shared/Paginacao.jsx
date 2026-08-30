import { MAX_BOTOES, ITENS_POR_PAGINA } from '../../config/app.config.js';

export default function Paginacao({ totalItens, itensPorPagina = ITENS_POR_PAGINA, paginaAtual, onPageChange }) {
    if (totalItens <= 0) return <nav className="paginacao-nav"></nav>;

    const totalPaginas = Math.ceil(totalItens / itensPorPagina);

    let inicio = Math.max(1, paginaAtual - Math.floor(MAX_BOTOES / 2));
    let fim = inicio + MAX_BOTOES - 1;
    if (fim > totalPaginas) {
        fim = totalPaginas;
        inicio = Math.max(1, fim - MAX_BOTOES + 1);
    }

    const numeros = [];
    for (let i = inicio; i <= fim; i++) numeros.push(i);

    return (
        <nav className="paginacao-nav">
            <ul className="paginacao-lista">
                <li className={`paginacao-item ${paginaAtual === 1 ? 'desabilitado' : ''}`}>
                    <button type="button" className="paginacao-btn" onClick={() => paginaAtual > 1 && onPageChange(paginaAtual - 1)}>
                        &laquo;
                    </button>
                </li>

                {inicio > 1 && (
                    <>
                        <li className="paginacao-item"><button type="button" className="paginacao-btn" onClick={() => onPageChange(1)}>1</button></li>
                        {inicio > 2 && <li className="paginacao-item desabilitado"><span className="paginacao-btn">…</span></li>}
                    </>
                )}

                {numeros.map((n) => (
                    <li key={n} className={`paginacao-item ${n === paginaAtual ? 'ativo' : ''}`}>
                        <button type="button" className="paginacao-btn" onClick={() => onPageChange(n)}>{n}</button>
                    </li>
                ))}

                {fim < totalPaginas && (
                    <>
                        {fim < totalPaginas - 1 && <li className="paginacao-item desabilitado"><span className="paginacao-btn">…</span></li>}
                        <li className="paginacao-item"><button type="button" className="paginacao-btn" onClick={() => onPageChange(totalPaginas)}>{totalPaginas}</button></li>
                    </>
                )}

                <li className={`paginacao-item ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}>
                    <button type="button" className="paginacao-btn" onClick={() => paginaAtual < totalPaginas && onPageChange(paginaAtual + 1)}>
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
}
