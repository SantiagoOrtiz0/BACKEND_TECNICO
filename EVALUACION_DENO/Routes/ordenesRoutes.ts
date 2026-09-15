import { Router } from "../Dependencies/dependencies.ts";
import {
    getOrdenes,
    getOrdenId,
    postOrden,
    putOrden,
    patchEstadoOrden,
    getHistorialOrden,
    deleteOrden,
} from "../Controller/ordenesController.ts";

const ordenesRouter = new Router();

ordenesRouter
    .get("/ordenes", getOrdenes)
    .get("/ordenes/:id", getOrdenId)
    .get("/ordenes/:id/historial", getHistorialOrden)
    .post("/ordenes", postOrden)
    .put("/ordenes/:id", putOrden)
    .patch("/ordenes/:id/estado", patchEstadoOrden)
    .delete("/ordenes/:id", deleteOrden);

export { ordenesRouter };
