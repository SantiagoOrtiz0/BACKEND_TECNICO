import { conexion } from "./conexion.ts";

interface TecnicoData {
    id: number | null;
    usuario_id: number;
    documento: string;
    especialidad: string;
    telefono: string;
    estado: "ACTIVO" | "INACTIVO";
}

export class Tecnico {
    public _ObjTecnico: TecnicoData | null;
    public _idTecnico: number | null;

    constructor(ObjTecnico: TecnicoData | null = null, idTecnico: number | null = null){
        this._ObjTecnico = ObjTecnico;
        this._idTecnico = idTecnico;
    }

    // Nombre y correo vienen del usuario asociado (no se duplican)
    public async SeleccionarTecnicos(): Promise<Record<string, unknown>[]> {
        const {rows: tecnicos} = await conexion.execute(
            `SELECT t.*, u.nombre, u.correo
             FROM tecnicos t
             INNER JOIN usuarios u ON t.usuario_id = u.id`
        );
        return tecnicos as Record<string, unknown>[];
    }

    public async ConsultarTecnico(): Promise<Record<string, unknown> | null> {
        const {rows: tecnicos} = await conexion.execute(
            `SELECT t.*, u.nombre, u.correo
             FROM tecnicos t
             INNER JOIN usuarios u ON t.usuario_id = u.id
             WHERE t.id = ?`,
            [this._idTecnico]
        );
        const lista = tecnicos as Record<string, unknown>[];
        return lista.length > 0 ? lista[0] : null;
    }

    // Para el Caso de prueba 7: validar que esté ACTIVO antes de asignarlo a una orden
    public async ConsultarEstadoTecnico(): Promise<"ACTIVO" | "INACTIVO" | null> {
        const {rows: tecnicos} = await conexion.execute(
            `SELECT estado FROM tecnicos WHERE id = ?`,
            [this._idTecnico]
        );
        const lista = tecnicos as { estado: "ACTIVO" | "INACTIVO" }[];
        return lista.length > 0 ? lista[0].estado : null;
    }

    public async ConsultarTecnicoUsuarioId(usuario_id: number): Promise<TecnicoData | null> {
        const {rows: tecnicos} = await conexion.execute(
            `SELECT * FROM tecnicos WHERE usuario_id = ?`,
            [usuario_id]
        );
        const lista = tecnicos as TecnicoData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarTecnico(): Promise<number> {
        const t = this._ObjTecnico!;
        const resultado = await conexion.execute(
            `INSERT INTO tecnicos (usuario_id, documento, especialidad, telefono, estado) VALUES (?, ?, ?, ?, ?)`,
            [t.usuario_id, t.documento, t.especialidad, t.telefono, t.estado]
        );
        return resultado.affectedRows ?? 0;
    }

    public async ActualizarEstadoTecnico(estado: "ACTIVO" | "INACTIVO"): Promise<number> {
        const resultado = await conexion.execute(
            `UPDATE tecnicos SET estado = ? WHERE id = ?`,
            [estado, this._idTecnico]
        );
        return resultado.affectedRows ?? 0;
    }
}