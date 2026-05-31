import { estaLogado } from "./storage/usuario/dados.storage.js";
import { loginPage } from "./pages/usuario/login.page.js";
import { dashboardPage } from "./pages/dashboard/dashboard.page.js";
import { usuariosPage } from "./pages/usuario/usuarios.page.js";

const app = document.getElementById('app');
app.innerHTML = '';

// Funções de navegação centralizadas — passadas para navbar e componentes
const navegarPara = {
    dashboard: () => dashboardPage(app, navegarPara),
    usuarios: () => usuariosPage(app, navegarPara),
};

if (!estaLogado()) {
    loginPage(app);
} else {
    dashboardPage(app, navegarPara);
}
