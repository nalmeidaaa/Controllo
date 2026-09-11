import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { QrCode, CalendarDays, MoveRight, ClipboardClock, LogOut } from 'lucide-react-native';
import { obterUsuarioAtual, deslogarUsuario } from "../../storage/usuario/dados.storage.js";

const iconColor = "#c9131c";

const opcoesPorTipo = {
    manutencao: [
        {
            title: "Itens pendentes",
            icon: <ClipboardClock color={iconColor} size={24} />,
            route: "ItensPendentesScreen",
        },
        {
            title: "Tarefas agendadas",
            icon: <CalendarDays color={iconColor} size={24} />,
            route: "CalendarioScreen",
        },
    ],
    geral: [
        {
            title: "Leitura de QR Code",
            icon: <QrCode color={iconColor} size={24} />,
            route: "HomeScreen",
        },
        {
            title: "Tarefas agendadas",
            icon: <CalendarDays color={iconColor} size={24} />,
            route: "CalendarioScreen",
        },
        {
            title: "Itens pendentes",
            icon: <ClipboardClock color={iconColor} size={24} />,
            route: "ItensPendentesScreen",
        },
    ],
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;
            async function carregarUsuario() {
                const usuario = await obterUsuarioAtual();
                if (ativo) {
                    setTipoUsuario(usuario?.tipo_usuario ?? null);
                    setCarregando(false);
                }
            }
            carregarUsuario();
            return () => {
                ativo = false;
            };
        }, [])
    );

    async function handleLogout() {
        await deslogarUsuario();
        navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
        });
    }

    if (carregando) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={iconColor} size="large" />
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
                        <Text style={styles.title}>Seja bem-vindo, usuário!</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        activeOpacity={0.8}
                        onPress={handleLogout}
                    >
                        <LogOut color={iconColor} size={22} />
                    </TouchableOpacity>
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
                                    {option.icon}
                                </View>

                                <View style={styles.cardText}>
                                    <Text style={styles.cardTitle}>{option.title}</Text>
                                </View>

                                <MoveRight color="#b01d2e" size={24} style={styles.arrow} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#f4f7f7",
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
        color: "#b01d2e",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },

    title: {
        color: "#2d0e0e",
        fontSize: 28,
        fontWeight: "600",
        letterSpacing: -0.5,
        marginTop: 6,
    },

    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#ffd8d8",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
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
        color: "#2d0e0e",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },

    card: {
        minHeight: 92,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: "#fce9e9",

        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    iconWrapper: {
        width: 50,
        height: 50,
        backgroundColor: "#ffd8d8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 18,
    },

    cardText: {
        flex: 1,
    },

    cardTitle: {
        color: "#270d0d",
        fontSize: 16,
        fontWeight: "600",
    },

    arrow: {
        marginLeft: 12,
    },
});
