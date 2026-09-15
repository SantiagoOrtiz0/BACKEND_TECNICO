import { Context } from "../Dependencies/dependencies.ts";
import { Cliente } from "../Model/clientesModel.ts";

export const postRegistrarCliente = async (ctx: Context) => {
    const { request, response } = ctx;
    try {
        const body = await request.body.json();
        const { nombre_completo, documento, telefono, correo } = body;

        if (!nombre_completo || !documento || !telefono || !correo) {
            response.status = 400;
            response.body = { success: false, message: "Todos los campos son obligatorios" };
            return;
        }

        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
        if (!correoValido) {
            response.status = 400;
            response.body = { success: false, message: "Correo electrónico no válido" };
            return;
        }

        const modeloCliente = new Cliente();
        const existente = await modeloCliente.ConsultarClienteDocumentoOCorreo(documento, correo);
        if (existente) {
            response.status = 409;
            response.body = { success: false, message: "El documento o correo ya está registrado" };
            return;
        }

        const nuevoCliente = new Cliente({ id: null, nombre_completo, documento, telefono, correo });
        const result = await nuevoCliente.InsertarCliente();

        response.status = 201;
        response.body = { success: true, message: "Cliente registrado correctamente", data: result };
    } catch (error) {
        response.status = 400;
        response.body = { success: false, message: "Error al registrar cliente", errors: error };
    }
};