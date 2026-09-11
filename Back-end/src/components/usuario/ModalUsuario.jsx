import { useEffect, useState } from 'react';

// Função utilitária para aplicar a máscara 000.000.000-00
function formatarCPF(valor) {
  if (!valor) return '';
  return valor
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .slice(0, 11) // Limita a 11 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o primeiro ponto
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca o segundo ponto
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca o hífen
}

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
              cpf: formatarCPF(usuario.cpf || ''),
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

  // Limpa a URL temporária da memória para evitar Memory Leak quando a foto preview muda
  useEffect(() => {
    return () => {
      if (previewFoto && previewFoto.startsWith('blob:')) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

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
      // Libera a memória da URL anterior caso já fosse um Blob local
      if (previewFoto && previewFoto.startsWith('blob:')) {
        URL.revokeObjectURL(previewFoto);
      }

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

    const erros = [];
    const mensagensErro = [];

    // Validação do Nome
    if (!nome) {
      erros.push('nome');
      mensagensErro.push('Informe o nome completo.');
    }

    // Validação de CPF e E-mail
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

    // Validação de Senha em novos cadastros
    if (!senha && !editando) {
      erros.push('senha');
      mensagensErro.push('Informe a senha.');
    }

    if (erros.length > 0) {
      setErro(mensagensErro);
      setCamposErro(erros);
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf); // Se seu backend aceita com pontuação (000.000.000-00). Se aceitar apenas números, use: cpf.replace(/\D/g, '')
    formData.append('email', email);
    formData.append('tipo_usuario', form.tipo_usuario);
    formData.append('senha', senha);

    if (form.imagem instanceof File) {
      formData.append('imagem', form.imagem);
    }

    try {
      setSalvando(true);
      await onSalvar(formData);
    } catch (error) {
      const resposta = error?.response?.data;
      const mensagem = resposta?.message || 'Ocorreu um erro. Tente novamente.';

      setErro([mensagem]);

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
        if (e.target === e.currentTarget && !salvando) onFechar();
      }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h5>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h5>

          <button
            type="button"
            className="modal-close"
            aria-label="Fechar"
            onClick={onFechar}
            disabled={salvando}
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
            <div className="form-group foto-group">
              <div className="foto-preview-container">
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Preview"
                    className="foto-preview-img"
                  />
                ) : (
                  <div className="foto-placeholder">Sem foto</div>
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
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modalNome">
                Nome Completo
              </label>

              <input
                type="text"
                id="modalNome"
                className={`form-control ${
                  camposErro.includes('nome') ? 'campo-erro' : ''
                }`}
                required
                value={form.nome}
                onChange={(e) => atualizar('nome', e.target.value)}
                disabled={salvando}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="modalCpf">
                  CPF
                </label>

                <input
                  type="text"
                  id="modalCpf"
                  className={`form-control ${
                    camposErro.includes('cpf') ? 'campo-erro' : ''
                  }`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={form.cpf}
                  onChange={(e) => atualizar('cpf', formatarCPF(e.target.value))}
                  disabled={salvando}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modalTipoUsuario">
                  Perfil
                </label>

                <select
                  id="modalTipoUsuario"
                  className="form-control"
                  value={form.tipo_usuario}
                  onChange={(e) => atualizar('tipo_usuario', e.target.value)}
                  disabled={salvando}
                >
                  <option value="administracao">Administração</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modalEmail">
                E-mail
              </label>

              <input
                type="email"
                id="modalEmail"
                className={`form-control ${
                  camposErro.includes('email') ? 'campo-erro' : ''
                }`}
                value={form.email}
                onChange={(e) => atualizar('email', e.target.value)}
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modalSenha">
                Senha de Acesso
              </label>

              <input
                type="password"
                id="modalSenha"
                className={`form-control ${
                  camposErro.includes('senha') ? 'campo-erro' : ''
                }`}
                required={!editando}
                value={form.senha}
                onChange={(e) => atualizar('senha', e.target.value)}
                disabled={salvando}
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
              disabled={salvando}
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