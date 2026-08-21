import { api } from "./api.js";

// Pega a URL base dinamicamente da configuração central
const API_URL = api.defaults.baseURL;

export function urlImagemSala(sala) {
    return sala?.caminho_imagem ? `${API_URL}${sala.caminho_imagem}` : null;
}

export function urlImagemUsuario(usuario) {
    return usuario?.caminho_imagem ? `${API_URL}${usuario.caminho_imagem}` : null;
}

export function urlImagemPatrimonio(patrimonio) {
    return patrimonio?.caminho_imagem ? `${API_URL}${patrimonio.caminho_imagem}` : null;
}