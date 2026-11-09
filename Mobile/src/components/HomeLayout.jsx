import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../theme/tema.jsx";
import { useUsuarioLogado } from "../hooks/useUsuarioLogado.js";
import { nomeDoUsuario } from "../utils/usuario.js";
import PerfilMenu from "./perfil/PerfilMenu.jsx";
import EntradaAnimada from "../animations/EntradaAnimada.jsx";

export default function HomeLayout({ children }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const usuario = useUsuarioLogado();
    const nomeUsuario = nomeDoUsuario(usuario) || "Usuário";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <EntradaAnimada distancia={-12} style={styles.headerRow}>
                    <View style={styles.heading}>
                        <Text style={styles.eyebrow}>Controllo</Text>
                        <Text style={styles.title}>
                            Seja bem-vindo, {nomeUsuario}!
                        </Text>
                    </View>

                    <PerfilMenu />
                </EntradaAnimada>

                {children}
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
    });
