import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ClipboardClock } from "lucide-react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";
import MinhasTarefas from "../../components/manutencao/MinhasTarefas.jsx";

const options = [
    {
        title: "Itens pendentes",
        Icone: ClipboardClock,
        route: "ManutencaoRequisicoesScreen",
    },
];

export default function ManutencaoScreen() {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <HomeLayout>
                <MenuList options={options} />
                <MinhasTarefas />
            </HomeLayout>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 24,
    },
});
