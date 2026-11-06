import React from "react";
import { ClipboardClock } from "lucide-react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";

const options = [
    {
        title: "Itens pendentes",
        Icone: ClipboardClock,
        route: "ManutencaoRequisicoesScreen",
    },
];

export default function ManutencaoScreen() {
    return (
        <HomeLayout>
            <MenuList options={options} />
        </HomeLayout>
    );
}
