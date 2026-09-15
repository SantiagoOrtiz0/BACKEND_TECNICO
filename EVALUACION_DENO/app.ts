import { Application, oakCors } from "./Dependencies/dependencies.ts";
import authRoutes from "./Routes/authRoutes.ts";
import clientesRoutes from "./Routes/clientesRoutes.ts";
import registroRoutes from "./Routes/registroRoutes.ts";

const app = new Application();
app.use(oakCors({
    origin:"*"
}));


const routes = [authRoutes, clientesRoutes, registroRoutes];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

console.log("Servidor corriendo por el puerto 8001");

app.listen({port: 8001});