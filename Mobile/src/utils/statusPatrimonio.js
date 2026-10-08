export function obterEstiloStatus(status) {
    switch (status) {
        case "Ok":
            return { bg: "#e3f7ea", texto: "#1f9254" };
        case "Pendente":
            return { bg: "#fff4d6", texto: "#a5710a" };
        default:
            return { bg: "#eeeeee", texto: "#555555" };
    }
}
