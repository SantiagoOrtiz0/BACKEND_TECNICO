import { conexion } from "./conexion.ts";

interface RolData {
    id: number;
    nombre: string;
}

export class Rol {
    public async SeleccionarRoles(): Promise<RolData[]> {
        const {rows: roles} = await conexion.execute(`SELECT * FROM roles`);
        return roles as RolData[];
    }

    public async ConsultarRolNombre(nombre: string): Promise<RolData | null> {
        const {rows: roles} = await conexion.execute(
            `SELECT * FROM roles WHERE nombre = ?`,
            [nombre]
        );
        const lista = roles as RolData[];
        return lista.length > 0 ? lista[0] : null;
    }
}