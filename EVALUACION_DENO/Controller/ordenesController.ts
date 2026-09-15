import { Context, RouterContext } from "../Dependencies/dependencies.ts";
import { Orden, EstadoOrden } from "../Model/ordenesModel.ts";
import { HistorialEstado } from "../Model/historialEstadosModel.ts";
import { Cliente } from "../Model/clientesModel.ts";
import { Equipo } from "../Model/equiposModel.ts";
import { Tecnico } from "../Model/tecnicosModel.ts";

const ESTADOS_VALIDOS: EstadoOrden[] = [
    "RECIBIDO",
    "EN_DIAGNOSTICO",
    "COTIZADO",
    "EN_REPARACION",
    "TERMINADO",
    "ENTREGADO",
    "CANCELADO",
];

export const getOrdenes = async (ctx: Context) => {
    const { response } = ctx;
    try {
        const orden = new Orden();
        const lista = await orden.SeleccionarOrdenes();

        response.status = 200;
        response.body = {
            success: true,
            data: lista,
        };
    } catch (error) {
        console.error("ERROR AL OBTENER ÓRDENES:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al obtener las órdenes",
        };
    }
};

export const getOrdenId = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de orden inválido",
            };
            return;
        }

        const orden = new Orden(null, id);
        const resultado = await orden.ConsultarOrden();

        if (!resultado) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Orden no encontrada",
            };
            return;
        }

        const historial = new HistorialEstado(null, id);
        const listaHistorial = await historial.SeleccionarHistorialOrden();

        response.status = 200;
        response.body = {
            success: true,
            data: {
                ...resultado,
                historial: listaHistorial,
            },
        };
    } catch (error) {
        console.error("ERROR AL CONSULTAR ORDEN:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al consultar la orden",
        };
    }
};

export const postOrden = async (ctx: Context) => {
    const { response, request } = ctx;
    try {
        const body = await request.body.json();
        const {
            cliente_id,
            equipo_id,
            tecnico_id,
            descripcion_problema,
            observaciones,
            valor_estimado,
            valor_final,
            numero_orden,
        } = body;

        if (!cliente_id || !equipo_id || !tecnico_id) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Faltan campos obligatorios: cliente_id, equipo_id, tecnico_id",
            };
            return;
        }

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

        const equipo = new Equipo(null, Number(equipo_id));
        const equipoExiste = await equipo.ConsultarEquipo();
        if (!equipoExiste) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "El equipo_id indicado no existe",
            };
            return;
        }

        if (Number(equipoExiste.cliente_id) !== Number(cliente_id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "El equipo no pertenece al cliente indicado",
            };
            return;
        }

        const tecnico = new Tecnico(null, Number(tecnico_id));
        const tecnicoExiste = await tecnico.ConsultarTecnico();
        if (!tecnicoExiste) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "El tecnico_id indicado no existe",
            };
            return;
        }

        const estadoTecnico = await tecnico.ConsultarEstadoTecnico();
        if (estadoTecnico !== "ACTIVO") {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Solo se puede asignar un técnico en estado ACTIVO",
            };
            return;
        }

        const modeloOrden = new Orden();
        let numOrden: string;

        if (numero_orden) {
            const existeNum = await modeloOrden.ConsultarPorNumeroOrden(String(numero_orden).trim());
            if (existeNum) {
                response.status = 409;
                response.body = {
                    success: false,
                    mensaje: "Ya existe una orden con ese número",
                };
                return;
            }
            numOrden = String(numero_orden).trim();
        } else {
            numOrden = await modeloOrden.GenerarNumeroOrden();
        }

        const valorEst = Number(valor_estimado ?? 0);
        const valorFin = Number(valor_final ?? 0);

        if (valorEst < 0 || valorFin < 0) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Los valores no pueden ser negativos",
            };
            return;
        }

        const nuevaOrden = new Orden({
            id: null,
            numero_orden: numOrden,
            cliente_id: Number(cliente_id),
            equipo_id: Number(equipo_id),
            tecnico_id: Number(tecnico_id),
            descripcion_problema: descripcion_problema
                ? String(descripcion_problema).trim()
                : null,
            estado: "RECIBIDO",
            observaciones: observaciones ? String(observaciones).trim() : null,
            valor_estimado: valorEst,
            valor_final: valorFin,
        });

        const idInsertado = await nuevaOrden.InsertarOrden();

        if (!idInsertado) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo crear la orden",
            };
            return;
        }

        // Registrar estado inicial en historial
        const historial = new HistorialEstado({
            id: null,
            orden_id: idInsertado,
            estado: "RECIBIDO",
        });
        await historial.InsertarHistorial();

        response.status = 201;
        response.body = {
            success: true,
            mensaje: "Orden creada correctamente",
            data: {
                id: idInsertado,
                numero_orden: numOrden,
            },
        };
    } catch (error) {
        console.error("ERROR AL CREAR ORDEN:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al crear la orden",
            errors: `${error}`,
        };
    }
};

