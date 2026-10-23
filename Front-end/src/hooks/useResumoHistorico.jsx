import { useEffect, useRef, useState } from 'react';
import { listarHistorico } from '../services/historicoService.js';
import { obterToken } from '../storage/usuario/dados.storage.js';
import { LISTA_ACOES } from '../components/historico/rotulos.js';

// Quantidade de registros por ação respeitando os demais filtros (período, sala, patrimônio).
// Usa o "total" devolvido pela API com limite=1, então não baixa os registros.
export function useResumoHistorico(filtros) {
    const [contagens, setContagens] = useState(null); // { Abertura, Andamento, Finalizacao } | null
    const [carregando, setCarregando] = useState(true);
    const contador = useRef(0);

    const { de, ate, id_sala, id_patrimonio } = filtros;

    useEffect(() => {
        const id = ++contador.current;
        setCarregando(true);

        (async () => {
            try {
                const token = obterToken();
                const totais = await Promise.all(
                    LISTA_ACOES.map(async (acao) => {
                        const r = await listarHistorico(token, { de, ate, id_sala, id_patrimonio, acao, pagina: 1, limite: 1 });
                        return [acao, r?.total ?? 0];
                    })
                );
                if (id === contador.current) setContagens(Object.fromEntries(totais));
            } catch {
                if (id === contador.current) setContagens(null); // os cards apenas ficam sem número
            } finally {
                if (id === contador.current) setCarregando(false);
            }
        })();
    }, [de, ate, id_sala, id_patrimonio]);

    const total = contagens ? Object.values(contagens).reduce((a, b) => a + b, 0) : null;
    return { contagens, total, carregando };
}
