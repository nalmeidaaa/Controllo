import React, { forwardRef, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { useTema } from "../../theme/tema.jsx";
import { DURACAO } from "../../animations/config.js";

/*
 * Campo com rótulo e borda que ganha a cor da marca ao receber foco
 * (mesmo comportamento do .form-control:focus do front-end).
 * `aoLado` aceita um elemento extra dentro do campo (ex.: botão "Ver senha").
 */
const CampoTexto = forwardRef(function CampoTexto(
    { rotulo, erro = false, aoLado, onFocus, onBlur, style, ...props },
    ref
) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const foco = useRef(new Animated.Value(0)).current;
    const [focado, setFocado] = useState(false);

    function animar(valor) {
        Animated.timing(foco, {
            toValue: valor,
            duration: DURACAO.rapida,
            useNativeDriver: false,
        }).start();
    }

    const corBorda = foco.interpolate({
        inputRange: [0, 1],
        outputRange: [cores.bordaNeutra, cores.marca],
    });

    return (
        <View style={[styles.grupo, style]}>
            {!!rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}

            <Animated.View
                style={[
                    styles.campo,
                    {
                        borderColor: erro ? cores.perigo : corBorda,
                        backgroundColor: focado ? cores.superficie : cores.input,
                    },
                ]}
            >
                <TextInput
                    ref={ref}
                    style={[styles.input, aoLado && styles.inputComLado]}
                    placeholderTextColor={cores.textoSuave}
                    onFocus={(e) => {
                        setFocado(true);
                        animar(1);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocado(false);
                        animar(0);
                        onBlur?.(e);
                    }}
                    {...props}
                />
                {aoLado}
            </Animated.View>
        </View>
    );
});

export default CampoTexto;

const criarStyles = (c) =>
    StyleSheet.create({
        grupo: {
            marginBottom: 18,
        },
        rotulo: {
            color: c.textoCinzaEscuro,
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 6,
        },
        campo: {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 10,
        },
        input: {
            flex: 1,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 15,
            color: c.texto,
        },
        inputComLado: {
            paddingRight: 4,
        },
    });
