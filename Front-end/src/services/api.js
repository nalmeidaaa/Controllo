import axios from 'axios';
import { deslogarUsuario } from "../storage/usuario/dados.storage.js";

export const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 10000 // Recomendado adicionar um timeout
});

// Interceptor global: serve para TODAS as requisições que usarem essa 'api'
api.interceptors.response.use(
    (resposta) => resposta,
    (error) => {
        const status = error.response?.status;

        // 401 = não autorizado / token expirado
        if (status === 401) {
            deslogarUsuario();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);