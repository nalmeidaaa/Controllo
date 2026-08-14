import 'dotenv/config';
import express from "express";
import routes from "./routes/routes.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configuração para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (imagens de salas)
app.use('/imagens', express.static(path.join(__dirname, '../uploads/imagens')));

// Rotas da API
app.use('/', routes);

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.SERVER_PORT}`);
});
