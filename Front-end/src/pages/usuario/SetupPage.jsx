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
  IoPulseOutline 
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

export default function SetupPage({ onSetupConcluido }) {
    const [form, setForm] = useState(ESTADO_INICIAL);
    const [previewFoto, setPreviewFoto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState([]);
    const [camposErro, setCamposErro] = useState([]);

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
        }

        if (!email) {
            erros.push('email');
            mensagensErro.push('Informe o E-mail.');
        }

        if (!senha) {
            erros.push('senha');
            mensagensErro.push('Informe a senha de acesso.');
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

        // Cria o FormData exatamente igual ao ModalUsuario
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('tipo_usuario', form.tipo_usuario);
        formData.append('senha', senha);

        // Envia 'imagem' em vez de 'foto'
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
                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    Senha <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('senha') ? 'is-invalid' : ''}`}>
                                    <IoLockClosedOutline className="field-icon" />
                                    <input
                                        type="password"
                                        className="setup-input-control"
                                        placeholder="••••••••••••"
                                        value={form.senha}
                                        onChange={(e) => atualizar('senha', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="setup-input-group">
                                <label className="setup-input-label">
                                    Confirmar Senha <span className="required-star">*</span>
                                </label>
                                <div className={`setup-input-wrapper ${camposErro.includes('confirmarSenha') ? 'is-invalid' : ''}`}>
                                    <IoShieldCheckmarkOutline className="field-icon" />
                                    <input
                                        type="password"
                                        className="setup-input-control"
                                        placeholder="••••••••••••"
                                        value={form.confirmarSenha}
                                        onChange={(e) => atualizar('confirmarSenha', e.target.value)}
                                        required
                                    />
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