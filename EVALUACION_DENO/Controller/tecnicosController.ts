import { Context, RouterContext } from "../Dependencies/dependencies.ts";
import { Tecnico } from "../Model/tecnicosModel.ts";
import { Usuario } from "../Model/usuariosModel.ts";

export async function getTecnicos(ctx :Context) {
    const{response}= ctx
    try {
        const tecnico = new Tecnico();
        const lista = await tecnico.SeleccionarTecnicos();

        response.status=200;
        response.body={
            succes:true,
            message:lista
        };


    } catch (error) {
        console.error("Error getTecnicos:", error);
        response.status = 500;
        response.body = {
            success: false,
            error: "Error al obtener los técnicos",
        };
    }
    
};


export const getTecnicoId = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de técnico inválido",
            };
            return;
        }

        const tecnico = new Tecnico(null, id);
        const resultado = await tecnico.ConsultarTecnico();

        if (!resultado) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Técnico no encontrado",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            data: resultado,
        };
    } catch (error) {
        console.error("ERROR AL CONSULTAR TÉCNICO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al consultar el técnico",
        };
    }
};

export const postTecnico = async (ctx: Context) => {
    const { response, request } = ctx;
    try {
        const body = await request.body.json();
        const { usuario_id, documento, especialidad, telefono, estado } = body;

        if (!usuario_id || !documento || !especialidad || !telefono) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Faltan campos obligatorios: usuario_id, documento, especialidad, telefono",
            };
            return;
        }

        const usuario = new Usuario(null, Number(usuario_id));
        const usuarioExiste = await usuario.ConsultarUsuario();
        if (!usuarioExiste) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "El usuario_id indicado no existe",
            };
            return;
        }

        const tecnicoCheck = new Tecnico();
        const yaExiste = await tecnicoCheck.ConsultarTecnicoUsuarioId(Number(usuario_id));
        if (yaExiste) {
            response.status = 409;
            response.body = {
                success: false,
                mensaje: "Este usuario ya tiene un perfil de técnico asociado",
            };
            return;
        }

        const estadoFinal = estado === "INACTIVO" ? "INACTIVO" : "ACTIVO";

        const nuevoTecnico = new Tecnico({
            id: null,
            usuario_id: Number(usuario_id),
            documento: String(documento).trim(),
            especialidad: String(especialidad).trim(),
            telefono: String(telefono).trim(),
            estado: estadoFinal,
        });

        const filas = await nuevoTecnico.InsertarTecnico();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo insertar el técnico",
            };
            return;
        }

        response.status = 201;
        response.body = {
            success: true,
            mensaje: "Técnico creado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL CREAR TÉCNICO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al crear el técnico",
        };
    }
};

export const putTecnico = async (ctx: RouterContext<string>) => {
    const { response, request, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de técnico inválido",
            };
            return;
        }

        const body = await request.body.json();
        const { documento, especialidad, telefono, estado } = body;

        if (!documento || !especialidad || !telefono) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Faltan campos obligatorios: documento, especialidad, telefono",
            };
            return;
        }

        if (estado && estado !== "ACTIVO" && estado !== "INACTIVO") {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: 'El estado debe ser "ACTIVO" o "INACTIVO"',
            };
            return;
        }

        const tecnico = new Tecnico(null, id);
        const existe = await tecnico.ConsultarTecnico();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Técnico no encontrado",
            };
            return;
        }

        const estadoFinal = estado === "INACTIVO" || estado === "ACTIVO"
            ? estado
            : (existe.estado as "ACTIVO" | "INACTIVO");

        const tecnicoActualizar = new Tecnico(
            {
                id: id,
                usuario_id: Number(existe.usuario_id), // no se cambia
                documento: String(documento).trim(),
                especialidad: String(especialidad).trim(),
                telefono: String(telefono).trim(),
                estado: estadoFinal,
            },
            id
        );

        const filas = await tecnicoActualizar.ActualizarTecnico();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo actualizar el técnico",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Técnico actualizado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR TÉCNICO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al actualizar el técnico",
        };
    }
};

export const patchEstadoTecnico = async (ctx: RouterContext<string>) => {
    const { response, request, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de técnico inválido",
            };
            return;
        }

        const body = await request.body.json();
        const { estado } = body;

        if (estado !== "ACTIVO" && estado !== "INACTIVO") {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: 'El estado debe ser "ACTIVO" o "INACTIVO"',
            };
            return;
        }

        const tecnico = new Tecnico(null, id);
        const existe = await tecnico.ConsultarTecnico();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Técnico no encontrado",
            };
            return;
        }

        const filas = await tecnico.ActualizarEstadoTecnico(estado);

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo actualizar el estado",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: `Estado del técnico actualizado a ${estado}`,
        };
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR ESTADO TÉCNICO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al actualizar el estado del técnico",
        };
    }
};

export const deleteTecnico = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de técnico inválido",
            };
            return;
        }

        const tecnico = new Tecnico(null, id);
        const existe = await tecnico.ConsultarTecnico();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Técnico no encontrado",
            };
            return;
        }

        const filas = await tecnico.EliminarTecnico();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo eliminar el técnico",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Técnico eliminado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ELIMINAR TÉCNICO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al eliminar el técnico. Puede tener órdenes de servicio asociadas.",
        };
    }
};
