import { Context, compararpassword } from "../Dependencies/dependencies.ts";
import { Usuario } from "../Model/usuariosModel.ts";
import { CrearToken } from "../Helpers/Jwt.ts";

export const postLogin = async (ctx: Context) => {
    const { request, response } = ctx;
    try {
        const body = await request.body.json();
        const { correo, contrasena } = body;

        if (!correo || !contrasena) {
            response.status = 400;
            response.body = { success: false, message: "Correo y contraseña son obligatorios" };
            return;
        }

        const modeloUsuario = new Usuario();
        const usuario = await modeloUsuario.ConsultarUsuarioCorreo(correo) as any;

        if (!usuario) {
            response.status = 401;
            response.body = { success: false, message: "Credenciales inválidas" };
            return;
        }

        const passwordValido = await compararpassword(contrasena, usuario.contrasena);
        if (!passwordValido) {
            response.status = 401;
            response.body = { success: false, message: "Credenciales inválidas" };
            return;
        }

        const token = await CrearToken(
            String(usuario.id),
            usuario.rol,
            usuario.correo,
            usuario.nombre
        );

        ctx.cookies.set("jwt_token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60,
        });

        response.status = 200;
        response.body = {
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol,
            },
        };
    } catch (error) {
        response.status = 500;
        response.body = { success: false, message: "Error al iniciar sesión", errors: `${error}` };
    }
};

export const postLogout = (ctx: Context) => {
    ctx.cookies.delete("jwt_token");
    ctx.response.status = 200;
    ctx.response.body = { success: true, message: "Sesión cerrada" };
};