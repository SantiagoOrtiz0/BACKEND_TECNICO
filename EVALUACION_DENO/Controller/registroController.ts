import { Context, bcrypt } from "../Dependencies/dependencies.ts";
import { Usuario } from "../Model/usuariosModel.ts";
import { Rol } from "../Model/rolesModel.ts";
import { Tecnico } from "../Model/tecnicosModel.ts";

// Registrar ADMINISTRADOR (solo toca usuarios)
export const postRegistrarAdministrador = async (ctx: Context) => {
    const { request, response } = ctx;
    try {
        const body = await request.body.json();
        const { nombre, correo, contrasena } = body;

        if (!nombre || !correo || !contrasena) {
            response.status = 400;
            response.body = { success: false, message: "Todos los campos son obligatorios" };
            return;
        }

        const modeloUsuario = new Usuario();
        const existente = await modeloUsuario.ConsultarUsuarioCorreo(correo);
        if (existente) {
            response.status = 409;
            response.body = { success: false, message: "El correo ya está registrado" };
            return;
        }

        const modeloRol = new Rol();
        const rolAdmin = await modeloRol.ConsultarRolNombre("ADMINISTRADOR");

        if (!rolAdmin) {
            response.status = 400;
            response.body = { success: false, message: "El rol ADMINISTRADOR no existe" };
            return;
        }

        const hashedPassword = await bcrypt.hash(contrasena);

        const nuevoUsuario = new Usuario({
            id: null,
            nombre,
            correo,
            contrasena: hashedPassword,
            rol_id: rolAdmin.id,
        });
        const result = await nuevoUsuario.InsertarUsuario();

        response.status = 201;
        response.body = { success: true, message: "Administrador registrado correctamente", data: result };
    } catch (error) {
        response.status = 400;
        response.body = { success: false, message: "Error al registrar administrador", errors: error };
    }
};

// Registrar TECNICO (usuario con rol TECNICO + su ficha técnica)
export const postRegistrarTecnico = async (ctx: Context) => {
    const { request, response } = ctx;
    try {
        const body = await request.body.json();
        const { nombre, correo, contrasena, documento, especialidad, telefono } = body;

        if (!nombre || !correo || !contrasena || !documento || !especialidad || !telefono) {
            response.status = 400;
            response.body = { success: false, message: "Todos los campos son obligatorios" };
            return;
        }

        const modeloUsuario = new Usuario();
        const existente = await modeloUsuario.ConsultarUsuarioCorreo(correo);
        if (existente) {
            response.status = 409;
            response.body = { success: false, message: "El correo ya está registrado" };
            return;
        }

        // Validar documento duplicado ANTES de crear el usuario
        // (evita dejar un usuario "huérfano" si el documento ya existe)
        const modeloTecnicoCheck = new Tecnico();
        const tecnicoExistente = await modeloTecnicoCheck.ConsultarTecnicoDocumento(documento);
        if (tecnicoExistente) {
            response.status = 409;
            response.body = { success: false, message: "El documento ya está registrado a otro técnico" };
            return;
        }

        // Paso 1: usuario con rol TECNICO
        const modeloRol = new Rol();
        const rolTecnico = await modeloRol.ConsultarRolNombre("TECNICO");

        if (!rolTecnico) {
            response.status = 400;
            response.body = { success: false, message: "El rol TECNICO no existe" };
            return;
        }

        const hashedPassword = await bcrypt.hash(contrasena);

        const nuevoUsuario = new Usuario({
            id: null,
            nombre,
            correo,
            contrasena: hashedPassword,
            rol_id: rolTecnico.id,
        });
        const resultadoUsuario = await nuevoUsuario.InsertarUsuario();

        if (!resultadoUsuario) {
            response.status = 400;
            response.body = { success: false, message: "No se pudo crear el usuario del técnico" };
            return;
        }

        // Paso 2: obtener el id recién creado y crear la ficha técnica
        const usuarioCreado = await modeloUsuario.ConsultarUsuarioCorreo(correo) as any;

        try {
            const nuevoTecnico = new Tecnico({
                id: null,
                usuario_id: usuarioCreado.id,
                documento,
                especialidad,
                telefono,
                estado: "ACTIVO",
            });
            const resultadoTecnico = await nuevoTecnico.InsertarTecnico();

            response.status = 201;
            response.body = { success: true, message: "Técnico registrado correctamente", data: resultadoTecnico };
        } catch (errorTecnico) {
            // Rollback manual: si falla la ficha técnica, borramos el usuario
            // que acabamos de crear para no dejarlo huérfano.
            const usuarioRollback = new Usuario(null, usuarioCreado.id);
            await usuarioRollback.EliminarUsuario();

            response.status = 400;
            response.body = {
                success: false,
                message: "No se pudo crear la ficha técnica, el registro fue revertido",
                errors: `${errorTecnico}`,
            };
        }
    } catch (error) {
        response.status = 400;
        response.body = { success: false, message: "Error al registrar técnico", errors: error };
    }
};