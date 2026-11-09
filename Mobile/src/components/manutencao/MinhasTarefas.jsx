import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Wrench } from "lucide-react-native";
import { useTema } from "../../theme/tema.jsx";
import { obterToken, obterUsuarioAtual } from "../../storage/usuario/dados.storage.js";
import {
    listarRequisicoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoManutencaoService.js";
import BadgePrioridade from "./BadgePrioridade.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoLinha } from "../../animations/Esqueleto.jsx";
import EstadoVazio from "../shared/EstadoVazio.jsx";

const LIMITE_BUSCA = 50;
const MAX_EXIBIDAS = 3;

// Id do responsável pela requisição (o nome do campo vem da API)
function idDoResponsavel(requisicao) {
    const id = requisicao?.responsavel?.id_usuario ?? requisicao?.responsavel?.id;
    return id == null ? null : String(id);
}

function formatarData(isoString) {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/*
 * Tarefas em andamento assumidas pelo próprio usuário.
 * Visual igual ao mural de atualizações do Geral.
 */
export default function MinhasTarefas() {
    const navigation = useNavigation();
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    const [tarefas, setTarefas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            (async () => {
                try {
                    setCarregando(true);
                    setErro(false);

                    const token = await obterToken();
                    const usuario = await obterUsuarioAtual();
                    const resposta = await listarRequisicoes(token, {
                        pagina: 1,
                        limite: LIMITE_BUSCA,
                        status: "Em andamento",
                    });

                    const meuId = usuario?.id == null ? null : String(usuario.id);
                    const minhas = (resposta?.result ?? []).filter(
                        (r) => meuId !== null && idDoResponsavel(r) === meuId
                    );

                    if (ativo) setTarefas(minhas);
                } catch (error) {
                    console.error("Erro ao carregar minhas tarefas", error);
                    if (!ativo) return;

                    if (ehErroDeSessao(error)) {
                        encerrarSessaoExpirada(navigation);
                        return;
                    }
                    setErro(true);
                } finally {
                    if (ativo) setCarregando(false);
                }
            })();

            return () => {
                ativo = false;
            };
        }, [navigation])
    );

    if (carregando) {
        return (
            <EntradaAnimada style={styles.container}>
                <Text style={styles.titulo}>Minhas tarefas</Text>
                <EsqueletoCartaoLinha quantidade={2} />
            </EntradaAnimada>
        );
    }

    if (erro) {
        return (
            <EntradaAnimada style={styles.container}>
                <Text style={styles.titulo}>Minhas tarefas</Text>
                <EstadoVazio compacto erro titulo="Não foi possível carregar suas tarefas" />
            </EntradaAnimada>
        );
    }

    if (!tarefas.length) {
        return (
            <EntradaAnimada style={styles.container}>
                <Text style={styles.titulo}>Minhas tarefas</Text>
                <EstadoVazio
                    compacto
                    Icone={Wrench}
                    titulo="Nenhuma tarefa assumida"
                    descricao="As requisições que você assumir aparecerão aqui."
                />
            </EntradaAnimada>
        );
    }

    return (
        <EntradaAnimada style={styles.container}>
            <Text style={styles.titulo}>Minhas tarefas</Text>

            <View style={styles.lista}>
                {tarefas.slice(0, MAX_EXIBIDAS).map((item, index) => (
                    <EntradaAnimada key={String(item.id_requisicao)} atraso={index * 90} distancia={14}>
                        <PressionavelAnimado
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate("ManutencaoRequisicaoDetalheScreen", {
                                    idRequisicao: item.id_requisicao,
                                })
                            }
                            accessibilityLabel={`Abrir tarefa ${item.patrimonio?.nome || ""}`}
                        >
                            <View style={styles.iconWrapper}>
                                <Wrench color={cores.marca} size={22} />
                            </View>

                            <View style={styles.textWrapper}>
                                <Text style={styles.nome} numberOfLines={1}>
                                    {item.patrimonio?.nome}
                                    {item.patrimonio?.numero_patrimonio
                                        ? ` • Nº ${item.patrimonio.numero_patrimonio}`
                                        : ""}
                                </Text>

                                {!!item.sala?.descricao && (
                                    <Text style={styles.subtitulo}>{item.sala.descricao}</Text>
                                )}

                                {!!item.descricao && (
                                    <Text style={styles.descricao} numberOfLines={2}>
                                        {item.descricao}
                                    </Text>
                                )}

                                <View style={styles.rodape}>
                                    <BadgePrioridade prioridade={item.prioridade} />
                                    <Text style={styles.data}>
                                        Aberta em {formatarData(item.abertura)}
                                    </Text>
                                </View>
                            </View>
                        </PressionavelAnimado>
                    </EntradaAnimada>
                ))}
            </View>
        </EntradaAnimada>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        container: {
            backgroundColor: c.cardMural,
            borderRadius: 20,
            padding: 16,
            marginVertical: 12,
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
        },

        titulo: {
            color: c.texto,
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 14,
            paddingLeft: 4,
        },

        lista: {
            gap: 12,
        },

        card: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: c.superficie,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: c.bordaMural,
        },

        iconWrapper: {
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: c.marcaSuave,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
        },

        textWrapper: {
            flex: 1,
        },

        nome: {
            color: c.texto,
            fontSize: 15,
            fontWeight: "700",
        },

        subtitulo: {
            color: c.textoSecundario,
            fontSize: 13,
            marginTop: 2,
        },

        descricao: {
            color: c.textoMural,
            fontSize: 12,
            marginTop: 4,
        },

        rodape: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
        },

        data: {
            color: c.textoDiscreto,
            fontSize: 11,
        },
    });
