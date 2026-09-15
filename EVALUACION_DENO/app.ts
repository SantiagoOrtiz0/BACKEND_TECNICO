import { Application, oakCors } from "./Dependencies/dependencies.ts";
import  {equiposRouter} from "./Routes/EquiposRouter.ts";
import { tecnicosRouter } from "./Routes/TecnicosRouter.ts";
import { ordenesRouter } from "./Routes/ordenesRoutes.ts";
import authRoutes from "./Routes/authRoutes.ts";
import clientesRoutes from "./Routes/clientesRoutes.ts";
import registroRoutes from "./Routes/registroRoutes.ts";

const app = new Application();

app.use(oakCors({
    origin:"*"
}));


const routes = [equiposRouter,tecnicosRouter, authRoutes, clientesRoutes, registroRoutes,ordenesRouter];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

console.log("Servidor corriendo por el puerto 8001");

app.listen({port: 8001});