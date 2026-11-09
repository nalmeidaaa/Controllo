// Regras de validação iguais às do setup do front-end (SetupPage.jsx)

// CPF válido pelos dois dígitos verificadores (não aceita sequências repetidas)
export function validarCPF(cpf) {
    const numeros = String(cpf || "").replace(/[^\d]+/g, "");
    if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(numeros.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(numeros.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11), 10)) return false;

    return true;
}

// Requisitos de senha exibidos na checklist do setup
export const REQUISITOS_SENHA = [
    { chave: "tamanho", texto: "Mínimo de 8 caracteres", teste: (s) => s.length >= 8 },
    { chave: "maiuscula", texto: "Pelo menos uma letra maiúscula", teste: (s) => /[A-Z]/.test(s) },
    { chave: "minuscula", texto: "Pelo menos uma letra minúscula", teste: (s) => /[a-z]/.test(s) },
    { chave: "numero", texto: "Pelo menos um número", teste: (s) => /\d/.test(s) },
    { chave: "especial", texto: "Pelo menos um caractere especial (@$!%*?&)", teste: (s) => /[@$!%*?&]/.test(s) },
];

export function checarRequisitosSenha(senha) {
    const texto = String(senha || "");
    return Object.fromEntries(REQUISITOS_SENHA.map((r) => [r.chave, r.teste(texto)]));
}

export function senhaAtendeRequisitos(senha) {
    return Object.values(checarRequisitosSenha(senha)).every(Boolean);
}

// Máscara do CPF enquanto o usuário digita: 000.000.000-00 (mesma regex do SetupPage)
export function mascaraCPF(valor) {
    return String(valor || "")
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+$/, "$1");
}
