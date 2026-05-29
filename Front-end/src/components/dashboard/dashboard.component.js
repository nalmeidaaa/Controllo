import { obterUsuarioAtual, deslogarUsuario } from "../../storage/usuario/dados.storage.js";
import { buscarUsuarios } from "../../services/usuarios/usuario.api.js";

export default function criarDashboard() {
    const painel = document.createElement('div');
    painel.className = 'dashboard-container p-4'; 

    const usuario = obterUsuarioAtual();

    // 💡 DIRETRIZ DE OURO: Ajuste os campos abaixo (usuario.nome, usuario.email, etc.) 
    // conforme os nomes exatos que o seu Back-end envia no JSON de login!
    painel.innerHTML = `
        <div class="dashboard-header mb-4">
            <div class="welcome-box">
                <h1>Painel de Controle</h1>
                <span class="subtitle">Bem-vindo de volta, <strong>${usuario?.nome || usuario?.name || 'Usuário'}</strong>!</span>
            </div>
        </div>

        <div class="dashboard-grid mb-4">
            <div class="card-info">
                <div class="card-info-header">
                    <h3>Meu Perfil</h3>
                </div>
                <div class="card-info-body">
                    <p><strong>E-mail:</strong> <span>${usuario?.email || 'Não informado'}</span></p>
                    <p><strong>Nível de Acesso:</strong> <span class="badge-access">${usuario?.tipo_usuario || usuario?.role || 'geral'}</span></p>
                </div>
            </div>
        </div>

        <div class="card-lista">
            <div class="card-lista-header d-flex justify-content-between align-items-center mb-3">
                <h3>Usuários Cadastrados</h3>
            </div>
            <div id="listaUsuariosContainer">
                <div class="loading-spinner">Carregando usuários do sistema...</div>
            </div>
        </div>
    `;

    const listaContainer = painel.querySelector('#listaUsuariosContainer');

    // 2. Busca assíncrona dos dados da API
    async function carregarDadosDoServidor() {
        try {
            // Pegamos o token dinamicamente do objeto do usuário salvo
            const token = usuario?.token;
            if (!token) throw new Error("Sessão expirada. Faça login novamente.");

            const listaDeUsuarios = (await buscarUsuarios(usuario?.token)).result;

            // Verificamos se a lista veio preenchida
            if (listaDeUsuarios && listaDeUsuarios.length > 0) {
                let tabelaHTML = `
                    <div class="table-responsive">
                        <table class="table-custom">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Nível de Acesso</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                listaDeUsuarios.forEach(u => {
                    // Trata os campos caso venham em inglês do banco (name, email, role)
                    const nomeItem = u.nome || u.name || 'Sem nome';
                    const emailItem = u.email || 'Sem e-mail';
                    const nivelItem = u.tipo_usuario || u.role || 'geral';

                    tabelaHTML += `
                        <tr>
                            <td><strong>${nomeItem}</strong></td>
                            <td>${emailItem}</td>
                            <td><span class="badge-${nivelItem}">${nivelItem}</span></td>
                        </tr>
                    `;
                });

                tabelaHTML += `</tbody></table></div>`;
                listaContainer.innerHTML = tabelaHTML;
            } else {
                // Se o array vier vazio [] do banco, mostra um aviso elegante
                listaContainer.innerHTML = `
                    <div class="empty-state">
                        <p class="text-muted">Nenhum outro usuário cadastrado no banco de dados.</p>
                    </div>
                `;
            }
        } catch (error) {
            // Se der erro de CORS, Token Inválido ou Queda de Servidor, avisa na tela
            listaContainer.innerHTML = `
                <div class="alert-error">
                    <strong>Não foi possível carregar os dados:</strong> ${error.message || 'Erro de conexão com o servidor.'}
                </div>
            `;
        }
    }

    // Executa a busca automática
    carregarDadosDoServidor();

    return painel;
}