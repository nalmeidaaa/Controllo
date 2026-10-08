import rateLimit from "express-rate-limit";

// Limite de tentativas do cadastro público, por IP.
// Padrão: 20 tentativas a cada 15 minutos (valor alto o bastante para uma escola
// com vários alunos na mesma rede). Ajustável pela variável CADASTRO_LIMITE_TENTATIVAS.
export const limitarCadastro = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.CADASTRO_LIMITE_TENTATIVAS) || 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente."
    }
});
