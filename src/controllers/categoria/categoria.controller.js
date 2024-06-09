import db from '../../db.js';
import response from '../../utils/response.js';

export async function getCategorias(req, res) {
    try {
        const categorias = await db.categoria.findMany();
        return response(res, 200, categorias, 'Categorias obtenidas correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener las categorias: ${error}`, false);
    }
}

export async function createCategoria(req, res) {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre || !descripcion) {
            return response(res, 400, null, 'El campo nombre y descripcion son obligatorios', false);
        }
        const categoria = await db.categoria.create({
            data: {
                nombre,
                descripcion,
            },
        });
        return response(res, 201, categoria, 'Categoria creada correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al crear la categoria: ${error}`, false);
    }
}

export async function getCategoriaById(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id de la categoria es obligatorio y debe ser un número', false);
        }
        const categoria = await db.categoria.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!categoria) {
            return response(res, 404, null, 'Categoria no encontrada', false);
        }
        return response(res, 200, categoria, 'Categoria obtenida correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener la categoria: ${error}`, false);
    }
}