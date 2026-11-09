import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, Text, TextInput, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { DoorOpen, MoveRight, Search, X } from "lucide-react-native";
import { obterToken } from "../../storage/usuario/dados.storage.js";
import { buscarSalas } from "../../services/salaService.js";
import { BASE_URL } from "../../services/api.js";
import { useTema } from "../../theme/tema.jsx";
import CabecalhoTela from "../../components/shared/CabecalhoTela.jsx";
import EstadoVazio from "../../components/shared/EstadoVazio.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoVertical } from "../../animations/Esqueleto.jsx";

export default function SalasScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();

    const [salas, setSalas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [pesquisa, setPesquisa] = useState("");
    const [pesquisaFocada, setPesquisaFocada] = useState(false);

    async function carregarSalas() {
        try {
            setCarregando(true);
            setErro(false);

            const token = await obterToken();
            if (!token) return;

            const resposta = await buscarSalas(token);
            setSalas(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao buscar salas", error);
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarSalas();
        }, [])
    );

    function abrirSala(sala) {
        navigation.navigate("SalaDetalheScreen", {
            idSala: sala.id_sala,
            nomeSala: sala.descricao,
        });
    }

    // Pesquisa pelo nome da sala ou pelo bloco
    const salasFiltradas = salas.filter((sala) => {
        const termo = pesquisa.trim().toLowerCase();

        return (
            (sala.descricao || "").toLowerCase().includes(termo) ||
            String(sala.bloco || "").toLowerCase().includes(termo)
        );
    });

    function renderSala({ item, index }) {
        return (
            <EntradaAnimada atraso={Math.min(index, 8) * 80} distancia={18}>
                <PressionavelAnimado
                    style={styles.card}
                    escala={0.985}
                    onPress={() => abrirSala(item)}
                    accessibilityLabel={`Abrir sala ${item.descricao}`}
                >
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>{item.descricao}</Text>

                            {!!item.bloco && (
                                <Text style={styles.cardSubtitle}>Bloco {item.bloco}</Text>
                            )}
                        </View>

                        <MoveRight color={cores.marcaEscura} size={22} />
                    </View>

                    {item.caminho_imagem ? (
                        <Image
                            source={{ uri: `${BASE_URL}${item.caminho_imagem}` }}
                            style={styles.salaImagemGrande}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderRetangular}>
                            <DoorOpen color={cores.marca} size={32} />
                            <Text style={styles.placeholderTexto}>Sem imagem disponível</Text>
                        </View>
                    )}
                </PressionavelAnimado>
            </EntradaAnimada>
        );
    }

    let conteudo;
    if (carregando) {
        conteudo = (
            <EntradaAnimada>
                <EsqueletoCartaoVertical quantidade={2} />
            </EntradaAnimada>
        );
    } else if (erro) {
        conteudo = (
            <EstadoVazio
                erro
                titulo="Não foi possível carregar as salas"
                acaoTexto="Tentar novamente"
                onAcao={carregarSalas}
            />
        );
    } else if (salas.length === 0) {
        conteudo = (
            <EstadoVazio
                Icone={DoorOpen}
                titulo="Nenhuma sala cadastrada"
                descricao="Quando houver salas, elas aparecerão aqui."
            />
        );
    } else if (salasFiltradas.length === 0) {
        conteudo = (
            <EstadoVazio
                Icone={Search}
                titulo="Nenhuma sala encontrada"
                descricao={`Nada corresponde a "${pesquisa.trim()}".`}
            />
        );
    } else {
        conteudo = (
            <FlatList
                data={salasFiltradas}
                keyExtractor={(item) => String(item.id_sala)}
                contentContainerStyle={styles.lista}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={renderSala}
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CabecalhoTela titulo="Salas" onVoltar={() => navigation.goBack()} />

                {/* Barra de pesquisa: a borda ganha a cor da marca ao focar */}
                <EntradaAnimada atraso={120} distancia={10}>
                    <View
                        style={[
                            styles.barraPesquisa,
                            { borderColor: pesquisaFocada ? cores.marca : cores.borda },
                        ]}
                    >
                        <Search color={cores.textoMudo} size={20} />

                        <TextInput
                            style={styles.inputPesquisa}
                            placeholder="Pesquisar sala..."
                            placeholderTextColor={cores.textoMudo}
                            value={pesquisa}
                            onChangeText={setPesquisa}
                            onFocus={() => setPesquisaFocada(true)}
                            onBlur={() => setPesquisaFocada(false)}
                            autoCapitalize="none"
                            returnKeyType="search"
                        />

                        {pesquisa.length > 0 && (
                            <PressionavelAnimado
                                onPress={() => setPesquisa("")}
                                escala={0.85}
                                accessibilityLabel="Limpar pesquisa"
                            >
                                <X color={cores.textoMudo} size={20} />
                            </PressionavelAnimado>
                        )}
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

        barraPesquisa: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: c.superficie,
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 50,
            marginBottom: 20,
            borderWidth: 1,
        },

        inputPesquisa: {
            flex: 1,
            marginLeft: 10,
            color: c.texto,
            fontSize: 14,
            paddingVertical: 0,
        },

        lista: {
            gap: 16,
            paddingBottom: 40,
        },

        card: {
            flexDirection: "column",
            backgroundColor: c.superficie,
            borderRadius: 14,
            padding: 20,
            borderWidth: 1,
            borderColor: c.borda,
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },

        cardHeaderRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },

        cardText: {
            flex: 1,
        },

        cardTitle: {
            color: c.texto,
            fontSize: 18,
            fontWeight: "600",
        },

        cardSubtitle: {
            color: c.textoMudo,
            fontSize: 14,
            marginTop: 2,
        },

        salaImagemGrande: {
            width: "100%",
            height: 160,
            borderRadius: 10,
            backgroundColor: c.marcaSuave,
        },

        placeholderRetangular: {
            width: "100%",
            height: 160,
            borderRadius: 10,
            backgroundColor: c.fundoRosado,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: c.borda,
            borderStyle: "dashed",
            gap: 8,
        },

        placeholderTexto: {
            color: c.textoMudo,
            fontSize: 13,
        },
    });
