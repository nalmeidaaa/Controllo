import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { QrCode, CalendarDays, MoveRight, ClipboardClock } from 'lucide-react-native';
import { obterUsuarioAtual } from "../../storage/usuario/dados.storage.js";
import PerfilMenu from "../../components/perfil/PerfilMenu.jsx";
import { useTema } from "../../theme/tema.jsx";

const opcoesPorTipo = {
    manutencao: [
        {
            title: "Itens pendentes",
            Icone: ClipboardClock,
            route: "ItensPendentesScreen",
        },
        {
            title: "Tarefas agendadas",
            Icone: CalendarDays,
            route: "CalendarioScreen",
        },
    ],
    geral: [
        {
            title: "Leitura de QR Code",
            Icone: QrCode,
            route: "HomeScreen",
        },
        {
            title: "Tarefas agendadas",
            Icone: CalendarDays,
            route: "CalendarioScreen",
        },
        {
            title: "Itens pendentes",
            Icone: ClipboardClock,
            route: "ItensPendentesScreen",
        },
    ],
};

export default function HomeScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [carregando, setCarregando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            async function carregarUsuario() {
                try {
                    const usuario = await obterUsuarioAtual();

                    if (ativo) {
                        setTipoUsuario(usuario?.tipo_usuario ?? null);

                        // Busca o nome do usuário conectado
                        setNomeUsuario(
                            usuario?.nome ||
                            usuario?.nome_usuario ||
                            usuario?.name ||
                            ""
                        );
                    }
                } catch (error) {
                    console.error("Erro ao carregar usuário:", error);
                } finally {
                    if (ativo) {
                        setCarregando(false);
                    }
                }
            }

            carregarUsuario();

            return () => {
                ativo = false;
            };
        }, [])
    );

    if (carregando) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={cores.marca} size="large" />
                </View>
            </SafeAreaView>
        );
    }

    const options = opcoesPorTipo[tipoUsuario] || [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View style={styles.heading}>
                        <Text style={styles.eyebrow}>Controllo</Text>
                        <Text style={styles.title}>
                            Seja bem-vindo, {nomeUsuario || "Usuário"}!
                        </Text>
                    </View>

                    <PerfilMenu />
                </View>

                {tipoUsuario === "administracao" ? (
                    <View style={styles.adminContainer}>
                        <Text style={styles.adminText}>
                            Página de admin carregada!
                        </Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.route}
                                activeOpacity={0.8}
                                style={styles.card}
                                onPress={() => navigation.navigate(option.route)}
                            >
                                <View style={styles.iconWrapper}>
                                    <option.Icone color={cores.marca} size={24} />
                                </View>

                                <View style={styles.cardText}>
                                    <Text style={styles.cardTitle}>{option.title}</Text>
                                </View>

                                <MoveRight color={cores.marcaEscura}size={24} style={styles.arrow} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const criarStyles = (c) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: c.fundo,
    },

    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    container: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 40,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 36,
    },

    heading: {
        flex: 1,
    },

    eyebrow: {
        color: c.marcaEscura,
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },

    title: {
        color: c.texto,
        fontSize: 28,
        fontWeight: "600",
        letterSpacing: -0.5,
        marginTop: 6,
    },

    list: {
        gap: 16,
    },

    adminContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 80,
    },

    adminText: {
        color: c.texto,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },

    card: {
        minHeight: 92,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: c.superficie,
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: c.borda,
        shadowColor: c.sombra,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    iconWrapper: {
        width: 50,
        height: 50,
        backgroundColor: c.marcaSuave,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 18,
    },

    cardText: {
        flex: 1,
    },

    cardTitle: {
        color: c.texto,
        fontSize: 16,
        fontWeight: "600",
    },

    arrow: {
        marginLeft: 12,
    },
});