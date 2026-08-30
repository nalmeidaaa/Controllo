// Salva os dados do usuário logado no sessionStorage
export function salvarUsuario(usuario) {
    if (usuario) {
        sessionStorage.setItem('usuario_logado', JSON.stringify(usuario));
    }
}

// Verifica se existe um usuário logado no sistema (retorna true ou false)
export function estaLogado() {
    const usuario = sessionStorage.getItem('usuario_logado');
    return usuario !== null; 
}

// Retorna os dados do usuário atual ou null se não houver ninguém logado
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