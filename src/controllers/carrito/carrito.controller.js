import db from '../../db.js';
import response from '../../utils/response.js';
import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID
const clientdSecret = process.env.PAYPAL_CLIENT_SECRET
//const environment = new paypal.core.SandboxEnvironment(clientId, clientdSecret);
// production
const environment = new paypal.core.LiveEnvironment(clientId, clientdSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function getCarritoById(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del carrito es obligatorio y debe ser un número', false);
        }
        const carrito = await db.carrito.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                items : {
                    include: {
                        producto: {
                            include: {
                                imagenes: {
                                    take: 1
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!carrito) {
            return response(res, 404, null, 'Carrito no encontrado', false);
        }
        return response(res, 200, carrito, 'Carrito obtenido correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener el carrito: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function addItemToCarrito (req, res) {
    try {
        const { fk_producto, fk_carrito, cantidad } = req.body;
        if (!fk_producto || !fk_carrito || !cantidad) {
            return response(res, 400, null, 'fk_producto, fk_carrito y cantidad son campos obligatorios', false);
        }
        if (isNaN(fk_producto) || isNaN(fk_carrito) || isNaN(cantidad)) {
            return response(res, 400, null, 'fk_producto, fk_carrito y cantidad deben ser números', false);
        }

        const producto = await db.producto.findUnique({
            where: {
                id: parseInt(fk_producto)
            }
        });

        const carrito = await db.carrito.findUnique({
            where: {
                id: parseInt(fk_carrito)
            }
        });

        const existeItem = await db.carritoitem.findFirst({
            where: {
                fk_producto: parseInt(fk_producto),
                fk_carrito: parseInt(fk_carrito)
            }
        });

        if (!carrito) {
            return response(res, 404, null, 'Carrito no encontrado', false);
        }

        if (!producto) {
            return response(res, 404, null, 'Producto no encontrado', false);
        }

        if (existeItem) {
            const carritoItem = await db.carritoitem.update({
                where: {
                    id: existeItem.id
                },
                data: {
                    cantidad: existeItem.cantidad + parseInt(cantidad)
                }
            });
            return response(res, 200, carritoItem, 'Item actualizado correctamente');
        }

        const carritoItem = await db.carritoitem.create({
            data: {
                fk_producto: parseInt(fk_producto),
                fk_carrito: parseInt(fk_carrito),
                cantidad: parseInt(cantidad)
            }
        });
        
        return response(res, 200, carritoItem, 'Item insertado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al insertar los items en el carrito: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function updateItemFromCarrito (req, res) {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del item del carrito es obligatorio y debe ser un número', false);
        }
        if (!cantidad || isNaN(cantidad)) {
            return response(res, 400, null, 'La cantidad es un campo obligatorio y debe ser un número', false);
        }
        const carritoItem = await db.carritoitem.update({
            where: {
                id: parseInt(id)
            },
            data: {
                cantidad: parseInt(cantidad)
            }
        });
        return response(res, 200, carritoItem, 'Item actualizado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al actualizar el item del carrito: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function deleteItemFromCarrito (req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return response(res, 400, null, 'El id del item del carrito es obligatorio y debe ser un número', false);
        }
        const carritoItem = await db.carritoitem.delete({
            where: {
                id: parseInt(id)
            }
        });
        return response(res, 200, carritoItem, 'Item eliminado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al eliminar el item del carrito: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function sincronizarCarrito (req, res) {
    try {
        const { fk_carrito, items } = req.body;
        if (!fk_carrito || !items) {
            return response(res, 400, null, 'fk_carrito e items son campos obligatorios', false);
        }
        if (isNaN(fk_carrito) || !Array.isArray(items)) {
            return response(res, 400, null, 'fk_carrito debe ser un número e items un array', false);
        }

        const carrito = await db.carrito.findUnique({
            where: {
                id: parseInt(fk_carrito)
            }
        });

        if (!carrito) {
            return response(res, 404, null, 'Carrito no encontrado', false);
        }

        for (const item of items) {
            const producto = await db.producto.findUnique({
                where: {
                    id: item.fk_producto
                }
            });

            if (!producto) {
                return response(res, 404, null, 'Producto no encontrado', false);
            }

            const existeItem = await db.carritoitem.findFirst({
                where: {
                    fk_producto: item.fk_producto,
                    fk_carrito: parseInt(fk_carrito)
                }
            });

            if (existeItem) {
                const carritoItem = await db.carritoitem.update({
                    where: {
                        id: existeItem.id
                    },
                    data: {
                        cantidad: existeItem.cantidad + item.cantidad
                    }
                });
            }else{
                const carritoItem = await db.carritoitem.create({
                    data: {
                        fk_producto: item.fk_producto,
                        fk_carrito: parseInt(fk_carrito),
                        cantidad: item.cantidad
                    }
                });
            }
        }

        return response(res, 200, null, 'Items insertados correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al insertar los items en el carrito: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function checkOut (req, res) {
    try {
        const request = new paypal.orders.OrdersCreateRequest();
        const { is_delivery, fk_carrito }  = req.body;
        
        const carrito = await db.carrito.findUnique({
            where: {
                id: parseInt(fk_carrito)
            },
            include: {
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        let items = [];
        let total = 0;
        let USD_TO_BOB = 6.96;
        for (const item of carrito.items) {
            items.push({
                name: item.producto.nombre,
                description: "Compra de " + item.producto.nombre,
                unit_amount: {
                    currency_code: 'USD',
                    value: (item.producto.precio / USD_TO_BOB).toFixed(2)
                },
                quantity: item.cantidad
            });
            total += (((item.producto.precio / USD_TO_BOB).toFixed(2)) * item.cantidad);
        }

        if (is_delivery) {
            items.push({
                name: 'Delivery',
                description: 'Costo de delivery',
                unit_amount: {
                    currency_code: 'USD',
                    value: (10 / USD_TO_BOB).toFixed(2)
                },
                quantity: 1
            });
            total = total + ((10 / USD_TO_BOB).toFixed(2) * 1)
        }

        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: total.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: total.toFixed(2)
                            }
                        }
                    },
                    items: items
                }
            ]
        });

        const respond = await client.execute(request);
        return response(res, 200, {id: respond.result.id}, 'Pago creado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al procesar el pago: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}