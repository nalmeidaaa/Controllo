import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User } from "lucide-react-native";
import { iniciaisDoNome } from "../../utils/usuario.js";

// Gradientes da identidade visual (iguais aos do front-end).
// A cor é escolhida pelo nome: a mesma pessoa sempre tem a mesma cor.
const PALETA = [
    ["#ff5a66", "#b01d2e"], // vermelho (marca)
    ["#fb923c", "#c2410c"], // laranja
    ["#2dd4bf", "#0f766e"], // verde-água
    ["#818cf8", "#4338ca"], // índigo
    ["#c084fc", "#7e22ce"], // violeta
    ["#64748b", "#334155"], // grafite
];

function indicePorNome(nome) {
    let h = 0;
    for (const c of String(nome || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % PALETA.length;
}

export default function Avatar({ nome, src, tamanho = 36, style }) {
    const [falhou, setFalhou] = useState(false);

    // Nova foto: tenta carregar de novo
    useEffect(() => setFalhou(false), [src]);

    const iniciais = iniciaisDoNome(nome);
    const mostrarFoto = Boolean(src) && !falhou;
    const [de, ate] = PALETA[indicePorNome(nome)];

    const base = {
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        overflow: "hidden",
    };

    if (mostrarFoto) {
        return (
            <View style={[base, { backgroundColor: "#242429" }, style]}>
                <Image
                    source={{ uri: src }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    onError={() => setFalhou(true)}
                    accessibilityLabel={nome ? `Foto de ${nome}` : "Foto de perfil"}
                />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[de, ate]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[base, { alignItems: "center", justifyContent: "center" }, style]}
        >
            {iniciais ? (
                <Text
                    style={{
                        color: "#ffffff",
                        fontSize: tamanho * 0.4,
                        fontWeight: "700",
                        letterSpacing: 0.3,
                    }}
                >
                    {iniciais}
                </Text>
            ) : (
                <User color="#ffffff" size={tamanho * 0.5} />
            )}
        </LinearGradient>
    );
}
