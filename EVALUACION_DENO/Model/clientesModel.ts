import { conexion } from "./conexion.ts";

interface ClienteData {
    id: number | null;
    nombre_completo: string;
    documento: string;
    telefono: string;
    correo: string;
}

export class Cliente {
    public _ObjCliente: ClienteData | null;
    public _idCliente: number | null;

    constructor(ObjCliente: ClienteData | null = null, idCliente: number | null = null){
        this._ObjCliente = ObjCliente;
        this._idCliente = idCliente;
    }

    public async SeleccionarClientes(): Promise<ClienteData[]> {
        const {rows: clientes} = await conexion.execute(`SELECT * FROM clientes`);
        return clientes as ClienteData[];
    }

    public async ConsultarCliente(): Promise<ClienteData | null> {
        const {rows: clientes} = await conexion.execute(
            `SELECT * FROM clientes WHERE id = ?`,
            [this._idCliente]
        );
        const lista = clientes as ClienteData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async ConsultarClienteDocumentoOCorreo(documento: string, correo: string): Promise<ClienteData | null> {
        const {rows: clientes} = await conexion.execute(
            `SELECT * FROM clientes WHERE documento = ? OR correo = ?`,
            [documento, correo]
        );
        const lista = clientes as ClienteData[];
        return lista.length > 0 ? lista[0] : null;
    }

    // Regla 8: no eliminar si tiene equipos asociados
    public async ContarEquiposDelCliente(): Promise<number> {
        const resultado = await conexion.execute(
            `SELECT COUNT(*) AS total FROM equipos WHERE cliente_id = ?`,
            [this._idCliente]
        );
        return resultado.rows ? resultado.rows[0].total : 0;
    }

    public async InsertarCliente(): Promise<number> {
        const c = this._ObjCliente!;
        const resultado = await conexion.execute(
            `INSERT INTO clientes (nombre_completo, documento, telefono, correo) VALUES (?, ?, ?, ?)`,
            [c.nombre_completo, c.documento, c.telefono, c.correo]
        );
        return resultado.affectedRows ?? 0;
    }

    public async ActualizarCliente(): Promise<number> {
        const c = this._ObjCliente!;
        const resultado = await conexion.execute(
            `UPDATE clientes SET nombre_completo = ?, documento = ?, telefono = ?, correo = ? WHERE id = ?`,
            [c.nombre_completo, c.documento, c.telefono, c.correo, this._idCliente]
        );
        return resultado.affectedRows ?? 0;
    }

    public async EliminarCliente(): Promise<number> {
        const resultado = await conexion.execute(
            `DELETE FROM clientes WHERE id = ?`,
            [this._idCliente]
        );
        return resultado.affectedRows ?? 0;
    }
}