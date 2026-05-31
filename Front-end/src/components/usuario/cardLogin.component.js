import { logar } from "../../services/usuarios/usuario.api";
import { salvarUsuario } from "../../storage/usuario/dados.storage";

export default function criarCardLogin() {
    const card = document.createElement('div');
    card.className = 'card-login';

    card.innerHTML = `
    <div class="card-login-logo">
        <div class="logo-mark"><span>C</span></div>
        <span class="logo-name">Controllo</span>
    </div>

    <h2>Boas-vindas</h2>
    <span class="subtitle">Acesse o painel de gerenciamento</span>

    <form id="formLogin">
        <div class="form-group">
            <label class="form-label">Acesso ou E-mail</label>
            <input type="text" class="form-control" id="inputLogin" placeholder="exemplo@controllo.com" required autocomplete="username">
        </div>

        <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" class="form-control" id="inputSenha" placeholder="••••••••" required autocomplete="current-password">
        </div>

        <div id="mensagemErro" class="alert-error d-none"></div>

        <button type="submit" class="btn-submit" id="btnEntrar">
            Entrar no Painel
        </button>
    </form>
`;

    const form = card.querySelector('#formLogin');
    const inputLogin = card.querySelector('#inputLogin');
    const inputSenha = card.querySelector('#inputSenha');
    const mensagemErro = card.querySelector('#mensagemErro');
    const btnEntrar = card.querySelector('#btnEntrar');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        mensagemErro.classList.add('d-none');
        btnEntrar.disabled = true;
        btnEntrar.innerText = 'Entrando…';

        try {
            const dados = await logar(inputLogin.value.trim(), inputSenha.value);

            if (dados && dados.token) {
                salvarUsuario(dados);
                window.location.href = '/';
            } else {
                throw new Error('Resposta inválida do servidor.');
            }
        } catch (error) {
            let textoErro = 'Não foi possível conectar ao servidor.';
            if (error.response?.data?.message) {
                textoErro = error.response.data.message;
            } else if (error.message) {
                textoErro = error.message;
            }

            mensagemErro.innerText = textoErro;
            mensagemErro.classList.remove('d-none');

            btnEntrar.disabled = false;
            btnEntrar.innerText = 'Entrar no Painel';
        }
    });

    return card;
}
