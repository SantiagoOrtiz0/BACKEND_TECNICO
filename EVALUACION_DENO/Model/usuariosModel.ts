import { conexion } from "./conexion.ts";

interface UsuarioData {
    id: number | null;
    nombre: string;
    correo: string;
    contrasena: string;
    rol_id: number;
}

export class Usuario {
    public _ObjUsuario: UsuarioData | null;
    public _idUsuario: number | null;

    constructor(ObjUsuario: UsuarioData | null = null, idUsuario: number | null = null){
        this._ObjUsuario = ObjUsuario;
        this._idUsuario = idUsuario;
    }

    public async SeleccionarUsuarios(): Promise<Record<string, unknown>[]> {
        const {rows: usuarios} = await conexion.execute(
            `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id`
        );
        return usuarios as Record<string, unknown>[];
    }

    public async ConsultarUsuario(): Promise<Record<string, unknown> | null> {
        const {rows: usuarios} = await conexion.execute(
            `SELECT u.id, u.nombre, u.correo, r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [this._idUsuario]
        );
        const lista = usuarios as Record<string, unknown>[];
        return lista.length > 0 ? lista[0] : null;
    }

    
    public async ConsultarUsuarioCorreo(correo: string): Promise<Record<string, unknown> | null> {
        const {rows: usuarios} = await conexion.execute(
            `SELECT u.*, r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.correo = ?`,
            [correo]
        );
        const lista = usuarios as Record<string, unknown>[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarUsuario(): Promise<number> {
        const u = this._ObjUsuario!;
        const resultado = await conexion.execute(
            `INSERT INTO usuarios (nombre, correo, contrasena, rol_id) VALUES (?, ?, ?, ?)`,
            [u.nombre, u.correo, u.contrasena, u.rol_id]
        );
        return resultado.affectedRows ?? 0;
    }

    // NUEVO: rollback manual si falla la creación de la ficha técnica
    // después de haber creado el usuario
    public async EliminarUsuario(): Promise<number> {
        const resultado = await conexion.execute(
            `DELETE FROM usuarios WHERE id = ?`,
            [this._idUsuario]
        );
        return resultado.affectedRows ?? 0;
    }
}