import { Application, oakCors } from "./Dependencies/dependencies.ts";
import { equiposRouter } from "./Router/EquiposRouter.ts";
import { tecnicosRouter } from "./Router/TecnicosRouter.ts";

const app = new Application();

app.use(oakCors({
    origin:"*"
}));


const routes = [equiposRouter,tecnicosRouter];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

console.log("Servidor corriendo por el puerto 8001");

app.listen({port: 8001});