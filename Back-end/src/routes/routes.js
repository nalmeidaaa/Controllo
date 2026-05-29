import { Router } from "express";
import usuarioRoutes from "./usuarioRoutes.js";

const routes = Router();

routes.use('/usuarios', usuarioRoutes);

export default routes;