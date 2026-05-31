export default function criarModalUsuario() {
    const overlay = document.createElement('div');
    overlay.id = 'modalUsuarioOverlay';
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h5 id="modalUsuarioTitulo">Novo Usuário</h5>
                <button class="modal-close" id="btnFecharModal" aria-label="Fechar">✕</button>
            </div>
            <form id="formUsuario" novalidate>
                <div class="modal-body">

                    <div class="form-group">
                        <label class="form-label" for="modalNome">Nome Completo</label>
                        <input type="text" id="modalNome" class="form-control" required>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                        <div class="form-group">
                            <label class="form-label" for="modalCpf">CPF</label>
                            <input type="text" id="modalCpf" class="form-control" placeholder="000.000.000-00">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="modalTipoUsuario">Perfil</label>
                            <select id="modalTipoUsuario" class="form-control">
                                <option value="administracao">Administração</option>
                                <option value="manutencao">Manutenção</option>
                                <option value="geral">Geral</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="modalEmail">E-mail</label>
                        <input type="email" id="modalEmail" class="form-control">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="modalSenha">Senha de Acesso</label>
                        <input type="password" id="modalSenha" class="form-control">
                        <small class="form-hint" id="helperModalSenha">Defina a senha inicial de acesso.</small>
                    </div>

                    <div id="modal-erro" class="alert-error" style="display:none"></div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-modal-cancel" id="btnCancelarModal">Cancelar</button>
                    <button type="submit" class="btn-modal-save"   id="btnSalvarModal">Salvar Usuário</button>
                </div>
            </form>
        </div>
    `;

    let callbackSalvar = null;

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.fechar(); });
    overlay.querySelector('#btnFecharModal').addEventListener('click', () => overlay.fechar());
    overlay.querySelector('#btnCancelarModal').addEventListener('click', () => overlay.fechar());

    overlay.abrir = function (usuario = null, onSalvar = null) {
        callbackSalvar = onSalvar;

        const form = overlay.querySelector('#formUsuario');
        const titulo = overlay.querySelector('#modalUsuarioTitulo');
        const btnSalvar = overlay.querySelector('#btnSalvarModal');
        const inputSenha = overlay.querySelector('#modalSenha');
        const helperSenha = overlay.querySelector('#helperModalSenha');
        const erroBox = overlay.querySelector('#modal-erro');

        form.reset();
        erroBox.style.display = 'none';

        if (usuario) {
            titulo.textContent = 'Editar Usuário';
            btnSalvar.textContent = 'Salvar Alterações';

            overlay.querySelector('#modalNome').value = usuario.nome || '';
            overlay.querySelector('#modalCpf').value = usuario.cpf || '';
            overlay.querySelector('#modalEmail').value = usuario.email || '';
            overlay.querySelector('#modalTipoUsuario').value = usuario.tipo_usuario || 'geral';

            inputSenha.required = false;
            helperSenha.textContent = 'Deixe em branco para manter a senha atual.';
        } else {
            titulo.textContent = 'Novo Usuário';
            btnSalvar.textContent = 'Salvar Usuário';
            inputSenha.required = true;
            helperSenha.textContent = 'Defina a senha inicial de acesso.';
        }

        overlay.dataset.usuarioId = usuario?.id_usuario ?? '';

        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        setTimeout(() => overlay.querySelector('#modalNome').focus(), 100);
    };

    overlay.fechar = function () {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
        callbackSalvar = null;
    };

    overlay.querySelector('#formUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        const erroBox = overlay.querySelector('#modal-erro');
        erroBox.style.display = 'none';

        const cpf = overlay.querySelector('#modalCpf').value.trim();
        const email = overlay.querySelector('#modalEmail').value.trim();

        if (!cpf && !email) {
            erroBox.textContent = 'Informe pelo menos o CPF ou o E-mail.';
            erroBox.style.display = 'block';
            return;
        }

        const payload = {
            id: overlay.dataset.usuarioId || null,
            nome: overlay.querySelector('#modalNome').value.trim(),
            cpf,
            email,
            tipo_usuario: overlay.querySelector('#modalTipoUsuario').value,
            senha: overlay.querySelector('#modalSenha').value,
        };

        if (typeof callbackSalvar === 'function') await callbackSalvar(payload);
    });

    return overlay;
}
