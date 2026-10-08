import { PrioridadeRequisicao } from '../enums/prioridadeRequisicao.js';

const DESCRICAO_MIN = 10;
const DESCRICAO_MAX = 200;
const OBSERVACAO_MIN = 5;
const OBSERVACAO_MAX = 200;

const semAcento = (texto) =>
    String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export class Requisicao {

    #idPatrimonio;
    #descricao;
    #prioridade;
    #idUsuarioSolicitante;

    constructor(idPatrimonio, descricao, prioridade = null, idUsuarioSolicitante = null) {
        this.idPatrimonio = idPatrimonio;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.idUsuarioSolicitante = idUsuarioSolicitante;
    }

    // GETTERS
    get idPatrimonio() { return this.#idPatrimonio; }
    get descricao() { return this.#descricao; }
    get prioridade() { return this.#prioridade; }
    get idUsuarioSolicitante() { return this.#idUsuarioSolicitante; }

    // SETTERS
    set idPatrimonio(value) {
        const numero = Number(value);
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new Error('Patrimônio informado é inválido');
        }
        this.#idPatrimonio = numero;
    }

    set descricao(value) {
        const texto = typeof value === 'string' ? value.trim() : '';
        if (texto.length < DESCRICAO_MIN || texto.length > DESCRICAO_MAX) {
            throw new Error(`A descrição do problema deve ter entre ${DESCRICAO_MIN} e ${DESCRICAO_MAX} caracteres`);
        }
        this.#descricao = texto;
    }

    set prioridade(value) {
        if (value === null || value === undefined || value === '') {
            this.#prioridade = PrioridadeRequisicao.MEDIA;
            return;
        }
        const normalizada = Requisicao.normalizarPrioridade(value);
        if (!normalizada) {
            throw new Error('Prioridade inválida. Valores permitidos: Alta, Média e Baixa');
        }
        this.#prioridade = normalizada;
    }

    set idUsuarioSolicitante(value) {
        const numero = Number(value);
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new Error('Usuário solicitante inválido');
        }
        this.#idUsuarioSolicitante = numero;
    }

    // Aceita "Alta", "media", "Média", "BAIXA"... e devolve o valor exato do banco (ou null)
    static normalizarPrioridade(value) {
        if (value === null || value === undefined || value === '') return null;
        const chave = semAcento(value);
        return Object.values(PrioridadeRequisicao).find((p) => semAcento(p) === chave) ?? null;
    }

    // Aceita "Pendente", "em andamento", "Concluido", "Concluído"... e devolve o valor exato do banco (ou null)
    static normalizarStatus(value, valoresValidos) {
        if (value === null || value === undefined || value === '') return null;
        const chave = semAcento(value);
        return valoresValidos.find((s) => semAcento(s) === chave) ?? null;
    }

    // Observação de conclusão da manutenção
    static validarObservacao(value) {
        const texto = typeof value === 'string' ? value.trim() : '';
        if (texto.length < OBSERVACAO_MIN || texto.length > OBSERVACAO_MAX) {
            throw new Error(`A observação deve ter entre ${OBSERVACAO_MIN} e ${OBSERVACAO_MAX} caracteres`);
        }
        return texto;
    }

    // FACTORY METHOD
    static criar({ id_patrimonio, descricao, prioridade }, idUsuarioSolicitante) {
        return new Requisicao(id_patrimonio, descricao, prioridade, idUsuarioSolicitante);
    }
}
