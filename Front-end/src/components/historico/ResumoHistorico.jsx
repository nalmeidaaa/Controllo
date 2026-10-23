import { ACOES, LISTA_ACOES } from './rotulos.js';

/**
 * Cards de resumo que também funcionam como filtro de ação:
 * clicar em um card filtra a lista; clicar em "Todas" (ou no card ativo) limpa.
 */
export default function ResumoHistorico({ contagens, total, carregando, acaoAtiva, onSelecionar }) {
    const numero = (v) => (carregando || v == null ? <span className="hist-esqueleto hist-esqueleto--num" /> : v.toLocaleString('pt-BR'));

    return (
        <div className="hist-resumo-cards" role="group" aria-label="Filtrar por ação">
            <button
                type="button"
                className={`hist-kpi hist-kpi--todas ${acaoAtiva === '' ? 'ativo' : ''}`}
                aria-pressed={acaoAtiva === ''}
                onClick={() => onSelecionar('')}
            >
                <span className="hist-kpi-rotulo">Todas as ações</span>
                <span className="hist-kpi-valor">{numero(total)}</span>
            </button>

            {LISTA_ACOES.map((acao) => (
                <button
                    key={acao}
                    type="button"
                    className={`hist-kpi hist-acao--${ACOES[acao].classe} ${acaoAtiva === acao ? 'ativo' : ''}`}
                    aria-pressed={acaoAtiva === acao}
                    onClick={() => onSelecionar(acaoAtiva === acao ? '' : acao)}
                >
                    <span className="hist-kpi-rotulo">
                        <span className="hist-kpi-ponto" aria-hidden="true" />
                        {ACOES[acao].plural}
                    </span>
                    <span className="hist-kpi-valor">{numero(contagens?.[acao])}</span>
                </button>
            ))}
        </div>
    );
}
