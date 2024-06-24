import response from './response.js';
import jwt from 'jsonwebtoken';
import db from '../db.js';

export const getUserJWT = async (req, res) => {
    const auth = req.headers?.authorization;
    let token = null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        token = auth.split(" ")[1];
    }else{
        return response(res, 401, null, "No autorizado", false);
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) return response(res, 401, null, "No autorizado", false);
        const usuario = await db.usuario.findUnique({
            where: {
                id: decoded.id
            }
        });
        if (!usuario) return response(res, 401, null, "No autorizado", false);
        return usuario;
    } catch (error) {
        console.log(error);
        return response(res, 401, null, "No autorizado", false);
    }finally{
        db.$disconnect();
    }
};

export const generarJWT = (id, correo) => {
    return jwt.sign({
        id, correo}, 
        process.env.JWT_SECRET, 
        {expiresIn: '1d'});
};

export const verificarRolAdmin = async (req, res, next) => {
    const usuarioJWT = await getUserJWT(req, res);
    if (!usuarioJWT.id) return;
    if (usuarioJWT.role !== "ADMIN") {
        return response(res, 401, null, "No autorizado ", false);
    }
    next();
};