import db from '../../db.js';
import response from '../../utils/response.js';
import * as imageUtils from '../../utils/image.js';
import * as functions from '../../utils/functions.js';
import transporter from '../../utils/email.js';

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
    }finally {
        db.$disconnect();
    }
}

export async function createPedido(req, res) {
    try{

        // let info = await transporter.sendMail({
        //     from: 'Horneatitos Shop <horneatitosshop@gmail.com>',
        //     to: 'bladimirbaptistagonzales@gmail.com',
        //     subject: 'Nuevo pedido',
        //     html: `<h1>Se ha realizado un nuevo pedido</h1>`
        // });
        // return response(res, 200, info, 'Pedido creado correctamente');
        const {fk_carrito } = req.body;
        if(!fk_carrito || isNaN(fk_carrito)){
            return response(res, 400, null, 'El id del carrito es obligatorio y debe ser un número', false);
        }

        const carrito = await db.carrito.findUnique({
            where: {
                id: Number(fk_carrito),
            },
            include: {
                items: {
                    include: {
                        producto: true,
                    },
                },
            },
        });

        if(!carrito){
            return response(res, 404, null, 'Carrito no encontrado', false);
        }

        if(carrito.items.length === 0){
            return response(res, 400, null, 'El carrito no tiene productos', false);
        }
        let ticket = functions.generarTicketPedido();
        const pedido = await db.pedido.create({
            data: {
                fk_usuario: carrito.fk_usuario,
                ticket,
                completado: false
            },
        });
        let total = 0;
        for(const item of carrito.items){
            total += item.producto.precio * item.cantidad;
            await db.detalle.create({
                data: {
                    fk_pedido: pedido.id,
                    fk_producto: item.fk_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.producto.precio,
                },
            });
        }
        await db.pedido.update({
            where: {
                id: pedido.id,
            },
            data: {
                total,
            }
        });
        
        await db.carritoitem.deleteMany({
            where: {
                fk_carrito: carrito.id,
            },
        });
        return response(res, 201, pedido, 'Pedido creado correctamente');
    }catch(error){
        console.error(error);
        return response(res, 500, null, `Error al crear el pedido: ${error}`, false);
    }finally {
        db.$disconnect();
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