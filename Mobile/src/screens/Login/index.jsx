import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { logar } from "../../services/usuarioService.js";
import { salvarUsuario } from "../../storage/usuario/dados.storage.js";

const corPrincipal = "#c9131c";

const rotasPorTipo = {
    administracao: "AdministracaoScreen",
    manutencao: "ManutencaoScreen",
    geral: "GeralScreen",
};

export default function LoginScreen() {
    const navigation = useNavigation();
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit() {
        setErro("");
        setCarregando(true);
        try {
            const dados = await logar(login.trim(), senha);
            await salvarUsuario(dados);
            console.log("dados eviados: ",dados)
            const rota = rotasPorTipo[dados.tipo_usuario];
            if (!rota) throw new Error("Tipo de usuário não reconhecido.");

            navigation.reset({
                index: 0,
                routes: [{ name: rota }],
            });
        } catch (error) {
            const textoErro =
                error.response?.data?.message ||
                error.message ||
                "Não foi possível conectar ao servidor.";
            setErro(textoErro);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <View style={styles.logoWrapper}>
                            <View style={styles.logoMark}>
                                <Text style={styles.logoMarkText}>C</Text>
                            </View>
                            <Text style={styles.logoName}>Controllo</Text>
                        </View>

                        <Text style={styles.title}>Boas-vindas</Text>
                        <Text style={styles.subtitle}>
                            Acesse o painel de gerenciamento
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Acesso ou E-mail</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="exemplo@controllo.com"
                                placeholderTextColor="#8c8c96"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={login}
                                onChangeText={setLogin}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Senha</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#8c8c96"
                                secureTextEntry
                                autoCapitalize="none"
                                value={senha}
                                onChangeText={setSenha}
                            />
                        </View>

                        {erro ? (
                            <Text style={styles.erro}>{erro}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.botao,
                                carregando && styles.botaoDesabilitado,
                            ]}
                            activeOpacity={0.85}
                            onPress={handleSubmit}
                            disabled={carregando}
                        >
                            {carregando ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.botaoTexto}>
                                    Entrar no Painel
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f4f7f7",
    },

    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },

    card: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#fce9e9",
        paddingHorizontal: 28,
        paddingVertical: 32,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },

    logoWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    logoMark: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: corPrincipal,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    logoMarkText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
    },

    logoName: {
        color: "#2d0e0e",
        fontSize: 18,
        fontWeight: "700",
    },

    title: {
        color: "#2d0e0e",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },

    subtitle: {
        color: "#6b6b73",
        fontSize: 14,
        marginBottom: 28,
    },

    formGroup: {
        marginBottom: 18,
    },

    label: {
        color: "#55555d",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },

    input: {
        borderWidth: 1,
        borderColor: "#e1e1e6",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#2d0e0e",
        backgroundColor: "#ffffff",
    },

    erro: {
        color: "#c9131c",
        backgroundColor: "#fde8e9",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        marginBottom: 16,
    },

    botao: {
        backgroundColor: corPrincipal,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },

    botaoDesabilitado: {
        opacity: 0.7,
    },

    botaoTexto: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
});
