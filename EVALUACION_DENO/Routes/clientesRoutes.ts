import { Router } from "../Dependencies/dependencies.ts";
import { authMiddleware } from "../Middleware/validarjwt.ts";
import { postRegistrarCliente } from "../Controller/clientesController.ts";

const router = new Router();


router.post("/api/clientes", authMiddleware, postRegistrarCliente);

export default router;