import { conexion } from "./conexion.ts";

interface HistorialEstadoData {
    id: number | null;
    orden_id: number;
    estado: string;
    fecha_cambio?: string;
}

export class HistorialEstado {
    public _ObjHistorial: HistorialEstadoData | null;
    public _idOrden: number | null;

    constructor(ObjHistorial: HistorialEstadoData | null = null, idOrden: number | null = null) {
        this._ObjHistorial = ObjHistorial;
        this._idOrden = idOrden;
    }

    public async SeleccionarHistorialOrden(): Promise<HistorialEstadoData[]> {
        const { rows: historial } = await conexion.execute(
            `SELECT * FROM historial_estados WHERE orden_id = ? ORDER BY fecha_cambio ASC`,
            [this._idOrden]
        );
        return historial as HistorialEstadoData[];
    }

    public async InsertarHistorial(): Promise<number> {
        const h = this._ObjHistorial!;
        const resultado = await conexion.execute(
            `INSERT INTO historial_estados (orden_id, estado) VALUES (?, ?)`,
            [h.orden_id, h.estado]
        );
        return resultado.affectedRows ?? 0;
    }

    public async EliminarHistorialPorOrden(): Promise<number> {
        const resultado = await conexion.execute(
            `DELETE FROM historial_estados WHERE orden_id = ?`,
            [this._idOrden]
        );
        return resultado.affectedRows ?? 0;
    }
}
