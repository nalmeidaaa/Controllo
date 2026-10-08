import { useCallback, useEffect, useState } from 'react';
import { buscarPendentes } from '../services/usuarioService.js';
import { obterToken } from '../storage/usuario/dados.storage.js';

export function usePendentes() {
    const [pendentes, setPendentes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const recarregar = useCallback(async () => {
        try {
            setCarregando(true);
            setErro('');
            const resposta = await buscarPendentes(obterToken());
            setPendentes(resposta?.result ?? []);
        } catch (error) {
            if (error.response?.status === 403) {
                setErro('Você não tem permissão para aprovar cadastros.');
            } else {
                setErro(error.response?.data?.message || 'Não foi possível carregar os cadastros pendentes.');
            }
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        recarregar();
    }, [recarregar]);

    return { pendentes, carregando, erro, recarregar };
}
