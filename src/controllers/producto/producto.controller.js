import db from '../../db.js';
import response from '../../utils/response.js';
import * as imageUtils from '../../utils/image.js';

export async function getProductoById(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del producto es obligatorio y debe ser un número', false);
        }
        const producto = await db.producto.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!producto) {
            return response(res, 404, null, 'Producto no encontrado', false);
        }
        return response(res, 200, producto, 'Producto obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el producto: ${error}`, false);
    }
}

export async function getProductos(req, res) {
    try {
        const productos = await db.producto.findMany();
        return response(res, 200, productos, 'Productos obtenidos correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener los productos: ${error}`, false);
    }
}

export async function createProducto(req, res) {
    try {
        const { nombre, fk_categoria, descripcion, precio, stock, peso } = req.body;
        if (!nombre || !fk_categoria || !descripcion || !precio || !stock || !peso) {
            return response(res, 400, null, 'Los campos nombre, fk_categoria, descripcion, precio, stock y peso son obligatorios', false);
        }
        if (isNaN(fk_categoria)) {
            return response(res, 400, null, 'El id de la categoria debe ser un número', false);
        }
        const categoria = await db.categoria.findUnique({
            where: {
                id: Number(fk_categoria),
            },
        });
        if (!categoria) {
            return response(res, 404, null, 'Categoria no encontrada', false);
        }
        if (!req.files || !req.files.imagenes) {
            return response(res, 400, null, 'Las imagenes del producto son obligatorias', false);
        }
        const imagenes = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];
        
        const producto = await db.producto.create({
            data: {
                nombre,
                categoria: {
                    connect: {
                        id: Number(fk_categoria),
                    },
                },
                descripcion,
                precio: parseFloat(precio),
                stock: Number(stock),
                peso: parseFloat(peso),
            },
        });
        for (const imagen of imagenes) {
            const ultimoId = await db.imagen.findFirst({
                select: {
                    id: true,
                },
                orderBy: {
                    id: 'desc',
                },
            });
            const id = ultimoId ? ultimoId.id + 1 : 1;
            const pathImagen = await imageUtils.guardarImagen('productos', imagen, `imagen_${id}`, null);
            await db.imagen.create({
                data: {
                    img_url: pathImagen,
                    fk_producto: producto.id,
                },
            });
        }
        
        return response(res, 201, producto, 'Producto creado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al crear el producto: ${error}`, false);
    }
}

export async function updateProducto(req, res){
    try {
        const { id } = req.params;
        const { nombre, fk_categoria, descripcion, precio, stock, peso } = req.body;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del producto es obligatorio y debe ser un número', false);
        }
        if (isNaN(fk_categoria)) {
            return response(res, 400, null, 'El id de la categoria debe ser un número', false);
        }
        const producto = await db.producto.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!producto) {
            return response(res, 404, null, 'Producto no encontrado', false);
        }
        const categoria = await db.categoria.findUnique({
            where: {
                id: Number(fk_categoria),
            },
        });
        if (!categoria) {
            return response(res, 404, null, 'Categoria no encontrada', false);
        }
        await db.producto.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre: nombre || producto.nombre,
                categoria: {
                    connect: {
                        id: Number(fk_categoria),
                    },
                },
                descripcion: descripcion || producto.descripcion,
                precio: precio ? parseFloat(precio) : producto.precio,
                stock: stock ? Number(stock) : producto.stock,
                peso: peso ? parseFloat(peso) : producto.peso,
            },
        });
        return response(res, 200, null, 'Producto actualizado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al actualizar el producto: ${error}`, false);
    }
}

export async function deleteProducto(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del producto es obligatorio y debe ser un número', false);
        }
        const producto = await db.producto.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!producto) {
            return response(res, 404, null, 'Producto no encontrado', false);
        }
        const imagenes = await db.imagen.findMany({
            where: {
                fk_producto: Number(id),
            },
        });

        for (const imagen of imagenes) {
            await imageUtils.eliminarImagen(imagen.img_url);
            await db.imagen.delete({
                where: {
                    id: imagen.id,
                },
            });
        }

        await db.producto.delete({
            where: {
                id: Number(id),
            },
        });
        return response(res, 200, null, 'Producto eliminado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al eliminar el producto: ${error}`, false);
    }
}

export async function getProductosByCategoria(req, res) {
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
        const productos = await db.producto.findMany({
            where: {
                fk_categoria: Number(id),
            },
        });
        return response(res, 200, productos, 'Productos obtenidos correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener los productos: ${error}`, false);
    }
}