import { useEffect, useState } from 'react';

const ESTADO_INICIAL = { nome: '', cpf: '', email: '', tipo_usuario: 'administracao', senha: '', imagem: null };

export default function ModalUsuario({ aberto, usuario, onSalvar, onFechar }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [previewFoto, setPreviewFoto] = useState('');

    const editando = Boolean(usuario);

    useEffect(() => {
        if (aberto) {
            setErro('');
            setSalvando(false);
            setForm(usuario
                ? {
                    nome: usuario.nome || '',
                    cpf: usuario.cpf || '',
                    email: usuario.email || '',
                    tipo_usuario: usuario.tipo_usuario || 'geral',
                    senha: '',
                    imagem: usuario.imagem || null,
                }
                : ESTADO_INICIAL);
            setPreviewFoto(usuario?.imagem || '');
        }
    }, [aberto, usuario]);

    if (!aberto) return null;

    function atualizar(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    function handleMudarFoto(e) {
        const arquivo = e.target.files[0];
        if (arquivo) {
            atualizar('imagem', arquivo);
            setPreviewFoto(URL.createObjectURL(arquivo));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');

        const cpf = form.cpf.trim();
        const email = form.email.trim();

        if (!cpf && !email) {
            setErro('Informe pelo menos o CPF ou o E-mail.');
            return;
        }

        // Cria o FormData exatamente como o Insomnia faz
        const formData = new FormData();
        formData.append('nome', form.nome.trim());
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('tipo_usuario', form.tipo_usuario);
        formData.append('senha', form.senha);

        // Adiciona a imagem apenas se o usuário selecionou um arquivo novo
        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);
            await onSalvar(formData);
        } catch (error) {
            setErro(error?.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }
    return (
        <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
            <div className="modal-box">
                <div className="modal-header">
                    <h5>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h5>
                    <button className="modal-close" aria-label="Fechar" onClick={onFechar}>✕</button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body">
                        <div className="form-group foto-group">
                            <div className="foto-preview-container">
                                {previewFoto ? (
                                    <img
                                        src={previewFoto}
                                        alt="Preview"
                                        className="foto-preview-img"
                                    />
                                ) : (
                                    <div className="foto-placeholder">
                                        Sem foto
                                    </div>
                                )}
                            </div>
                            <label className="form-label foto-label" htmlFor="modalFoto">
                                Escolher foto de perfil
                            </label>
                            <input
                                type="file" id="modalFoto" accept="image/*" className="foto-input"
                                onChange={handleMudarFoto}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="modalNome">Nome Completo</label>
                            <input
                                type="text" id="modalNome" className="form-control" required
                                value={form.nome} onChange={(e) => atualizar('nome', e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="modalCpf">CPF</label>
                                <input
                                    type="text" id="modalCpf" className="form-control" placeholder="000.000.000-00"
                                    value={form.cpf} onChange={(e) => atualizar('cpf', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="modalTipoUsuario">Perfil</label>
                                <select
                                    id="modalTipoUsuario" className="form-control"
                                    value={form.tipo_usuario} onChange={(e) => atualizar('tipo_usuario', e.target.value)}
                                >
                                    <option value="administracao">Administração</option>
                                    <option value="manutencao">Manutenção</option>
                                    <option value="geral">Geral</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="modalEmail">E-mail</label>
                            <input
                                type="email" id="modalEmail" className="form-control"
                                value={form.email} onChange={(e) => atualizar('email', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="modalSenha">Senha de Acesso</label>
                            <input
                                type="password" id="modalSenha" className="form-control"
                                required={!editando}
                                value={form.senha} onChange={(e) => atualizar('senha', e.target.value)}
                            />
                            <small className="form-hint">
                                {editando ? 'Deixe em branco para manter a senha atual.' : 'Defina a senha inicial de acesso.'}
                            </small>
                        </div>

                        {erro && <div className="alert-error">{erro}</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-modal-cancel" onClick={onFechar}>Cancelar</button>
                        <button type="submit" className="btn-modal-save" disabled={salvando}>
                            {salvando ? 'Salvando…' : (editando ? 'Salvar Alterações' : 'Salvar Usuário')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}