import { logar } from "../../services/usuarios/usuario.api";
// 1. IMPORTAR A FUNÇÃO DO SEU NOVO STORAGE (Ajuste o caminho se necessário)
import { salvarUsuario } from "../../storage/usuario/dados.storage"; 

export default function criarCardLogin() {
    const card = document.createElement('div');
    card.className = 'card-login';

    card.innerHTML = `
    <h2>Controllo</h2>
    <span class="subtitle">Painel de gerenciamento corporativo</span>

    <form id="formLogin">
        <div style="margin-bottom: 16px;">
            <label class="form-label">Acesso ou E-mail</label>
            <input type="text" class="form-control" id="inputLogin" placeholder="exemplo@controllo.com" required>
        </div>

        <div style="margin-bottom: 24px;">
            <label class="form-label">Senha secreta</label>
            <input type="password" class="form-control" id="inputSenha" placeholder="••••••••" required>
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
        btnEntrar.innerText = 'Carregando...';

        try {
            const dados = await logar(inputLogin.value.trim(), inputSenha.value);

            // 2. MODIFICAÇÃO AQUI: Em vez de salvar picado, valida e salva tudo de vez
            if (dados && dados.token) {
                
                // Salva o objeto inteiro retornado pela API (que já contém o token, tipo_usuario, etc)
                salvarUsuario(dados);

                // Redireciona para a home
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
            btnEntrar.innerText = 'Entrar';
        }
    });

    return card;
}