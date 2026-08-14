// Salva os dados do usuário logado (geralmente disparado logo após o logar() com sucesso)
export function salvarUsuario(usuario) {
    if (usuario) {
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
    }
}

// Verifica se existe um usuário logado no sistema (retorna true ou false)
export function estaLogado() {
    const usuario = localStorage.getItem('usuario_logado');
    return usuario !== null; 
}

// Retorna os dados do usuário atual ou null se não houver ninguém logado
export function obterUsuarioAtual() {
    const usuario = localStorage.getItem('usuario_logado');
    return usuario ? JSON.parse(usuario) : null;
}

// Retorna apenas o Token do usuário (muito útil para colocar nas requisições do seu usuario.api.js)
export function obterToken() {
    const usuario = obterUsuarioAtual();
    return usuario ? usuario.token : null; // Assume que o seu objeto usuario tem a propriedade .token
}

// Remove o usuário do storage (o famoso "Fazer Logout")
export function deslogarUsuario() {
    localStorage.removeItem('usuario_logado');
}