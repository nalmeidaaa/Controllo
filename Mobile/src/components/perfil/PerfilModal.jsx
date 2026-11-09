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
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
    AlertCircle,
    Camera,
    LogOut,
    Moon,
    ShieldCheck,
    Sun,
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
} from "../../utils/usuario.js";
import Avatar from "./Avatar.jsx";

const TIPOS_IMAGEM = ["image/png", "image/jpeg", "image/jpg"];

/*
 * Meu perfil: somente a foto pode ser alterada.
 * Nome, e-mail e CPF são exibidos, mas não são editáveis.
 */
export default function PerfilModal({ aberto, onFechar, onSair, onSessaoExpirada }) {
    const { cores, escuro, alternar } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const insets = useSafeAreaInsets();
    const { height: alturaTela } = useWindowDimensions();
    const usuario = useUsuarioLogado();

    // O Modal só some depois da animação de saída
    const [visivel, setVisivel] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const [previewFoto, setPreviewFoto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState("");
    const [erro, setErro] = useState([]);

    const nomeUsuario = nomeDoUsuario(usuario);
    const fotoUsuario = urlFotoUsuario(usuario);

    // Abre/fecha com animação (fundo escurece e a folha sobe)
    useEffect(() => {
        if (aberto) {
            setSucesso("");
            setErro([]);
            setPreviewFoto("");
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

    async function escolherFoto() {
        if (enviando) return;

        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (resultado.canceled || !resultado.assets?.length) return;
            await enviarFoto(resultado.assets[0]);
        } catch {
            setErro(["Não foi possível abrir a galeria de fotos."]);
        }
    }

    // Envia a foto junto com o nome e o e-mail atuais (o servidor exige os dois).
    // Nome e e-mail não mudam aqui: são reenviados como estão cadastrados.
    async function enviarFoto(asset) {
        setErro([]);
        setSucesso("");
        setPreviewFoto(asset.uri);

        const atual = (await obterUsuarioAtual()) || {};
        const nomeAtual = nomeDoUsuario(atual);
        const emailAtual = String(atual.email || "").trim();

        if (!nomeAtual || !emailAtual) {
            setPreviewFoto("");
            setErro(["Não foi possível identificar seus dados. Feche e abra o app novamente."]);
            return;
        }

        const formData = new FormData();
        formData.append("nome", nomeAtual);
        formData.append("email", emailAtual);

        // O servidor só aceita png/jpeg
        const tipo = TIPOS_IMAGEM.includes(asset.mimeType) ? asset.mimeType : "image/jpeg";
        const extensao = tipo === "image/png" ? "png" : "jpg";
        const nomeArquivo = /\.(png|jpe?g)$/i.test(asset.fileName || "")
            ? asset.fileName
            : `perfil.${extensao}`;

        formData.append("imagem", {
            uri: asset.uri,
            name: nomeArquivo,
            type: tipo,
        });

        try {
            setEnviando(true);

            const token = await obterToken();
            const resposta = await atualizarMeuPerfil(token, formData);
            const retornado = resposta?.result || {};

            const atualizado = {
                ...atual,
                caminho_imagem: retornado.caminho_imagem ?? atual.caminho_imagem,
                sincronizado: true,
            };

            if (retornado.caminho_imagem) {
                delete atualizado.foto_local;
            } else {
                // Enquanto o servidor não confirma o caminho, usa a foto escolhida
                atualizado.foto_local = asset.uri;
            }

            await salvarUsuario(atualizado); // o botão do cabeçalho atualiza sozinho
            setPreviewFoto("");
            setSucesso("Foto atualizada com sucesso!");
        } catch (error) {
            setPreviewFoto("");
            if (ehErroDeSessao(error)) {
                onSessaoExpirada?.();
                return;
            }
            setErro([mensagemDeErro(error, "Erro ao atualizar a foto.")]);
        } finally {
            setEnviando(false);
        }
    }

    function sair() {
        onSair?.();
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
            onRequestClose={onFechar}
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
                            <Text style={styles.cabecalhoTitulo}>Meu perfil</Text>

                            <Pressable
                                onPress={onFechar}
                                style={[styles.botaoIcone, styles.botaoFechar]}
                                accessibilityRole="button"
                                accessibilityLabel="Fechar"
                            >
                                <X color={cores.textoSecundario} size={22} />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.corpoScroll}
                            contentContainerStyle={styles.corpo}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* ───── Resumo: foto (editável) + dados (somente leitura) ───── */}
                            <View style={styles.resumo}>
                                <View style={styles.resumoAnel}>
                                    <Pressable
                                        onPress={escolherFoto}
                                        disabled={enviando}
                                        accessibilityRole="button"
                                        accessibilityLabel="Alterar foto"
                                    >
                                        <Avatar
                                            nome={nomeUsuario}
                                            src={previewFoto || fotoUsuario}
                                            tamanho={88}
                                        />
                                        <View style={styles.cameraBadge}>
                                            <Camera color="#ffffff" size={15} />
                                        </View>
                                    </Pressable>
                                </View>

                                {enviando ? (
                                    <ActivityIndicator color={cores.marca} style={styles.dica} />
                                ) : (
                                    <Text style={styles.dica}>Toque na foto para alterar</Text>
                                )}

                                <Text style={styles.resumoNome}>{nomeUsuario || "Usuário"}</Text>

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

                            {/* ───── Ações ───── */}
                            <View style={styles.acoes}>
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

    });
