import { useCallback, useEffect, useRef, useState } from 'react';
import { listarHistorico } from '../services/historicoService.js';
import { obterToken } from '../storage/usuario/dados.storage.js';

export function useHistorico(filtros, pagina, limite) {
    const [eventos, setEventos] = useState([]);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const contador = useRef(0);

    const chaveFiltros = JSON.stringify(filtros);

    const recarregar = useCallback(async () => {
        const id = ++contador.current;
        try {
            setCarregando(true);
            setErro('');
            const resposta = await listarHistorico(obterToken(), { ...filtros, pagina, limite });
            if (id !== contador.current) return;
            setEventos(resposta?.result ?? []);
            setTotal(resposta?.total ?? 0);
        } catch (error) {
            if (id !== contador.current) return;
            if (error.response?.status === 403) {
                setErro('Você não tem permissão para ver o histórico.');
            } else {
                setErro(error.response?.data?.message || 'Não foi possível carregar o histórico.');
            }
        } finally {
            if (id === contador.current) setCarregando(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaveFiltros, pagina, limite]);

    useEffect(() => {
        recarregar();
    }, [recarregar]);

    return { eventos, total, carregando, erro, recarregar };
}
