import { listarHistorico } from './historicoService.js';
import { ACOES, nomeUsuario } from '../components/historico/rotulos.js';

const POR_PAGINA = 100;
const MAX_PAGINAS = 200; // trava de segurança (20 mil registros)

// ------------------------------------------------------------
// Busca TODOS os registros que batem com os filtros (não só a página atual)
// ------------------------------------------------------------
export async function coletarRegistros(token, filtros, aoProgredir) {
    const vistos = new Map();
    let total = Infinity;

    for (let pagina = 1; pagina <= MAX_PAGINAS && vistos.size < total; pagina++) {
        const r = await listarHistorico(token, { ...filtros, pagina, limite: POR_PAGINA });
        const lote = r?.result ?? [];
        total = r?.total ?? lote.length;
        if (lote.length === 0) break;

        const antes = vistos.size;
        lote.forEach((e) => vistos.set(e.id_historico ?? `${pagina}-${vistos.size}`, e));
        aoProgredir?.(Math.min(vistos.size, total), total);
        if (vistos.size === antes) break; // servidor repetiu a página: evita laço infinito
    }
    return Array.from(vistos.values());
}

// ------------------------------------------------------------
// Linhas "achatadas" usadas pelos dois formatos
// ------------------------------------------------------------
function linhaDe(e) {
    return {
        horario: e.horario ? new Date(e.horario) : null,
        acao: ACOES[e.acao]?.label || e.acao || '—',
        acaoChave: e.acao,
        patrimonio: e.patrimonio?.nome || '—',
        numero: e.patrimonio?.numero_patrimonio || '—',
        sala: e.sala ? `${e.sala.descricao}${e.sala.bloco ? ` (Bloco ${e.sala.bloco})` : ''}` : '—',
        solicitante: nomeUsuario(e.solicitante),
        responsavel: e.responsavel?.nome || '—',
        feitoPor: nomeUsuario(e.usuario_acao),
        descricao: e.descricao || '—',
        requisicao: e.requisicao?.id_requisicao ?? '',
    };
}

