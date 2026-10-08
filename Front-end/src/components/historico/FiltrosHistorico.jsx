import { useEffect, useState } from 'react';
import { listarPatrimoniosParaFiltro } from '../../services/historicoService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';

export default function FiltrosHistorico({ filtros, salas, onChange, onLimpar }) {
    const [patrimonios, setPatrimonios] = useState([]);

    // lista de patrimônios acompanha a sala escolhida
    useEffect(() => {
        let ativo = true;
        (async () => {
            try {
                const resposta = await listarPatrimoniosParaFiltro(obterToken(), filtros.id_sala);
                if (ativo) setPatrimonios(resposta?.result ?? []);
            } catch {
                if (ativo) setPatrimonios([]);
            }
        })();
        return () => { ativo = false; };
    }, [filtros.id_sala]);

    function alterarSala(valor) {
        // trocar a sala invalida o patrimônio escolhido
        onChange({ id_sala: valor, id_patrimonio: '' });
    }

    return (
        <div className="hist-filtros">
            <div className="hist-filtro">
                <label className="form-label" htmlFor="filtroAcao">Ação</label>
                <select
                    id="filtroAcao"
                    className="form-control"
                    value={filtros.acao}
                    onChange={(e) => onChange({ acao: e.target.value })}
                >
                    <option value="">Todas</option>
                    <option value="Abertura">Abertura</option>
                    <option value="Andamento">Andamento</option>
                    <option value="Finalizacao">Finalização</option>
                </select>
            </div>

            <div className="hist-filtro">
                <label className="form-label" htmlFor="filtroDe">De</label>
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
                <label className="form-label" htmlFor="filtroAte">Até</label>
                <input
                    id="filtroAte"
                    type="date"
                    className="form-control"
                    value={filtros.ate}
                    min={filtros.de || undefined}
                    onChange={(e) => onChange({ ate: e.target.value })}
                />
            </div>

            <div className="hist-filtro">
                <label className="form-label" htmlFor="filtroSala">Sala</label>
                <select
                    id="filtroSala"
                    className="form-control"
                    value={filtros.id_sala}
                    onChange={(e) => alterarSala(e.target.value)}
                >
                    <option value="">Todas</option>
                    {salas.map((s) => (
                        <option key={s.id_sala} value={s.id_sala}>
                            {s.descricao} (Bloco {s.bloco})
                        </option>
                    ))}
                </select>
            </div>

            <div className="hist-filtro">
                <label className="form-label" htmlFor="filtroPatrimonio">Patrimônio</label>
                <select
                    id="filtroPatrimonio"
                    className="form-control"
                    value={filtros.id_patrimonio}
                    onChange={(e) => onChange({ id_patrimonio: e.target.value })}
                >
                    <option value="">Todos</option>
                    {patrimonios.map((p) => (
                        <option key={p.id_patrimonio} value={p.id_patrimonio}>
                            {p.nome}{p.numero_patrimonio ? ` (${p.numero_patrimonio})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="hist-filtro hist-filtro-limpar">
                <button type="button" className="btn-modal-cancel" onClick={onLimpar}>
                    Limpar filtros
                </button>
            </div>
        </div>
    );
}
