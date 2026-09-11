import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LogOut } from "lucide-react-native";
import { deslogarUsuario } from "../storage/usuario/dados.storage.js";

const iconColor = "#c9131c";

export default function HomeLayout({ children }) {
    const navigation = useNavigation();

    async function handleLogout() {
        await deslogarUsuario();
        navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
        });
    }

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

                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f4f7f7",
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
});
