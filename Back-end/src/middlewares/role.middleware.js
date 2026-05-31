import { normalizarTipoUsuario } from "../utils/normalizarTipoUsuario.js";
import usuarioRepository from "../repositories/usuarioRepository.js";


export function autorizar(perfisPermitidos) {
    // Normaliza a lista de permissões uma única vez na inicialização da rota
    const perfisValidos = perfisPermitidos.map(p => normalizarTipoUsuario(p));

    return (req, res, next) => {
        console.log("Conteúdo de req.usuario:", req.usuario);
        if (!req.usuario) {
            return res.status(401).json({ erro: "Não autenticado" });
        }

        const tipoUsuario = normalizarTipoUsuario(req.usuario.tipo_usuario);

        // Agora apenas checa no array que já está pronto
        if (!perfisValidos.includes(tipoUsuario)) {
            return res.status(403).json({ erro: "Acesso negado" });
        }

        next();
    };
}