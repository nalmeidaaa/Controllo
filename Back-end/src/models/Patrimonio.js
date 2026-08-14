import { StatusPatrimonio } from '../enums/statusPatrimonio.js';

export class Patrimonio {

    #id;
    #nome;
    #status;
    #idSala;
    #caminhoImagem;
    #numero_patrimonio;

    constructor(
        nome,
        status = null,
        idSala = null,
        id = null,
        caminhoImagem = null,
        numero_patrimonio = null
    ) {
        this.nome = nome;

        if (status !== null && status !== undefined) {
            this.status = status;
        }

        // Passa pelo setter mesmo se for nulo, pois agora aceitamos nulo legitimamente
        this.idSala = idSala;
        this.id = id;
        this.caminhoImagem = caminhoImagem;
        this.numero_patrimonio = numero_patrimonio;
    }

    // GETTERS
    get id() {
        return this.#id;
    }

    get nome() {
        return this.#nome;
    }

    get status() {
        return this.#status;
    }

    get idSala() {
        return this.#idSala;
    }

    get caminhoImagem() {
        return this.#caminhoImagem;
    }

    get numero_patrimonio() {
        return this.#numero_patrimonio;
    }

    // SETTERS
    set id(value) {
        this.#validarId(value);
        this.#id = value ? Number(value) : null;
    }

    set nome(value) {
        this.#validarNome(value);
        this.#nome = value;
    }

    set status(value) {
        this.#validarStatus(value);
        this.#status = value;
    }

    set idSala(value) {
        this.#validarIdSala(value);
        this.#idSala = value ? Number(value) : null;
    }

    set caminhoImagem(value) {
        // Permite atribuir null explicitamente para limpar a imagem
        this.#caminhoImagem = value ?? null;
    }

    set numero_patrimonio(value) {
        this.#validarNumeroPatrimonio(value);
        this.#numero_patrimonio = value ?? null;
    }

    // VALIDAÇÕES
    #validarId(value) {
        if (value && value <= 0) {
            throw new Error("Verifique o ID informado");
        }
    }

    #validarNome(value) {
        if (!value || value.trim().length < 3) {
            throw new Error("Nome inválido para o patrimônio");
        }
    }

    #validarStatus(value) {
        const statusValidos = Object.values(StatusPatrimonio);
        if (!statusValidos.includes(value)) {
            throw new Error(`Status inválido. Valores permitidos: ${statusValidos.join(', ')}.`);
        }
    }

    #validarIdSala(value) {
        // ARRUMADO: Permite null ou undefined. Se houver valor, valida se é um ID numérico maior que zero.
        if (value !== null && value !== undefined && (Number(value) <= 0 || isNaN(Number(value)))) {
            throw new Error("ID da sala (FK) informado é inválido");
        }
    }

    #validarNumeroPatrimonio(value) {
        if (value !== null && value !== undefined && (Number(value) <= 0 || isNaN(Number(value))) && value.length > 12) {
            throw new Error("Número do patrimônio informado é inválido");
        }
    }

    // FACTORY METHODS
    static criar({ nome, status, id_sala, idSala, caminho_imagem, caminhoImagem, numero_patrimonio }) {
        return new Patrimonio(
            nome,
            status,
            id_sala || idSala || null, // Garante envio de null se não vier de lugar nenhum
            null,
            caminho_imagem || caminhoImagem || null,
            numero_patrimonio || null
        );
    }

    static editar({ nome, status, id_sala, idSala, caminho_imagem, caminhoImagem, numero_patrimonio }, id) {
        if (!id) {
            throw new Error("ID é obrigatório para alteração");
        }

        return new Patrimonio(
            nome,
            status,
            id_sala || idSala || null,
            Number(id),
            caminho_imagem || caminhoImagem || null,
            numero_patrimonio || null
        );
    }
}