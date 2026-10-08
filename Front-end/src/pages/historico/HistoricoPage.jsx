import { useEffect, useState } from 'react';
import { listarSalas } from '../../services/salaService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { useHistorico } from '../../hooks/useHistorico.jsx';
import FiltrosHistorico from '../../components/historico/FiltrosHistorico.jsx';
import TabelaHistorico from '../../components/historico/TabelaHistorico.jsx';
import PaginacaoServidor from '../../components/historico/PaginacaoServidor.jsx';
import ModalLinhaDoTempo from '../../components/historico/ModalLinhaDoTempo.jsx';
import './HistoricoPage.css';

const LIMITE = 10;

const FILTROS_VAZIOS = { acao: '', de: '', ate: '', id_sala: '', id_patrimonio: '' };

export default function HistoricoPage() {
    const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
    const [pagina, setPagina] = useState(1);
    const [salas, setSalas] = useState([]);
    const [requisicaoAberta, setRequisicaoAberta] = useState(null);

    const { eventos, total, carregando, erro, recarregar } = useHistorico(filtros, pagina, LIMITE);

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

    function alterarFiltros(parcial) {
        setFiltros((atual) => ({ ...atual, ...parcial }));
        setPagina(1);
    }

    function limparFiltros() {
        setFiltros(FILTROS_VAZIOS);
        setPagina(1);
    }

    return (
        <div className="page-usuarios-container">
            <header className="header-usuarios">
                <div>
                    <h1>Histórico de Manutenção</h1>
                    <p className="page-subtitle">
                        Acompanhe aberturas, andamentos e finalizações das requisições.
                    </p>
                </div>
            </header>

            <FiltrosHistorico
                filtros={filtros}
                salas={salas}
                onChange={alterarFiltros}
                onLimpar={limparFiltros}
            />

            {carregando ? (
                <div className="tabela-card">
                    <div className="hist-estado">Carregando histórico...</div>
                </div>
            ) : erro ? (
                <div className="tabela-card">
                    <div className="hist-estado">
                        <p>{erro}</p>
                        <button className="btn-primary-custom" onClick={recarregar}>Tentar novamente</button>
                    </div>
                </div>
            ) : eventos.length === 0 ? (
                <div className="tabela-card">
                    <div className="hist-estado">Nenhum registro encontrado</div>
                </div>
            ) : (
                <>
                    <TabelaHistorico eventos={eventos} onSelecionar={setRequisicaoAberta} />
                    <PaginacaoServidor
                        total={total}
                        limite={LIMITE}
                        pagina={pagina}
                        onMudar={setPagina}
                    />
                </>
            )}

            {requisicaoAberta && (
                <ModalLinhaDoTempo
                    idRequisicao={requisicaoAberta}
                    onFechar={() => setRequisicaoAberta(null)}
                />
            )}
        </div>
    );
}
