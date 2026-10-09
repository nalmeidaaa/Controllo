export const ACOES = {
    Abertura: { label: 'Abertura', bg: '#fffbeb', cor: '#92400e', borda: '#fde68a' },
    Andamento: { label: 'Andamento', bg: '#e0f2fe', cor: '#0369a1', borda: '#bae6fd' },
    Finalizacao: { label: 'Finalização', bg: '#ecfdf3', cor: '#166534', borda: '#bbf7d0' },
};

export const PRIORIDADES = { Alta: 'Alta', Media: 'Média', Baixa: 'Baixa' };

export function formatarDataHora(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

export function nomeUsuario(usuario) {
    return usuario?.nome || 'Usuário removido';
}
