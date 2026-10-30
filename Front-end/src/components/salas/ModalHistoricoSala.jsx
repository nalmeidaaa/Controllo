import { useEffect, useState } from 'react';
import BadgeAcao from '../historico/BadgeAcao.jsx';
import { formatarDataHora, nomeUsuario } from '../historico/rotulos.js';
import { listarHistoricoSala } from '../../services/historicoService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';

const LIMITE = 100;

export default function ModalHistoricoSala({ sala, onFechar }) {
    const [eventos, setEventos] = useState([]);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const idSala = sala?.id_sala || sala?.id;

    // Busca o histórico sempre que uma sala é aberta
    useEffect(() => {
        if (!idSala) return undefined;

        let ativo = true;
        setEventos([]);
        setTotal(0);
        setErro('');
        setCarregando(true);

        (async () => {
            try {
                const resposta = await listarHistoricoSala(obterToken(), idSala, LIMITE);
                if (!ativo) return;
                const lista = resposta?.result ?? [];
                setEventos(Array.isArray(lista) ? lista : []);
                setTotal(resposta?.total ?? lista.length);
            } catch (e) {
                if (!ativo) return;
                setErro(
                    e.response?.status === 403
                        ? 'Você não tem permissão para ver o histórico.'
                        : e.response?.data?.message ||
                          e.response?.data?.erro ||
                          'Não foi possível carregar o histórico desta sala.'
                );
            } finally {
                if (ativo) setCarregando(false);
            }
        })();

        return () => { ativo = false; };
    }, [idSala]);

    // Fecha com ESC
    useEffect(() => {
        if (!sala) return undefined;
        function handleEsc(e) {
            if (e.key === 'Escape') onFechar();
        }
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [sala, onFechar]);

    if (!sala) return null;

    const semHistorico = !carregando && !erro && eventos.length === 0;

    return (
        <div
            className="historico-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onFechar();
            }}
        >
            <div className="historico-modal">

                <div className="historico-modal-header">
                    <div>
                        <h2>Histórico da sala</h2>
                        <p>Tudo o que já aconteceu nesta sala.</p>
                    </div>

                    <button
                        type="button"
                        className="historico-modal-close"
                        onClick={onFechar}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <div className="historico-modal-body">

                    <div className="historico-patrimonio">
                        <span>Sala</span>
                        <strong>{sala.descricao || sala.nome || 'Sem descrição'}</strong>
                        <small>
                            ID #{idSala}
                            {sala.bloco ? ` • Bloco ${sala.bloco}` : ''}
                        </small>
                    </div>

                    {carregando && (
                        <div className="historico-carregando">
                            Carregando histórico...
                        </div>
                    )}

                    {!carregando && erro && (
                        <div className="historico-vazio">
                            <div className="historico-vazio-icone">⚠️</div>
                            <strong>Não foi possível carregar</strong>
                            <span>{erro}</span>
                        </div>
                    )}

                    {semHistorico && (
                        <div className="historico-vazio">
                            <div className="historico-vazio-icone">📋</div>
                            <strong>Esta sala não tem histórico</strong>
                            <span>
                                Ainda não há nenhum registro vinculado a esta sala.
                            </span>
                        </div>
                    )}

                    {!carregando && !erro && eventos.length > 0 && (
                        <>
                            <div className="historico-lista">
                                {eventos.map((item, index) => {
                                    const idReq = item.requisicao?.id_requisicao;
                                    const pat = item.patrimonio;

                                    return (
                                        <div
                                            className="historico-item"
                                            key={item.id_historico ?? index}
                                        >
                                            <div className="historico-item-topo">
                                                <span className="historico-item-numero">
                                                    <BadgeAcao acao={item.acao} />
                                                    {idReq != null && (
                                                        <> &nbsp;Requisição #{idReq}</>
                                                    )}
                                                </span>

                                                <span className="historico-item-data">
                                                    {formatarDataHora(item.horario)}
                                                </span>
                                            </div>

                                            <div style={{ marginTop: 8 }}>
                                                <strong>
                                                    {pat?.nome || 'Patrimônio removido'}
                                                </strong>
                                                {pat?.numero_patrimonio && (
                                                    <small style={{ opacity: 0.75 }}>
                                                        {' '}• Nº {pat.numero_patrimonio}
                                                    </small>
                                                )}
                                            </div>

                                            <div style={{ marginTop: 4 }}>
                                                {item.descricao || <em>Sem descrição</em>}
                                            </div>

                                            <small style={{ display: 'block', marginTop: 6, opacity: 0.75 }}>
                                                Feito por {nomeUsuario(item.usuario_acao)}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>

                            {total > eventos.length && (
                                <small style={{ display: 'block', marginTop: 12, opacity: 0.75, textAlign: 'center' }}>
                                    Mostrando os {eventos.length} registros mais recentes de {total}.
                                    Veja o restante na tela de Histórico.
                                </small>
                            )}
                        </>
                    )}

                </div>

                <div className="historico-modal-footer">
                    <button
                        type="button"
                        className="historico-btn-fechar"
                        onClick={onFechar}
                    >
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
}
