import { useEffect, useState } from "react";
import { buscarUsuarios } from "../services/usuarioService.js";
import { obterToken } from "../storage/usuario/dados.storage.js";

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);

    async function carregarUsuarios() {
        try {
            setLoading(true);
            setErro(false);

            const token = obterToken();
            if (!token) return;

            const resposta = await buscarUsuarios(token);
            setUsuarios(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao buscar usuários", error);
            setErro(true);
        } finally { // ele só acontece quando o try e o catch são executados, independente de dar certo ou errado
            setLoading(false);
        }
    }

    useEffect(() => {

        carregarUsuarios();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { usuarios, setUsuarios, loading, erro, recarregar: carregarUsuarios };
}
