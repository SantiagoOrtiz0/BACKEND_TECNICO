import { conexion } from "./conexion.ts";

interface UsuarioData {
    id: number | null;
    nombre: string;
    correo: string;
    contrasena: string;
    rol: "ADMINISTRADOR" | "TECNICO";
}

export class Usuario {
    public _ObjUsuario: UsuarioData | null;
    public _idUsuario: number | null;

    constructor(ObjUsuario: UsuarioData | null = null, idUsuario: number | null = null){
        this._ObjUsuario = ObjUsuario;
        this._idUsuario = idUsuario;
    }

    public async SeleccionarUsuarios(): Promise<UsuarioData[]> {
        const {rows: usuarios} = await conexion.execute(`SELECT * FROM usuarios`);
        return usuarios as UsuarioData[];
    }

    public async ConsultarUsuario(): Promise<UsuarioData | null> {
        const {rows: usuarios} = await conexion.execute(
            `SELECT * FROM usuarios WHERE id = ?`,
            [this._idUsuario]
        );
        const lista = usuarios as UsuarioData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async ConsultarUsuarioCorreo(correo: string): Promise<UsuarioData | null> {
        const {rows: usuarios} = await conexion.execute(
            `SELECT * FROM usuarios WHERE correo = ?`,
            [correo]
        );
        const lista = usuarios as UsuarioData[];
        return lista.length > 0 ? lista[0] : null;
    }

    public async InsertarUsuario(): Promise<number> {
        const u = this._ObjUsuario!;
        const resultado = await conexion.execute(
            `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)`,
            [u.nombre, u.correo, u.contrasena, u.rol]
        );
        return resultado.affectedRows ?? 0;
    }
}