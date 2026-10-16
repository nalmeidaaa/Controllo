import { useEffect, useState } from 'react';
import { listarSalas } from '../../services/salaService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { useHistorico } from '../../hooks/useHistorico.jsx';
import FiltrosHistorico from '../../components/historico/FiltrosHistorico.jsx';
import PaginacaoServidor from '../../components/historico/PaginacaoServidor.jsx';
import ModalLinhaDoTempo from '../../components/historico/ModalLinhaDoTempo.jsx';
import './HistoricoPage.css';

const LIMITE = 10;
const FILTROS_VAZIOS = { acao: '', de: '', ate: '', id_sala: '', id_patrimonio: '' };

function extrairTexto(valor) {
  if (!valor) return '';
  if (typeof valor === 'object') {
    return valor.nome || valor.descricao || valor.nome_sala || valor.nome_patrimonio || valor.usuario_nome || '';
  }
  return String(valor);
}

function CardHistorico({ item, onSelecionar }) {
  const dataFormatada = item.horario
    ? new Date(item.horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : '-';

  const acao = item.acao || 'Solicitação';
  const patrimonio = extrairTexto(item.patrimonio_nome || item.patrimonio) || '-';
  const sala = extrairTexto(item.sala_nome || item.sala) || '-';
  const solicitante = extrairTexto(item.solicitante_nome || item.solicitante) || '—';
  const responsavel = extrairTexto(item.responsavel_nome || item.responsavel) || '—';
  const feitoPor = extrairTexto(
    item.usuario_nome ||
    item.usuario ||
    item.feito_por ||
    item.nome_usuario ||
    item.usuario_acao ||
    item.nome
  ) || '—';
  const descricao = item.descricao || '';

  return (
    <div className="hist-card-item" onClick={() => onSelecionar(item.id_requisicao || item.id)}>
      <div className="hist-card-campo hist-campo-status">
        <span className="hist-card-badge">{acao}</span>
        <span className="hist-card-data">{dataFormatada}</span>
      </div>

      <div className="hist-card-campo">
        <label>Patrimônio</label>
        <p>
          {patrimonio}
          {item.numero_patrimonio && <small> ({item.numero_patrimonio})</small>}
        </p>
      </div>

      <div className="hist-card-campo">
        <label>Sala</label>
        <p>{sala}</p>
      </div>

      <div className="hist-card-campo">
        <label>Solicitante</label>
        <p>{solicitante}</p>
      </div>

      <div className="hist-card-campo">
        <label>Responsável</label>
        <p>{responsavel}</p>
      </div>

      <div className="hist-card-campo">
        <label>Feito Por</label>
        <p>{feitoPor}</p>
      </div>

      {descricao && (
        <div className="hist-card-campo hist-campo-descricao">
          <label>Descrição</label>
          <p>{descricao}</p>
        </div>
      )}

    </div>
  );
}

function montarElementoRelatorio(eventos, total) {
  const dataAtual = new Date().toLocaleString('pt-BR');

  const linhas = eventos.map((item) => {
    const dataFormatada = item.horario
      ? new Date(item.horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      : '-';
    const acao = item.acao || '-';

    const patrimonio = extrairTexto(item.patrimonio_nome || item.patrimonio) || '-';
    const numPatrimonio = item.numero_patrimonio ? `<br/><small style="color:#888">${item.numero_patrimonio}</small>` : '';
    const sala = extrairTexto(item.sala_nome || item.sala) || '-';
    const solicitante = extrairTexto(item.solicitante_nome || item.solicitante) || '—';
    const responsavel = extrairTexto(item.responsavel_nome || item.responsavel) || '—';

    const feitoPor = extrairTexto(
      item.usuario_nome ||
      item.usuario ||
      item.feito_por ||
      item.nome_usuario ||
      item.usuario_acao ||
      item.nome
    ) || '—';

    const descricao = item.descricao || '-';

    return `
      <tr>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${dataFormatada}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;"><span style="display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; background-color: #fef9c3; color: #854d0e;">${acao}</span></td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${patrimonio}${numPatrimonio}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${sala}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${solicitante}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${responsavel}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${feitoPor}</td>
        <td style="border: 1px solid #e0e0e0; padding: 8px; font-size: 11px;">${descricao}</td>
      </tr>
    `;
  }).join('');

  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#333';
  container.innerHTML = `
    <div style="border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
      <h1 style="font-size: 18px; margin: 0 0 5px 0; text-transform: uppercase;">Histórico de Manutenção</h1>
      <p style="margin: 3px 0; font-size: 12px;"><strong>Emissão:</strong> ${dataAtual}</p>
      <p style="margin: 3px 0; font-size: 12px;"><strong>Total de registros:</strong> ${total}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Data e Hora</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Ação</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Patrimônio</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Sala</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Solicitante</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Responsável</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Feito Por</th>
          <th style="border: 1px solid #e0e0e0; padding: 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase;">Descrição</th>
        </tr>
      </thead>
      <tbody>
        ${linhas}
      </tbody>
    </table>
    <div style="margin-top: 20px; font-size: 10px; text-align: center; color: #777;">
      <p>Relatório gerado automaticamente pelo sistema.</p>
    </div>
  `;

  return container;
}

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
        if (ativo) setSalas([]);
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

  const gerarpdf = async () => {
    if (!window.html2pdf) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    const elemento = montarElementoRelatorio(eventos, total);
    const nomeArquivo = `historico_manutencao_${new Date().toISOString().slice(0,10)}.pdf`;

    const opcoes = {
      margin: 10,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    const pdfBase64 = await window.html2pdf().set(opcoes).from(elemento).output('datauristring');

    const link = document.createElement('a');
    link.href = pdfBase64;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-usuarios-container">
      <header className="header-usuarios">
        <div>
          <h1>Histórico de Manutenção</h1>
          <p className="page-subtitle">
            Acompanhe aberturas, andamentos e finalizações das requisições.
          </p>
        </div>
        <button onClick={gerarpdf} className="btn-gerar-pdf">
          Gerar PDF
        </button>
      </header>

      <FiltrosHistorico
        filtros={filtros}
        salas={salas}
        onChange={alterarFiltros}
        onLimpar={limparFiltros}
      />

      <div className="hist-conteudo-card">
        {carregando ? (
          <div className="hist-estado">Carregando histórico...</div>
        ) : erro ? (
          <div className="hist-estado">
            <p>{erro}</p>
            <button className="btn-primary-custom" onClick={recarregar}>Tentar novamente</button>
          </div>
        ) : eventos.length === 0 ? (
          <div className="hist-estado">Nenhum registro encontrado</div>
        ) : (
          <div className="hist-cards-grid">
            {eventos.map((item, index) => (
              <CardHistorico
                key={item.id_requisicao || item.id || index}
                item={item}
                onSelecionar={setRequisicaoAberta}
              />
            ))}
          </div>
        )}
      </div>

      {!carregando && !erro && eventos.length > 0 && (
        <PaginacaoServidor
          total={total}
          limite={LIMITE}
          pagina={pagina}
          onMudar={setPagina}
        />
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