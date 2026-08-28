import { api } from "./api.js";

export async function logar(login, senha) {
    try {
        if (!login || !senha) throw new Error("Login e senha são obrigatórios");

        const resposta = await api.post('/usuarios/login', {
            login,
            senha
        });

        return resposta.data;

    } catch (error) {
        const mensagem =
            error.response?.data?.erro ||
            error.response?.data?.message ||
            error.message;

        console.error("Erro no login:", mensagem);
        throw new Error(mensagem);
    }
}

export async function criarUsuario(token, nome, cpf, email, tipo_usuario, senha) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!cpf && !email) throw new Error("Erro: Nenhum CPF nem email informado.");

        const resposta = await api.post(
            '/usuarios',
            { nome, cpf, email, tipo_usuario, senha },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        const mensagem =
            error.response?.data?.erro ||
            error.response?.data?.message ||
            error.message;

        console.error("Erro ao criar usuário:", mensagem);
        throw new Error(mensagem);
    }
}

export async function buscarUsuarios(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.get('/usuarios', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return resposta.data;

    } catch (error) {
        const mensagem =
            error.response?.data?.erro ||
            error.response?.data?.message ||
            error.message;

        console.error("Erro ao buscar usuários:", mensagem);
        throw new Error(mensagem);
    }
}

export async function atualizarUsuario(
    token,
    id,
    nome,
    cpf,
    email,
    tipo_usuario,
    senha
) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");

        const resposta = await api.put(
            `/usuarios/${id}`,
            {
                nome,
                cpf,
                email,
                tipo_usuario,
                senha
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        const mensagem =
            error.response?.data?.erro ||
            error.response?.data?.message ||
            error.message ||
            "Erro ao atualizar usuário.";

        console.error("Erro ao atualizar usuário:", mensagem);

        throw new Error(mensagem);
    }
}

export async function deletarUsuario(token, id) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");

        const resposta = await api.delete(`/usuarios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return resposta.data;

    } catch (error) {
        const mensagem =
            error.response?.data?.erro ||
            error.response?.data?.message ||
            error.message;

        console.error("Erro ao deletar usuário:", mensagem);
        throw new Error(mensagem);
    }
}