import React from "react";
import { CalendarDays, ClipboardClock } from "lucide-react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";

const iconColor = "#c9131c";

const options = [
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
];

export default function ManutencaoScreen() {
    return (
        <HomeLayout>
            <MenuList options={options} />
        </HomeLayout>
    );
}
