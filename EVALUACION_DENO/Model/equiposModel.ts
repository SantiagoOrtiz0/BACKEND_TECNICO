import { conexion } from "./conexion.ts";

interface EquipoData {
    id: number | null;
    cliente_id: number;
    tipo_equipo: string;
    marca: string;
    modelo: string;
    numero_serie: string | null;
    descripcion_problema: string | null;
}

export class Equipo {
    public _ObjEquipo: EquipoData | null;
    public _idEquipo: number | null;

    constructor(ObjEquipo: EquipoData | null = null, idEquipo: number | null = null){
        this._ObjEquipo = ObjEquipo;
        this._idEquipo = idEquipo;
    }

    public async SeleccionarEquipos(): Promise<EquipoData[]> {
        const {rows: equipos} = await conexion.execute(`SELECT * FROM equipos`);
        return equipos as EquipoData[];
    }

    public async ConsultarEquipo(): Promise<EquipoData | null> {
        const {rows: equipos} = await conexion.execute(
            `SELECT * FROM equipos WHERE id = ?`,
            [this._idEquipo]
        );
        const lista = equipos as EquipoData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async SeleccionarEquiposCliente(): Promise<Record<string, unknown>[]> {
        const {rows: equipos} = await conexion.execute(
            `SELECT e.*, c.nombre_completo AS nombre_cliente
             FROM equipos e
             INNER JOIN clientes c ON e.cliente_id = c.id`
        );
        return equipos as Record<string, unknown>[];
    }

    public async ConsultarNumeroSerie(numero_serie: string): Promise<EquipoData | null> {
        const {rows: equipos} = await conexion.execute(
            `SELECT * FROM equipos WHERE numero_serie = ?`,
            [numero_serie]
        );
        const lista = equipos as EquipoData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarEquipo(): Promise<number> {
        const eq = this._ObjEquipo!;
        const resultado = await conexion.execute(
            `INSERT INTO equipos (cliente_id, tipo_equipo, marca, modelo, numero_serie, descripcion_problema)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [eq.cliente_id, eq.tipo_equipo, eq.marca, eq.modelo, eq.numero_serie, eq.descripcion_problema]
        );
        return resultado.affectedRows ?? 0;
    }

    public async ActualizarEquipo(): Promise<number> {
        const eq = this._ObjEquipo!;
        const resultado = await conexion.execute(
            `UPDATE equipos SET tipo_equipo = ?, marca = ?, modelo = ?, numero_serie = ?, descripcion_problema = ? WHERE id = ?`,
            [eq.tipo_equipo, eq.marca, eq.modelo, eq.numero_serie, eq.descripcion_problema, this._idEquipo]
        );
        return resultado.affectedRows ?? 0;
    }

    public async EliminarEquipo(): Promise<number> {
        const resultado = await conexion.execute(
            `DELETE FROM equipos WHERE id = ?`,
            [this._idEquipo]
        );
        return resultado.affectedRows ?? 0;
    }
}