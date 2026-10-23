import { useEffect, useMemo, useState } from 'react';
import './SalasDesativadas.css';
import { ITENS_POR_PAGINA } from '../../config/app.config.js';
import Paginacao from '../shared/Paginacao.jsx';
import ModalConfirmacao from '../shared/ModalConfirmacao.jsx';
import EstadoVazio from '../shared/EstadoVazio.jsx';
import { EsqueletoLinhas } from '../shared/Esqueleto.jsx';
import SalaDesativadaLinha from './SalaDesativadaLinha.jsx';

function normalizar(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export default function SalasDesativadasLista({
    dados,
    paginaAtual,
    onPageChange,
    onVisualizar,
    onVerAtivas
}) {
    const {
        salas, carregando, erro, carregar,
        reativar, reativando, erroReativar, limparErroReativar,
        mensagem, desfazer, limparMensagem
    } = dados;

    const [termo, setTermo] = useState('');
    const [alvo, setAlvo] = useState(null);

    // Ao sair da aba, a mensagem de sucesso some.
    useEffect(() => limparMensagem, [limparMensagem]);

    const filtradas = useMemo(() => {
        const t = normalizar(termo);
        if (!t) return salas;
        return salas.filter((s) =>
            normalizar(s.descricao || s.nome).includes(t) ||
            normalizar(`bloco ${s.bloco}`).includes(t)
        );
    }, [salas, termo]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));

    // Evita ficar numa página inexistente (ex.: reativou o último item da última página).
    useEffect(() => {
        if (!carregando && paginaAtual > totalPaginas) onPageChange(totalPaginas);
    }, [carregando, paginaAtual, totalPaginas, onPageChange]);

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pagina = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA);

    function abrirConfirmacao(sala) {
        limparErroReativar();
        setAlvo(sala);
    }

    function fecharConfirmacao() {
        if (reativando) return;
        limparErroReativar();
        setAlvo(null);
    }

    async function confirmar() {
        const ok = await reativar(alvo);
        if (ok) setAlvo(null);
    }

    const nomeAlvo = alvo ? (alvo.descricao || alvo.nome || 'esta sala') : '';
    const nomeMsg = mensagem?.sala ? (mensagem.sala.descricao || mensagem.sala.nome || 'Sala') : '';

    let corpo;
    if (carregando) {
        corpo = <EsqueletoLinhas quantidade={5} altura={76} />;
    } else if (erro && salas.length === 0) {
        corpo = (
            <EstadoVazio
                tom="erro"
                titulo="Não foi possível carregar as salas desativadas."
                textoAcao="Tentar novamente"
                onAcao={carregar}
            />
        );
    } else if (salas.length === 0) {
        corpo = (
            <EstadoVazio
                icone="archive-outline"
                titulo="Nenhuma sala desativada."
                descricao="Salas desativadas aparecem aqui e podem ser reativadas a qualquer momento."
            />
        );
    } else if (filtradas.length === 0) {
        corpo = (
            <EstadoVazio
                icone="search-outline"
                titulo={`Nenhum resultado para "${termo.trim()}".`}
            />
        );
    } else {
        corpo = (
            <ul className="sdes-lista">
                {pagina.map((sala) => (
                    <SalaDesativadaLinha
                        key={String(sala.id_sala ?? sala.id)}
                        sala={sala}
                        onVisualizar={onVisualizar}
                        onReativar={abrirConfirmacao}
                    />
                ))}
            </ul>
        );
    }

    return (
        <section className="sdes-container" aria-label="Salas desativadas">
            {mensagem && (
                <div className="sdes-mensagem" role="status">
                    <span>
                        {mensagem.erro
                            ? mensagem.erro
                            : <>Sala <strong>{nomeMsg}</strong> reativada.</>}
                    </span>
                    <span className="sdes-mensagem-acoes">
                        {!mensagem.erro && (
                            <>
                                <button type="button" className="sdes-link" onClick={onVerAtivas}>Ver em Ativas</button>
                                <button type="button" className="sdes-link" onClick={desfazer}>Desfazer</button>
                            </>
                        )}
                        <button type="button" className="sdes-link" onClick={limparMensagem} aria-label="Dispensar mensagem">×</button>
                    </span>
                </div>
            )}

            <div className="sdes-busca">
                <ion-icon name="search-outline" class="sdes-busca-icone"></ion-icon>
                <input
                    type="search"
                    className="filtros-input sdes-busca-input"
                    placeholder="Buscar por nome ou bloco…"
                    aria-label="Buscar salas desativadas"
                    value={termo}
                    onChange={(e) => { setTermo(e.target.value); onPageChange(1); }}
                />
            </div>

            {corpo}

            {!carregando && filtradas.length > 0 && (
                <div>
                    <div className="paginacao-contador">
                        {`Exibindo ${inicio + 1}–${Math.min(paginaAtual * ITENS_POR_PAGINA, filtradas.length)} de ${filtradas.length} salas`}
                    </div>
                    <Paginacao
                        totalItens={filtradas.length}
                        paginaAtual={paginaAtual}
                        onPageChange={onPageChange}
                    />
                </div>
            )}

            <ModalConfirmacao
                aberto={Boolean(alvo)}
                titulo={`Reativar ${nomeAlvo}?`}
                mensagem="A sala voltará para a lista de salas ativas."
                textoConfirmar="Reativar"
                carregando={reativando}
                erro={erroReativar}
                onConfirmar={confirmar}
                onCancelar={fecharConfirmacao}
            />
        </section>
    );
}
