import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MoveRight } from "lucide-react-native";

export default function MenuList({ options }) {
    const navigation = useNavigation();

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
                        {option.icon}
                    </View>

                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{option.title}</Text>
                    </View>

                    <MoveRight color="#b01d2e" size={24} style={styles.arrow} />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 16,
    },

    card: {
        minHeight: 92,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: "#fce9e9",

        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    iconWrapper: {
        width: 50,
        height: 50,
        backgroundColor: "#ffd8d8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 18,
    },

    cardText: {
        flex: 1,
    },

    cardTitle: {
        color: "#270d0d",
        fontSize: 16,
        fontWeight: "600",
    },

    arrow: {
        marginLeft: 12,
    },
});
