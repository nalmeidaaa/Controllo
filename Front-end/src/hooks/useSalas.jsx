import { useEffect, useState } from "react";
import { listarSalas } from "../services/salaService.js";
import { obterToken } from "../storage/usuario/dados.storage.js";

export function useSalas() {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);

    async function carregarSalas() {
        try {
            setLoading(true);
            setErro(false);

            const token = obterToken();
            if (!token) return;

            const resposta = await listarSalas(token);
            setSalas(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao buscar salas", error);
            setErro(true);
        } finally { // ele só acontece quando o try e o catch são executados, independente de dar certo ou errado
            setLoading(false);
        }
    }

    useEffect(() => {

        carregarSalas();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { salas, setSalas, loading, erro, recarregar: carregarSalas };
}
