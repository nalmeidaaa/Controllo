import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTema } from "../theme/tema.jsx";
import { useReduzMovimento } from "./config.js";

/*
 * Esqueletos de carregamento: blocos que "respiram" (opacidade) enquanto a
 * API responde. Substituem o spinner para o layout não pular ao chegar o conteúdo.
 */

export function EsqueletoBloco({ largura = "100%", altura = 14, raio = 6, style }) {
    const { cores } = useTema();
    const reduz = useReduzMovimento();
    const pulso = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (reduz) return undefined;

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, { toValue: 1, duration: 750, useNativeDriver: true }),
                Animated.timing(pulso, { toValue: 0.45, duration: 750, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [reduz, pulso]);

    return (
        <Animated.View
            style={[
                {
                    width: largura,
                    height: altura,
                    borderRadius: raio,
                    backgroundColor: cores.iconeNeutro,
                    opacity: reduz ? 0.7 : pulso,
                },
                style,
            ]}
        />
    );
}

/* Esqueleto de cartão horizontal (ícone + duas linhas + badge) */
export function EsqueletoCartaoLinha({ quantidade = 3 }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    return (
        <View style={styles.lista}>
            {Array.from({ length: quantidade }).map((_, i) => (
                <View key={i} style={styles.cardLinha}>
                    <EsqueletoBloco largura={42} altura={42} raio={10} style={styles.marginRight} />
                    <View style={styles.flex}>
                        <EsqueletoBloco largura="70%" altura={14} />
                        <EsqueletoBloco largura="45%" altura={11} style={styles.espacoSuperior} />
                    </View>
                </View>
            ))}
        </View>
    );
}

/* Esqueleto de cartão vertical (imagem grande + título + subtítulo) */
export function EsqueletoCartaoVertical({ quantidade = 2 }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    return (
        <View style={styles.lista}>
            {Array.from({ length: quantidade }).map((_, i) => (
                <View key={i} style={styles.cardVertical}>
                    <EsqueletoBloco altura={20} largura="55%" />
                    <EsqueletoBloco altura={12} largura="35%" style={styles.espacoSuperior} />
                    <EsqueletoBloco altura={160} raio={10} style={styles.espacoSuperiorGrande} />
                </View>
            ))}
        </View>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        lista: { gap: 14 },
        flex: { flex: 1 },
        marginRight: { marginRight: 14 },
        espacoSuperior: { marginTop: 8 },
        espacoSuperiorGrande: { marginTop: 16 },
        cardLinha: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: c.superficie,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: c.borda,
        },
        cardVertical: {
            backgroundColor: c.superficie,
            borderRadius: 14,
            padding: 20,
            borderWidth: 1,
            borderColor: c.borda,
        },
    });
