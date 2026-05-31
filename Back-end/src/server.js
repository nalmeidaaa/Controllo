import 'dotenv/config';
import express from "express";
import routes from "../src/routes/routes.js";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', routes);

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.SERVER_PORT}`);
});