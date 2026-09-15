import { Router } from "../Dependencies/dependencies.ts";
import { getTecnicos,getTecnicoId,postTecnico,putTecnico,patchEstadoTecnico, deleteTecnico} from "../Controller/tecnicosController.ts";

const tecnicosRouter = new Router();

tecnicosRouter.get("/tecnicos", getTecnicos);
tecnicosRouter.get("/tecnicos/:id",getTecnicoId);
tecnicosRouter.post("/tecnicos",postTecnico);
tecnicosRouter.put("/tecnicos/:id",putTecnico);
tecnicosRouter.patch("/tecnicos/:id/estado",patchEstadoTecnico);
tecnicosRouter.delete("/tecnicos/:id",deleteTecnico);


export { tecnicosRouter };
