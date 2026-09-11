import React from "react";
import { QrCode, CalendarDays, ClipboardClock } from "lucide-react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";

const iconColor = "#c9131c";

const options = [
    {
        title: "Leitura de QR Code",
        icon: <QrCode color={iconColor} size={24} />,
        route: "QrCodeScreen",
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
];

export default function GeralScreen() {
    return (
        <HomeLayout>
            <MenuList options={options} />
        </HomeLayout>
    );
}
