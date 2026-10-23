import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

const FORMATOS = [
    { id: 'xlsx', rotulo: 'Planilha Excel', ext: '.xlsx', Icone: FileSpreadsheet, dica: 'Ideal para filtrar e analisar os dados' },
    { id: 'pdf', rotulo: 'Documento PDF', ext: '.pdf', Icone: FileText, dica: 'Ideal para imprimir ou compartilhar' },
];

/**
 * Botão dividido: a parte principal gera no formato padrão;
 * a setinha ao lado abre a escolha entre XLSX e PDF.
 */
export default function BotaoGerar({ onGerar, gerando = false, desabilitado = false }) {
    const [aberto, setAberto] = useState(false);
    const [padrao, setPadrao] = useState('xlsx');
    const raiz = useRef(null);

    // fecha ao clicar fora / Esc
    useEffect(() => {
        if (!aberto) return undefined;
        const fora = (e) => raiz.current && !raiz.current.contains(e.target) && setAberto(false);
        const tecla = (e) => e.key === 'Escape' && setAberto(false);
        document.addEventListener('mousedown', fora);
        document.addEventListener('keydown', tecla);
        return () => {
            document.removeEventListener('mousedown', fora);
            document.removeEventListener('keydown', tecla);
        };
    }, [aberto]);

    const bloqueado = desabilitado || gerando;
    const atual = FORMATOS.find((f) => f.id === padrao);

    function escolher(id) {
        setPadrao(id);
        setAberto(false);
        onGerar(id);
    }

    return (
        <div className="gerar" ref={raiz}>
            <div className={`gerar-grupo ${bloqueado ? 'bloqueado' : ''}`}>
                <button
                    type="button"
                    className="gerar-principal"
                    disabled={bloqueado}
                    onClick={() => onGerar(padrao)}
                    title={desabilitado ? 'Não há registros para gerar' : `Gerar histórico em ${atual.ext}`}
                >
                    {gerando ? <Loader2 size={17} className="gerar-giro" /> : <Download size={17} />}
                    <span>{gerando ? 'Gerando…' : 'Gerar histórico'}</span>
                    {!gerando && <span className="gerar-formato">{atual.ext.slice(1).toUpperCase()}</span>}
                </button>

                <button
                    type="button"
                    className="gerar-seta"
                    disabled={bloqueado}
                    aria-haspopup="menu"
                    aria-expanded={aberto}
                    aria-label="Escolher formato do arquivo"
                    onClick={() => setAberto((a) => !a)}
                >
                    <ChevronDown size={17} className={aberto ? 'girada' : ''} />
                </button>
            </div>

            {aberto && (
                <div className="gerar-menu" role="menu">
                    <div className="gerar-menu-titulo">Formato do arquivo</div>
                    {FORMATOS.map(({ id, rotulo, ext, Icone, dica }) => (
                        <button key={id} type="button" role="menuitem" className="gerar-opcao" onClick={() => escolher(id)}>
                            <span className={`gerar-opcao-icone gerar-opcao-icone--${id}`}><Icone size={18} /></span>
                            <span className="gerar-opcao-texto">
                                <strong>{rotulo} <small>{ext}</small></strong>
                                <small>{dica}</small>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
