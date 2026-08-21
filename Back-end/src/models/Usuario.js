import { validarCPF } from "../utils/validarCpf.js";
import { limparNumero } from "../utils/limparNumero.js";

export class Usuario {

    #id;
    #nome;
    #cpf;
    #tipo_usuario;
    #email;
    #hash_senha;
    #caminhoImagem; // Nova propriedade privada para a imagem de perfil

    constructor(
        nome,
        cpf = null,
        tipo_usuario = null,
        email = null,
        hash_senha = null,
        id = null,
        caminhoImagem = null // Novo parâmetro posicional
    ) {

        this.nome = nome;

        if (cpf !== null && cpf !== undefined) {
            this.cpf = cpf;
        }

        if (tipo_usuario !== null && tipo_usuario !== undefined) {
            this.tipo_usuario = tipo_usuario;
        }

        if (email !== null && email !== undefined) {
            this.email = email;
        }

        if (hash_senha !== null && hash_senha !== undefined) {
            this.hash_senha = hash_senha;
        }

        this.id = id;

        if (caminhoImagem !== null && caminhoImagem !== undefined) {
            this.caminhoImagem = caminhoImagem;
        }

    }

    // GETTERS

    get id() {
        return this.#id;
    }

    get nome() {
        return this.#nome;
    }

    get cpf() {
        return this.#cpf;
    }

    get tipo_usuario() {
        return this.#tipo_usuario;
    }

    get email() {
        return this.#email;
    }

    get hash_senha() {
        return this.#hash_senha;
    }

    get caminhoImagem() { // Novo Getter
        return this.#caminhoImagem;
    }

    // SETTERS

    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    set nome(value) {
        this.#nome = value;
    }

    set cpf(value) {
        this.#validarCpf(value);
        this.#cpf = value
            ? limparNumero(value)
            : null;
    }

    set tipo_usuario(value) {
        this.#validarTipoUsuario(value);
        this.#tipo_usuario = value;
    }

    set email(value) {
        this.#validarEmail(value);
        this.#email = value || null;
    }

    set hash_senha(value) {
        this.#validarSenha(value);
        this.#hash_senha = value;
    }

    set caminhoImagem(value) { // Novo Setter
        if (value !== null && value !== undefined) {
            this.#caminhoImagem = value;
        }
    }

    // VALIDAÇÕES

    #validarId(value) {
        if (value && value <= 0) {
            throw new Error("Verifique o ID informado");
        }
    }

    #validarNome(value) {
        if (!value || value.trim().length < 3) {
            throw new Error("Nome inválido");
        }
    }

    #validarCpf(value) {
        // CPF opcional
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return;
        }

        const cpfLimpo = limparNumero(value);

        if (!validarCPF(cpfLimpo)) {
            throw new Error("CPF inválido");
        }
    }

    #validarTipoUsuario(value) {
        if (!value || value.trim().length === 0) {
            throw new Error("Tipo de usuário inválido");
        }
    }

    #validarEmail(value) {
        // EMAIL opcional
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return;
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value)) {
            throw new Error("Email inválido");
        }
    }

    #validarSenha(value) {
        // A validação só dispara se houver valor (evita quebrar o editar caso não altere a senha)
        if (value && value.length < 6) {
            throw new Error(
                "A senha deve possuir no mínimo 6 caracteres"
            );
        }
    }

    // FACTORY METHODS

    static criar({
        nome,
        cpf,
        tipo_usuario,
        email,
        hash_senha,
        caminho_imagem, // Suporta vindo mapeado do banco
        caminhoImagem   // Suporta vindo mapeado da controller
    }) {

        return new Usuario(
            nome,
            cpf,
            tipo_usuario,
            email,
            hash_senha,
            null,
            caminho_imagem || caminhoImagem
        );

    }

    static editar({
        nome,
        cpf,
        tipo_usuario,
        email,
        hash_senha,
        caminho_imagem, // Suporta vindo mapeado do banco
        caminhoImagem   // Suporta vindo mapeado da controller
    }, id) {

        if (!id) {
            throw new Error(
                "ID é obrigatório para alteração"
            );
        }

        return new Usuario(
            nome,
            cpf,
            tipo_usuario,
            email,
            hash_senha,
            id,
            caminho_imagem || caminhoImagem
        );

    }

}