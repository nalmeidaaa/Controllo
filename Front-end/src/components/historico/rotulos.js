// Cores em hex ficam só para a planilha (Excel); na tela os badges usam classes CSS (tema claro/escuro)
export const ACOES = {
    Abertura: { label: 'Abertura', plural: 'Aberturas', classe: 'abertura', excel: { bg: 'FFFBEB', fg: '92400E' } },
    Andamento: { label: 'Andamento', plural: 'Andamentos', classe: 'andamento', excel: { bg: 'E0F2FE', fg: '0369A1' } },
    Finalizacao: { label: 'Finalização', plural: 'Finalizações', classe: 'finalizacao', excel: { bg: 'ECFDF3', fg: '166534' } },
};

export const LISTA_ACOES = Object.keys(ACOES);

export const PRIORIDADES = { Alta: 'Alta', Media: 'Média', Baixa: 'Baixa' };

export function formatarDataHora(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

export function formatarHora(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function nomeUsuario(usuario) {
    return usuario?.nome || 'Usuário removido';
}

// ── Datas (sempre no fuso local, formato AAAA-MM-DD dos <input type="date">) ──
export function paraISO(data) {
    const p = (n) => String(n).padStart(2, '0');
    return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

export function diasAtras(qtd) {
    const d = new Date();
    d.setDate(d.getDate() - qtd);
    return paraISO(d);
}

export function formatarDataISO(iso) {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
}

// "Hoje", "Ontem" ou "quinta-feira, 22 de outubro" (com o ano quando não é o atual)
export function rotuloDia(iso) {
    const data = new Date(iso);
    const chave = paraISO(data);
    if (chave === paraISO(new Date())) return 'Hoje';
    if (chave === diasAtras(1)) return 'Ontem';

    const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
    if (data.getFullYear() !== new Date().getFullYear()) opcoes.year = 'numeric';
    const texto = data.toLocaleDateString('pt-BR', opcoes);
    return texto.charAt(0).toUpperCase() + texto.slice(1); // só a 1ª letra (evita "De" maiúsculo)
}

// Agrupa eventos (já ordenados pelo servidor) por dia, mantendo a ordem
export function agruparPorDia(eventos) {
    const grupos = [];
    eventos.forEach((e) => {
        const chave = e.horario ? paraISO(new Date(e.horario)) : 'sem-data';
        const ultimo = grupos[grupos.length - 1];
        if (ultimo && ultimo.chave === chave) {
            ultimo.eventos.push(e);
        } else {
            grupos.push({ chave, rotulo: e.horario ? rotuloDia(e.horario) : 'Sem data', eventos: [e] });
        }
    });
    return grupos;
}
