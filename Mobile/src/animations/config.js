import { useEffect, useState } from "react";
import { AccessibilityInfo, Easing } from "react-native";

// Durações e curvas usadas por todas as animações do app.
// Valores moderados de propósito: o objetivo é fluidez, não espetáculo.
export const DURACAO = {
    rapida: 160,
    normal: 300,
    lenta: 440,
};

export const SUAVE = Easing.out(Easing.cubic);
export const SAIDA = Easing.in(Easing.cubic);

/**
 * Usuário pediu menos movimento no sistema operacional?
 * Quando sim, as animações de movimento são desligadas (mesma regra do front-end).
 */
export function useReduzMovimento() {
    const [reduz, setReduz] = useState(false);

    useEffect(() => {
        let ativo = true;

        AccessibilityInfo.isReduceMotionEnabled()
            .then((valor) => {
                if (ativo) setReduz(!!valor);
            })
            .catch(() => {});

        const assinatura = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            (valor) => setReduz(!!valor)
        );

        return () => {
            ativo = false;
            assinatura?.remove?.();
        };
    }, []);

    return reduz;
}
