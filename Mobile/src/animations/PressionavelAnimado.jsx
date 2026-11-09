import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { DURACAO, SUAVE, useReduzMovimento } from "./config.js";

/*
 * Botão/cartão que encolhe levemente ao ser pressionado e volta com uma
 * mola curta. `style` vai para o conteúdo; `containerStyle` para a área
 * que recebe o toque (útil quando o item precisa ocupar a largura toda).
 */
export default function PressionavelAnimado({
    children,
    onPress,
    onPressIn,
    onPressOut,
    disabled = false,
    style,
    containerStyle,
    escala = 0.97,
    accessibilityLabel,
    accessibilityRole = "button",
    hitSlop,
}) {
    const reduz = useReduzMovimento();
    const anim = useRef(new Animated.Value(1)).current;

    function apertar(e) {
        if (!reduz) {
            Animated.timing(anim, {
                toValue: escala,
                duration: DURACAO.rapida / 2,
                easing: SUAVE,
                useNativeDriver: true,
            }).start();
        }
        onPressIn?.(e);
    }

    function soltar(e) {
        if (!reduz) {
            Animated.spring(anim, {
                toValue: 1,
                friction: 6,
                tension: 220,
                useNativeDriver: true,
            }).start();
        }
        onPressOut?.(e);
    }

    return (
        <Pressable
            onPress={onPress}
            onPressIn={apertar}
            onPressOut={soltar}
            disabled={disabled}
            hitSlop={hitSlop}
            style={containerStyle}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled }}
        >
            <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
