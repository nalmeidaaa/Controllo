import jwt from 'jsonwebtoken';

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token não informado' });
    const token = authHeader.split(' ')[1];

    try {        
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next(); 
    } catch (error) {
        console.error("Erro na verificação:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
}

export default authMiddleware;