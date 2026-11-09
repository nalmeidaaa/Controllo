import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
    AlertCircle,
    ArrowLeft,
    Camera,
    ChevronRight,
    CreditCard,
    LogOut,
    Mail,
    Moon,
    Pencil,
    ShieldCheck,
    Sun,
    User,
    X,
} from "lucide-react-native";
import { useTema } from "../../theme/tema.jsx";
import { useUsuarioLogado } from "../../hooks/useUsuarioLogado.js";
import {
    obterToken,
    obterUsuarioAtual,
    salvarUsuario,
} from "../../storage/usuario/dados.storage.js";
import { atualizarMeuPerfil } from "../../services/usuarioService.js";
import {
    ehErroDeSessao,
    mensagemDeErro,
} from "../../services/requisicaoGeralService.js";
import {
    nomeDoUsuario,
    urlFotoUsuario,
    rotuloTipoUsuario,
    formatarCpf,
} from "../../utils/usuario.js";
import Avatar from "./Avatar.jsx";

const TIPOS_IMAGEM = ["image/png", "image/jpeg", "image/jpg"];

export default function PerfilModal({ aberto, onFechar, onSair, onSessaoExpirada }) {
    const { cores, escuro, alternar } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const insets = useSafeAreaInsets();
    const { height: alturaTela } = useWindowDimensions();
    const usuario = useUsuarioLogado();

    // O Modal só some depois da animação de saída
    const [visivel, setVisivel] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    // 'menu' = resumo + ações | 'editar' = formulário
    const [visao, setVisao] = useState("menu");
    const [form, setForm] = useState({ nome: "", email: "", imagem: null });
    const [previewFoto, setPreviewFoto] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState("");
    const [erro, setErro] = useState([]);

    const nomeUsuario = nomeDoUsuario(usuario);
    const fotoUsuario = urlFotoUsuario(usuario);
    const editando = visao === "editar";

    function carregarFormulario() {
        setForm({ nome: nomeUsuario, email: usuario?.email || "", imagem: null });
        setPreviewFoto(fotoUsuario || "");
        setSucesso("");
        setErro([]);
    }

    // Abre/fecha com animação (fundo escurece e a folha sobe)
    useEffect(() => {
        if (aberto) {
            setVisao("menu");
            carregarFormulario();
            setVisivel(true);
            Animated.timing(anim, {
                toValue: 1,
                duration: 280,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) setVisivel(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberto]);

    function abrirEdicao() {
        carregarFormulario();
        setVisao("editar");
    }

    function voltarAoMenu() {
        setVisao("menu");
        setSucesso("");
        setErro([]);
    }

    // Botão voltar do Android: na edição volta ao menu; no menu fecha
    function voltarOuFechar() {
        if (editando) voltarAoMenu();
        else onFechar?.();
    }

    function atualizarCampo(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
        setSucesso("");
        setErro([]);
    }

    async function escolherFoto() {
        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (resultado.canceled || !resultado.assets?.length) return;

            const asset = resultado.assets[0];
            setForm((f) => ({ ...f, imagem: asset }));
            setPreviewFoto(asset.uri);
            setSucesso("");
            setErro([]);
        } catch {
            setErro(["Não foi possível abrir a galeria de fotos."]);
        }
    }

    function sair() {
        onSair?.();
    }

    async function salvar() {
        setErro([]);
        setSucesso("");

        const nome = form.nome.trim();
        const email = form.email.trim();

        if (!nome) return setErro(["Informe o nome completo."]);
        if (!email) return setErro(["Informe o E-mail."]);

        const formData = new FormData();
        formData.append("nome", nome);
        formData.append("email", email);

        if (form.imagem) {
            // O servidor só aceita png/jpeg
            const tipo = TIPOS_IMAGEM.includes(form.imagem.mimeType)
                ? form.imagem.mimeType
                : "image/jpeg";
            const extensao = tipo === "image/png" ? "png" : "jpg";
            const nomeArquivo = /\.(png|jpe?g)$/i.test(form.imagem.fileName || "")
                ? form.imagem.fileName
                : `perfil.${extensao}`;

            formData.append("imagem", {
                uri: form.imagem.uri,
                name: nomeArquivo,
                type: tipo,
            });
        }

        try {
            setSalvando(true);

            const token = await obterToken();
            const resposta = await atualizarMeuPerfil(token, formData);
            const retornado = resposta?.result || {};

            const atual = (await obterUsuarioAtual()) || {};
            const atualizado = {
                ...atual,
                nome: retornado.nome || nome,
                email: retornado.email ?? email,
                cpf: retornado.cpf ?? atual.cpf,
                caminho_imagem: retornado.caminho_imagem ?? atual.caminho_imagem,
                sincronizado: true,
            };

            if (retornado.caminho_imagem) {
                delete atualizado.foto_local;
            } else if (form.imagem) {
                // Enquanto o servidor não confirma o caminho, usa a foto escolhida
                atualizado.foto_local = form.imagem.uri;
            }

            await salvarUsuario(atualizado); // o botão do cabeçalho atualiza sozinho

            setForm((f) => ({ ...f, imagem: null }));
            setSucesso("Perfil atualizado com sucesso!");
        } catch (error) {
            if (ehErroDeSessao(error)) {
                onSessaoExpirada?.();
                return;
            }
            setErro([mensagemDeErro(error, "Erro ao atualizar o perfil.")]);
        } finally {
            setSalvando(false);
        }
    }

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [alturaTela, 0],
    });

    return (
        <Modal
            visible={visivel}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={voltarOuFechar}
        >
            <View style={styles.raiz}>
                <Animated.View
                    style={[StyleSheet.absoluteFill, styles.fundo, { opacity: anim }]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={onFechar}
                        accessibilityLabel="Fechar perfil"
                    />
                </Animated.View>

                <KeyboardAvoidingView behavior="padding" style={styles.kav}>
                    <Animated.View
                        style={[
                            styles.folha,
                            {
                                maxHeight: alturaTela * 0.92,
                                paddingBottom: Math.max(insets.bottom, 16),
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        {/* ───── Cabeçalho ───── */}
                        <View style={styles.cabecalho}>
                            {editando && (
                                <Pressable
                                    onPress={voltarAoMenu}
                                    style={styles.botaoIcone}
                                    accessibilityRole="button"
                                    accessibilityLabel="Voltar"
                                >
                                    <ArrowLeft color={cores.textoSecundario} size={20} />
                                </Pressable>
                            )}

                            <Text style={styles.cabecalhoTitulo}>
                                {editando ? "Editar perfil" : "Meu perfil"}
                            </Text>

                            <Pressable
                                onPress={onFechar}
                                style={[styles.botaoIcone, styles.botaoFechar]}
                                accessibilityRole="button"
                                accessibilityLabel="Fechar"
                            >
                                <X color={cores.textoSecundario} size={22} />
                            </Pressable>
                        </View>

                        {!editando ? (
                            /* ───── Visão: resumo + ações ───── */
                            <ScrollView
                                style={styles.corpoScroll}
                                contentContainerStyle={styles.corpo}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.resumo}>
                                    <View style={styles.resumoAnel}>
                                        <Avatar nome={nomeUsuario} src={fotoUsuario} tamanho={88} />
                                    </View>

                                    <Text style={styles.resumoNome}>
                                        {nomeUsuario || "Usuário"}
                                    </Text>

                                    {!!usuario?.email && (
                                        <Text style={styles.resumoEmail}>{usuario.email}</Text>
                                    )}

                                    {!!usuario?.tipo_usuario && (
                                        <View style={styles.resumoTipo}>
                                            <Text style={styles.resumoTipoTexto}>
                                                {rotuloTipoUsuario(usuario.tipo_usuario)}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.acoes}>
                                    <Pressable
                                        style={({ pressed }) => [styles.acao, pressed && styles.acaoPressionada]}
                                        onPress={abrirEdicao}
                                        accessibilityRole="button"
                                    >
                                        <View style={styles.acaoIcone}>
                                            <Pencil color={cores.textoSecundario} size={19} />
                                        </View>
                                        <View style={styles.acaoTexto}>
                                            <Text style={styles.acaoTitulo}>Editar perfil</Text>
                                            <Text style={styles.acaoSub}>Nome, e-mail e foto</Text>
                                        </View>
                                        <ChevronRight color={cores.textoSuave} size={18} />
                                    </Pressable>

                                    <Pressable
                                        style={({ pressed }) => [styles.acao, pressed && styles.acaoPressionada]}
                                        onPress={alternar}
                                        accessibilityRole="switch"
                                        accessibilityState={{ checked: escuro }}
                                    >
                                        <View style={styles.acaoIcone}>
                                            {escuro ? (
                                                <Moon color={cores.textoSecundario} size={19} />
                                            ) : (
                                                <Sun color={cores.textoSecundario} size={19} />
                                            )}
                                        </View>
                                        <View style={styles.acaoTexto}>
                                            <Text style={styles.acaoTitulo}>Modo escuro</Text>
                                            <Text style={styles.acaoSub}>
                                                {escuro ? "Ativado" : "Desativado"}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={escuro}
                                            onValueChange={alternar}
                                            trackColor={{ false: cores.bordaForte, true: cores.marca }}
                                            thumbColor="#ffffff"
                                        />
                                    </Pressable>

                                    <View style={styles.divisor} />

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.acao,
                                            pressed && styles.acaoPerigoPressionada,
                                        ]}
                                        onPress={sair}
                                        accessibilityRole="button"
                                    >
                                        <View style={[styles.acaoIcone, styles.acaoIconePerigo]}>
                                            <LogOut color={cores.perigo} size={19} />
                                        </View>
                                        <View style={styles.acaoTexto}>
                                            <Text style={[styles.acaoTitulo, { color: cores.perigo }]}>
                                                Sair
                                            </Text>
                                            <Text style={styles.acaoSub}>
                                                Encerrar a sessão neste dispositivo
                                            </Text>
                                        </View>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        ) : (
                            /* ───── Visão: edição ───── */
                            <>
                                <ScrollView
                                    style={styles.corpoScroll}
                                    contentContainerStyle={styles.corpo}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.fotoSecao}>
                                        <Pressable
                                            onPress={escolherFoto}
                                            accessibilityRole="button"
                                            accessibilityLabel="Alterar foto"
                                        >
                                            <Avatar nome={form.nome} src={previewFoto} tamanho={96} />
                                            <View style={styles.cameraBadge}>
                                                <Camera color="#ffffff" size={15} />
                                            </View>
                                        </Pressable>
                                        <Text style={styles.dica}>Toque na foto para alterar</Text>
                                    </View>

                                    {!!sucesso && (
                                        <View style={[styles.alerta, styles.alertaOk]}>
                                            <ShieldCheck color={cores.sucesso} size={18} />
                                            <Text style={[styles.alertaTexto, { color: cores.sucesso }]}>
                                                {sucesso}
                                            </Text>
                                        </View>
                                    )}

                                    {erro.length > 0 && (
                                        <View style={[styles.alerta, styles.alertaErro]}>
                                            <AlertCircle color={cores.perigo} size={18} />
                                            <View style={{ flex: 1 }}>
                                                {erro.map((msg, i) => (
                                                    <Text
                                                        key={i}
                                                        style={[styles.alertaTexto, { color: cores.perigo }]}
                                                    >
                                                        {msg}
                                                    </Text>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.form}>
                                        <View>
                                            <Text style={styles.label}>Nome completo *</Text>
                                            <View style={styles.campo}>
                                                <User color={cores.textoSuave} size={18} style={styles.campoIcone} />
                                                <TextInput
                                                    style={styles.input}
                                                    value={form.nome}
                                                    onChangeText={(v) => atualizarCampo("nome", v)}
                                                    autoCapitalize="words"
                                                    placeholder="Seu nome completo"
                                                    placeholderTextColor={cores.textoSuave}
                                                />
                                            </View>
                                        </View>

                                        <View>
                                            <Text style={styles.label}>CPF (não editável)</Text>
                                            <View style={[styles.campo, styles.campoDesabilitado]}>
                                                <CreditCard color={cores.textoSuave} size={18} style={styles.campoIcone} />
                                                <TextInput
                                                    style={styles.input}
                                                    value={formatarCpf(usuario?.cpf)}
                                                    editable={false}
                                                    placeholder="Não informado"
                                                    placeholderTextColor={cores.textoSuave}
                                                />
                                            </View>
                                        </View>

                                        <View>
                                            <Text style={styles.label}>E-mail *</Text>
                                            <View style={styles.campo}>
                                                <Mail color={cores.textoSuave} size={18} style={styles.campoIcone} />
                                                <TextInput
                                                    style={styles.input}
                                                    value={form.email}
                                                    onChangeText={(v) => atualizarCampo("email", v)}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    placeholder="exemplo@controllo.com"
                                                    placeholderTextColor={cores.textoSuave}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.rodape}>
                                    <Pressable
                                        style={[styles.botao, styles.botaoSecundario]}
                                        onPress={voltarAoMenu}
                                        disabled={salvando}
                                    >
                                        <Text style={styles.botaoSecundarioTexto}>Voltar</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.botao,
                                            styles.botaoPrimario,
                                            salvando && { opacity: 0.7 },
                                        ]}
                                        onPress={salvar}
                                        disabled={salvando}
                                    >
                                        {salvando ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={styles.botaoPrimarioTexto}>
                                                Salvar alterações
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        raiz: { flex: 1 },
        fundo: { backgroundColor: c.overlay },
        kav: { flex: 1, justifyContent: "flex-end" },

        folha: {
            backgroundColor: c.superficie,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: c.borda,
            overflow: "hidden",
        },

        // ── Cabeçalho ──
        cabecalho: {
            height: 64,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: c.borda,
        },
        cabecalhoTitulo: {
            color: c.texto,
            fontSize: 18,
            fontWeight: "600",
            marginLeft: 8,
        },
        botaoIcone: {
            width: 38,
            height: 38,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },
        botaoFechar: { marginLeft: "auto" },

        corpoScroll: { flexGrow: 0, flexShrink: 1 },
        corpo: { padding: 24, gap: 20 },

        // ── Resumo ──
        resumo: { alignItems: "center", paddingTop: 4 },
        resumoAnel: {
            padding: 3,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: c.marca,
            marginBottom: 14,
        },
        resumoNome: {
            color: c.texto,
            fontSize: 20,
            fontWeight: "600",
            letterSpacing: -0.3,
            textAlign: "center",
        },
        resumoEmail: {
            color: c.textoSecundario,
            fontSize: 13,
            marginTop: 2,
            textAlign: "center",
        },
        resumoTipo: {
            marginTop: 10,
            paddingVertical: 3,
            paddingHorizontal: 12,
            borderRadius: 999,
            backgroundColor: c.marcaSuave,
        },
        resumoTipoTexto: {
            color: c.marcaEscura,
            fontSize: 11.5,
            fontWeight: "600",
            letterSpacing: 0.3,
            textTransform: "uppercase",
        },

        // ── Ações ──
        acoes: { gap: 4 },
        acao: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "transparent",
        },
        acaoPressionada: {
            backgroundColor: c.superficieAlt,
            borderColor: c.borda,
        },
        acaoPerigoPressionada: {
            backgroundColor: c.perigoSuave,
            borderColor: c.perigoBorda,
        },
        acaoIcone: {
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.superficieAlt,
            borderWidth: 1,
            borderColor: c.borda,
        },
        acaoIconePerigo: {
            backgroundColor: c.perigoSuave,
            borderColor: c.perigoBorda,
        },
        acaoTexto: { flex: 1 },
        acaoTitulo: { color: c.texto, fontSize: 14.5, fontWeight: "600" },
        acaoSub: { color: c.textoSuave, fontSize: 12.5, marginTop: 1 },
        divisor: {
            height: 1,
            marginVertical: 8,
            marginHorizontal: 6,
            backgroundColor: c.borda,
        },

        // ── Edição ──
        fotoSecao: { alignItems: "center", gap: 8 },
        cameraBadge: {
            position: "absolute",
            right: 0,
            bottom: 2,
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.marca,
            borderWidth: 2,
            borderColor: c.superficie,
        },
        dica: { color: c.textoSuave, fontSize: 12 },

        alerta: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 6,
            borderWidth: 1,
        },
        alertaOk: { backgroundColor: c.sucessoSuave, borderColor: c.sucessoBorda },
        alertaErro: { backgroundColor: c.perigoSuave, borderColor: c.perigoBorda },
        alertaTexto: { fontSize: 13, flexShrink: 1 },

        form: { gap: 16 },
        label: {
            color: c.textoSecundario,
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 6,
        },
        campo: { justifyContent: "center" },
        campoIcone: { position: "absolute", left: 12, zIndex: 1 },
        campoDesabilitado: { opacity: 0.7 },
        input: {
            height: 46,
            paddingLeft: 38,
            paddingRight: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.borda,
            backgroundColor: c.input,
            color: c.texto,
            fontSize: 15,
        },

        rodape: {
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 14,
            paddingHorizontal: 24,
            borderTopWidth: 1,
            borderTopColor: c.borda,
            backgroundColor: c.superficieAlt,
        },
        botao: {
            minHeight: 44,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
        },
        botaoSecundario: {
            borderWidth: 1,
            borderColor: c.bordaForte,
            backgroundColor: c.superficie,
        },
        botaoSecundarioTexto: { color: c.textoSecundario, fontSize: 14.5, fontWeight: "600" },
        botaoPrimario: { backgroundColor: c.marca, minWidth: 150 },
        botaoPrimarioTexto: { color: "#ffffff", fontSize: 14.5, fontWeight: "600" },
    });
