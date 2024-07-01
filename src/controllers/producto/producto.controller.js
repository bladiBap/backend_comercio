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
            include: {
                imagenes: true
            }
        });
        if (!producto) {
            return response(res, 404, null, 'Producto no encontrado', false);
        }
        return response(res, 200, producto, 'Producto obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el producto: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function getProductos(req, res) {
    try {
        const {page, pageSize} = req.query;
        const totalPorductos = await db.producto.count();
        const productos = await db.producto.findMany(
            {
                include: {
                    imagenes: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? {
                        take: 1
                    } : true
                },
                skip: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                    undefined : ((parseInt(page) - 1) * parseInt(pageSize)),
                take: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                    undefined : parseInt(pageSize)
            }
        );
        return response(res, 200, {
            productos,
            total_pages : (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ?
            1 : Math.ceil(totalPorductos / parseInt(pageSize))
        }, 'Productos obtenidos correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener los productos: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function createProducto(req, res) {
    try {
        const { nombre, descripcion, precio, stock, peso } = req.body;
        if (!nombre || !descripcion || !precio || !stock || !peso) {
            return response(res, 400, null, 'Los campos nombre, descripcion, precio, stock y peso son obligatorios', false);
        }
        
        if (!req.files || !req.files.imagenes) {
            return response(res, 400, null, 'Las imagenes del producto son obligatorias', false);
        }
        const imagenes = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];
        
        const producto = await db.producto.create({
            data: {
                nombre,
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
    }finally {
        db.$disconnect();
    }
}

export async function updateProducto(req, res){
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, peso } = req.body;
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
        
        await db.producto.update({
            where: {
                id: Number(id),
            },
            data: {
                nombre: nombre || producto.nombre,
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
    }finally {
        db.$disconnect();
    }
}

export async function addImagen(req, res) {
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
        if (!req.files || !req.files.imagenes) {
            return response(res, 400, null, 'Las imagenes del producto son obligatorias', false);
        }
        const imagenes = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];
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
        return response(res, 200, null, 'Imagenes agregadas correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al agregar las imagenes: ${error}`, false);
    }finally {
        db.$disconnect();
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
    }finally {
        db.$disconnect();
    }
}

export async function buscarProducto (req, res){
    try{

        const {texto, page, pageSize} = req.query;

        if (!texto || texto.trim() === '') {
            return response(res, 400, null, 'El texto es obligatorio', false);
        }

        const totalCoincidencias = await db.producto.count({
            where: {
                nombre: {
                    contains: texto
                }
            }
        });

        const productos = await db.producto.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                precio: true,
                stock: true,
                peso: true,
                imagenes: {
                    take: 1
                },
            },
            where: {
                nombre: {
                    contains: texto
                }
            },
            skip: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : ((parseInt(page) - 1) * parseInt(pageSize)),
            take: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : parseInt(pageSize)
        });
        return response(res, 200, {
            productos,
            total_pages : (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
            1 : Math.ceil(totalCoincidencias / parseInt(pageSize))
        }, 'Productos obtenidos correctamente');
    } catch (error ){
        console.error(error)
        return response(res, 500, null, `Error al buscar el producto: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function deleteManyImages (req, res){
    try {
        const { id } = req.params;
        const { ids } = req.body;
        console.log(req.body);
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del producto es obligatorio y debe ser un número', false);
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response(res, 400, null, 'Los ids de las imagenes son obligatorios y deben ser un array', false);
        }

        const imagenes = await db.imagen.findMany({
            where: {
                id: {
                    in: ids,
                },
                fk_producto: Number(id),
            },
        });

        if (imagenes.length === 0) {
            return response(res, 404, null, 'Imagenes no encontradas', false);
        }

        for (const imagen of imagenes) {
            await imageUtils.eliminarImagen(imagen.img_url);
        }

        await db.imagen.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return response(res, 200, null, 'Imagenes eliminadas correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al eliminar las imagenes: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}