import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle, Inbox } from "lucide-react-native";
import { useTema } from "../../theme/tema.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";

/*
 * Mensagem para lista vazia ou erro de carregamento.
 * Visual equivalente ao "kit-estado" do front-end (borda tracejada + ícone).
 */
export default function EstadoVazio({
    titulo,
    descricao,
    erro = false,
    acaoTexto,
    onAcao,
    Icone,
    compacto = false,
}) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores, erro, compacto), [cores, erro, compacto]);
    const IconeFinal = Icone || (erro ? AlertCircle : Inbox);

    return (
        <EntradaAnimada style={styles.caixa} distancia={12}>
            <View style={styles.icone}>
                <IconeFinal color={erro ? cores.marca : cores.iconeNeutroCor} size={24} />
            </View>

            <Text style={styles.titulo}>{titulo}</Text>

            {!!descricao && <Text style={styles.descricao}>{descricao}</Text>}

            {!!acaoTexto && onAcao && (
                <PressionavelAnimado onPress={onAcao} style={styles.botao} escala={0.95}>
                    <Text style={styles.botaoTexto}>{acaoTexto}</Text>
                </PressionavelAnimado>
            )}
        </EntradaAnimada>
    );
}

const criarStyles = (c, erro, compacto) =>
    StyleSheet.create({
        caixa: {
            alignItems: "center",
            paddingVertical: compacto ? 20 : 32,
            paddingHorizontal: 24,
            borderRadius: 14,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: erro ? c.perigoBorda : c.bordaForte,
            backgroundColor: erro ? c.perigoSuave : c.superficie,
        },
        icone: {
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: erro ? c.marcaSuave : c.iconeNeutro,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
        },
        titulo: {
            color: c.texto,
            fontSize: 15,
            fontWeight: "600",
            textAlign: "center",
        },
        descricao: {
            color: c.textoSecundario,
            fontSize: 13,
            textAlign: "center",
            marginTop: 6,
            lineHeight: 19,
        },
        botao: {
            marginTop: 16,
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: c.marca,
        },
        botaoTexto: {
            color: "#ffffff",
            fontSize: 14,
            fontWeight: "600",
        },
    });
