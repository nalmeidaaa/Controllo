import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Eye, EyeOff } from "lucide-react-native";
import { logar } from "../../services/usuarioService.js";
import { salvarUsuario } from "../../storage/usuario/dados.storage.js";
import { useTema } from "../../theme/tema.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import useAgitar from "../../animations/useAgitar.js";
import { DURACAO, useReduzMovimento } from "../../animations/config.js";
import CampoTexto from "../../components/shared/CampoTexto.jsx";
import LogoControllo from "../../components/shared/LogoControllo.jsx";

const rotasPorTipo = {
    administracao: "AdministracaoScreen",
    manutencao: "ManutencaoScreen",
    geral: "GeralScreen",
};

export default function LoginScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();
    const reduz = useReduzMovimento();

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const senhaRef = useRef(null);
    const { estilo: estiloErro, agitar } = useAgitar();

    // Manchas de cor no fundo que flutuam bem devagar (equivalente aos "blobs" do front-end)
    const deriva = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (reduz) return undefined;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(deriva, { toValue: 1, duration: 7000, useNativeDriver: true }),
                Animated.timing(deriva, { toValue: 0, duration: 7000, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [reduz, deriva]);

    // Sempre que um erro aparece, a caixa treme de leve
    useEffect(() => {
        if (erro) agitar();
    }, [erro, agitar]);

    async function handleSubmit() {
        if (!login.trim() || !senha) {
            setErro("Por favor, preencha todos os campos.");
            return;
        }

        setErro("");
        setCarregando(true);
        try {
            const dados = await logar(login.trim(), senha);
            await salvarUsuario(dados);
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
            {/* Fundo decorativo */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View
                    style={[
                        styles.blob,
                        styles.blobTopo,
                        {
                            transform: [
                                { translateX: deriva.interpolate({ inputRange: [0, 1], outputRange: [-20, 30] }) },
                                { translateY: deriva.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.blob,
                        styles.blobBase,
                        {
                            transform: [
                                { translateX: deriva.interpolate({ inputRange: [0, 1], outputRange: [20, -26] }) },
                                { translateY: deriva.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
                            ],
                        },
                    ]}
                />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <EntradaAnimada distancia={40} duracao={DURACAO.lenta} style={styles.card}>
                        <EntradaAnimada atraso={60} distancia={-14} style={styles.logoWrapper}>
                            <View style={styles.logoMark}>
                                <LogoControllo tamanho={36} />
                            </View>
                            <Text style={styles.logoName}>Controllo</Text>
                        </EntradaAnimada>

                        <EntradaAnimada atraso={120} distancia={14}>
                            <Text style={styles.title}>Boas-vindas</Text>
                            <Text style={styles.subtitle}>
                                Acesse o painel de gerenciamento
                            </Text>
                        </EntradaAnimada>

                        <EntradaAnimada atraso={180} distancia={14}>
                            <CampoTexto
                                rotulo="E-mail"
                                placeholder="exemplo@controllo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                returnKeyType="next"
                                onSubmitEditing={() => senhaRef.current?.focus()}
                                blurOnSubmit={false}
                                value={login}
                                onChangeText={setLogin}
                                erro={!!erro && !login.trim()}
                            />
                        </EntradaAnimada>

                        <EntradaAnimada atraso={240} distancia={14}>
                            <CampoTexto
                                ref={senhaRef}
                                rotulo="Senha"
                                placeholder="••••••••"
                                secureTextEntry={!mostrarSenha}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="password"
                                textContentType="password"
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                value={senha}
                                onChangeText={setSenha}
                                erro={!!erro && !senha}
                                aoLado={
                                    <TouchableOpacity
                                        style={styles.olhoBotao}
                                        onPress={() => setMostrarSenha(!mostrarSenha)}
                                        activeOpacity={0.7}
                                        accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {mostrarSenha ? (
                                            <EyeOff color={cores.textoCinza} size={20} />
                                        ) : (
                                            <Eye color={cores.textoCinza} size={20} />
                                        )}
                                    </TouchableOpacity>
                                }
                            />
                        </EntradaAnimada>

                        {erro ? (
                            <Animated.View style={[styles.erro, estiloErro]}>
                                <Text style={styles.erroTexto}>{erro}</Text>
                            </Animated.View>
                        ) : null}

                        <EntradaAnimada atraso={300} distancia={14}>
                            <PressionavelAnimado
                                onPress={handleSubmit}
                                disabled={carregando}
                                style={[styles.botao, carregando && styles.botaoDesabilitado]}
                                accessibilityLabel="Entrar no painel"
                            >
                                {carregando ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.botaoTexto}>Entrar no Painel</Text>
                                )}
                            </PressionavelAnimado>
                        </EntradaAnimada>

                        <EntradaAnimada atraso={360} distancia={10}>
                            <TouchableOpacity
                                style={styles.linkWrapper}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("CadastroScreen")}
                                disabled={carregando}
                            >
                                <Text style={styles.linkTexto}>
                                    Não tem conta?{" "}
                                    <Text style={styles.linkDestaque}>Criar conta</Text>
                                </Text>
                            </TouchableOpacity>
                        </EntradaAnimada>
                    </EntradaAnimada>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: c.fundo,
            overflow: "hidden",
        },
        blob: {
            position: "absolute",
            borderRadius: 999,
            backgroundColor: c.marca,
        },
        blobTopo: {
            width: 300,
            height: 300,
            top: -110,
            left: -90,
            opacity: 0.12,
        },
        blobBase: {
            width: 260,
            height: 260,
            bottom: -100,
            right: -80,
            opacity: 0.08,
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
            backgroundColor: c.superficie,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: c.borda,
            paddingHorizontal: 28,
            paddingVertical: 32,
            shadowColor: c.sombra,
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
            marginRight: 10,
        },
        logoName: {
            color: c.texto,
            fontSize: 18,
            fontWeight: "700",
        },
        title: {
            color: c.texto,
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 4,
        },
        subtitle: {
            color: c.textoCinza,
            fontSize: 14,
            marginBottom: 28,
        },
        olhoBotao: {
            paddingHorizontal: 14,
            justifyContent: "center",
            alignItems: "center",
        },
        erro: {
            color: c.marcaTexto,
            backgroundColor: c.marcaMuitoSuave,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 16,
        },
        erroTexto: {
            color: c.marcaTexto,
            fontSize: 13,
        },
        botao: {
            backgroundColor: c.marca,
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
            shadowColor: c.marca,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
        },
        botaoDesabilitado: {
            opacity: 0.7,
        },
        botaoTexto: {
            color: "#ffffff",
            fontSize: 15,
            fontWeight: "600",
        },
        linkWrapper: {
            marginTop: 22,
            alignItems: "center",
        },
        linkTexto: {
            color: c.textoCinza,
            fontSize: 14,
        },
        linkDestaque: {
            color: c.marcaTexto,
            fontWeight: "600",
        },
    });
