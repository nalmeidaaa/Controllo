import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { QrCode, CalendarDays, MoveRight, ClipboardClock } from 'lucide-react-native';

// Cor base para os ícones adaptada do desktop: --verde-escuro[cite: 1]
const iconColor = "#c9131c";

const options = [
    {
        title: "Leitura de QR Code",
        icon: <QrCode color={iconColor} size={24} />,
        route: "HomeScreen",
    },
    {
        title: "Tarefas agendadas",
        icon: <CalendarDays color={iconColor} size={24} />,
        route: "CalendarioScreen",
    },
    {
        title: "Itens pendentes",
        icon: <ClipboardClock color={iconColor} size={24} />,
        route: "ItensPendentesScreen",
    }
]

export default function HomeScreen() {
    const navigation = useNavigation();
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>Controllo</Text>
                    <Text style={styles.title}>Seja bem-vindo, usuário!</Text>
                </View>

                <View style={styles.list}>
                    {options.map((option) => (
                        <TouchableOpacity key={option.route} activeOpacity={0.8} style={styles.card} onPress={() => navigation.navigate(option.route)}>
                            {/* Wrapper do ícone inspirado na classe .card-icon do desktop[cite: 1] */}
                            <View style={styles.iconWrapper}>
                                {option.icon}
                            </View>
                            
                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle}>{option.title}</Text>
                            </View>
                            
                            {/* Cor da seta baseada na variável --texto-suave para contraste ideal[cite: 1] */}
                            <MoveRight color="#b01d2e" size={24} style={styles.arrow} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    )
}

// ─── Estilos Adaptados ────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    safeArea: {
        flex: 1,               
        backgroundColor: "#f4f7f7", // var(--bg-pagina)[cite: 1]
    },

    container: {
        flex: 1,               
        paddingHorizontal: 28, // Inspirado no padding do .dashboard-wrapper[cite: 1]
        paddingTop: 40,        // Inspirado no padding do .dashboard-wrapper[cite: 1]
    },

    heading: {
        marginBottom: 36, // Inspirado no margin-bottom de .dashboard-welcome[cite: 1]
    },

    eyebrow: {
        color: "#b01d2e", // var(--verde-escuro)[cite: 1]
        fontSize: 11, // Baseado na tipografia do .dashboard-section-label[cite: 1]
        fontWeight: "600", // Baseado no .dashboard-section-label[cite: 1]
        textTransform: "uppercase", // Baseado no .dashboard-section-label[cite: 1]
        letterSpacing: 0.7, // Baseado no .dashboard-section-label[cite: 1]
    },

    title: {
        color: "#2d0e0e", // var(--texto-primario)[cite: 1]
        fontSize: 28, // Baseado no h1 do desktop[cite: 1]
        fontWeight: "600", // Baseado no h1 do desktop[cite: 1]
        letterSpacing: -0.5, // Baseado no h1 do desktop[cite: 1]
        marginTop: 6,      
    },

    list: {
        gap: 16, // Espaçamento inspirado na classe .dashboard-menu-grid[cite: 1]
    },

    card: {
        minHeight: 92,         
        alignItems: "center",  
        flexDirection: "row",  
        backgroundColor: "#ffffff", // var(--bg-superficie)[cite: 1]
        borderRadius: 14, // var(--raio-lg)[cite: 1]
        paddingHorizontal: 24, // Baseado no padding da classe .menu-card[cite: 1]
        paddingVertical: 20,   
        borderWidth: 1,        
        borderColor: "#fce9e9", // var(--borda)[cite: 1]
        
        // Adaptação da var(--sombra-sm) do desktop[cite: 1]
        shadowColor: "#101010", 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 3, 
        elevation: 2,
    },

    // Novo wrapper para manter os ícones iguais ao card de menu do desktop
    iconWrapper: {
        width: 50, // Baseado na largura da classe .card-icon[cite: 1]
        height: 50, // Baseado na altura da classe .card-icon[cite: 1]
        backgroundColor: "#ffd8d8", // var(--ciano-claro)[cite: 1]
        borderRadius: 10, // var(--raio)[cite: 1]
        alignItems: "center",
        justifyContent: "center",
        marginRight: 18, // Baseado no gap da classe .menu-card[cite: 1]
    },

    cardText: {
        flex: 1, 
    },

    cardTitle: {
        color: "#270d0d", // var(--texto-primario)[cite: 1]
        fontSize: 16, // Baseado no tamanho do .card-info h3[cite: 1]
        fontWeight: "600", // Baseado no peso do .card-info h3[cite: 1]
    },

    arrow: {
        marginLeft: 12,    
    },
});