// PUT /ordenes/:id - Actualizar datos de la orden (no el estado)
export const putOrden = async (ctx: RouterContext<string>) => {
    const { response, request, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de orden inválido",
            };
            return;
        }

        const body = await request.body.json();
        const {
            tecnico_id,
            descripcion_problema,
            observaciones,
            valor_estimado,
            valor_final,
        } = body;

        const orden = new Orden(null, id);
        const existe = await orden.ConsultarOrdenBasica();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Orden no encontrada",
            };
            return;
        }

        // Si cambia el técnico, validar que exista y esté ACTIVO
        let tecnicoFinal = existe.tecnico_id;
        if (tecnico_id !== undefined && tecnico_id !== null) {
            const tecnico = new Tecnico(null, Number(tecnico_id));
            const tecnicoExiste = await tecnico.ConsultarTecnico();
            if (!tecnicoExiste) {
                response.status = 404;
                response.body = {
                    success: false,
                    mensaje: "El tecnico_id indicado no existe",
                };
                return;
            }
            const estadoTecnico = await tecnico.ConsultarEstadoTecnico();
            if (estadoTecnico !== "ACTIVO") {
                response.status = 400;
                response.body = {
                    success: false,
                    mensaje: "Solo se puede asignar un técnico en estado ACTIVO",
                };
                return;
            }
            tecnicoFinal = Number(tecnico_id);
        }

        const valorEst = valor_estimado !== undefined
            ? Number(valor_estimado)
            : Number(existe.valor_estimado);
        const valorFin = valor_final !== undefined
            ? Number(valor_final)
            : Number(existe.valor_final);

        if (valorEst < 0 || valorFin < 0) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "Los valores no pueden ser negativos",
            };
            return;
        }

        const ordenActualizar = new Orden(
            {
                id: id,
                numero_orden: existe.numero_orden,
                cliente_id: existe.cliente_id,
                equipo_id: existe.equipo_id,
                tecnico_id: tecnicoFinal,
                descripcion_problema: descripcion_problema !== undefined
                    ? (descripcion_problema ? String(descripcion_problema).trim() : null)
                    : existe.descripcion_problema,
                estado: existe.estado,
                observaciones: observaciones !== undefined
                    ? (observaciones ? String(observaciones).trim() : null)
                    : existe.observaciones,
                valor_estimado: valorEst,
                valor_final: valorFin,
            },
            id
        );

        const filas = await ordenActualizar.ActualizarOrden();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo actualizar la orden",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Orden actualizada correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR ORDEN:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al actualizar la orden",
        };
    }
};

// PATCH /ordenes/:id/estado - Cambiar estado + registrar en historial
export const patchEstadoOrden = async (ctx: RouterContext<string>) => {
    const { response, request, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de orden inválido",
            };
            return;
        }

        const body = await request.body.json();
        const { estado } = body;

        if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: `Estado inválido. Use uno de: ${ESTADOS_VALIDOS.join(", ")}`,
            };
            return;
        }

        const orden = new Orden(null, id);
        const existe = await orden.ConsultarOrdenBasica();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Orden no encontrada",
            };
            return;
        }

        if (existe.estado === estado) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: `La orden ya está en estado ${estado}`,
            };
            return;
        }

        const filas = await orden.ActualizarEstadoOrden(estado as EstadoOrden);

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo actualizar el estado",
            };
            return;
        }

        // Registrar en historial
        const historial = new HistorialEstado({
            id: null,
            orden_id: id,
            estado: estado,
        });
        await historial.InsertarHistorial();

        response.status = 200;
        response.body = {
            success: true,
            mensaje: `Estado de la orden actualizado a ${estado}`,
        };
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR ESTADO ORDEN:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al actualizar el estado de la orden",
        };
    }
};

// GET /ordenes/:id/historial - Solo historial de estados
export const getHistorialOrden = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de orden inválido",
            };
            return;
        }

        const orden = new Orden(null, id);
        const existe = await orden.ConsultarOrdenBasica();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Orden no encontrada",
            };
            return;
        }

        const historial = new HistorialEstado(null, id);
        const lista = await historial.SeleccionarHistorialOrden();

        response.status = 200;
        response.body = {
            success: true,
            data: lista,
        };
    } catch (error) {
        console.error("ERROR AL OBTENER HISTORIAL:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al obtener el historial",
        };
    }
};

// DELETE /ordenes/:id - Eliminar orden (y su historial)
export const deleteOrden = async (ctx: RouterContext<string>) => {
    const { response, params } = ctx;
    try {
        const id = Number(params.id);

        if (!id || isNaN(id)) {
            response.status = 400;
            response.body = {
                success: false,
                mensaje: "ID de orden inválido",
            };
            return;
        }

        const orden = new Orden(null, id);
        const existe = await orden.ConsultarOrdenBasica();

        if (!existe) {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: "Orden no encontrada",
            };
            return;
        }

        // Borrar historial primero (FK)
        const historial = new HistorialEstado(null, id);
        await historial.EliminarHistorialPorOrden();

        const filas = await orden.EliminarOrden();

        if (filas === 0) {
            response.status = 500;
            response.body = {
                success: false,
                mensaje: "No se pudo eliminar la orden",
            };
            return;
        }

        response.status = 200;
        response.body = {
            success: true,
            mensaje: "Orden eliminada correctamente",
        };
    } catch (error) {
        console.error("ERROR AL ELIMINAR ORDEN:", error);
        response.status = 500;
        response.body = {
            success: false,
            mensaje: "Error al eliminar la orden",
        };
    }
};