// "23/10/2026" + quebra + "10:41" (cabe melhor na coluna estreita do PDF)
function dataHoraEmDuasLinhas(d) {
    if (!d) return '—';
    return `${d.toLocaleDateString('pt-BR')}\n${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function dataHoraTexto(d) {
    return d
        ? d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';
}

export function nomeDoArquivo(extensao) {
    const hoje = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `historico-manutencao_${hoje.getFullYear()}-${p(hoje.getMonth() + 1)}-${p(hoje.getDate())}_${p(hoje.getHours())}${p(hoje.getMinutes())}.${extensao}`;
}

function baixar(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// meta: { filtros: [[rótulo, valor], ...], geradoPor }
const VERMELHO = 'E30613';
const CINZA_TEXTO = '55555F';

// ------------------------------------------------------------
// XLSX
// ------------------------------------------------------------
export async function gerarXlsx(registros, meta) {
    const { default: ExcelJS } = await import('exceljs');
    const linhas = registros.map(linhaDe);

    const wb = new ExcelJS.Workbook();
    wb.creator = meta.geradoPor || 'Controllo';
    wb.created = new Date();

    const ws = wb.addWorksheet('Histórico', {
        views: [{ state: 'frozen', ySplit: 5, showGridLines: false }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    const colunas = [
        { cab: 'Data e hora', larg: 18, chave: 'horario' },
        { cab: 'Ação', larg: 14, chave: 'acao' },
        { cab: 'Patrimônio', larg: 28, chave: 'patrimonio' },
        { cab: 'Nº patrimônio', larg: 15, chave: 'numero' },
        { cab: 'Sala', larg: 26, chave: 'sala' },
        { cab: 'Solicitante', larg: 24, chave: 'solicitante' },
        { cab: 'Responsável', larg: 24, chave: 'responsavel' },
        { cab: 'Feito por', larg: 24, chave: 'feitoPor' },
        { cab: 'Requisição', larg: 12, chave: 'requisicao' },
        { cab: 'Descrição', larg: 60, chave: 'descricao' },
    ];
    ws.columns = colunas.map((c) => ({ key: c.chave, width: c.larg }));
    const ultima = colunas.length;

    // Cabeçalho do relatório
    ws.mergeCells(1, 1, 1, ultima);
    ws.getCell(1, 1).value = 'Histórico de Manutenção';
    ws.getCell(1, 1).font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF' + VERMELHO } };
    ws.getRow(1).height = 28;

    ws.mergeCells(2, 1, 2, ultima);
    ws.getCell(2, 1).value =
        `Gerado em ${dataHoraTexto(new Date())}${meta.geradoPor ? ` por ${meta.geradoPor}` : ''}  •  ${linhas.length} registro${linhas.length === 1 ? '' : 's'}`;
    ws.getCell(2, 1).font = { name: 'Calibri', size: 10, color: { argb: 'FF' + CINZA_TEXTO } };

    ws.mergeCells(3, 1, 3, ultima);
    ws.getCell(3, 1).value = 'Filtros: ' + meta.filtros.map(([k, v]) => `${k}: ${v}`).join('  |  ');
    ws.getCell(3, 1).font = { name: 'Calibri', size: 10, color: { argb: 'FF' + CINZA_TEXTO } };

    // Linha de títulos da tabela (linha 5)
    const cab = ws.getRow(5);
    colunas.forEach((c, i) => {
        const cel = cab.getCell(i + 1);
        cel.value = c.cab;
        cel.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' } };
        cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERMELHO } };
        cel.alignment = { vertical: 'middle', horizontal: 'left' };
    });
    cab.height = 24;

    // Dados
    const borda = { style: 'thin', color: { argb: 'FFE5E5E8' } };
    linhas.forEach((l, idx) => {
        const row = ws.getRow(6 + idx);
        colunas.forEach((c, i) => {
            const cel = row.getCell(i + 1);
            cel.value = l[c.chave] === '' ? null : l[c.chave];
            cel.font = { name: 'Calibri', size: 10 };
            cel.alignment = { vertical: 'top', wrapText: true };
            cel.border = { bottom: borda };
            if (idx % 2 === 1) cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F9' } };
        });
        // ExcelJS grava a data em UTC; compensa o fuso para o Excel exibir o horário local
        if (l.horario) {
            row.getCell(1).value = new Date(l.horario.getTime() - l.horario.getTimezoneOffset() * 60000);
        }
        row.getCell(1).numFmt = 'dd/mm/yyyy hh:mm';

        const cor = ACOES[l.acaoChave]?.excel;
        if (cor) {
            const cel = row.getCell(2);
            cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + cor.bg } };
            cel.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF' + cor.fg } };
            cel.alignment = { vertical: 'top', horizontal: 'center' };
        }
        row.getCell(9).alignment = { vertical: 'top', horizontal: 'center' };
    });

    ws.autoFilter = { from: { row: 5, column: 1 }, to: { row: 5 + Math.max(linhas.length, 1), column: ultima } };

    const buffer = await wb.xlsx.writeBuffer();
    baixar(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        nomeDoArquivo('xlsx')
    );
}

// ------------------------------------------------------------
// PDF
// ------------------------------------------------------------
export async function gerarPdf(registros, meta) {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const linhas = registros.map(linhaDe);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();
    const margem = 36;

    // Faixa de título
    doc.setFillColor(227, 6, 19);
    doc.rect(0, 0, largura, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 35);
    doc.text('Histórico de Manutenção', margem, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(95, 95, 105);
    doc.text(
        `Gerado em ${dataHoraTexto(new Date())}${meta.geradoPor ? ` por ${meta.geradoPor}` : ''}  |  ${linhas.length} registro${linhas.length === 1 ? '' : 's'}`,
        margem, 56
    );

    const filtrosTexto = meta.filtros.map(([k, v]) => `${k}: ${v}`).join('   |   ');
    const quebrado = doc.splitTextToSize(`Filtros - ${filtrosTexto}`, largura - margem * 2);
    doc.text(quebrado, margem, 70);
    const inicioTabela = 70 + quebrado.length * 11 + 8;

    autoTable(doc, {
        startY: inicioTabela,
        margin: { left: margem, right: margem, bottom: 40 },
        head: [['Data e hora', 'Ação', 'Patrimônio', 'Sala', 'Solicitante', 'Responsável', 'Feito por', 'Descrição']],
        body: linhas.map((l) => [
            dataHoraEmDuasLinhas(l.horario),
            l.acao,
            `${l.patrimonio}\nNº ${l.numero}`,
            l.sala,
            l.solicitante,
            l.responsavel,
            l.feitoPor,
            l.descricao,
        ]),
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: [40, 40, 48], lineColor: [229, 229, 232], lineWidth: 0.4 },
        headStyles: { fillColor: [227, 6, 19], textColor: 255, fontStyle: 'bold', halign: 'left' },
        alternateRowStyles: { fillColor: [248, 248, 249] },
        columnStyles: {
            0: { cellWidth: 58 },
            1: { cellWidth: 58, fontStyle: 'bold', halign: 'center' },
            2: { cellWidth: 110 },
            3: { cellWidth: 104 },
            4: { cellWidth: 70 },
            5: { cellWidth: 70 },
            6: { cellWidth: 70 },
            // descrição ocupa o restante
        },
        // cor do texto da coluna "Ação" conforme o tipo
        didParseCell: (d) => {
            if (d.section === 'body' && d.column.index === 1) {
                const chave = linhas[d.row.index]?.acaoChave;
                const hex = ACOES[chave]?.excel?.fg;
                if (hex) d.cell.styles.textColor = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
            }
        },
        didDrawPage: () => {
            doc.setFontSize(8);
            doc.setTextColor(140, 140, 150);
            doc.text('Controllo - Histórico de Manutenção', margem, altura - 18);
        },
    });

    // Numeração "Página X de Y" (só dá para saber o total no fim)
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 150);
        doc.text(`Página ${i} de ${totalPaginas}`, largura - margem, altura - 18, { align: 'right' });
    }

    doc.save(nomeDoArquivo('pdf'));
}

