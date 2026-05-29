import axios from "axios";

const API_URL = 'http://localhost:8000/usuarios';

export async function logar(login, senha) {
    try {
        if (!login || !senha) throw new Error("Login e senha são obrigatórios");

        const resposta = await axios.post(`${API_URL}/login`, {
            login: login,
            senha: senha
        });

        return resposta.data;

    } catch (error) {
        console.error("Erro no login:", error.response?.data?.message || error.message);
        throw error;
    }
}

export async function criarUsuario(token, nome, cpf, email, tipo_usuario, senha) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        
        if (!cpf && !email) throw new Error("Erro: Nenhum CPF nem email informado.");

        const resposta = await axios.post(API_URL, {
            nome,
            cpf,
            email,
            tipo_usuario,
            senha
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        console.error("Erro ao criar usuário:", error.response?.data?.message || error.message);
        throw error;
    }
}

export async function buscarUsuarios(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        console.error("Erro ao buscar usuários:", error.response?.data?.message || error.message);
        throw error;
    }
}

export async function atualizarUsuario(token, id, nome, cpf, email, tipo_usuario, senha) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");
        if (!cpf && !email) throw new Error("Erro: Nenhum CPF nem email informado.");

        const resposta = await axios.put(`${API_URL}/${id}`, {
            nome,
            cpf,
            email,
            tipo_usuario,
            senha
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error.response?.data?.message || error.message);
        throw error;
    }
}

export async function deletarUsuario(token, id) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");
        const resposta = await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        console.error("Erro ao deletar usuário:", error.response?.data?.message || error.message);
        throw error;
    }
}