import db from '../../db.js';
import response from '../../utils/response.js';
import * as imageUtils from '../../utils/image.js';
import bycript from 'bcrypt';

export async function createUsuario(req, res) {
    try {
        const { nombre, apellido, telefono, direccion, email, password } = req.body;
        if (!nombre || !apellido || !telefono || !direccion || !email || !password) {
            return response(res, 400, null, 'Los campos nombre, apellido, telefono, direccion, email y password son obligatorios', false);
        }
        const existeCorreo = await db.usuario.findFirst({
            where: {
                email : email,
            },
        });
        if (existeCorreo) {
            return response(res, 400, null, 'El correo ya esta en uso', false);
        }
        
        const imagen = req.files?.imagen;
        if (imagen === undefined || imagen === null) {
            return response(res, 400, null, 'La imagen del usuario es obligatoria', false);
        }
        const ultimoId = await db.usuario.findFirst({
            select: {
                id: true,
            },
            orderBy: {
                id: 'desc',
            },
        });
        const id = ultimoId ? ultimoId.id + 1 : 1;
        const pathImagen = await imageUtils.guardarImagen('usuarios', imagen, `imagen_${id}`, null);
        const contrasenaEncriptada = await bycript.hash(password, 10);
        const usuario = await db.usuario.create({
            data: {
                nombre,
                apellido,
                telefono,
                direccion,
                email,
                password: contrasenaEncriptada,
                img_url: pathImagen,
            },
        });
        usuario.password = undefined;
        return response(res, 201, usuario, 'Usuario creado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al crear el usuario: ${error}`, false);
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
        usuario.password = undefined;
        return response(res, 200, usuario, 'Usuario obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el usuario: ${error}`, false);
    }
}