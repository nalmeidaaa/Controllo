const MS_MIN = 60 * 1000;
const MS_HORA = 60 * MS_MIN;
const MS_DIA = 24 * MS_HORA;

function paraData(valor) {
    if (!valor) return null;
    const d = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d;
}

const dois = (n) => String(n).padStart(2, '0');

/** "agora", "há 5 min", "há 3 h", "há 2 dias"; acima de 30 dias, dd/mm/aaaa. */
export function tempoRelativo(valor, agora = new Date()) {
    const d = paraData(valor);
    if (!d) return '';
    const diff = agora.getTime() - d.getTime();
    if (diff < MS_MIN) return 'agora';
    if (diff < MS_HORA) return `há ${Math.floor(diff / MS_MIN)} min`;
    if (diff < MS_DIA) return `há ${Math.floor(diff / MS_HORA)} h`;
    if (diff < 30 * MS_DIA) {
        const dias = Math.floor(diff / MS_DIA);
        return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }
    return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Chave yyyy-mm-dd (dia local) para agrupar. */
export function chaveDia(valor) {
    const d = paraData(valor);
    if (!d) return '';
    return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/** "Hoje", "Ontem" ou dd/mm/aaaa. */
export function rotuloDia(valor, agora = new Date()) {
    const d = paraData(valor);
    if (!d) return '';
    const chave = chaveDia(d);
    if (chave === chaveDia(agora)) return 'Hoje';
    if (chave === chaveDia(dataDiasAtras(1, agora))) return 'Ontem';
    return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Duração em ms → "45 s", "12 min", "2 h 05 min". */
export function formatarDuracao(ms) {
    if (!Number.isFinite(ms) || ms < 0) return '';
    const seg = Math.round(ms / 1000);
    if (seg < 60) return `${seg} s`;
    const min = Math.floor(seg / 60);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} h ${dois(min % 60)} min`;
}

/** Data (meia-noite local) de n dias atrás. */
export function dataDiasAtras(n, base = new Date()) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    d.setDate(d.getDate() - n);
    return d;
}

/** dd/mm/aaaa às hh:mm */
export function dataCompleta(valor) {
    const d = paraData(valor);
    if (!d) return '';
    return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} às ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}
