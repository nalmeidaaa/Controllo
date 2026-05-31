import criarNavbar, { ativarItemMenu } from "../../components/layout/navbar.component.js";
import { criarPaginaInicial } from "../../components/dashboard/dashboard.component.js";

export function dashboardPage(container, navegarPara = {}) {
    container.innerHTML = '';

    criarNavbar(navegarPara);
    ativarItemMenu('dashboard');

    const dashboard = criarPaginaInicial(navegarPara);
    container.appendChild(dashboard);
}
