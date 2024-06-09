import db from '../../db.js';
import response from '../../utils/response.js';
import * as imageUtils from '../../utils/image.js';

export async function getPedidoById(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del pedido es obligatorio y debe ser un número', false);
        }
        const pedido = await db.pedido.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!pedido) {
            return response(res, 404, null, 'Pedido no encontrado', false);
        }
        return response(res, 200, pedido, 'Pedido obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el pedido: ${error}`, false);
    }
}

export async function createPedido(req, res) {
    try{
        const {detalles, id_usuario} = req.body;
        if(!detalles || !id_usuario){
            return response(res, 400, null, 'Los detalles y el id del usuario son obligatorios', false);
        }

        if(!validarDetalleBody(req, res)){
            return;
        }

        

        const pedido = await db.pedido.create({
            data: {
                fk_usuario: parseInt(id_usuario),

            }
        });

        for (const detalle of detalles){
            const producto = await db.producto.findUnique({
                where: {
                    id: detalle.id_producto
                }
            });
            if(!producto){
                return response(res, 404, null, `Producto con id ${detalle.id_producto} no encontrado`, false);
            }
            if(producto.stock < detalle.cantidad){
                return response(res, 400, null, `No hay suficiente stock para el producto ${producto.nombre}`, false);
            }
        }



    }catch(error){
        console.error(error);
        return response(res, 500, null, `Error al crear el pedido: ${error}`, false);
    }
}

const validarDetalleBody = (req, res) => {
    const {detalles} = req.body;
    if(!detalles || !Array.isArray(detalles) || detalles.length === 0){
        return response(res, 400, null, 'Los detalles deben ser un arreglo con al menos un elemento', false);
    }
    for(const detalle of detalles){
        if(!detalle.id_producto || !detalle.cantidad || !detalle.precio_unitario){
            return response(res, 400, null, 'Los detalles deben contener el id del producto, la cantidad y el precio unitario', false);
        }
        if(isNaN(detalle.id_producto) || isNaN(detalle.cantidad) || isNaN(detalle.precio_unitario)){
            return response(res, 400, null, 'El id del producto, la cantidad y el precio unitario deben ser números', false);
        }

    }
    return true;
};