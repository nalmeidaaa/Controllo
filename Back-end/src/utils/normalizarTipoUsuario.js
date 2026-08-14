export function normalizarTipoUsuario(tipo) {
    return tipo
        .normalize("NFD")                 // separa letras de acentos
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .toLowerCase();                  // tudo minúsculo
}