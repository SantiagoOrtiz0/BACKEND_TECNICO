import { conexion } from "./conexion.ts";

export type EstadoOrden = "RECIBIDO" | "EN_DIAGNOSTICO" | "COTIZADO" | "EN_REPARACION" | "TERMINADO" | "ENTREGADO" | "CANCELADO";

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

    public async ConsultarOrden(): Promise<Record<string, unknown> | null> {
        const { rows: ordenes } = await conexion.execute(
            `SELECT o.*,
                    c.nombre_completo AS nombre_cliente,
                    u.nombre AS nombre_tecnico,
                    e.tipo_equipo, e.marca, e.modelo, e.numero_serie
            FROM ordenes_servicio o
            INNER JOIN clientes c ON o.cliente_id = c.id
            INNER JOIN tecnicos t ON o.tecnico_id = t.id
            INNER JOIN usuarios u ON t.usuario_id = u.id
            INNER JOIN equipos e ON o.equipo_id = e.id
            WHERE o.id = ?`,
            [this._idOrden]
        );
        const lista = ordenes as Record<string, unknown>[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async ConsultarOrdenBasica(): Promise<OrdenData | null> {
        const { rows: ordenes } = await conexion.execute(
            `SELECT * FROM ordenes_servicio WHERE id = ?`,
            [this._idOrden]
        );
        const lista = ordenes as OrdenData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async ConsultarPorNumeroOrden(numero_orden: string): Promise<OrdenData | null> {
        const { rows: ordenes } = await conexion.execute(
            `SELECT * FROM ordenes_servicio WHERE numero_orden = ?`,
            [numero_orden]
        );
        const lista = ordenes as OrdenData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async GenerarNumeroOrden(): Promise<string> {
        const { rows } = await conexion.execute(
            `SELECT numero_orden FROM ordenes_servicio ORDER BY id DESC LIMIT 1`
        );
        const lista = rows as { numero_orden: string }[];

        if (lista.length === 0) {
            return "ORD-1001";
        }

        const ultimo = lista[0].numero_orden; // ej: ORD-1001
        const partes = ultimo.split("-");
        const num = parseInt(partes[1] ?? "1000", 10) + 1;
        return `ORD-${num}`;
    }

    public async InsertarOrden(): Promise<number> {
        const o = this._ObjOrden!;
        const resultado = await conexion.execute(
            `INSERT INTO ordenes_servicio
                (numero_orden, cliente_id, equipo_id, tecnico_id, descripcion_problema, estado, observaciones, valor_estimado, valor_final)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                o.numero_orden,
                o.cliente_id,
                o.equipo_id,
                o.tecnico_id,
                o.descripcion_problema,
                o.estado,
                o.observaciones,
                o.valor_estimado,
                o.valor_final,
            ]
        );
        return (resultado as { lastInsertId?: number }).lastInsertId
            ?? resultado.affectedRows
            ?? 0;
    }

    public async ActualizarOrden(): Promise<number> {
        const o = this._ObjOrden!;
        const resultado = await conexion.execute(
            `UPDATE ordenes_servicio SET
                tecnico_id = ?,
                descripcion_problema = ?,
                observaciones = ?,
                valor_estimado = ?,
                valor_final = ?
             WHERE id = ?`,
            [
                o.tecnico_id,
                o.descripcion_problema,
                o.observaciones,
                o.valor_estimado,
                o.valor_final,
                this._idOrden,
            ]
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

    public async EliminarOrden(): Promise<number> {
        const resultado = await conexion.execute(
            `DELETE FROM ordenes_servicio WHERE id = ?`,
            [this._idOrden]
        );
        return resultado.affectedRows ?? 0;
    }
}