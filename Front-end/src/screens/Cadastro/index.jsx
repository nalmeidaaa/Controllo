import React, { useMemo, useState } from "react";
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
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { cadastrarUsuario } from "../../services/usuarioService.js";
import { useTema } from "../../theme/tema.jsx";
import { CheckCircle2, Circle } from "lucide-react-native";
import { validarCPF, checarRequisitosSenha, REQUISITOS_SENHA, senhaAtendeRequisitos } from "../../utils/validacao.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar({ nome, cpf, email, senha, confirmar }) {
    const erros = {};

    if (!nome.trim()) erros.nome = "Informe o nome completo.";
    else if (nome.trim().length < 3) erros.nome = "O nome deve ter ao menos 3 caracteres.";

    if (!cpf.trim()) erros.cpf = "Informe o CPF.";
    else if (!validarCPF(cpf)) erros.cpf = "O CPF informado é inválido.";

    if (!email.trim()) erros.email = "Informe o e-mail.";
    else if (!EMAIL_REGEX.test(email.trim())) erros.email = "Informe um e-mail válido.";

    if (!senha) erros.senha = "Informe a senha.";
    else if (!senhaAtendeRequisitos(senha)) erros.senha = "A senha não atende a todos os requisitos de segurança.";

    if (!confirmar) erros.confirmar = "Confirme a senha.";
    else if (senha !== confirmar) erros.confirmar = "As senhas não conferem.";

    return erros;
}

export default function CadastroScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();

    const [form, setForm] = useState({ nome: "", cpf: "", email: "", senha: "", confirmar: "" });
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(false);

    function alterar(campo, valor) {
        setForm((atual) => ({ ...atual, [campo]: valor }));
        if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
    }

    async function handleSubmit() {
        setErroGeral("");

        const errosValidacao = validar(form);
        setErros(errosValidacao);
        if (Object.keys(errosValidacao).length > 0) return;

        setCarregando(true);
        try {
            await cadastrarUsuario({
                nome: form.nome.trim(),
                cpf: form.cpf.replace(/\D/g, ""),
                email: form.email.trim(),
                senha: form.senha,
            });

            Alert.alert(
                "Cadastro enviado!",
                "Aguarde a aprovação do administrador.",
                [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }],
                { cancelable: false }
            );
        } catch (error) {
            const dados = error.response?.data;
            const mensagem =
                dados?.message ||
                (error.response ? "Não foi possível enviar o cadastro." : "Não foi possível conectar ao servidor.");

            // 409 (CPF/e-mail repetido) e 400 com campo: destaca o campo certo
            if (dados?.campo && ["nome", "cpf", "email", "senha"].includes(dados.campo)) {
                setErros({ [dados.campo]: mensagem });
            } else {
                setErroGeral(mensagem); // 403, 429 e demais
            }
        } finally {
            setCarregando(false);
        }
    }

    function campo({ chave, rotulo, placeholder, ...props }) {
        return (
            <View style={styles.formGroup}>
                <Text style={styles.label}>{rotulo}</Text>
                <TextInput
                    style={[styles.input, erros[chave] && styles.inputErro]}
                    placeholder={placeholder}
                    placeholderTextColor={cores.textoSuave}value={form[chave]}
                    onChangeText={(v) => alterar(chave, v)}
                    editable={!carregando}
                    {...props}
                />
                {!!erros[chave] && <Text style={styles.erroCampo}>{erros[chave]}</Text>}
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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

                        <Text style={styles.title}>Criar conta</Text>
                        <Text style={styles.subtitle}>
                            Seu cadastro será analisado pelo administrador
                        </Text>

                        {campo({ chave: "nome", rotulo: "Nome completo", placeholder: "Seu nome", autoCapitalize: "words" })}
                        {campo({
                            chave: "cpf",
                            rotulo: "CPF",
                            placeholder: "000.000.000-00",
                            keyboardType: "numeric",
                            maxLength: 14,
                        })}
                        {campo({
                            chave: "email",
                            rotulo: "E-mail",
                            placeholder: "exemplo@controllo.com",
                            keyboardType: "email-address",
                            autoCapitalize: "none",
                            autoCorrect: false,
                        })}
                        {campo({
                            chave: "senha",
                            rotulo: "Senha",
                            placeholder: "Mínimo 8 caracteres",
                            secureTextEntry: true,
                            autoCapitalize: "none",
                        })}
                        <ChecklistSenha senha={form.senha} styles={styles} cores={cores} />
                        {campo({
                            chave: "confirmar",
                            rotulo: "Confirmar senha",
                            placeholder: "Repita a senha",
                            secureTextEntry: true,
                            autoCapitalize: "none",
                        })}

                        {!!erroGeral && <Text style={styles.erro}>{erroGeral}</Text>}

                        <TouchableOpacity
                            style={[styles.botao, carregando && styles.botaoDesabilitado]}
                            activeOpacity={0.85}
                            onPress={handleSubmit}
                            disabled={carregando}
                        >
                            {carregando ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.botaoTexto}>Enviar cadastro</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkWrapper}
                            activeOpacity={0.7}
                            onPress={() => navigation.goBack()}
                            disabled={carregando}
                        >
                            <Text style={styles.linkTexto}>
                                Já tem conta? <Text style={styles.linkDestaque}>Entrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const criarStyles = (c) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.fundo },
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
    logoWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    logoMark: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: c.marca,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    logoMarkText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
    logoName: { color: c.texto, fontSize: 18, fontWeight: "700" },
    title: { color: c.texto, fontSize: 24, fontWeight: "700", marginBottom: 4 },
    subtitle: { color: c.textoCinza, fontSize: 14, marginBottom: 24 },
    formGroup: { marginBottom: 16 },
    label: { color: c.textoCinzaEscuro, fontSize: 13, fontWeight: "600", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: c.bordaNeutra,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: c.texto,
        backgroundColor: c.superficie,
    },
    inputErro: { borderColor: c.marca },
    erroCampo: { color: c.marcaTexto, fontSize: 12, marginTop: 4 },
    erro: {
        color: c.marcaTexto,
        backgroundColor: c.marcaMuitoSuave,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        marginBottom: 16,
    },
    botao: {
        backgroundColor: c.marca,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    botaoDesabilitado: { opacity: 0.7 },
    botaoTexto: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
    linkWrapper: { alignItems: "center", marginTop: 20 },
    linkTexto: { color: c.textoCinza, fontSize: 14 },
    linkDestaque: { color: c.marcaTexto, fontWeight: "700" },
    checklist: {
        marginTop: -6,
        marginBottom: 18,
        gap: 6,
    },
    checklistItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    checklistTexto: {
        fontSize: 12,
    },
});

/* Checklist de requisitos da senha (mesmo visual do setup do front-end) */
function ChecklistSenha({ senha, styles, cores }) {
    const atendidos = checarRequisitosSenha(senha);

    return (
        <View style={styles.checklist}>
            {REQUISITOS_SENHA.map((r) => {
                const ok = !!atendidos[r.chave];
                const Icone = ok ? CheckCircle2 : Circle;
                return (
                    <View key={r.chave} style={styles.checklistItem}>
                        <Icone color={ok ? cores.sucesso : cores.textoSuave} size={15} />
                        <Text style={[styles.checklistTexto, { color: ok ? cores.sucesso : cores.textoSuave }]}>
                            {r.texto}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}
