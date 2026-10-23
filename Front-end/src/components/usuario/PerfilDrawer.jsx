import { useEffect, useState } from 'react';
import {
    IoPersonOutline,
    IoCardOutline,
    IoMailOutline,
    IoCameraOutline,
    IoShieldCheckmarkOutline,
    IoAlertCircleOutline,
    IoCloseOutline,
    IoArrowBackOutline,
    IoCreateOutline,
    IoMoonOutline,
    IoSunnyOutline,
    IoLogOutOutline,
    IoChevronForwardOutline,
} from 'react-icons/io5';
import { atualizarUsuario } from '../../services/usuarioService.js';
import { obterToken, salvarUsuario } from '../../storage/usuario/dados.storage.js';
import { useUsuarioLogado } from '../../hooks/useUsuarioLogado.jsx';
import { useTema } from '../../theme/tema.js';
import {
    nomeDoUsuario,
    urlFotoUsuario,
    rotuloTipoUsuario,
    idDoUsuario,
    arquivoParaMiniatura,
    sincronizarUsuarioLogado,
} from '../../utils/usuario.js';
import Avatar from '../shared/Avatar.jsx';
import './PerfilDrawer.css';

export default function PerfilDrawer({ aberto, onFechar, onSair }) {
    const usuarioLogado = useUsuarioLogado();
    const { escuro, alternar: alternarTema } = useTema();

    // 'menu' = resumo + ações | 'editar' = formulário de edição
    const [visao, setVisao] = useState('menu');

    const [form, setForm] = useState({ nome: '', cpf: '', email: '', imagem: null });
    const [previewFoto, setPreviewFoto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState([]);

    const nomeUsuario = nomeDoUsuario(usuarioLogado);
    const fotoUsuario = urlFotoUsuario(usuarioLogado);

    function carregarFormulario() {
        setForm({
            nome: nomeUsuario,
            cpf: usuarioLogado?.cpf || '',
            email: usuarioLogado?.email || '',
            imagem: null,
        });
        setPreviewFoto(fotoUsuario || '');
        setSucesso('');
        setErro([]);
    }

    // Ao abrir, sempre volta para o menu
    useEffect(() => {
        if (aberto) {
            setVisao('menu');
            carregarFormulario();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberto]);

    // Esc fecha a gaveta
    useEffect(() => {
        if (!aberto) return undefined;
        const aoTeclar = (e) => e.key === 'Escape' && onFechar?.();
        window.addEventListener('keydown', aoTeclar);
        return () => window.removeEventListener('keydown', aoTeclar);
    }, [aberto, onFechar]);

    function abrirEdicao() {
        carregarFormulario();
        setVisao('editar');
    }

    function voltarAoMenu() {
        setVisao('menu');
        setSucesso('');
        setErro([]);
    }

    function atualizarCampo(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
        setSucesso('');
        setErro([]);
    }

    function handleMudarFoto(e) {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;
        atualizarCampo('imagem', arquivo);
        setPreviewFoto(URL.createObjectURL(arquivo));
    }

    function handleSair() {
        onFechar?.();
        onSair?.();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro([]);
        setSucesso('');

        const nome = form.nome.trim();
        const email = form.email.trim();

        if (!nome) return setErro(['Informe o nome completo.']);
        if (!email) return setErro(['Informe o E-mail.']);

        const idUsuario = idDoUsuario(usuarioLogado);
        const formData = new FormData();
        formData.append('id', idUsuario);
        formData.append('nome', nome);
        formData.append('email', email);
        // só reenvia o tipo se ele existir no cadastro, para nunca rebaixar a conta sem querer
        if (usuarioLogado?.tipo_usuario) {
            formData.append('tipo_usuario', usuarioLogado.tipo_usuario);
        }
        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);
            const resposta = await atualizarUsuario(obterToken(), idUsuario, formData);

            const retornado = resposta?.result || resposta?.usuario || resposta || {};
            const atualizado = { ...usuarioLogado, nome, email };

            if (retornado?.caminho_imagem) {
                atualizado.caminho_imagem = retornado.caminho_imagem;
                delete atualizado.foto_local;
            } else if (form.imagem instanceof File) {
                // enquanto o servidor não confirma o caminho, usa uma miniatura da foto escolhida
                atualizado.foto_local = await arquivoParaMiniatura(form.imagem);
            }
            salvarUsuario(atualizado); // navbar e dashboard atualizam sozinhos

            if (form.imagem instanceof File) {
                sincronizarUsuarioLogado({ forcar: true }); // pega o caminho definitivo, se possível
            }

            setForm((f) => ({ ...f, imagem: null }));
            setSucesso('Perfil atualizado com sucesso!');
        } catch (error) {
            const dados = error?.response?.data;
            setErro([dados?.message || error?.message || 'Erro ao atualizar o perfil.']);
        } finally {
            setSalvando(false);
        }
    }

    const editando = visao === 'editar';

    return (
        <div
            className={`perfil-drawer-overlay ${aberto ? 'visible' : ''}`}
            onMouseDown={(e) => e.target === e.currentTarget && onFechar?.()}
            aria-hidden={!aberto}
        >
            <aside className="perfil-drawer-box" role="dialog" aria-modal="true" aria-label="Meu perfil">
                {/* ───── Cabeçalho ───── */}
                <div className="perfil-drawer-header">
                    {editando && (
                        <button type="button" className="perfil-drawer-icon-btn" onClick={voltarAoMenu} aria-label="Voltar">
                            <IoArrowBackOutline size={20} />
                        </button>
                    )}
                    <h3>{editando ? 'Editar perfil' : 'Meu perfil'}</h3>
                    <button type="button" className="perfil-drawer-icon-btn perfil-drawer-close" onClick={onFechar} aria-label="Fechar">
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                {!editando ? (
                    /* ───── Visão: resumo + ações ───── */
                    <div className="perfil-drawer-body">
                        <section className="perfil-resumo">
                            <Avatar nome={nomeUsuario} src={fotoUsuario} tamanho={88} className="perfil-resumo-avatar" />
                            <h4 className="perfil-resumo-nome">{nomeUsuario || 'Usuário'}</h4>
                            {usuarioLogado?.email && <p className="perfil-resumo-email">{usuarioLogado.email}</p>}
                            {usuarioLogado?.tipo_usuario && (
                                <span className="perfil-resumo-tipo">{rotuloTipoUsuario(usuarioLogado.tipo_usuario)}</span>
                            )}
                        </section>

                        <nav className="perfil-acoes" aria-label="Ações da conta">
                            <button type="button" className="perfil-acao" onClick={abrirEdicao}>
                                <span className="perfil-acao-icone"><IoCreateOutline size={19} /></span>
                                <span className="perfil-acao-texto">
                                    <strong>Editar perfil</strong>
                                    <small>Nome, e-mail e foto</small>
                                </span>
                                <IoChevronForwardOutline className="perfil-acao-seta" size={16} />
                            </button>

                            <button
                                type="button"
                                className="perfil-acao"
                                role="switch"
                                aria-checked={escuro}
                                onClick={alternarTema}
                            >
                                <span className="perfil-acao-icone">
                                    {escuro ? <IoMoonOutline size={19} /> : <IoSunnyOutline size={19} />}
                                </span>
                                <span className="perfil-acao-texto">
                                    <strong>Modo escuro</strong>
                                    <small>{escuro ? 'Ativado' : 'Desativado'}</small>
                                </span>
                                <span className={`perfil-switch ${escuro ? 'ligado' : ''}`} aria-hidden="true">
                                    <span className="perfil-switch-bolinha" />
                                </span>
                            </button>

                            <div className="perfil-acoes-divisor" />

                            <button type="button" className="perfil-acao perfil-acao--perigo" onClick={handleSair}>
                                <span className="perfil-acao-icone"><IoLogOutOutline size={19} /></span>
                                <span className="perfil-acao-texto">
                                    <strong>Sair</strong>
                                    <small>Encerrar a sessão neste dispositivo</small>
                                </span>
                            </button>
                        </nav>
                    </div>
                ) : (
                    /* ───── Visão: edição ───── */
                    <>
                        <div className="perfil-drawer-body">
                            <div className="perfil-drawer-avatar-section">
                                <label htmlFor="drawerFotoInput" title="Alterar foto" className="perfil-drawer-avatar-label">
                                    <Avatar nome={form.nome} src={previewFoto} tamanho={96} />
                                    <span className="perfil-drawer-camera-badge"><IoCameraOutline size={15} /></span>
                                </label>
                                <input type="file" id="drawerFotoInput" accept="image/*" hidden onChange={handleMudarFoto} />
                                <small className="perfil-drawer-dica">Toque na foto para alterar</small>
                            </div>

                            {sucesso && (
                                <div className="perfil-alerta perfil-alerta--ok" role="status">
                                    <IoShieldCheckmarkOutline size={18} />
                                    <span>{sucesso}</span>
                                </div>
                            )}

                            {erro.length > 0 && (
                                <div className="perfil-alerta perfil-alerta--erro" role="alert">
                                    <IoAlertCircleOutline size={18} />
                                    <div>{erro.map((msg, i) => <div key={i}>{msg}</div>)}</div>
                                </div>
                            )}

                            <form id="formPerfil" onSubmit={handleSubmit} className="perfil-form">
                                <div className="form-group">
                                    <label className="form-label">Nome completo *</label>
                                    <div className="perfil-campo">
                                        <IoPersonOutline />
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.nome}
                                            onChange={(e) => atualizarCampo('nome', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">CPF (não editável)</label>
                                    <div className="perfil-campo perfil-campo--desabilitado">
                                        <IoCardOutline />
                                        <input type="text" className="form-control" value={form.cpf} disabled />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">E-mail *</label>
                                    <div className="perfil-campo">
                                        <IoMailOutline />
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={(e) => atualizarCampo('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="perfil-drawer-footer">
                            <button type="button" className="btn-modal-cancel" onClick={voltarAoMenu}>
                                Voltar
                            </button>
                            <button type="submit" form="formPerfil" className="btn-submit perfil-btn-salvar" disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
