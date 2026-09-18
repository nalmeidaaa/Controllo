export function obterEstiloStatus(status) {
    switch (status) {
        case "Ok":
            return { bg: "#e3f7ea", texto: "#1f9254" };
        case "Pendente":
            return { bg: "#fff4d6", texto: "#a5710a" };
        case "Danificado":
            return { bg: "#ffd8d8", texto: "#c9131c" };
        case "Manutenção":
            return { bg: "#ffe6cf", texto: "#b05a10" };
        case "Descartado":
            return { bg: "#e6e6e6", texto: "#555555" };
        default:
            return { bg: "#eeeeee", texto: "#555555" };
    }
}