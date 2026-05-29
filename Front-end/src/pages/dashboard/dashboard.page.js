import criarNavbar from "../../components/layout/navbar.component.js";
import criarDashboard from "../../components/dashboard/dashboard.component.js";

export function dashboardPage(container) {
    container.innerHTML = ''; // Limpa o container principal (#app)

    // 1. Apenas chama a função. Ela mesma vai achar o <header> da página e se injetar lá!
    criarNavbar(); 
    
    // 2. Cria o Dashboard (este sim retorna um elemento Node válido)
    const dashboard = criarDashboard();
    
    // 3. Injeta apenas o dashboard no container principal
    container.appendChild(dashboard); 
}