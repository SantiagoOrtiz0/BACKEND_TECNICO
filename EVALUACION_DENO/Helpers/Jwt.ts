import { create, getNumericDate, verify } from "../Dependencies/dependencies.ts";
import { generarKey } from "./cryptokey.ts";

const Key = Deno.env.get("MY_SECRET_KEY") || "default_key";
const server = Deno.env.get("SERVER");

export const CrearToken = async(userId : string,  rol:string, email:string,nombre:string)=>{
    
    const payload ={
        iss:server,
        sub: userId,
        rol: rol,
        email:email,
        nombre:nombre,
        jti: crypto.randomUUID(),
        exp: getNumericDate(60 * 60),
    }
    const secretKey = await generarKey(Key);

    return await create({alg :"HS256",typ: "JWT"},payload, secretKey);
}

export const VerificarTokenAcceso = async (token: string) => {
    const secretKey = await generarKey(Key);
    try {
        return await verify(token, secretKey);
    } catch (error) {
        console.log("token invalido:", error);
        return null;
    }
};