import { CalendarDays, FilterX } from 'lucide-react';
import { diasAtras, paraISO } from './rotulos.js';

const PERIODOS = [
    { id: 'hoje', rotulo: 'Hoje', de: () => paraISO(new Date()), ate: () => paraISO(new Date()) },
    { id: '7d', rotulo: '7 dias', de: () => diasAtras(6), ate: () => paraISO(new Date()) },
    { id: '30d', rotulo: '30 dias', de: () => diasAtras(29), ate: () => paraISO(new Date()) },
    { id: 'tudo', rotulo: 'Todo o período', de: () => '', ate: () => '' },
];

function periodoAtivo(filtros) {
    return PERIODOS.find((p) => p.de() === filtros.de && p.ate() === filtros.ate)?.id ?? 'personalizado';
}

export default function FiltrosHistorico({ filtros, salas, patrimonios, onChange, onLimpar, qtdAtivos }) {
    const ativo = periodoAtivo(filtros);

    return (
        <section className="hist-filtros" aria-label="Filtros do histórico">
            <div className="hist-filtros-linha">
                <div className="hist-filtro hist-filtro--periodo">
                    <span className="hist-filtro-rotulo"><CalendarDays size={14} /> Período</span>
                    <div className="hist-periodos">
                        {PERIODOS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className={`filtro-chip ${ativo === p.id ? 'ativo' : ''}`}
                                onClick={() => onChange({ de: p.de(), ate: p.ate() })}
                            >
                                {p.rotulo}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hist-datas">
                    <div className="hist-filtro">
                        <label className="hist-filtro-rotulo" htmlFor="filtroDe">De</label>
                        <input
                            id="filtroDe"
                            type="date"
                            className="form-control"
                            value={filtros.de}
                            max={filtros.ate || undefined}
                            onChange={(e) => onChange({ de: e.target.value })}
                        />
                    </div>
                    <div className="hist-filtro">
                        <label className="hist-filtro-rotulo" htmlFor="filtroAte">Até</label>
                        <input
                            id="filtroAte"
                            type="date"
                            className="form-control"
                            value={filtros.ate}
                            min={filtros.de || undefined}
                            onChange={(e) => onChange({ ate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="hist-filtros-linha">
                <div className="hist-filtro hist-filtro--grande">
                    <label className="hist-filtro-rotulo" htmlFor="filtroSala">Sala</label>
                    <select
                        id="filtroSala"
                        className="form-control"
                        value={filtros.id_sala}
                        // trocar a sala invalida o patrimônio escolhido
                        onChange={(e) => onChange({ id_sala: e.target.value, id_patrimonio: '' })}
                    >
                        <option value="">Todas as salas</option>
                        {salas.map((s) => (
                            <option key={s.id_sala} value={s.id_sala}>
                                {s.descricao} (Bloco {s.bloco})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="hist-filtro hist-filtro--grande">
                    <label className="hist-filtro-rotulo" htmlFor="filtroPatrimonio">Patrimônio</label>
                    <select
                        id="filtroPatrimonio"
                        className="form-control"
                        value={filtros.id_patrimonio}
                        onChange={(e) => onChange({ id_patrimonio: e.target.value })}
                    >
                        <option value="">Todos os patrimônios</option>
                        {patrimonios.map((p) => (
                            <option key={p.id_patrimonio} value={p.id_patrimonio}>
                                {p.nome}{p.numero_patrimonio ? ` (${p.numero_patrimonio})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    className="hist-limpar"
                    onClick={onLimpar}
                    disabled={qtdAtivos === 0}
                >
                    <FilterX size={16} />
                    Limpar filtros
                    {qtdAtivos > 0 && <span className="hist-limpar-qtd">{qtdAtivos}</span>}
                </button>
            </div>
        </section>
    );
}
