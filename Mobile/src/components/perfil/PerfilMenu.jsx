import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTema } from "../../theme/tema.jsx";
import { useUsuarioLogado } from "../../hooks/useUsuarioLogado.js";
import { deslogarUsuario } from "../../storage/usuario/dados.storage.js";
import { encerrarSessaoExpirada } from "../../services/requisicaoGeralService.js";
import {
    nomeDoUsuario,
    urlFotoUsuario,
    sincronizarUsuarioLogado,
} from "../../utils/usuario.js";
import Avatar from "./Avatar.jsx";
import PerfilModal from "./PerfilModal.jsx";

// Botão com a foto do usuário (substitui o antigo botão de sair) + o perfil que ele abre
export default function PerfilMenu() {
    const navigation = useNavigation();
    const { cores } = useTema();
    const usuario = useUsuarioLogado();
    const [aberto, setAberto] = useState(false);

    // Se o login não trouxe e-mail/foto, completa os dados uma única vez
    useEffect(() => {
        sincronizarUsuarioLogado();
    }, []);

    async function sair() {
        setAberto(false);
        await deslogarUsuario();
        navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
        });
    }

    function sessaoExpirada() {
        setAberto(false);
        encerrarSessaoExpirada(navigation);
    }

    return (
        <>
            <Pressable
                onPress={() => setAberto(true)}
                style={({ pressed }) => [
                    styles.botao,
                    { borderColor: cores.marca, backgroundColor: cores.superficie },
                    pressed && styles.pressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Abrir meu perfil"
                hitSlop={6}
            >
                <Avatar
                    nome={nomeDoUsuario(usuario)}
                    src={urlFotoUsuario(usuario)}
                    tamanho={40}
                />
            </Pressable>

            <PerfilModal
                aberto={aberto}
                onFechar={() => setAberto(false)}
                onSair={sair}
                onSessaoExpirada={sessaoExpirada}
            />
        </>
    );
}

const styles = StyleSheet.create({
    botao: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    pressionado: {
        opacity: 0.8,
    },
});
