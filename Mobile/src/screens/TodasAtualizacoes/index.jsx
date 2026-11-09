import React, { useMemo, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CheckCircle2, Clock, Send, Bell, Search } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import { useTema } from "../../theme/tema.jsx";
import {
    buscarAtualizacoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoGeralService.js";
import CabecalhoTela from "../../components/shared/CabecalhoTela.jsx";
import EstadoVazio from "../../components/shared/EstadoVazio.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoLinha } from "../../animations/Esqueleto.jsx";

function formatarData(isoString) {
    if (!isoString) return "";

    return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function criarTipos(c) {
    return {
        Abertura: { titulo: "Requisição enviada", fundo: c.alerta.fundo, Icone: Send, cor: c.alerta.cor },
        Andamento: { titulo: "Requisição em andamento", fundo: c.marcaSuave, Icone: Clock, cor: c.marca },
        Finalizacao: { titulo: "Requisição concluída!", fundo: c.concluido.fundo, Icone: CheckCircle2, cor: c.concluido.cor },
    };
}

export default function TodasAtualizacoesScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const TIPOS = useMemo(() => criarTipos(cores), [cores]);
    const navigation = useNavigation();

    const [atualizacoes, setAtualizacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [renovando, setRenovando] = useState(false);
    const [erro, setErro] = useState(false);
    const [busca, setBusca] = useState("");
    const [buscaFocada, setBuscaFocada] = useState(false);
    // Animação de entrada só na primeira carga; ao voltar à tela os dados atualizam em silêncio
    const [entradaFeita, setEntradaFeita] = useState(false);
    const jaCarregou = useRef(false);

    const carregarDados = async (silencioso = false) => {
        try {
            if (!silencioso) setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await buscarAtualizacoes(token);

            setAtualizacoes(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao carregar todas as atualizações", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            setCarregando(false);
            setRenovando(false);
            if (!jaCarregou.current) {
                jaCarregou.current = true;
                // Dá tempo para a entrada da primeira carga terminar antes de liberar as próximas
                setTimeout(() => setEntradaFeita(true), 700);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Já carregou antes? Atualiza sem mostrar o esqueleto de novo
            carregarDados(jaCarregou.current);
        }, [])
    );

    const aoRecarregar = () => {
        setRenovando(true);
        carregarDados(true);
    };

    // Filtra por patrimônio, sala ou descrição da requisição
    const atualizacoesFiltradas = atualizacoes.filter((item) => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return true;

        const patrimonio = item.requisicao?.patrimonio?.nome?.toLowerCase() || "";
        const sala = item.requisicao?.sala?.descricao?.toLowerCase() || "";
        const descricao = (item.descricao || item.requisicao?.descricao || "").toLowerCase();

        return patrimonio.includes(termo) || sala.includes(termo) || descricao.includes(termo);
    });

    // Só os primeiros cards entram animados; os que aparecem ao rolar ficam estáticos
    const renderCard = ({ item, index }) => {
        const tipo = TIPOS[item.acao] || TIPOS.Abertura;
        const Icone = tipo.Icone;
        const requisicao = item.requisicao || {};
        const descricao =
            item.acao === "Finalizacao"
                ? item.descricao || requisicao.descricao
                : requisicao.descricao;

        return (
            <EntradaAnimada
                atraso={Math.min(index, 6) * 60}
                distancia={10}
                ativa={!entradaFeita}
            >
                <PressionavelAnimado
                    style={styles.card}
                    onPress={() =>
                        navigation.navigate("RequisicaoDetalheScreen", {
                            idRequisicao: requisicao.id_requisicao,
                        })
                    }
                >
                    <View style={[styles.iconWrapper, { backgroundColor: tipo.fundo }]}>
                        <Icone color={tipo.cor} size={22} />
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.titulo}>{tipo.titulo}</Text>

                        <Text style={styles.subtitulo}>
                            {requisicao.patrimonio?.nome}
                            {requisicao.sala?.descricao ? ` • ${requisicao.sala.descricao}` : ""}
                        </Text>

                        {!!descricao && (
                            <Text style={styles.descricao} numberOfLines={3}>
                                {descricao}
                            </Text>
                        )}

                        <Text style={styles.data}>{formatarData(item.horario)}</Text>
                    </View>
                </PressionavelAnimado>
            </EntradaAnimada>
        );
    };

    let conteudo;
    if (carregando) {
        conteudo = (
            <EntradaAnimada distancia={8}>
                <EsqueletoCartaoLinha quantidade={5} />
            </EntradaAnimada>
        );
    } else if (erro) {
        conteudo = (
            <EstadoVazio
                erro
                titulo="Não foi possível carregar o mural"
                descricao="Ocorreu um problema ao buscar o histórico."
                acaoTexto="Tentar novamente"
                onAcao={() => carregarDados()}
            />
        );
    } else {
        conteudo = (
            <FlatList
                data={atualizacoesFiltradas}
                keyExtractor={(item) => String(item.id_historico)}
                renderItem={renderCard}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={renovando}
                        onRefresh={aoRecarregar}
                        colors={[cores.marca]}
                        tintColor={cores.marca}
                    />
                }
                ListEmptyComponent={
                    <EstadoVazio
                        compacto
                        Icone={Bell}
                        titulo="Nenhuma atualização encontrada"
                        descricao={
                            busca
                                ? "Tente buscar com outros termos."
                                : "Não há atualizações registradas no momento."
                        }
                    />
                }
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CabecalhoTela titulo="Mural completo" onVoltar={() => navigation.goBack()} marginBottom={20} />

                {/* Busca: a borda ganha a cor da marca ao focar */}
                <EntradaAnimada distancia={8}>
                    <View
                        style={[
                            styles.barraBusca,
                            { borderColor: buscaFocada ? cores.marca : cores.borda },
                        ]}
                    >
                        <Search color={cores.textoMudo} size={20} />
                        <TextInput
                            style={styles.inputBusca}
                            placeholder="Pesquisar item..."
                            placeholderTextColor={cores.textoMudo}
                            value={busca}
                            onChangeText={setBusca}
                            onFocus={() => setBuscaFocada(true)}
                            onBlur={() => setBuscaFocada(false)}
                            returnKeyType="search"
                        />
                    </View>
                </EntradaAnimada>

                {conteudo}
            </View>
        </SafeAreaView>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: c.fundo,
        },

        container: {
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 40,
        },

        barraBusca: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: c.superficie,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 50,
            marginBottom: 20,
            borderWidth: 1,
        },

        inputBusca: {
            flex: 1,
            color: c.texto,
            fontSize: 14,
            paddingVertical: 0,
        },

        lista: {
            gap: 12,
            paddingBottom: 40,
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
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },

        iconWrapper: {
            width: 42,
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
        },

        textWrapper: {
            flex: 1,
        },

        titulo: {
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

        data: {
            color: c.textoDiscreto,
            fontSize: 11,
            marginTop: 6,
        },
    });
