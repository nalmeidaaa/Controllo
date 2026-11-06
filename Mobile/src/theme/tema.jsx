import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_TEMA = "@controllo:tema";

// Mesma identidade visual do front-end (tema claro / tema escuro)
const claro = {
    fundo: "#f4f7f7",
    superficie: "#ffffff",
    superficieAlt: "#f4f7f7",
    texto: "#2d0e0e",
    textoSecundario: "#5a4646",
    textoSuave: "#8c8c96",
    textoDiscreto: "#a99",
    borda: "#fce9e9",
    bordaForte: "#c4c4cc",
    marca: "#c9131c",
    marcaEscura: "#b01d2e",
    marcaTexto: "#c9131c", // marca usada como cor de texto (mais clara no tema escuro)
    marcaSuave: "#ffd8d8",
    perigo: "#dc2626",
    perigoSuave: "rgba(220, 38, 38, 0.08)",
    perigoBorda: "rgba(220, 38, 38, 0.22)",
    sucesso: "#198754",
    sucessoSuave: "rgba(25, 135, 84, 0.14)",
    sucessoBorda: "rgba(25, 135, 84, 0.3)",
    input: "#f9f9fb",
    overlay: "rgba(18, 18, 20, 0.55)",
    sombra: "#101010",
    cardMural: "#fafafa",
    iconeNeutro: "#eeeeee",
    iconeNeutroCor: "#8a8a8a",
    divisor: "#eaeaea",
    bordaMural: "rgb(239, 239, 239)",
    alerta: { fundo: "#fff4d6", cor: "#a5710a" },
    andamento: { fundo: "#ffd8d8", cor: "#c9131c" },
    concluido: { fundo: "#e3f7ea", cor: "#1f9254" },
    // usados pelas telas internas (valores idênticos aos originais do app)
    textoMudo: "#8a7373",
    textoCinza: "#6b6b73",
    textoCinzaEscuro: "#55555d",
    textoMural: "#7a6a6a",
    bordaInput: "#e6d3d3",
    bordaNeutra: "#e1e1e6",
    bordaClara: "#e0e0e0",
    marcaMuitoSuave: "#fde8e9",
    fundoRosado: "#fff1f1",
    fundoCampo: "#fbf5f5",
    fundoBusca: "#f5f5f5",
    linhaTimeline: "#f0d4d4",
    prioridadeMedia: { fundo: "#ffe6cf", cor: "#b05a10" },
    prioridadeBaixa: { fundo: "#e6e6e6", cor: "#555555" },
    neutro: { fundo: "#eeeeee", cor: "#555555" },
};

const escuro = {
    fundo: "#0e0e11",
    superficie: "#17171c",
    superficieAlt: "#1c1c22",
    texto: "#ececf1",
    textoSecundario: "#b4b4bf",
    textoSuave: "#8b8b97",
    textoDiscreto: "#8b8b97",
    borda: "#2c2c35",
    bordaForte: "#43434e",
    marca: "#e30613",
    marcaEscura: "#ff5a66",
    marcaTexto: "#ff6b74",
    marcaSuave: "rgba(227, 6, 19, 0.24)",
    perigo: "#f87171",
    perigoSuave: "rgba(248, 113, 113, 0.1)",
    perigoBorda: "rgba(248, 113, 113, 0.38)",
    sucesso: "#4ade80",
    sucessoSuave: "rgba(34, 197, 94, 0.14)",
    sucessoBorda: "rgba(34, 197, 94, 0.4)",
    input: "#1d1d23",
    overlay: "rgba(0, 0, 0, 0.65)",
    sombra: "#000000",
    cardMural: "#1c1c22",
    iconeNeutro: "#2a2a32",
    iconeNeutroCor: "#8b8b97",
    divisor: "#2c2c35",
    bordaMural: "#2f2f38",
    alerta: { fundo: "rgba(245, 158, 11, 0.16)", cor: "#f5b942" },
    andamento: { fundo: "rgba(227, 6, 19, 0.24)", cor: "#ff6b74" },
    concluido: { fundo: "rgba(34, 197, 94, 0.16)", cor: "#4ade80" },
    textoMudo: "#9a9aa6",
    textoCinza: "#a8a8b3",
    textoCinzaEscuro: "#b4b4bf",
    textoMural: "#a0a0ab",
    bordaInput: "#3a3a44",
    bordaNeutra: "#3a3a44",
    bordaClara: "#2f2f38",
    marcaMuitoSuave: "rgba(227, 6, 19, 0.16)",
    fundoRosado: "rgba(227, 6, 19, 0.12)",
    fundoCampo: "#1d1d23",
    fundoBusca: "#1d1d23",
    linhaTimeline: "#3a2a2c",
    prioridadeMedia: { fundo: "rgba(251, 146, 60, 0.18)", cor: "#fb923c" },
    prioridadeBaixa: { fundo: "#2a2a32", cor: "#b4b4bf" },
    neutro: { fundo: "#2a2a32", cor: "#b4b4bf" },
};

const TemaContext = createContext({
    tema: "light",
    escuro: false,
    cores: claro,
    alternar: () => {},
});

export function TemaProvider({ children }) {
    const [tema, setTema] = useState("light");
    const [carregado, setCarregado] = useState(false);

    // Recupera o tema escolhido da última vez
    useEffect(() => {
        let ativo = true;

        AsyncStorage.getItem(CHAVE_TEMA)
            .then((salvo) => {
                if (ativo && (salvo === "dark" || salvo === "light")) {
                    setTema(salvo);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (ativo) setCarregado(true);
            });

        return () => {
            ativo = false;
        };
    }, []);

    const alternar = useCallback(() => {
        setTema((atual) => {
            const novo = atual === "dark" ? "light" : "dark";
            AsyncStorage.setItem(CHAVE_TEMA, novo).catch(() => {});
            return novo;
        });
    }, []);

    const valor = useMemo(
        () => ({
            tema,
            escuro: tema === "dark",
            cores: tema === "dark" ? escuro : claro,
            alternar,
        }),
        [tema, alternar]
    );

    // Evita o "piscar" de tema claro antes de ler a preferência salva
    if (!carregado) return null;

    return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
    return useContext(TemaContext);
}
