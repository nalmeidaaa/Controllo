import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_REQUISICOES = "@controllo:requisicoes";

const STATUS_CONCLUIDO = "Ok";

export async function listarRequisicoes() {
    const dados = await AsyncStorage.getItem(CHAVE_REQUISICOES);
    return dados ? JSON.parse(dados) : [];
}

async function salvarLista(lista) {
    await AsyncStorage.setItem(CHAVE_REQUISICOES, JSON.stringify(lista));
}

export async function criarRequisicao({
    idPatrimonio,
    nomePatrimonio,
    numeroPatrimonio,
    idSala,
    nomeSala,
    statusAnterior,
    statusNovo,
    descricao,
}) {
    const lista = await listarRequisicoes();

    const novaRequisicao = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        idPatrimonio,
        nomePatrimonio,
        numeroPatrimonio: numeroPatrimonio || null,
        idSala: idSala || null,
        nomeSala: nomeSala || null,
        statusAnterior: statusAnterior || null,
        statusNovo,
        descricao: (descricao || "").trim(),
        criadoEm: new Date().toISOString(),
        concluida: statusNovo === STATUS_CONCLUIDO,
        concluidoEm: statusNovo === STATUS_CONCLUIDO ? new Date().toISOString() : null,
    };

    const listaAtualizada = [novaRequisicao, ...lista];
    await salvarLista(listaAtualizada);

    return novaRequisicao;
}

// Sincroniza o status "concluída" das requisições locais com o status
// atual do patrimônio vindo da API (caso tenha sido resolvido por outra pessoa)
export async function sincronizarComPatrimonios(patrimonios = []) {
    const lista = await listarRequisicoes();

    if (lista.length === 0) return lista;

    const statusPorPatrimonio = new Map(
        patrimonios.map((p) => [String(p.id_patrimonio), p.status])
    );

    let alterou = false;

    const listaAtualizada = lista.map((requisicao) => {
        const statusAtual = statusPorPatrimonio.get(String(requisicao.idPatrimonio));

        if (!statusAtual) return requisicao;

        const concluidaAgora = statusAtual === STATUS_CONCLUIDO;

        if (concluidaAgora !== requisicao.concluida) {
            alterou = true;

            return {
                ...requisicao,
                concluida: concluidaAgora,
                concluidoEm: concluidaAgora
                    ? requisicao.concluidoEm || new Date().toISOString()
                    : null,
            };
        }

        return requisicao;
    });

    if (alterou) {
        await salvarLista(listaAtualizada);
    }

    return listaAtualizada;
}

export async function obterUltimaAtualizacao() {
    const lista = await listarRequisicoes();
    if (lista.length === 0) return null;

    return [...lista].sort(
        (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)
    )[0];
}