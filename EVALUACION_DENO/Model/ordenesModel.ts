import { conexion } from "./conexion.ts";

type EstadoOrden = "RECIBIDO" | "EN_DIAGNOSTICO" | "COTIZADO" | "EN_REPARACION" | "TERMINADO" | "ENTREGADO" | "CANCELADO";

interface OrdenData {
    id: number | null;
    numero_orden: string | null;
    cliente_id: number;
    equipo_id: number;
    tecnico_id: number;
    descripcion_problema: string | null;
    estado: EstadoOrden;
    observaciones: string | null;
    valor_estimado: number;
    valor_final: number;
}

export class Orden {
    public _ObjOrden: OrdenData | null;
    public _idOrden: number | null;

    constructor(ObjOrden: OrdenData | null = null, idOrden: number | null = null){
        this._ObjOrden = ObjOrden;
        this._idOrden = idOrden;
    }

    public async SeleccionarOrdenes(): Promise<Record<string, unknown>[]> {
        const {rows: ordenes} = await conexion.execute(
            `SELECT o.*, c.nombre_completo AS nombre_cliente, u.nombre AS nombre_tecnico
             FROM ordenes_servicio o
             INNER JOIN clientes c ON o.cliente_id = c.id
             INNER JOIN tecnicos t ON o.tecnico_id = t.id
             INNER JOIN usuarios u ON t.usuario_id = u.id`
        );
        return ordenes as Record<string, unknown>[];
    }

    public async ConsultarOrden(): Promise<OrdenData | null> {
        const {rows: ordenes} = await conexion.execute(
            `SELECT * FROM ordenes_servicio WHERE id = ?`,
            [this._idOrden]
        );
        const lista = ordenes as OrdenData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarOrden(): Promise<number> {
        const o = this._ObjOrden!;
        const resultado = await conexion.execute(
            `INSERT INTO ordenes_servicio (numero_orden, cliente_id, equipo_id, tecnico_id, descripcion_problema, estado, valor_estimado, valor_final)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [o.numero_orden, o.cliente_id, o.equipo_id, o.tecnico_id, o.descripcion_problema, o.estado, o.valor_estimado, o.valor_final]
        );
        return resultado.affectedRows ?? 0;
    }

    public async ActualizarEstadoOrden(estado: EstadoOrden): Promise<number> {
        const resultado = await conexion.execute(
            `UPDATE ordenes_servicio SET estado = ? WHERE id = ?`,
            [estado, this._idOrden]
        );
        return resultado.affectedRows ?? 0;
    }
}