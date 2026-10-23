import { ChevronRight } from 'lucide-react';
import Avatar from '../shared/Avatar.jsx';
import { urlFotoUsuario } from '../../utils/usuario.js';
import BadgeAcao from './BadgeAcao.jsx';
import { agruparPorDia, formatarHora, nomeUsuario } from './rotulos.js';

function Item({ e, onSelecionar }) {
    const idReq = e.requisicao?.id_requisicao;
    const sala = e.sala ? `${e.sala.descricao}${e.sala.bloco ? ` • Bloco ${e.sala.bloco}` : ''}` : '';
    const feitoPor = nomeUsuario(e.usuario_acao);

    return (
        <div
            className="hist-item"
            role="button"
            tabIndex={0}
            title="Ver linha do tempo da requisição"
            onClick={() => onSelecionar(idReq)}
            onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    onSelecionar(idReq);
                }
            }}
        >
            <span className="hist-item-hora">{formatarHora(e.horario)}</span>

            <span className="hist-item-acao"><BadgeAcao acao={e.acao} /></span>

            <span className="hist-item-patrimonio">
                <strong>{e.patrimonio?.nome || 'Patrimônio removido'}</strong>
                <small>
                    {e.patrimonio?.numero_patrimonio ? `Nº ${e.patrimonio.numero_patrimonio}` : 'Sem nº'}
                    {sala && ` • ${sala}`}
                </small>
            </span>

            <span className="hist-item-descricao">
                <span className="hist-item-texto">{e.descricao || <em>Sem descrição</em>}</span>
                {idReq != null && <small>Requisição #{idReq}</small>}
            </span>

            <span className="hist-item-autor">
                <Avatar nome={feitoPor} src={urlFotoUsuario(e.usuario_acao)} tamanho={26} />
                <span>{feitoPor}</span>
            </span>

            <ChevronRight className="hist-item-seta" size={18} aria-hidden="true" />
        </div>
    );
}

export default function ListaHistorico({ eventos, onSelecionar }) {
    const grupos = agruparPorDia(eventos);

    return (
        <div className="hist-lista">
            <div className="hist-lista-cabecalho" aria-hidden="true">
                <span>Hora</span>
                <span>Ação</span>
                <span>Patrimônio e local</span>
                <span>Descrição</span>
                <span>Feito por</span>
                <span />
            </div>

            {grupos.map((g) => (
                <section key={g.chave} className="hist-grupo">
                    <h3 className="hist-grupo-titulo">
                        {g.rotulo}
                        <span>{g.eventos.length}</span>
                    </h3>
                    {g.eventos.map((e) => (
                        <Item key={e.id_historico} e={e} onSelecionar={onSelecionar} />
                    ))}
                </section>
            ))}
        </div>
    );
}
