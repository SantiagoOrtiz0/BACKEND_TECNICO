import { Router } from "../Dependencies/dependencies.ts";
import { getEquipos,getEquipoId,getEquiposConCliente,postEquipo,putEquipo,deleteEquipo} from "../Controller/equiposController.ts";

const equiposRouter = new Router();

equiposRouter.get("/equipos", getEquipos);
equiposRouter.get("/equipos/con-cliente", getEquiposConCliente);
equiposRouter.get("/equipos/:id", getEquipoId);
equiposRouter.post("/equipos", postEquipo);
equiposRouter.put("/equipos/:id", putEquipo);
equiposRouter.delete("/equipos/:id", deleteEquipo);


export { equiposRouter };
