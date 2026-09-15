import { conexion } from "./conexion.ts";

interface TecnicoData {
    id: number | null;
    nombre: string;
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

    public async SeleccionarTecnicos(): Promise<TecnicoData[]> {
        const {rows: tecnicos} = await conexion.execute(`SELECT * FROM tecnicos`);
        return tecnicos as TecnicoData[];
    }

    public async ConsultarTecnico(): Promise<TecnicoData | null> {
        const {rows: tecnicos} = await conexion.execute(
            `SELECT * FROM tecnicos WHERE id = ?`,
            [this._idTecnico]
        );
        const lista = tecnicos as TecnicoData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarTecnico(): Promise<number> {
        const t = this._ObjTecnico!;
        const resultado = await conexion.execute(
            `INSERT INTO tecnicos (nombre, documento, especialidad, telefono, estado) VALUES (?, ?, ?, ?, ?)`,
            [t.nombre, t.documento, t.especialidad, t.telefono, t.estado]
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