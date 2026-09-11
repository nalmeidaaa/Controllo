import React from "react";
import { View, StyleSheet, Text } from "react-native";
import HomeLayout from "../../components/HomeLayout.jsx";

export default function AdministracaoScreen() {
    return (
        <HomeLayout>
            <View style={styles.adminContainer}>
                <Text style={styles.adminText}>Página de admin carregada!</Text>
            </View>
        </HomeLayout>
    );
}

const styles = StyleSheet.create({
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
});
