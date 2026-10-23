import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, SearchX, FileClock, X } from 'lucide-react';
import { listarSalas } from '../../services/salaService.js';
import { listarPatrimoniosParaFiltro } from '../../services/historicoService.js';
import { coletarRegistros, gerarPdf, gerarXlsx } from '../../services/relatorioHistorico.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { useHistorico } from '../../hooks/useHistorico.jsx';
import { useResumoHistorico } from '../../hooks/useResumoHistorico.jsx';
import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import { nomeDoUsuario } from '../../utils/usuario.js';
import FiltrosHistorico from '../../components/historico/FiltrosHistorico.jsx';
import ResumoHistorico from '../../components/historico/ResumoHistorico.jsx';
import ListaHistorico from '../../components/historico/ListaHistorico.jsx';
import PaginacaoServidor from '../../components/historico/PaginacaoServidor.jsx';
import ModalLinhaDoTempo from '../../components/historico/ModalLinhaDoTempo.jsx';
import BotaoGerar from '../../components/historico/BotaoGerar.jsx';
import { ACOES, formatarDataISO } from '../../components/historico/rotulos.js';
import './HistoricoPage.css';

const LIMITE = 15;

const FILTROS_VAZIOS = { acao: '', de: '', ate: '', id_sala: '', id_patrimonio: '' };

function Esqueleto() {
    return (
        <div className="hist-lista" aria-busy="true" aria-label="Carregando histórico">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="hist-item hist-item--esqueleto">
                    <span className="hist-esqueleto" style={{ width: 38 }} />
                    <span className="hist-esqueleto" style={{ width: 90, height: 22, borderRadius: 999 }} />
                    <span className="hist-esqueleto" style={{ width: '70%' }} />
                    <span className="hist-esqueleto" style={{ width: '85%' }} />
                    <span className="hist-esqueleto" style={{ width: '60%' }} />
                    <span />
                </div>
            ))}
        </div>
    );
}

