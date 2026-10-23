import { useCallback, useEffect, useRef, useState } from 'react';
import {
    listarSalasDesativadas,
    ativarSala,
    desativarSala
} from '../services/salaService.js';
import { obterToken } from '../storage/usuario/dados.storage.js';

function idDaSala(sala) {
    return String(sala?.id_sala ?? sala?.id ?? '');
}

function mensagemDeErro(erro, padrao) {
    const d = erro?.response?.data;
    return d?.erro || d?.mensagem || d?.message || padrao;
}

/*
 * Salas desativadas: carregar (sem requisições duplicadas), reativar e desfazer.
 * `aoMudarAtivas` é chamado em segundo plano para atualizar a lista de ativas.
 */
export function useSalasDesativadas({ aoMudarAtivas } = {}) {
    const [salas, setSalas] = useState([]);
    const [carregando, setCarregando] = useState(true);   // só na primeira carga
    const [erro, setErro] = useState(false);
    const [reativando, setReativando] = useState(false);
    const [erroReativar, setErroReativar] = useState('');
    const [mensagem, setMensagem] = useState(null);       // { sala, erro? }

    const emAndamento = useRef(null);
    const jaCarregou = useRef(false);
    const aoMudarRef = useRef(aoMudarAtivas);
    aoMudarRef.current = aoMudarAtivas;

    const carregar = useCallback(() => {
        if (emAndamento.current) return emAndamento.current;

        const token = obterToken();
        if (!token) {
            setCarregando(false);
            return Promise.resolve();
        }

        if (!jaCarregou.current) setCarregando(true);
        setErro(false);

        emAndamento.current = listarSalasDesativadas(token)
            .then((resposta) => {
                const dados = resposta?.result ?? resposta ?? [];
                setSalas(Array.isArray(dados) ? dados : []);
                jaCarregou.current = true;
            })
            .catch((e) => {
                console.error('Erro ao carregar salas desativadas:', e);
                setErro(true);
            })
            .finally(() => {
                setCarregando(false);
                emAndamento.current = null;
            });

        return emAndamento.current;
    }, []);

    // Contador correto desde o início da página.
    useEffect(() => {
        carregar();
    }, [carregar]);

    const reativar = useCallback(async (sala) => {
        const id = idDaSala(sala);
        const token = obterToken();

        if (!id) {
            setErroReativar('Não foi possível identificar a sala.');
            return false;
        }
        if (!token) {
            setErroReativar('Sessão inválida. Faça login novamente.');
            return false;
        }

        setReativando(true);
        setErroReativar('');

        try {
            await ativarSala(id, token);
            setSalas((atual) => atual.filter((s) => idDaSala(s) !== id));
            setMensagem({ sala });
            aoMudarRef.current?.();
            return true;
        } catch (e) {
            console.error('Erro ao reativar sala:', e);
            setErroReativar(mensagemDeErro(e, 'Não foi possível reativar a sala.'));
            return false;
        } finally {
            setReativando(false);
        }
    }, []);

    const desfazer = useCallback(async () => {
        const sala = mensagem?.sala;
        const token = obterToken();
        if (!sala || !token) return;

        try {
            await desativarSala(idDaSala(sala), token);
            setMensagem(null);
            await carregar();
            aoMudarRef.current?.();
        } catch (e) {
            console.error('Erro ao desfazer reativação:', e);
            setMensagem({ sala, erro: mensagemDeErro(e, 'Não foi possível desfazer.') });
        }
    }, [mensagem, carregar]);

    const limparMensagem = useCallback(() => setMensagem(null), []);
    const limparErroReativar = useCallback(() => setErroReativar(''), []);

    return {
        salas,
        carregando,
        erro,
        carregar,
        reativar,
        reativando,
        erroReativar,
        limparErroReativar,
        mensagem,
        desfazer,
        limparMensagem
    };
}
