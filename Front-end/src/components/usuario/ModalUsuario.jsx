
import { useEffect, useState } from 'react';

const ESTADO_INICIAL = {
    nome: '',
    cpf: '',
    email: '',
    tipo_usuario: 'administracao',
    senha: '',
    imagem: null
};

const TIPOS_VALIDOS = ['administracao', 'manutencao', 'geral'];

function normalizarTipo(tipo) {
    if (!tipo) return '';

    return tipo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function formatarCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    return valor;
}

export default function ModalUsuario({ aberto, usuario, onSalvar, onFechar }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [erro, setErro] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [previewFoto, setPreviewFoto] = useState('');
    const [camposErro, setCamposErro] = useState([]);
    const [mostrarRequisitos, setMostrarRequisitos] = useState(false);

    const editando = Boolean(usuario);

    // Verifica os requisitos da senha
    const requisitosSenha = [
        {
            texto: 'Pelo menos 6 caracteres',
            valido: form.senha.length >= 6
        },
        {
            texto: 'Pelo menos uma letra maiúscula',
            valido: /[A-Z]/.test(form.senha)
        },
        {
            texto: 'Pelo menos uma letra minúscula',
            valido: /[a-z]/.test(form.senha)
        },
        {
            texto: 'Pelo menos um caractere especial',
            valido: /[^A-Za-z0-9\s]/.test(form.senha)
        }
    ];

    useEffect(() => {
        if (aberto) {
            setErro([]);
            setSalvando(false);
            setCamposErro([]);
            setMostrarRequisitos(false);

            setForm(
                usuario
                    ? {
                        nome: usuario.nome || '',
                        cpf: usuario.cpf || '',
                        email: usuario.email || '',
                        tipo_usuario: (() => {
                            const tipoBase =
                                normalizarTipo(usuario.tipo_usuario) === 'desativado'
                                    ? usuario.tipo_usuario_antigo
                                    : usuario.tipo_usuario;

                            const tipoNormalizado = normalizarTipo(tipoBase);

                            return TIPOS_VALIDOS.includes(tipoNormalizado)
                                ? tipoNormalizado
                                : 'geral';
                        })(),
                        senha: '',
                        imagem: usuario.imagem || null
                    }
                    : { ...ESTADO_INICIAL }
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
        const senha = form.senha;

        const erros = [];
        const mensagensErro = [];

        // Verifica o nome
        if (!nome) {
            erros.push('nome');
            mensagensErro.push('Informe o nome completo.');
        }

        // Verifica CPF e e-mail
        if (!cpf && !email) {
            erros.push('cpf', 'email');
            mensagensErro.push('Informe o CPF.');
            mensagensErro.push('Informe o E-mail.');
        } else if (!cpf) {
            erros.push('cpf');
            mensagensErro.push('Informe o CPF.');
        } else if (!email) {
            erros.push('email');
            mensagensErro.push('Informe o E-mail.');
        }

        // Senha obrigatória ao cadastrar
        if (!senha.trim() && !editando) {
            erros.push('senha');
            mensagensErro.push('Informe a senha.');
        }

        // Verifica os requisitos quando uma senha é digitada
        if (
            senha.length > 0 &&
            requisitosSenha.some((item) => !item.valido)
        ) {
            erros.push('senha');
            mensagensErro.push('A senha não atende a todos os requisitos.');
            setMostrarRequisitos(true);
        }

        if (erros.length > 0) {
            setErro(mensagensErro);
            setCamposErro(erros);
            return;
        }

        const formData = new FormData();

        if (editando) {
            formData.append('id', usuario.id_usuario);
        }

        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('tipo_usuario', form.tipo_usuario);

        // Só envia a senha se ela foi preenchida
        if (senha.length > 0) {
            formData.append('senha', senha);
        }

        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);
            await onSalvar(formData);
        } catch (error) {
            const resposta = error?.response?.data;

            const mensagem =
                resposta?.message ||
                'Ocorreu um erro. Tente novamente.';

            setErro([mensagem]);

            if (resposta?.campo) {
                setCamposErro([resposta.campo]);

                if (resposta.campo === 'senha') {
                    setMostrarRequisitos(true);
                }
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
                        type="button"
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
                            <div key={index}>{mensagem}</div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body">

                        {/* Foto de perfil */}
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

                        {/* Nome */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="modalNome">
                                Nome Completo
                            </label>

                            <input
                                type="text"
                                id="modalNome"
                                className={`form-control ${camposErro.includes('nome') ? 'campo-erro' : ''
                                    }`}
                                required
                                value={form.nome}
                                onChange={(e) =>
                                    atualizar('nome', e.target.value)
                                }
                            />
                        </div>

                        {/* CPF e perfil */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="modalCpf">
                                    CPF
                                </label>

                                <input
                                    type="text"
                                    id="modalCpf"
                                    className={`form-control ${camposErro.includes('cpf') ? 'campo-erro' : ''
                                        }`}
                                    placeholder="000.000.000-00"
                                    value={form.cpf}
                                    maxLength={14}
                                    onChange={(e) =>
                                        atualizar('cpf', formatarCPF(e.target.value))
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
                                        atualizar('tipo_usuario', e.target.value)
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

                        {/* E-mail */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="modalEmail">
                                E-mail
                            </label>

                            <input
                                type="email"
                                id="modalEmail"
                                className={`form-control ${camposErro.includes('email') ? 'campo-erro' : ''
                                    }`}
                                value={form.email}
                                onChange={(e) =>
                                    atualizar('email', e.target.value)
                                }
                            />
                        </div>

                        {/* Senha */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="modalSenha">
                                Senha de Acesso
                            </label>

                            <input
                                type="password"
                                id="modalSenha"
                                className={`form-control ${camposErro.includes('senha') ? 'campo-erro' : ''
                                    }`}
                                required={!editando}
                                value={form.senha}
                                onFocus={() => setMostrarRequisitos(true)}
                                onChange={(e) =>
                                    atualizar('senha', e.target.value)
                                }
                            />

                            <small className="form-hint">
                                {editando
                                    ? 'Deixe em branco para manter a senha atual.'
                                    : 'Defina a senha inicial de acesso.'}
                            </small>

                            {/* Card colorido feito diretamente no JSX */}

                            {mostrarRequisitos && (
                                <ul
                                    style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        marginTop: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}
                                >
                                    {requisitosSenha.map((requisito, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                color: requisito.valido ? '#4ade80' : '#ff5964',
                                                fontSize: '12px',
                                                transition: 'color 0.2s ease'
                                            }}
                                        >
                                            {requisito.valido ? '✓' : '○'} {requisito.texto}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>
                    </div>

                    {/* Botões */}
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
                                : editando
                                    ? 'Salvar Alterações'
                                    : 'Salvar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
