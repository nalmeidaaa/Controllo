import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MoveRight } from "lucide-react-native";
import { useTema } from "../theme/tema.jsx";
import EntradaAnimada from "../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../animations/PressionavelAnimado.jsx";
import { DURACAO } from "../animations/config.js";

export default function MenuList({ options }) {
    const navigation = useNavigation();
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    return (
        <View style={styles.list}>
            {options.map((option, i) => (
                <EntradaAnimada
                    key={`${option.route}-${i}`}
                    atraso={140 + i * 90}
                    distancia={24}
                >
                    <CartaoOpcao
                        option={option}
                        onPress={() => navigation.navigate(option.route)}
                    />
                </EntradaAnimada>
            ))}
        </View>
    );
}

/* Cartão do menu: na pressão, o ícone assume a cor da marca e uma barra
   vermelha cresce embaixo (espelho do hover do .menu-card no front-end). */
function CartaoOpcao({ option, onPress }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const [pressionado, setPressionado] = useState(false);
    const preenchimento = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(preenchimento, {
            toValue: pressionado ? 1 : 0,
            duration: DURACAO.rapida,
            useNativeDriver: false,
        }).start();
    }, [pressionado, preenchimento]);

    const Icone = option.Icone;
    const larguraBarra = preenchimento.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <PressionavelAnimado
            onPress={onPress}
            onPressIn={() => setPressionado(true)}
            onPressOut={() => setPressionado(false)}
            style={styles.card}
            accessibilityLabel={option.title}
        >
            <Animated.View
                style={[
                    styles.iconWrapper,
                    {
                        backgroundColor: preenchimento.interpolate({
                            inputRange: [0, 1],
                            outputRange: [cores.marcaSuave, cores.marca],
                        }),
                    },
                ]}
            >
                {Icone ? (
                    <Icone color={pressionado ? "#ffffff" : cores.marca} size={24} />
                ) : (
                    option.icon
                )}
            </Animated.View>

            <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{option.title}</Text>
            </View>

            <MoveRight color={cores.marcaEscura} size={24} style={styles.arrow} />

            <Animated.View style={[styles.barra, { width: larguraBarra }]}>
                <LinearGradient
                    colors={[cores.marcaEscura, cores.marca]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </PressionavelAnimado>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        list: {
            gap: 16,
        },

        card: {
            minHeight: 92,
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: c.superficie,
            borderRadius: 14,
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderWidth: 1,
            borderColor: c.borda,
            overflow: "hidden",
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },

        iconWrapper: {
            width: 50,
            height: 50,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 18,
        },

        cardText: {
            flex: 1,
        },

        cardTitle: {
            color: c.texto,
            fontSize: 16,
            fontWeight: "600",
        },

        arrow: {
            marginLeft: 12,
        },

        barra: {
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 3,
            overflow: "hidden",
        },
    });
