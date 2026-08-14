import { Router } from "express";
import usuarioRoutes from "./usuarioRoutes.js";
import patrimonioRoutes from "./patrimonioRoutes.js";
import salaRoutes from "./salaRoutes.js";

const routes = Router();

routes.use('/usuarios', usuarioRoutes);
routes.use('/patrimonios', patrimonioRoutes);
routes.use('/salas', salaRoutes);

export default routes;
