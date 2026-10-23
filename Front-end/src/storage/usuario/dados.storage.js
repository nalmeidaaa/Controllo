// Salva os dados do usuário logado no sessionStorage
export function salvarUsuario(usuario) {
    if (usuario) {
        sessionStorage.setItem('usuario_logado', JSON.stringify(usuario));
        // Avisa componentes (navbar, dashboard...) que os dados do usuário mudaram
        window.dispatchEvent(new Event('usuario-atualizado'));
    }
}

// Verifica se existe um usuário logado no sistema
export function estaLogado() {
    const usuario = sessionStorage.getItem('usuario_logado');
    return usuario !== null; 
}

// Retorna exatamente o objeto salvo no login (com nome, id, email e token)
export function obterUsuarioAtual() {
    const usuario = sessionStorage.getItem('usuario_logado');
    return usuario ? JSON.parse(usuario) : null;
}

// Retorna apenas o Token do usuário
export function obterToken() {
    const usuario = obterUsuarioAtual();
    return usuario ? usuario.token : null;
}

// Remove o usuário do storage (Fazer Logout)
export function deslogarUsuario() {
    sessionStorage.removeItem('usuario_logado');
    sessionStorage.clear();
}