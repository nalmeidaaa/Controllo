import { useEffect, useState } from "react";
import { obterSalaComPatrimonios } from "../services/salaService.js";
import { obterToken } from "../storage/usuario/dados.storage.js";

export function useSalaDetalhe(idSala) {
    const [sala, setSala] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);

    async function carregarSala() {
        try {
            setLoading(true);
            setErro(false);

            const token = obterToken();
            if (!token) return;

            const dados = await obterSalaComPatrimonios(idSala, token);
            const salaCarregada = Array.isArray(dados.result) ? dados.result[0] : (dados.result ?? dados);
            setSala(salaCarregada);
        } catch (error) {
            console.error("Erro ao buscar sala", error);
            setErro(true);
        } finally { // ele só acontece quando o try e o catch são executados, independente de dar certo ou errado
            setLoading(false);
        }
    }

    useEffect(() => {

        carregarSala();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idSala]);

    return { sala, setSala, loading, erro, recarregar: carregarSala };
}
