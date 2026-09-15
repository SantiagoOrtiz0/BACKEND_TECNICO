import { Context, RouterContext } from "../Dependencies/dependencies.ts";
import { Equipo } from "../Model/equiposModel.ts";
import { Cliente } from "../Model/clientesModel.ts";

export const getEquipos = async (ctx: Context) => {
    const { response } = ctx;
    try {
        const equipo = new Equipo();
        const lista = await equipo.SeleccionarEquipos();

        response.status = 200;
        response.body = {
            success: true,
            data: lista,
        };
    } catch (error) {
        console.error("ERROR AL OBTENER EQUIPOS:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al obtener los equipos",
        };
    }
};

// GET /equipos/con-cliente - Listar equipos con nombre del cliente
export const getEquiposConCliente = async (ctx: Context) => {
    const { response } = ctx;
    try {
        const equipo = new Equipo();
        const lista = await equipo.SeleccionarEquiposCliente();

        response.status = 200;
        response.body = {
            success: true,
            data: lista,
        };
    } catch (error) {
        console.error("ERROR AL OBTENER EQUIPOS CON CLIENTE:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al obtener los equipos con cliente",
        };
    }
};

// GET /equipos/:id - Consultar un equipo por ID
export const getEquipoId = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de equipo inválido",
            };
            return;
        }

        const equipo = new Equipo(null, id);
        const resultado = await equipo.ConsultarEquipo();

        if (!resultado) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Equipo no encontrado",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            data: resultado,
        };
    } catch (error) {
        console.error("ERROR AL CONSULTAR EQUIPO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al consultar el equipo",
        };
    }
};

// POST /equipos - Crear un equipo
export const postEquipo = async (ctx: Context) => {
    const { response, request } = ctx;
    try {
        const body = await request.body.json();
        const {
            cliente_id,
            tipo_equipo,
            marca,
            modelo,
            numero_serie,
            descripcion_problema,
        } = body;

        if (!cliente_id || !tipo_equipo || !marca || !modelo) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Faltan campos obligatorios: cliente_id, tipo_equipo, marca, modelo",
            };
            return;
        }

        // Validar que el cliente exista
        const cliente = new Cliente(null, Number(cliente_id));
        const clienteExiste = await cliente.ConsultarCliente();
        if (!clienteExiste) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "El cliente_id indicado no existe",
            };
            return;
        }

        // Validar número de serie único (si viene)
        if (numero_serie) {
            const equipoCheck = new Equipo();
            const serieExiste = await equipoCheck.ConsultarNumeroSerie(String(numero_serie).trim());
            if (serieExiste) {
                response.status = 409;
                response.body = {
                    success: false,
                    mensaje: "Ya existe un equipo con ese número de serie",
                };
                return;
            }
        }

        const nuevoEquipo = new Equipo({
            id: null,
            cliente_id: Number(cliente_id),
            tipo_equipo: String(tipo_equipo).trim(),
            marca: String(marca).trim(),
            modelo: String(modelo).trim(),
            numero_serie: numero_serie ? String(numero_serie).trim() : null,
            descripcion_problema: descripcion_problema
                ? String(descripcion_problema).trim()
                : null,
        });

        const filas = await nuevoEquipo.InsertarEquipo();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo insertar el equipo",
            };
            return;
        }

        response.status = 201;
        response.body = {
            success: true,
            mensaje: "Equipo creado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL CREAR EQUIPO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al crear el equipo",
        };
    }
};

// PUT /equipos/:id - Actualizar un equipo
export const putEquipo = async (ctx: RouterContext<string>) => {
    const { response, request, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de equipo inválido",
            };
            return;
        }

        const body = await request.body.json();
        const { tipo_equipo, marca, modelo, numero_serie, descripcion_problema } = body;

        if (!tipo_equipo || !marca || !modelo) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Faltan campos obligatorios: tipo_equipo, marca, modelo",
            };
            return;
        }

        const equipo = new Equipo(null, id);
        const existe = await equipo.ConsultarEquipo();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Equipo no encontrado",
            };
            return;
        }

        // Si cambia el número de serie, validar unicidad
        if (numero_serie && numero_serie !== existe.numero_serie) {
            const equipoCheck = new Equipo();
            const serieExiste = await equipoCheck.ConsultarNumeroSerie(String(numero_serie).trim());
            if (serieExiste) {
                response.status = 409;
                response.body = {
                    success: false,
                    mensaje: "Ya existe otro equipo con ese número de serie",
                };
                return;
            }
        }

        const equipoActualizar = new Equipo(
            {
                id: id,
                cliente_id: existe.cliente_id,
                tipo_equipo: String(tipo_equipo).trim(),
                marca: String(marca).trim(),
                modelo: String(modelo).trim(),
                numero_serie: numero_serie !== undefined
                    ? (numero_serie ? String(numero_serie).trim() : null)
                    : existe.numero_serie,
                descripcion_problema: descripcion_problema !== undefined
                    ? (descripcion_problema ? String(descripcion_problema).trim() : null)
                    : existe.descripcion_problema,
            },
            id
        );

        const filas = await equipoActualizar.ActualizarEquipo();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo actualizar el equipo",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Equipo actualizado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR EQUIPO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al actualizar el equipo",
        };
    }
};

// DELETE /equipos/:id - Eliminar un equipo
export const deleteEquipo = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de equipo inválido",
            };
            return;
        }

        const equipo = new Equipo(null, id);
        const existe = await equipo.ConsultarEquipo();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Equipo no encontrado",
            };
            return;
        }

        const filas = await equipo.EliminarEquipo();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo eliminar el equipo",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Equipo eliminado correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ELIMINAR EQUIPO:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al eliminar el equipo. Puede tener órdenes de servicio asociadas.",
        };
    }
};