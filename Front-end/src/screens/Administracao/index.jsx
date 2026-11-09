import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import { useTema } from "../../theme/tema.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";

export default function AdministracaoScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    return (
        <HomeLayout>
            <EntradaAnimada style={styles.adminContainer}>
                <Text style={styles.adminText}>Página de admin carregada!</Text>
            </EntradaAnimada>
        </HomeLayout>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
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
    });