export default function HistoricoPage() {
    const usuario = useUsuarioLogado();

    const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
    const [pagina, setPagina] = useState(1);
    const [salas, setSalas] = useState([]);
    const [patrimonios, setPatrimonios] = useState([]);
    const [requisicaoAberta, setRequisicaoAberta] = useState(null);

    const [gerando, setGerando] = useState(false);
    const [aviso, setAviso] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

    const { eventos, total, carregando, erro, recarregar } = useHistorico(filtros, pagina, LIMITE);
    const resumo = useResumoHistorico(filtros);

    useEffect(() => {
        let ativo = true;
        (async () => {
            try {
                const resposta = await listarSalas(obterToken());
                if (ativo) setSalas(resposta?.result ?? []);
            } catch {
                if (ativo) setSalas([]); // o filtro de sala apenas fica sem opções
            }
        })();
        return () => { ativo = false; };
    }, []);

    // a lista de patrimônios acompanha a sala escolhida
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

    // some sozinho depois de alguns segundos
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(null), 6000);
        return () => clearTimeout(t);
    }, [aviso]);

    const qtdAtivos = useMemo(
        () => [filtros.acao, filtros.de || filtros.ate, filtros.id_sala, filtros.id_patrimonio].filter(Boolean).length,
        [filtros]
    );

    function alterarFiltros(parcial) {
        setFiltros((atual) => ({ ...atual, ...parcial }));
        setPagina(1);
    }

    function limparFiltros() {
        setFiltros(FILTROS_VAZIOS);
        setPagina(1);
    }

    // Texto dos filtros aplicados, impresso no cabeçalho do arquivo gerado
    function descreverFiltros() {
        const sala = salas.find((s) => String(s.id_sala) === String(filtros.id_sala));
        const pat = patrimonios.find((p) => String(p.id_patrimonio) === String(filtros.id_patrimonio));

        let periodo = 'Todo o período';
        if (filtros.de && filtros.ate) periodo = `${formatarDataISO(filtros.de)} a ${formatarDataISO(filtros.ate)}`;
        else if (filtros.de) periodo = `a partir de ${formatarDataISO(filtros.de)}`;
        else if (filtros.ate) periodo = `até ${formatarDataISO(filtros.ate)}`;

        return [
            ['Ação', ACOES[filtros.acao]?.label || 'Todas'],
            ['Período', periodo],
            ['Sala', sala ? `${sala.descricao} (Bloco ${sala.bloco})` : 'Todas'],
            ['Patrimônio', pat ? `${pat.nome}${pat.numero_patrimonio ? ` (${pat.numero_patrimonio})` : ''}` : 'Todos'],
        ];
    }

    async function gerarRelatorio(formato) {
        setAviso(null);
        setGerando(true);
        try {
            // exporta tudo que bate com os filtros, não apenas a página que está na tela
            const registros = await coletarRegistros(obterToken(), filtros);
            if (registros.length === 0) {
                setAviso({ tipo: 'erro', texto: 'Não há registros para gerar com os filtros atuais.' });
                return;
            }

            const meta = { filtros: descreverFiltros(), geradoPor: nomeDoUsuario(usuario) };
            if (formato === 'pdf') await gerarPdf(registros, meta);
            else await gerarXlsx(registros, meta);

            setAviso({
                tipo: 'sucesso',
                texto: `Histórico gerado em ${formato.toUpperCase()} com ${registros.length} registro${registros.length === 1 ? '' : 's'}.`,
            });
        } catch (error) {
            console.error('Erro ao gerar histórico:', error);
            setAviso({
                tipo: 'erro',
                texto: error?.response?.data?.message || 'Não foi possível gerar o histórico. Tente novamente.',
            });
        } finally {
            setGerando(false);
        }
    }

    return (
        <div className="page-usuarios-container hist-pagina">
            <header className="header-usuarios">
                <div>
                    <h1>Histórico de Manutenção</h1>
                    <p className="page-subtitle">
                        Acompanhe aberturas, andamentos e finalizações das requisições.
                    </p>
                </div>

                <BotaoGerar
                    onGerar={gerarRelatorio}
                    gerando={gerando}
                    desabilitado={!carregando && !erro && total === 0}
                />
            </header>

            {aviso && (
                <div className={`hist-aviso hist-aviso--${aviso.tipo}`} role="status">
                    {aviso.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{aviso.texto}</span>
                    <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)}><X size={16} /></button>
                </div>
            )}

            <ResumoHistorico
                contagens={resumo.contagens}
                total={resumo.total}
                carregando={resumo.carregando}
                acaoAtiva={filtros.acao}
                onSelecionar={(acao) => alterarFiltros({ acao })}
            />

            <FiltrosHistorico
                filtros={filtros}
                salas={salas}
                patrimonios={patrimonios}
                qtdAtivos={qtdAtivos}
                onChange={alterarFiltros}
                onLimpar={limparFiltros}
            />

            <div className="hist-card">
                {carregando ? (
                    <Esqueleto />
                ) : erro ? (
                    <div className="hist-estado">
                        <AlertCircle size={34} className="hist-estado-icone" />
                        <p>{erro}</p>
                        <button className="btn-primary-custom" onClick={recarregar}>Tentar novamente</button>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="hist-estado">
                        {qtdAtivos > 0 ? <SearchX size={34} className="hist-estado-icone" /> : <FileClock size={34} className="hist-estado-icone" />}
                        <p>
                            <strong>{qtdAtivos > 0 ? 'Nenhum registro encontrado' : 'Ainda não há registros'}</strong>
                            <br />
                            {qtdAtivos > 0
                                ? 'Nenhum evento corresponde aos filtros escolhidos.'
                                : 'As movimentações das requisições de manutenção aparecerão aqui.'}
                        </p>
                        {qtdAtivos > 0 && (
                            <button className="btn-modal-cancel" onClick={limparFiltros}>Limpar filtros</button>
                        )}
                    </div>
                ) : (
                    <>
                        <ListaHistorico eventos={eventos} onSelecionar={setRequisicaoAberta} />
                        <PaginacaoServidor total={total} limite={LIMITE} pagina={pagina} onMudar={setPagina} />
                    </>
                )}
            </div>

            {requisicaoAberta && (
                <ModalLinhaDoTempo
                    idRequisicao={requisicaoAberta}
                    onFechar={() => setRequisicaoAberta(null)}
                />
            )}
        </div>
    );
}
