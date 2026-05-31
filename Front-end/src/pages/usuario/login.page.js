import criarColuna from "../../components/shared/coluna-bootstrap.component";
import criarCardLogin from "../../components/usuario/cardLogin.component";

export function loginPage() {
    const app = document.querySelector('#app');

    if (!app) {
        console.error("Erro: A div com id '#app' não foi encontrada no HTML.");
        return;
    }

    app.innerHTML = `
        <div class="d-flex justify-content-center align-items-center style-container-login" style="min-height: 100vh; width: 100vw; position: absolute; top: 0; left: 0;">
            <div id="container-login" style="width: 100%; display: flex; justify-content: center;"></div>
        </div>
    `;

    const containerLogin = document.querySelector('#container-login');

    const coluna = criarColuna();
    coluna.className = 'w-100 d-flex justify-content-center';

    const cardLogin = criarCardLogin();

    coluna.appendChild(cardLogin);
    containerLogin.appendChild(coluna);
}