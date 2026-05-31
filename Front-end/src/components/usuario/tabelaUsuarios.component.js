import { ITENS_POR_PAGINA, MAX_BOTOES } from '../../config/app.config.js';
import { obterUsuarioAtual } from '../../storage/usuario/dados.storage.js';

// ── Renderização da tabela ────────────────────────────────────────────────────

export function renderizarTabela(container, usuarios, opcoes = {}) {
    container.innerHTML = '';
    const { onEditar, onExcluir } = opcoes;

    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = `
            <div class="tabela-card">
                <div class="tabela-empty">
                    <div class="tabela-empty-icon">👤</div>
                    <p>Nenhum usuário encontrado.</p>
                </div>
            </div>
        `;
        return;
    }

    const tabela = criarTabelaUsuarios(usuarios, { onEditar, onExcluir });
    container.appendChild(tabela);
}

export function criarTabelaUsuarios(listaUsuarios = [], opcoes = {}) {
    const { onEditar, onExcluir } = opcoes;

    const usuarioAtual = obterUsuarioAtual();

    const wrapper = document.createElement('div');
    wrapper.className = 'tabela-card';

    wrapper.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Usuário</th>
                    <th>CPF</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th style="text-align:right">Ações</th>
                </tr>
            </thead>
            <tbody>
                ${listaUsuarios.map(u => criarLinhaUsuario(u, usuarioAtual)).join('')}
            </tbody>
        </table>
    `;

    configurarEventosTabela(wrapper, listaUsuarios, { onEditar, onExcluir });
    return wrapper;
}

function criarLinhaUsuario(usuario, usuarioAtual) {
    const nome = usuario.nome || '—';
    const cpf = usuario.cpf || '—';
    const email = usuario.email || '—';
    const id = usuario.id_usuario;
    const badge = getBadge(usuario.tipo_usuario);
    const initials = buscarInicial(nome);

    // Usuário logado: botão excluir desabilitado + tooltip explicativo
    const ehVoce = String(usuarioAtual?.id_usuario) === String(id);
    const excluirBtn = ehVoce
        ? `<button class="btn-action btn-action-danger" disabled title="Você não pode excluir sua própria conta" style="opacity:.35;cursor:not-allowed">Excluir</button>`
        : `<button class="btn-action btn-action-danger btn-excluir-usuario" data-id="${id}">Excluir</button>`;

    return `
        <tr ${ehVoce ? 'class="linha-usuario-ativo"' : ''}>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div class="user-avatar">${initials}</div>
                    <div>
                        <span class="user-name">${nome}</span>
                        ${ehVoce ? '<span class="badge-voce">você</span>' : ''}
                    </div>
                </div>
            </td>
            <td><span class="user-cpf">${cpf}</span></td>
            <td><span class="user-email">${email}</span></td>
            <td><span class="badge-perfil ${badge.cls}">${badge.texto}</span></td>
            <td style="text-align:right">
                <button class="btn-action btn-editar-usuario" data-id="${id}" style="margin-right:6px">Editar</button>
                ${excluirBtn}
            </td>
        </tr>
    `;
}

function configurarEventosTabela(container, listaUsuarios, opcoes = {}) {
    const { onEditar, onExcluir } = opcoes;
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    tbody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');
        if (!id) return;

        if (target.classList.contains('btn-editar-usuario')) {
            const usuario = listaUsuarios.find(u => String(u.id_usuario) === String(id));
            if (typeof onEditar === 'function') onEditar(usuario);
        }

        if (target.classList.contains('btn-excluir-usuario')) {
            if (typeof onExcluir === 'function') onExcluir(id);
        }
    });
}

// ── Paginação (mesmo padrão do projeto) ──────────────────────────────────────

export function criarPaginacao({
    totalItens,
    itensPorPagina = ITENS_POR_PAGINA,
    paginaAtual,
    onPageChange
}) {
    const nav = document.createElement('nav');
    nav.className = 'paginacao-nav';

    if (totalItens <= 0) return nav;

    const totalPaginas = Math.ceil(totalItens / itensPorPagina);

    const ul = document.createElement('ul');
    ul.className = 'paginacao-lista';
    nav.appendChild(ul);

    ul.appendChild(criarAnterior(paginaAtual, onPageChange));

    let inicio = Math.max(1, paginaAtual - Math.floor(MAX_BOTOES / 2));
    let fim = inicio + MAX_BOTOES - 1;

    if (fim > totalPaginas) {
        fim = totalPaginas;
        inicio = Math.max(1, fim - MAX_BOTOES + 1);
    }

    if (inicio > 1) {
        ul.appendChild(criarItem(1, paginaAtual, onPageChange));
        if (inicio > 2) ul.appendChild(criarEllipsis());
    }

    for (let i = inicio; i <= fim; i++) {
        ul.appendChild(criarItem(i, paginaAtual, onPageChange));
    }

    if (fim < totalPaginas) {
        if (fim < totalPaginas - 1) ul.appendChild(criarEllipsis());
        ul.appendChild(criarItem(totalPaginas, paginaAtual, onPageChange));
    }

    ul.appendChild(criarProximo(paginaAtual, totalPaginas, onPageChange));

    return nav;
}

function criarItem(numero, paginaAtual, onPageChange) {
    const li = document.createElement('li');
    li.className = `paginacao-item ${numero === paginaAtual ? 'ativo' : ''}`;

    const btn = document.createElement('button');
    btn.className = 'paginacao-btn';
    btn.textContent = numero;
    btn.onclick = () => onPageChange(numero);

    li.appendChild(btn);
    return li;
}

function criarAnterior(paginaAtual, onPageChange) {
    const li = document.createElement('li');
    li.className = `paginacao-item ${paginaAtual === 1 ? 'desabilitado' : ''}`;

    const btn = document.createElement('button');
    btn.className = 'paginacao-btn';
    btn.innerHTML = '&laquo;';
    btn.onclick = () => { if (paginaAtual > 1) onPageChange(paginaAtual - 1); };

    li.appendChild(btn);
    return li;
}

function criarProximo(paginaAtual, totalPaginas, onPageChange) {
    const li = document.createElement('li');
    li.className = `paginacao-item ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`;

    const btn = document.createElement('button');
    btn.className = 'paginacao-btn';
    btn.innerHTML = '&raquo;';
    btn.onclick = () => { if (paginaAtual < totalPaginas) onPageChange(paginaAtual + 1); };

    li.appendChild(btn);
    return li;
}

function criarEllipsis() {
    const li = document.createElement('li');
    li.className = 'paginacao-item desabilitado';

    const span = document.createElement('span');
    span.className = 'paginacao-btn';
    span.textContent = '…';

    li.appendChild(span);
    return li;
}

// ── Barra de pesquisa + filtros ───────────────────────────────────────────────

export function criarBarraFiltros(opcoes = {}) {
    const { onBusca, onFiltro } = opcoes;

    const barra = document.createElement('div');
    barra.className = 'filtros-barra';

    barra.innerHTML = `
        <div class="filtros-busca">
            <span class="filtros-busca-icon">🔍</span>
            <input
                type="text"
                class="filtros-input"
                id="inputBusca"
                placeholder="Buscar por nome, CPF ou e-mail…"
                autocomplete="off"
            >
        </div>

        <div class="filtros-chips">
            <button class="filtro-chip ativo" data-filtro="todos">Todos</button>
            <button class="filtro-chip" data-filtro="administracao">Admin</button>
            <button class="filtro-chip" data-filtro="manutencao">Manutenção</button>
            <button class="filtro-chip" data-filtro="geral">Geral</button>
        </div>
    `;

    // Debounce na busca
    const inputBusca = barra.querySelector('#inputBusca');
    let debounceTimer;
    inputBusca.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (typeof onBusca === 'function') onBusca(inputBusca.value.trim());
        }, 300);
    });

    // Chips de perfil
    const chips = barra.querySelectorAll('.filtro-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('ativo'));
            chip.classList.add('ativo');
            if (typeof onFiltro === 'function') onFiltro(chip.dataset.filtro);
        });
    });

    return barra;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBadge(tipo) {
    const t = (tipo || '').toLowerCase();
    if (t === 'administração' || t === 'administracao')
        return { cls: 'badge-admin', texto: 'Admin' };
    if (t === 'manutenção' || t === 'manutencao')
        return { cls: 'badge-manutencao', texto: 'Manutenção' };
    return { cls: 'badge-geral', texto: 'Geral' };
}

function buscarInicial(nome) {
    if (!nome || nome === '—') return '?';
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
