import { VerificarTokenAcceso } from "../Helpers/Jwt.ts";
import { Context, Next } from "../Dependencies/dependencies.ts";

export async function authMiddleware(ctx: Context, next: Next) {
    // Prioriza la cookie httpOnly; si no está, intenta el header (compatibilidad)
    const tokenCookie = await ctx.cookies.get("jwt_token");
    const authHeader = ctx.request.headers.get("Authorization");
    const tokenHeader = authHeader?.split(" ")[1];

    const token = tokenCookie ?? tokenHeader;

    if (!token) {
        ctx.response.status = 401;
        ctx.response.body = { error: "No se proporcionó un token de acceso" };
        return;
    }

    const usuario = await VerificarTokenAcceso(token);

    if (!usuario) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Token de acceso inválido" };
        return;
    }

    ctx.state.usuario = usuario;   // consistente
    await next();
}

export async function soloAdmin(ctx: Context, next: Next) {
    const usuario = ctx.state.user;

    if(usuario?.rol !== "ADMINISTRADOR") {
        ctx.response.status = 403;
        ctx.response.body = {error: "No tiene permisos de administrador"};
        return;
    }

    await next();
}