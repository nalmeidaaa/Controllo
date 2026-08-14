export class Sala {
    #id;
    #descricao;
    #bloco;
    #caminhoImagem;

    constructor(
        descricao,
        bloco,
        id = null,
        caminhoImagem = null
    ) {
        if (descricao !== null && descricao !== undefined) {
            this.descricao = descricao;
        }
        if (bloco !== null && bloco !== undefined) {
            this.bloco = bloco;
        }
        if (id !== null && id !== undefined) {
            this.id = id;
        }
        if (caminhoImagem !== null && caminhoImagem !== undefined) {
            this.caminhoImagem = caminhoImagem;
        }
    }

    // GETTERS
    get id() {
        return this.#id;
    }

    get descricao() {
        return this.#descricao;
    }

    get bloco() {
        return this.#bloco;
    }

    get caminhoImagem() {
        return this.#caminhoImagem;
    }

    // SETTERS COM VALIDAÇÃO
    set id(id) {
        if (id !== null && id !== undefined) {
            this.#id = id;
        }
    }

    set descricao(descricao) {
        if (descricao !== null && descricao !== undefined) {
            if (typeof descricao !== 'string' || descricao.trim().length < 2) {
                throw new Error('Descrição deve ter pelo menos 2 caracteres.');
            }
            this.#descricao = descricao.trim();
        }
    }

    set bloco(bloco) {
        if (bloco !== null && bloco !== undefined) {
            if (!Number.isInteger(Number(bloco)) || Number(bloco) <= 0) {
                throw new Error('Bloco deve ser um número inteiro positivo.');
            }
            this.#bloco = Number(bloco);
        }
    }

    set caminhoImagem(caminho) {
        if (caminho !== null && caminho !== undefined) {
            this.#caminhoImagem = caminho;
        }
    }

    // FACTORY METHODS
    static criar(descricao, bloco, caminhoImagem = null) {
        return new Sala(descricao, bloco, null, caminhoImagem);
    }

    static editar(id, descricao, bloco, caminhoImagem = null) {
        return new Sala(descricao, bloco, id, caminhoImagem);
    }
}
