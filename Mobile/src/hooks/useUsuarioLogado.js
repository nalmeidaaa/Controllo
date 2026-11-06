import { useEffect, useState } from "react";
import {
    assinarUsuario,
    obterUsuarioAtual,
} from "../storage/usuario/dados.storage.js";

// Usuário logado sempre atualizado: re-renderiza quando o perfil é editado
export function useUsuarioLogado() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        let ativo = true;

        obterUsuarioAtual()
            .then((u) => {
                if (ativo) setUsuario(u);
            })
            .catch(() => {});

        const cancelar = assinarUsuario((u) => {
            if (ativo) setUsuario(u);
        });

        return () => {
            ativo = false;
            cancelar();
        };
    }, []);

    return usuario;
}
