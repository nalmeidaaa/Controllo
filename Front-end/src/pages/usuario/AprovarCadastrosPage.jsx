import { useState } from 'react';
import { aprovarCadastro, recusarCadastro } from '../../services/usuarioService.js';
import { obterToken } from '../../storage/usuario/dados.storage.js';
import { usePendentes } from '../../hooks/usePendentes.jsx';
import TabelaPendentes from '../../components/aprovacao/TabelaPendentes.jsx';
import ModalAprovar from '../../components/aprovacao/ModalAprovar.jsx';
import ModalRecusar from '../../components/aprovacao/ModalRecusar.jsx';
import './AprovarCadastrosPage.css';

export default function AprovarCadastrosPage({ onPendentesAtualizados }) {
    const { pendentes, carregando, erro, recarregar } = usePendentes();

    const [aprovando, setAprovando] = useState(null);
    const [recusando, setRecusando] = useState(null);
    const [executando, setExecutando] = useState(false);
    const [erroModal, setErroModal] = useState('');
    const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

    function mensagemDeErro(error, padrao) {
        if (error.response?.status === 403) return 'Você não tem permissão para esta ação.';
        return error.response?.data?.message || (error.response ? padrao : 'Não foi possível conectar ao servidor.');
    }

    async function depoisDaAcao() {
        await recarregar();
        onPendentesAtualizados?.();
    }

    async function confirmarAprovacao(perfil) {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await aprovarCadastro(obterToken(), aprovando.id_usuario, perfil);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro aprovado com sucesso.' });
            setAprovando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível aprovar o cadastro.'));
            // 404/409: o cadastro já foi tratado por outra pessoa; atualiza a lista
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    async function confirmarRecusa() {
        try {
            setExecutando(true);
            setErroModal('');
            const resposta = await recusarCadastro(obterToken(), recusando.id_usuario);
            setMensagem({ tipo: 'sucesso', texto: resposta?.message || 'Cadastro recusado e excluído.' });
            setRecusando(null);
            await depoisDaAcao();
        } catch (error) {
            setErroModal(mensagemDeErro(error, 'Não foi possível recusar o cadastro.'));
            if ([404, 409].includes(error.response?.status)) await depoisDaAcao();
        } finally {
            setExecutando(false);
        }
    }

    function abrirAprovar(usuario) {
        setMensagem(null);
        setErroModal('');
        setAprovando(usuario);
    }

    function abrirRecusar(usuario) {
        setMensagem(null);
        setErroModal('');
        setRecusando(usuario);
    }

    return (
        <div className="page-usuarios-container">
            <header className="header-usuarios">
                <div>
                    <h1>Aprovar Cadastros</h1>
                    <p className="page-subtitle">
                        Analise os cadastros enviados pelo aplicativo e libere o acesso.
                    </p>
                </div>
            </header>

            {mensagem && (
                <div className={`aprov-mensagem ${mensagem.tipo}`} role="status">
                    {mensagem.texto}
                </div>
            )}

            {carregando ? (
                <div className="tabela-card">
                    <div className="aprov-estado">Carregando cadastros...</div>
                </div>
            ) : erro ? (
                <div className="tabela-card">
                    <div className="aprov-estado">
                        <p>{erro}</p>
                        <button className="btn-primary-custom" onClick={recarregar}>Tentar novamente</button>
                    </div>
                </div>
            ) : pendentes.length === 0 ? (
                <div className="tabela-card">
                    <div className="aprov-estado">Nenhum cadastro pendente</div>
                </div>
            ) : (
                <TabelaPendentes
                    pendentes={pendentes}
                    ocupado={executando}
                    onAprovar={abrirAprovar}
                    onRecusar={abrirRecusar}
                />
            )}

            {aprovando && (
                <ModalAprovar
                    usuario={aprovando}
                    salvando={executando}
                    erro={erroModal}
                    onConfirmar={confirmarAprovacao}
                    onFechar={() => !executando && setAprovando(null)}
                />
            )}

            {recusando && (
                <ModalRecusar
                    usuario={recusando}
                    salvando={executando}
                    erro={erroModal}
                    onConfirmar={confirmarRecusa}
                    onFechar={() => !executando && setRecusando(null)}
                />
            )}
        </div>
    );
}
