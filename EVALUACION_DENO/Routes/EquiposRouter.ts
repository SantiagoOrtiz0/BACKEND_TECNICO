import { Router } from "../Dependencies/dependencies.ts";
import { getEquipos,getEquipoId,getEquiposConCliente,postEquipo,putEquipo,deleteEquipo} from "../Controller/equiposController.ts";

const equiposRouter = new Router();

equiposRouter.get("/tecnicos", getEquipos);
equiposRouter.get("/tecnicos/:id",getEquipoId);
equiposRouter.get("/equipos/con-cliente", getEquiposConCliente);
equiposRouter.post("/tecnicos",postEquipo);
equiposRouter.put("/tecnicos/:id",putEquipo);
equiposRouter.delete("/tecnicos/:id",deleteEquipo);


export { equiposRouter };
