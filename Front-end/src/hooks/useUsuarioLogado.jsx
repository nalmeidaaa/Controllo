import { useEffect, useState } from 'react';
import { obterUsuarioAtual } from '../storage/usuario/dados.storage.js';

// Mantém o usuário logado sincronizado com o sessionStorage.
// Re-renderiza sempre que salvarUsuario() for chamado.
export function useUsuarioLogado() {
    const [usuario, setUsuario] = useState(() => obterUsuarioAtual());

    useEffect(() => {
        const atualizar = () => setUsuario(obterUsuarioAtual());
        window.addEventListener('usuario-atualizado', atualizar);
        return () => window.removeEventListener('usuario-atualizado', atualizar);
    }, []);

    return usuario;
}
