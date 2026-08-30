import { useEffect, useState, useRef } from 'react';

const ESTADO_INICIAL = {
    nome: '',
    cpf: '',
    email: '',
    tipo_usuario: 'administracao',
    senha: '',
    imagem: null
};

export default function ModalUsuario({ aberto, usuario, onSalvar, onFechar }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [erro, setErro] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [previewFoto, setPreviewFoto] = useState('');

    const [camposErro, setCamposErro] = useState([]);

    const editando = Boolean(usuario);

    useEffect(() => {
        if (aberto) {
            setErro([]);
            setSalvando(false);
            setCamposErro([]);

            setForm(
                usuario
                    ? {
                        nome: usuario.nome || '',
                        cpf: usuario.cpf || '',
                        email: usuario.email || '',
                        tipo_usuario: usuario.tipo_usuario || 'geral',
                        senha: '',
                        imagem: usuario.imagem || null,
                    }
                    : ESTADO_INICIAL
            );

            setPreviewFoto(usuario?.imagem || '');
        }
    }, [aberto, usuario]);

    if (!aberto) return null;

    function atualizar(campo, valor) {
        setForm((f) => ({
            ...f,
            [campo]: valor
        }));

        setCamposErro((campos) =>
            campos.filter((campoErro) => campoErro !== campo)
        );
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

        setErro([]);
        setCamposErro([]);

        const nome = form.nome.trim();
        const cpf = form.cpf.trim();
        const email = form.email.trim();
        const senha = form.senha.trim();

        // Guarda os campos que estão com erro
        const erros = [];
        const mensagensErro = [];

        // Verifica o nome
        if (!nome) {
            erros.push('nome');
            mensagensErro.push('Informe o nome completo.');
        }

        // Verifica CPF e E-mail
        if (!cpf && !email) {
            erros.push('cpf');
            erros.push('email');

            mensagensErro.push('Informe o CPF.');
            mensagensErro.push('Informe o E-mail.');

        } else if (!cpf) {
            erros.push('cpf');
            mensagensErro.push('Informe o CPF.');

        } else if (!email) {
            erros.push('email');
            mensagensErro.push('Informe o E-mail.');
        }

        // Verifica a senha somente ao criar um novo usuário
        if (!senha && !editando) {
            erros.push('senha');
            mensagensErro.push('Informe a senha.');
        }

        // Se existir algum erro, mostra todos
        if (erros.length > 0) {
            setErro(mensagensErro);
            setCamposErro(erros);

            return;
        }

        // Cria o FormData exatamente como o Insomnia faz
        const formData = new FormData();

        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('tipo_usuario', form.tipo_usuario);
        formData.append('senha', senha);

        // Adiciona a imagem apenas se o usuário selecionou um arquivo novo
        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);

            await onSalvar(formData);

        } catch (error) {

            // Pega a resposta enviada pelo backend
            const resposta = error?.response?.data;

            // Pega a mensagem enviada pelo backend
            const mensagem =
                resposta?.message ||
                'Ocorreu um erro. Tente novamente.';

            // Mostra a mensagem na tela
            setErro([mensagem]);

            // Se o backend informou qual campo deu erro,
            // destaca esse campo
            if (resposta?.campo) {
                setCamposErro([resposta.campo]);
            }

        } finally {
            setSalvando(false);
        }
    }

    return (
        <div
            className="modal-overlay visible"
            onClick={(e) => {
                if (e.target === e.currentTarget) onFechar();
            }}
        >

            <div className="modal-box">

                <div className="modal-header">
                    <h5>
                        {editando ? 'Editar Usuário' : 'Novo Usuário'}
                    </h5>

                    <button
                        className="modal-close"
                        aria-label="Fechar"
                        onClick={onFechar}
                    >
                        ✕
                    </button>
                </div>

                {erro.length > 0 && (
                    <div className="alert-error">
                        {erro.map((mensagem, index) => (
                            <div key={index}>
                                {mensagem}
                            </div>
                        ))}
                    </div>
                )}

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

                            <label
                                className="form-label foto-label"
                                htmlFor="modalFoto"
                            >
                                Escolher foto de perfil
                            </label>

                            <input
                                type="file"
                                id="modalFoto"
                                accept="image/*"
                                className="foto-input"
                                onChange={handleMudarFoto}
                            />

                        </div>

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="modalNome"
                            >
                                Nome Completo
                            </label>

                            <input
                                type="text"
                                id="modalNome"
                                className={`form-control ${
                                    camposErro.includes('nome')
                                        ? 'campo-erro'
                                        : ''
                                }`}
                                required
                                value={form.nome}
                                onChange={(e) =>
                                    atualizar('nome', e.target.value)
                                }
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label
                                    className="form-label"
                                    htmlFor="modalCpf"
                                >
                                    CPF
                                </label>

                                <input
                                    type="text"
                                    id="modalCpf"
                                    className={`form-control ${
                                        camposErro.includes('cpf')
                                            ? 'campo-erro'
                                            : ''
                                    }`}
                                    placeholder="000.000.000-00"
                                    value={form.cpf}
                                    onChange={(e) =>
                                        atualizar('cpf', e.target.value)
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label
                                    className="form-label"
                                    htmlFor="modalTipoUsuario"
                                >
                                    Perfil
                                </label>

                                <select
                                    id="modalTipoUsuario"
                                    className="form-control"
                                    value={form.tipo_usuario}
                                    onChange={(e) =>
                                        atualizar(
                                            'tipo_usuario',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="administracao">
                                        Administração
                                    </option>

                                    <option value="manutencao">
                                        Manutenção
                                    </option>

                                    <option value="geral">
                                        Geral
                                    </option>
                                </select>

                            </div>

                        </div>

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="modalEmail"
                            >
                                E-mail
                            </label>

                            <input
                                type="email"
                                id="modalEmail"
                                className={`form-control ${
                                    camposErro.includes('email')
                                        ? 'campo-erro'
                                        : ''
                                }`}
                                value={form.email}
                                onChange={(e) =>
                                    atualizar('email', e.target.value)
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="modalSenha"
                            >
                                Senha de Acesso
                            </label>

                            <input
                                type="password"
                                id="modalSenha"
                                className={`form-control ${
                                    camposErro.includes('senha')
                                        ? 'campo-erro'
                                        : ''
                                }`}
                                required={!editando}
                                value={form.senha}
                                onChange={(e) =>
                                    atualizar('senha', e.target.value)
                                }
                            />

                            <small className="form-hint">
                                {editando
                                    ? 'Deixe em branco para manter a senha atual.'
                                    : 'Defina a senha inicial de acesso.'}
                            </small>

                        </div>

                    </div>

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={onFechar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-modal-save"
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando…'
                                : (
                                    editando
                                        ? 'Salvar Alterações'
                                        : 'Salvar Usuário'
                                )}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}