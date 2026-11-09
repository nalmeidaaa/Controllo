import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTema } from "../../theme/tema.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";

// Cabeçalho padrão das telas internas: botão voltar + rótulo + título
export default function CabecalhoTela({ titulo, onVoltar, marginBottom = 24 }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores, marginBottom), [cores, marginBottom]);

    return (
        <EntradaAnimada distancia={-10} style={styles.linha}>
            <PressionavelAnimado
                onPress={onVoltar}
                escala={0.92}
                style={styles.voltar}
                accessibilityLabel="Voltar"
            >
                <ArrowLeft color={cores.marca} size={22} />
            </PressionavelAnimado>

            <View style={styles.texto}>
                <Text style={styles.eyebrow}>Controllo</Text>
                <Text style={styles.titulo}>{titulo}</Text>
            </View>
        </EntradaAnimada>
    );
}

const criarStyles = (c, marginBottom) =>
    StyleSheet.create({
        linha: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom,
        },
        voltar: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: c.marcaSuave,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
        },
        texto: {
            flex: 1,
        },
        eyebrow: {
            color: c.marcaEscura,
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.7,
        },
        titulo: {
            color: c.texto,
            fontSize: 24,
            fontWeight: "600",
            letterSpacing: -0.5,
            marginTop: 4,
        },
    });
