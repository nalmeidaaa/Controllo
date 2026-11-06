import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MoveRight } from "lucide-react-native";
import { useTema } from "../theme/tema.jsx";

export default function MenuList({ options }) {
    const navigation = useNavigation();
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);

    return (
        <View style={styles.list}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.route}
                    activeOpacity={0.8}
                    style={styles.card}
                    onPress={() => navigation.navigate(option.route)}
                >
                    <View style={styles.iconWrapper}>
                        {option.Icone ? (
                            <option.Icone color={cores.marca} size={24} />
                        ) : (
                            option.icon
                        )}
                    </View>

                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{option.title}</Text>
                    </View>

                    <MoveRight color={cores.marcaEscura} size={24} style={styles.arrow} />
                </TouchableOpacity>
            ))}
        </View>
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

        shadowColor: c.sombra,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    iconWrapper: {
        width: 50,
        height: 50,
        backgroundColor: c.marcaSuave,
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
    });
