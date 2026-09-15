import { Router } from "../Dependencies/dependencies.ts";
import {
    postRegistrarAdministrador,
    postRegistrarTecnico,
} from "../Controller/registroController.ts";

const router = new Router();

router
    .post("/api/registro/administrador", postRegistrarAdministrador)
    .post("/api/registro/tecnico", postRegistrarTecnico);

export default router;