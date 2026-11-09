import { useCallback, useRef } from "react";
import { Animated } from "react-native";
import { useReduzMovimento } from "./config.js";

/*
 * Tremidinha horizontal para mensagens de erro (espelha o "shake" do front-end).
 * Retorna o estilo a aplicar e a função que dispara o movimento.
 */
export default function useAgitar() {
    const reduz = useReduzMovimento();
    const x = useRef(new Animated.Value(0)).current;

    const agitar = useCallback(() => {
        if (reduz) return;
        x.setValue(0);
        Animated.sequence(
            [-6, 6, -4, 4, 0].map((valor) =>
                Animated.timing(x, {
                    toValue: valor,
                    duration: 55,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [reduz, x]);

    return {
        estilo: { transform: [{ translateX: x }] },
        agitar,
    };
}
