import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_USUARIO = "@controllo:usuario_logado";

export async function salvarUsuario(usuario) {
    if (usuario) {
        await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    }
}

export async function obterUsuarioAtual() {
    const usuario = await AsyncStorage.getItem(CHAVE_USUARIO);
    return usuario ? JSON.parse(usuario) : null;
}

export async function obterToken() {
    const usuario = await obterUsuarioAtual();
    return usuario ? usuario.token : null;
}

export async function estaLogado() {
    const usuario = await AsyncStorage.getItem(CHAVE_USUARIO);
    return usuario !== null;
}

export async function deslogarUsuario() {
    await AsyncStorage.removeItem(CHAVE_USUARIO);
}
