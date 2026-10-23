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
    IoPulseOutline,
    IoCheckmarkCircleOutline,
    IoEllipseOutline,
    IoEyeOutline,
    IoEyeOffOutline
} from 'react-icons/io5';
import { criarUsuario } from '../../services/usuarioService.js';
import './SetupPage.css';

const ESTADO_INICIAL = {
    nome: '',
    cpf: '',
    email: '',
    tipo_usuario: 'administracao',
    senha: '',
    confirmarSenha: '',
    imagem: null
};

// Função para validar o CPF (matematicamente)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Função para mascarar o CPF (000.000.000-00)
function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') .replace(/(-\d{2})\d+$/, '$1');
}

// Objeto de checagem individual para os requisitos da senha
function checarRequisitosSenha(senha) {
    return {
        tamanho: senha.length >= 8,
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /\d/.test(senha),
        especial: /[@$!%*?&]/.test(senha)
    };
}

export default function SetupPage({ onSetupConcluido }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [previewFoto, setPreviewFoto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState([]);
    const [camposErro, setCamposErro] = useState([]);

    // Estados para controlar a visibilidade das senhas
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const requisitosSenha = checarRequisitosSenha(form.senha);
    const senhaValida = Object.values(requisitosSenha).every(Boolean);

    function atualizar(campo, valor) {
        const valorTratado = campo === 'cpf' ? mascaraCPF(valor) : valor;

        setForm((f) => ({
            ...f,
            [campo]: valorTratado
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
        const confirmarSenha = form.confirmarSenha.trim();

        const erros = [];
        const mensagensErro = [];

        if (!nome) {
            erros.push('nome');
            mensagensErro.push('Informe o nome completo.');
        }

        if (!cpf) {
            erros.push('cpf');
            mensagensErro.push('Informe o CPF.');
        } else if (!validarCPF(cpf)) {
            erros.push('cpf');
            mensagensErro.push('O CPF informado é inválido.');
        }

        if (!email) {
            erros.push('email');
            mensagensErro.push('Informe o E-mail.');
        }

        if (!senha) {
            erros.push('senha');
            mensagensErro.push('Informe a senha de acesso.');
        } else if (!senhaValida) {
            erros.push('senha');
            mensagensErro.push('A senha não atende a todos os requisitos de segurança.');
        }

        if (senha && senha !== confirmarSenha) {
            erros.push('confirmarSenha');
            mensagensErro.push('As senhas não coincidem.');
        }

        if (erros.length > 0) {
            setErro(mensagensErro);
            setCamposErro(erros);
            return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('tipo_usuario', form.tipo_usuario);
        formData.append('senha', senha);

        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            setSalvando(true);

            await criarUsuario(null, formData);

            if (onSetupConcluido) {
                onSetupConcluido();
            }

        } catch (error) {
            const resposta = error?.response?.data;
            const mensagem = resposta?.message || error?.message || 'Erro ao realizar o cadastro inicial.';

            setErro([mensagem]);

            if (resposta?.campo) {
                setCamposErro([resposta.campo]);
            }
        } finally {
            setSalvando(false);
        }
    }

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
                        <span className="brand-badge">Setup de Sistema</span>
                        <h1>Bem-vindo ao Controllo</h1>
                        <p>Configure a conta do administrador inicial para liberar o acesso a toda a plataforma e gerenciar as operações.</p>
                    </div>

                    <div className="brand-features">
                        <div className="feature-item">
                            <div className="feature-icon"><IoShieldCheckmarkOutline /></div>
                            <div>
                                <strong>Acesso Master</strong>
                                <p>Gerenciamento total de perfis e permissões.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon"><IoPulseOutline /></div>
                            <div>
                                <strong>Painel em Tempo Real</strong>
                                <p>Monitoramento unificado em uma única interface.</p>
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
                    
                    <div className="form-header-row">
                        <div className="form-titles">
                            <h2>Primeiro Acesso</h2>
                            <p>Cadastre o primeiro administrador para inicializar.</p>
                        </div>

                        <div className="setup-avatar-compact">
                            <label htmlFor="setupFoto" className="avatar-label" title="Alterar foto">
                                <div className={`avatar-circle ${previewFoto ? 'has-image' : ''}`}>
                                    {previewFoto ? (
                                        <img src={previewFoto} alt="Preview" />
                                    ) : (
                                        <IoPersonOutline />
                                    )}
                                    <div className="avatar-badge">
                                        <IoCameraOutline />
                                    </div>
                                </div>
                            </label>
                            <input
                                type="file"
                                id="setupFoto"
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
                                {erro.map((msg, index) => (
                                    <span key={index}>{msg}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="setup-form">
                        
                        <div className="setup-input-group">
                            <label className="setup-input-label">
                                Nome Completo <span className="required-star">*</span>
                            </label>
                            <div className={`setup-input-wrapper ${camposErro.includes('nome') ? 'is-invalid' : ''}`}>
                                <IoPersonOutline className="field-icon" />
                                <input
                                    type="text"
                                    className="setup-input-control"
                                    placeholder="Ex: João Silva de Oliveira"
                                    value={form.nome}
                                    onChange={(e) => atualizar('nome', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="setup-form-row">
                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    CPF <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('cpf') ? 'is-invalid' : ''}`}>
                                    <IoCardOutline className="field-icon" />
                                    <input
                                        type="text"
                                        className="setup-input-control"
                                        placeholder="000.000.000-00"
                                        value={form.cpf}
                                        onChange={(e) => atualizar('cpf', e.target.value)}
                                        maxLength={14}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    E-mail Corporativo <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('email') ? 'is-invalid' : ''}`}>
                                    <IoMailOutline className="field-icon" />
                                    <input
                                        type="email"
                                        className="setup-input-control"
                                        placeholder="admin@controllo.com"
                                        value={form.email}
                                        onChange={(e) => atualizar('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="setup-form-row">
                            {/* Campo Senha */}
                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    Senha <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('senha') ? 'is-invalid' : ''}`}>
                                    <IoLockClosedOutline className="field-icon" />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        className="setup-input-control"
                                        placeholder="••••••••••••"
                                        value={form.senha}
                                        onChange={(e) => atualizar('senha', e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', color: '#6c757d', display: 'flex', alignItems: 'center' }}
                                        title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                                    >
                                        {mostrarSenha ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
                                    </button>
                                </div>
                                
                                <div className="password-requirements mt-2" style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: requisitosSenha.tamanho ? '#198754' : '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {requisitosSenha.tamanho ? <IoCheckmarkCircleOutline /> : <IoEllipseOutline />} Mínimo de 8 caracteres
                                    </span>
                                    <span style={{ color: requisitosSenha.maiuscula ? '#198754' : '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {requisitosSenha.maiuscula ? <IoCheckmarkCircleOutline /> : <IoEllipseOutline />} Pelo menos uma letra maiúscula
                                    </span>
                                    <span style={{ color: requisitosSenha.minuscula ? '#198754' : '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {requisitosSenha.minuscula ? <IoCheckmarkCircleOutline /> : <IoEllipseOutline />} Pelo menos uma letra minúscula
                                    </span>
                                    <span style={{ color: requisitosSenha.numero ? '#198754' : '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {requisitosSenha.numero ? <IoCheckmarkCircleOutline /> : <IoEllipseOutline />} Pelo menos um número
                                    </span>
                                    <span style={{ color: requisitosSenha.especial ? '#198754' : '#6c757d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {requisitosSenha.especial ? <IoCheckmarkCircleOutline /> : <IoEllipseOutline />} Pelo menos um caractere especial (@$!%*?&)
                                    </span>
                                </div>
                            </div>

                            {/* Campo Confirmar Senha */}
                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    Confirmar Senha <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('confirmarSenha') ? 'is-invalid' : ''}`}>
                                    <IoShieldCheckmarkOutline className="field-icon" />
                                    <input
                                        type={mostrarConfirmarSenha ? 'text' : 'password'}
                                        className="setup-input-control"
                                        placeholder="••••••••••••"
                                        value={form.confirmarSenha}
                                        onChange={(e) => atualizar('confirmarSenha', e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', color: '#6c757d', display: 'flex', alignItems: 'center' }}
                                        title={mostrarConfirmarSenha ? "Ocultar senha" : "Ver senha"}
                                    >
                                        {mostrarConfirmarSenha ? <IoEyeOutline size={18} /> : <IoEyeOffOutline size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="setup-btn-primary" disabled={salvando}>
                            {salvando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    <span>Cadastrando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Finalizar Configuração</span>
                                    <IoArrowForwardOutline />
                                </>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}