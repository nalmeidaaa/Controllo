import React, { useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Wrench, ClipboardClock } from "lucide-react-native";
import HomeLayout from "../../components/HomeLayout.jsx";
import MenuList from "../../components/MenuList.jsx";
import MuralAtualizacoes from "../../components/MuralAtualizacoes.jsx";
import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarAtualizacoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoGeralService.js";

const iconColor = "#c9131c";

const options = [
    {
        title: "Visualizar Salas",
        icon: <Wrench color={iconColor} size={24} />,
        route: "SalasScreen",
    },
    {
        title: "Itens pendentes",
        icon: <ClipboardClock color={iconColor} size={24} />,
        route: "ItensPendentesScreen",
    },
];

export default function GeralScreen() {
    const navigation = useNavigation();
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            (async () => {
                try {
                    setCarregando(true);
                    setErro(false);

                    const token = await obterToken();
                    const resposta = await buscarAtualizacoes(token);

                    if (ativo) setAtualizacoes(resposta?.result ?? []);
                } catch (error) {
                    console.error("Erro ao carregar mural", error);
                    if (!ativo) return;

                    if (ehErroDeSessao(error)) {
                        encerrarSessaoExpirada(navigation);
                        return;
                    }
                    setErro(true);
                } finally {
                    if (ativo) setCarregando(false);
                }
            })();

            return () => {
                ativo = false;
            };
        }, [navigation])
    );

    return (
        <HomeLayout>
            <MuralAtualizacoes
                atualizacoes={atualizacoes}
                carregando={carregando}
                erro={erro}
            />
            <MenuList options={options} />
        </HomeLayout>
    );
}
