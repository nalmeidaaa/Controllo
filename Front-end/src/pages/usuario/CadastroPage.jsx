import { useState } from 'react';
import {
    IoPersonOutline,
    IoCardOutline,
    IoMailOutline,
    IoLockClosedOutline,
    IoShieldCheckmarkOutline,
    IoCameraOutline,
    IoArrowForwardOutline,
    IoAlertCircleOutline,
    IoCheckmarkCircleOutline,
    IoTimeOutline
} from 'react-icons/io5';
import { cadastrarUsuario } from '../../services/usuarioService.js';
import './SetupPage.css';
import './CadastroPage.css';

const ESTADO_INICIAL = {
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    imagem: null
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CadastroPage({ onVoltar }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [previewFoto, setPreviewFoto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState([]);
    const [camposErro, setCamposErro] = useState([]);
    const [enviado, setEnviado] = useState(false);

    function atualizar(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
        setCamposErro((campos) => campos.filter((c) => c !== campo));
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
        const cpfNumeros = form.cpf.replace(/\D/g, '');
        const email = form.email.trim();
        const senha = form.senha;
        const confirmarSenha = form.confirmarSenha;

        const campos = [];
        const mensagens = [];

        if (!nome) {
            campos.push('nome');
            mensagens.push('Informe o nome completo.');
        }

        if (!form.cpf.trim()) {
            campos.push('cpf');
            mensagens.push('Informe o CPF.');
        } else if (cpfNumeros.length !== 11) {
            campos.push('cpf');
            mensagens.push('O CPF deve ter 11 dígitos.');
        }

        if (!email) {
            campos.push('email');
            mensagens.push('Informe o e-mail.');
        } else if (!EMAIL_REGEX.test(email)) {
            campos.push('email');
            mensagens.push('Informe um e-mail válido.');
        }

        if (!senha) {
            campos.push('senha');
            mensagens.push('Informe a senha.');
        } else if (senha.length < 6) {
            campos.push('senha');
            mensagens.push('A senha deve possuir no mínimo 6 caracteres, uma letra maiúscula, uma letra minúscula e um caractere especial.');
        }

        if (senha && senha !== confirmarSenha) {
            campos.push('confirmarSenha');
            mensagens.push('As senhas não coincidem.');
        }

        if (campos.length > 0) {
            setErro(mensagens);
            setCamposErro(campos);
            return;
        }

        // Não envia tipo_usuario: o servidor força "pendente"
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf', cpfNumeros);
        formData.append('email', email);
        formData.append('senha', senha);
        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);
            await cadastrarUsuario(formData);
            setEnviado(true);
        } catch (error) {
            const status = error?.response?.status;
            const resposta = error?.response?.data;

            let mensagem;
            if (status === 429) {
                mensagem = 'Muitas tentativas de cadastro. Tente novamente mais tarde.';
            } else if (resposta?.message) {
                mensagem = resposta.message; // 403 (sem administrador), 409, 400...
            } else if (!error?.response) {
                mensagem = 'Não foi possível conectar ao servidor.';
            } else {
                mensagem = 'Erro ao enviar o cadastro.';
            }

            setErro([mensagem]);
            if (resposta?.campo) setCamposErro([resposta.campo]);
        } finally {
            setSalvando(false);
        }
    }

    const invalido = (campo) => (camposErro.includes(campo) ? 'is-invalid' : '');

    return (
        <div className="setup-wrapper">
            <div className="setup-brand-panel">
                <div className="brand-glow-effect"></div>

                <div className="brand-content">
                    <div className="brand-header">
                        <div className="brand-logo-box">C</div>
                        <span className="brand-logo-text">Controllo</span>
                    </div>

                    <div className="brand-hero">
                        <span className="brand-badge">Novo cadastro</span>
                        <h1>Crie sua conta no Controllo</h1>
                        <p>Preencha seus dados. Depois do envio, o administrador analisa e libera o seu acesso.</p>
                    </div>

                    <div className="brand-features">
                        <div className="feature-item">
                            <div className="feature-icon"><IoTimeOutline /></div>
                            <div>
                                <strong>Aprovação do administrador</strong>
                                <p>Você poderá entrar assim que o cadastro for aprovado.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="brand-footer">
                    <span>Controllo &copy; 2026</span>
                </div>
            </div>

            <div className="setup-form-panel">
                <div className="form-container">
                    {enviado ? (
                        <div className="cadastro-sucesso">
                            <IoCheckmarkCircleOutline className="cadastro-sucesso-icone" />
                            <h2>Cadastro enviado!</h2>
                            <p>Aguarde a aprovação do administrador.</p>
                            <button type="button" className="setup-btn-primary" onClick={onVoltar}>
                                <span>Voltar ao login</span>
                                <IoArrowForwardOutline />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="form-header-row">
                                <div className="form-titles">
                                    <h2>Criar conta</h2>
                                    <p>Informe seus dados para solicitar acesso.</p>
                                </div>

                                <div className="setup-avatar-compact">
                                    <label htmlFor="cadastroFoto" className="avatar-label" title="Adicionar foto (opcional)">
                                        <div className={`avatar-circle ${previewFoto ? 'has-image' : ''}`}>
                                            {previewFoto ? (
                                                <img src={previewFoto} alt="Prévia" />
                                            ) : (
                                                <IoPersonOutline />
                                            )}
                                            <div className="avatar-badge"><IoCameraOutline /></div>
                                        </div>
                                    </label>
                                    <input
                                        type="file"
                                        id="cadastroFoto"
                                        accept="image/*"
                                        className="setup-d-none"
                                        onChange={handleMudarFoto}
                                    />
                                </div>
                            </div>

                            {erro.length > 0 && (
                                <div className="setup-alert-error" role="alert">
                                    <IoAlertCircleOutline className="alert-icon" />
                                    <div className="alert-content">
                                        {erro.map((msg, i) => <span key={i}>{msg}</span>)}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate className="setup-form">
                                <div className="setup-input-group">
                                    <label className="setup-input-label">
                                        Nome completo <span className="required-star">*</span>
                                    </label>
                                    <div className={`setup-input-wrapper ${invalido('nome')}`}>
                                        <IoPersonOutline className="field-icon" />
                                        <input
                                            type="text"
                                            className="setup-input-control"
                                            placeholder="Ex: João Silva de Oliveira"
                                            value={form.nome}
                                            onChange={(e) => atualizar('nome', e.target.value)}
                                            disabled={salvando}
                                        />
                                    </div>
                                </div>

                                <div className="setup-form-row">
                                    <div className="setup-input-group">
                                        <label className="setup-input-label">
                                            CPF <span className="required-star">*</span>
                                        </label>
                                        <div className={`setup-input-wrapper ${invalido('cpf')}`}>
                                            <IoCardOutline className="field-icon" />
                                            <input
                                                type="text"
                                                className="setup-input-control"
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                value={form.cpf}
                                                onChange={(e) => atualizar('cpf', e.target.value)}
                                                disabled={salvando}
                                            />
                                        </div>
                                    </div>

                                    <div className="setup-input-group">
                                        <label className="setup-input-label">
                                            E-mail <span className="required-star">*</span>
                                        </label>
                                        <div className={`setup-input-wrapper ${invalido('email')}`}>
                                            <IoMailOutline className="field-icon" />
                                            <input
                                                type="email"
                                                className="setup-input-control"
                                                placeholder="voce@exemplo.com"
                                                value={form.email}
                                                onChange={(e) => atualizar('email', e.target.value)}
                                                disabled={salvando}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="setup-form-row">
                                    <div className="setup-input-group">
                                        <label className="setup-input-label">
                                            Senha <span className="required-star">*</span>
                                        </label>
                                        <div className={`setup-input-wrapper ${invalido('senha')}`}>
                                            <IoLockClosedOutline className="field-icon" />
                                            <input
                                                type="password"
                                                className="setup-input-control"
                                                placeholder="Mínimo 6 caracteres"
                                                value={form.senha}
                                                onChange={(e) => atualizar('senha', e.target.value)}
                                                disabled={salvando}
                                            />
                                        </div>
                                    </div>

                                    <div className="setup-input-group">
                                        <label className="setup-input-label">
                                            Confirmar senha <span className="required-star">*</span>
                                        </label>
                                        <div className={`setup-input-wrapper ${invalido('confirmarSenha')}`}>
                                            <IoShieldCheckmarkOutline className="field-icon" />
                                            <input
                                                type="password"
                                                className="setup-input-control"
                                                placeholder="Repita a senha"
                                                value={form.confirmarSenha}
                                                onChange={(e) => atualizar('confirmarSenha', e.target.value)}
                                                disabled={salvando}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="setup-btn-primary" disabled={salvando}>
                                    {salvando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Enviar cadastro</span>
                                            <IoArrowForwardOutline />
                                        </>
                                    )}
                                </button>

                                <button type="button" className="cadastro-link-voltar" onClick={onVoltar} disabled={salvando}>
                                    Já tem conta? <strong>Entrar</strong>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
