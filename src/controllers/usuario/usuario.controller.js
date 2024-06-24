import db from '../../db.js';
import response from '../../utils/response.js';
import * as imageUtils from '../../utils/image.js';
import bycript from 'bcrypt';
import { getUserJWT, generarJWT } from '../../utils/jwt.js';

export async function createUsuario(req, res) {
    try {
        const { nombre, apellido, telefono, direccion, email, password, role } = req.body;
        if (!nombre || !apellido || !email || !password || !role) {
            return response(res, 400, null, 'Los campos nombre, apellido, email, password y role son obligatorios', false);
        }
        if (role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'user') return response(res, 400, null, "No existe el role", false);
        const existeCorreo = await db.usuario.findFirst({
            where: {
                email : email,
            },
        });
        if (existeCorreo) {
            return response(res, 400, null, 'El correo ya esta en uso', false);
        }
        
        const imagen = req.files?.imagen;
        let pathImagen = "";
        if (imagen !== undefined) {
            const ultimoId = await db.usuario.findFirst({
                select: {
                    id: true,
                },
                orderBy: {
                    id: 'desc',
                },
            });
            const id = ultimoId ? ultimoId.id + 1 : 1;
            pathImagen = await imageUtils.guardarImagen('usuarios', imagen, `imagen_${id}`, null);
        }
        
        const contrasenaEncriptada = await bycript.hash(password, 10);
        const usuario = await db.usuario.create({
            data: {
                nombre,
                apellido,
                telefono: telefono || "",
                direccion: direccion || "",
                email,
                password: contrasenaEncriptada,
                img_url: pathImagen,
                role: role.toUpperCase(),
            },
        });
        await db.carrito.create({
            data: {
                fk_usuario: usuario.id,
            },
        });
        usuario.password = undefined;
        return response(res, 201, usuario, 'Usuario creado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al crear el usuario: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return response(res, 400, null, 'El id del usuario debe ser un número', false);
        }
        const usuario = await db.usuario.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!usuario) {
            return response(res, 404, null, 'Usuario no encontrado', false);
        }
        const idCarrito = await db.carrito.findFirst({
            where: {
                fk_usuario: usuario.id,
            },
            select: {
                id: true,
            },
        });
        usuario.password = undefined;
        usuario.fk_carrito = idCarrito.id;
        return response(res, 200, usuario, 'Usuario obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el usuario: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export const getUserByToken = async (req, res) => {
    try {
        const usuario = await getUserJWT(req, res);
        if (!usuario.id) return;
        usuario.password = undefined;
        const idCarrito = await db.carrito.findFirst({
            where: {
                fk_usuario: usuario.id,
            },
            select: {
                id: true,
            },
        });
        usuario.fk_carrito = idCarrito.id;
        return response(res, 200, usuario);
    }catch (error) {
        console.error(error);
        return response(res, 500, null, `Ocurrio un error al intentar obtener el usuario`, false);
    }finally {
        db.$disconnect();
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return response(res, 400, null, 'El correo y la contraseña son obligatorios', false);
        }
        const usuario = await db.usuario.findFirst({
            where: {
                email: email,
            },
        });
        if (!usuario) {
            return response(res, 404, null, 'Usuario no encontrado', false);
        }
        const contrasenaValida = await bycript.compare(password, usuario.password);
        if (!contrasenaValida) return response(res, 400, null, 'Correo o contraseña incorrectos', false);
        const carrito = await db.carrito.findFirst({
            where: {
                fk_usuario: usuario.id,
            },
        });
        usuario.password = undefined;
        usuario.fk_carrito = carrito.id;
        const token = generarJWT(usuario.id, usuario.email);
        return response(res, 200, { token, usuario }, 'Sesión iniciada');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al iniciar sesión: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}