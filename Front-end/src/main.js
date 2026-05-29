import { estaLogado } from "../src/storage/usuario/dados.storage.js"; // Usando o seu caminho do storage
import { loginPage } from "./pages/usuario/login.page.js";
import { dashboardPage } from "./pages/dashboard/dashboard.page.js";

const appContainer = document.getElementById('app');
appContainer.innerHTML = ''; // Limpa a tela inicial de forma global

if (!estaLogado()) {
    // Se não estiver logado, a página de login assume o controle do appContainer
    loginPage(appContainer);
} else {
    // Se estiver logado, a página do dashboard assume o controle do appContainer
    dashboardPage(appContainer); 
}