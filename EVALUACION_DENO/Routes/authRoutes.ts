import { Router } from "../Dependencies/dependencies.ts";
import { postLogin, postLogout } from "../Controller/loginController.ts";

const router = new Router();

router
    .post("/api/login", postLogin)
    .post("/api/logout", postLogout);

export default router;