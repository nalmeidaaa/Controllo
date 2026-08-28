import { useEffect, useState } from 'react';

const ESTADO_INICIAL = {
    nome: '',
    cpf: '',
    email: '',
    tipo_usuario: 'administracao',
    senha: ''
};

export default function ModalUsuario({ aberto, usuario, onSalvar, onFechar }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    const editando = Boolean(usuario);

    useEffect(() => {
        if (aberto) {
            setErro('');
            setSalvando(false);

            let tipoUsuario = usuario?.tipo_usuario || 'geral';

            // Converte o tipo recebido para o formato usado pelo select
            tipoUsuario = tipoUsuario
                .toString()
                .trim()
                .toLowerCase();

            // Aceita tanto com acento quanto sem acento
            if (
                tipoUsuario === 'administração' ||
                tipoUsuario === 'administracao'
            ) {
                tipoUsuario = 'administracao';
            } else if (
                tipoUsuario === 'manutenção' ||
                tipoUsuario === 'manutencao'
            ) {
                tipoUsuario = 'manutencao';
            } else if (tipoUsuario === 'geral') {
                tipoUsuario = 'geral';
            } else {
                tipoUsuario = 'geral';
            }

            setForm(
                usuario
                    ? {
                        nome: usuario.nome || '',
                        cpf: usuario.cpf || '',
                        email: usuario.email || '',
                        tipo_usuario: tipoUsuario,
                        senha: '',
                    }
                    : ESTADO_INICIAL
            );
        }
    }, [aberto, usuario]);

    if (!aberto) return null;

    function atualizar(campo, valor) {
        setForm((f) => ({
            ...f,
            [campo]: valor
        }));
    }

    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;

        if (/^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;

        if (resto === 10) resto = 0;

        if (resto !== Number(cpf[9])) return false;

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(cpf[i]) * (11 - i);
        }

        resto = (soma * 10) % 11;

        if (resto === 10) resto = 0;

        return resto === Number(cpf[10]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');

        const nome = form.nome.trim();
        const cpf = form.cpf.trim();
        const email = form.email.trim();

        // Verifica nome e CPF
        if (!nome || !cpf) {
            setErro(
                !nome && !cpf
                    ? 'Você não colocou o nome e o CPF.'
                    : !nome
                        ? 'Você não colocou o nome.'
                        : 'Você não colocou o CPF.'
            );

            return;
        }

        // Verifica se o CPF é válido
        if (!validarCPF(cpf)) {
            setErro('CPF inválido.');
            return;
        }

        const payload = {
            id: usuario?.id_usuario ?? null,
            nome,
            cpf,
            email,
            tipo_usuario: form.tipo_usuario,
            senha: form.senha,
        };

        try {
            setSalvando(true);

            await onSalvar(payload);

        } catch (error) {
            setErro(
                error?.response?.data?.erro ||
                error?.response?.data?.message ||
                error?.response?.data?.errorMessage ||
                error?.message ||
                'Ocorreu um erro. Tente novamente.'
            );
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

                <form onSubmit={handleSubmit} noValidate>

                    <div className="modal-body">

                        {/* NOME */}
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
                                className="form-control"
                                required
                                value={form.nome}
                                onChange={(e) =>
                                    atualizar('nome', e.target.value)
                                }
                            />
                        </div>

                        {/* CPF E PERFIL */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 14
                            }}
                        >
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
                                    className="form-control"
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

                        {/* E-MAIL */}
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
                                className="form-control"
                                value={form.email}
                                onChange={(e) =>
                                    atualizar('email', e.target.value)
                                }
                            />
                        </div>

                        {/* SENHA */}
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
                                className="form-control"
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

                        {/* ERRO */}
                        {erro && (
                            <div
                                className="alert-error"
                                style={{ display: 'block' }}
                            >
                                {erro}
                            </div>
                        )}

                    </div>

                    {/* BOTÕES */}
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