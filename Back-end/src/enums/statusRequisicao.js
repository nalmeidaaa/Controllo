export const StatusRequisicao = Object.freeze({
    PENDENTE: 'Pendente',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDO: 'Concluído'
});

// Status considerados "em aberto" (patrimônio fica Pendente enquanto durar)
export const STATUS_REQUISICAO_ABERTOS = Object.freeze([
    StatusRequisicao.PENDENTE,
    StatusRequisicao.EM_ANDAMENTO
]);
