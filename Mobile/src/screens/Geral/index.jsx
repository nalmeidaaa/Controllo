import React, { useCallback, useState } from "react";
import { DoorOpen, ClipboardClock } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";
import MuralAtualizacoes from "../../components/MuralAtualizacoes.jsx";
import { obterUltimaAtualizacao } from "../../storage/requisicao/requisicoes.storage.js";

const iconColor = "#c9131c";

const options = [
    {
        title: "Visualizar Salas",
        icon: <DoorOpen color={iconColor} size={24} />,
        route: "SalasScreen",
    },
    {
        title: "Itens pendentes",
        icon: <ClipboardClock color={iconColor} size={24} />,
        route: "ItensPendentesScreen",
    },
];

export default function GeralScreen() {
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            (async () => {
                const requisicao = await obterUltimaAtualizacao();
                if (ativo) setUltimaAtualizacao(requisicao);
            })();

            return () => {
                ativo = false;
            };
        }, [])
    );

    return (
        <HomeLayout>
            <MuralAtualizacoes requisicao={ultimaAtualizacao} />
            <MenuList options={options} />
        </HomeLayout>
    );
}