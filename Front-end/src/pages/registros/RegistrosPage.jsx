import { useEffect, useState } from 'react';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { listarHistorico } from '../../services/requisicaoService.js';

export default function RegistrosPage() {
    const token = obterToken();

    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        async function carregarRegistros() {
            try {
                const resposta = await listarHistorico(token);

                setRegistros(resposta?.result || []);
            } catch (error) {
                console.error('Erro ao carregar registros:', error);
                setErro(true);
            } finally {
                setCarregando(false);
            }
        }

        carregarRegistros();
    }, [token]);

    if (!token) {
        return (
            <div>
                <p>Sessão inválida. Faça login novamente.</p>
            </div>
        );
    }

    if (carregando) {
        return (
            <div>
                <p>Carregando registros...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div>
                <p>Não foi possível carregar os registros.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Registros</h1>

            {registros.length === 0 ? (
                <p>Nenhum registro encontrado.</p>
            ) : (
                registros.map((registro) => (
                    <div key={registro.id_requisicao}>
                        <p>Sala: {registro.sala}</p>
                        <p>Patrimônio: {registro.patrimonio}</p>
                        <p>Descrição: {registro.descricao}</p>
                        <p>Status: {registro.status}</p>
                        <p>Prioridade: {registro.prioridade}</p>
                        <p>Abertura: {registro.abertura}</p>
                        <p>Fechamento: {registro.fechamento || 'Não fechado'}</p>
                    </div>
                ))
            )}
        </div>
    );
}