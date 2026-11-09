import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { DURACAO, SUAVE, useReduzMovimento } from "./config.js";

/*
 * Entrada suave: o conteúdo surge com fade e sobe alguns pixels.
 * Use `atraso` para criar a cascata entre elementos irmãos.
 */
export default function EntradaAnimada({
    children,
    atraso = 0,
    distancia = 16,
    duracao = DURACAO.normal,
    ativa = true,
    style,
}) {
    const reduz = useReduzMovimento();
    const anim = useRef(new Animated.Value(reduz || !ativa ? 1 : 0)).current;

    useEffect(() => {
        if (reduz || !ativa) {
            anim.setValue(1);
            return;
        }

        Animated.timing(anim, {
            toValue: 1,
            duration: duracao,
            delay: atraso,
            easing: SUAVE,
            useNativeDriver: true,
        }).start();
    }, [reduz, ativa, anim, atraso, duracao]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: anim,
                    transform: [
                        {
                            translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [distancia, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}
