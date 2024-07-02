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
            include: {
                detalles: {
                    include: {
                        producto: {
                            include: {
                                imagenes: {
                                    take: 1,
                                }
                            }
                        }
                    },
                },
                usuario: true,
            }
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
        const {fk_carrito, esdelivery, nombre, direccion, correo} = req.body;
        console.log(req.body);
        if(!fk_carrito || isNaN(fk_carrito) || esdelivery === undefined || !nombre || !direccion || !correo){
            return response(res, 400, null, 'El id del carrito, esdelivery, nombre, dirección y correo son obligatorios', false);
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
                completado: false,
                esdelivery : esdelivery,
                nombre,
                direccion,
                correo
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

        let info = await transporter.sendMail({
            from: 'Horneatitos Shop <horneatitosshop@gmail.com>',
            to: 'bladimirbaptistagonzales@gmail.com',
            subject: 'Nuevo pedido',
            html: `<!DOCTYPE html
                    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport">
                    <meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>Nueva plantilla de correo electr%C3%B3nico 2024-06-25</title><link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet"><!--<![endif]--><style type="text/css"> 
                    #outlook a{padding:0}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:100%}.es-button{mso-style-priority:100 !important;text-decoration:none !important}a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit 
                        !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}.es-desk-hidden{display:none;float:left;overflow:hidden;width:0;max-height:0;line-height:0;mso-hide:all}.custom_shape_divider{position:absolute;top:0;left:0;width:100%;overflow:hidden;line-height:0}@media only screen and (max-width:600px)
                        {p,ul li,ol li,a{line-height:150% !important}h1,h2,h3,h1 a,h2 a,h3 a{line-height:120% !important}h1{font-size:22px !important;text-align:center}h2{font-size:20px !important;text-align:center}h3{font-size:18px !important;text-align:center}.es-header-body h1 a,.es-content-body h1 a,.es-footer-body h1 a{font-size:22px !important}.es-header-body 
                        h2 a,.es-content-body h2 a,.es-footer-body h2 a{font-size:20px !important}.es-header-body h3 a,.es-content-body h3 a,.es-footer-body h3 a{font-size:18px !important}.es-menu td a{font-size:13px !important}.es-header-body p,.es-header-body ul li,.es-header-body ol li,.es-header-body a{font-size:13px !important}.es-content-body p,.es-content-body 
                        ul li,.es-content-body ol li,.es-content-body a{font-size:14px !important}.es-footer-body p,.es-footer-body ul li,.es-footer-body ol li,.es-footer-body a{font-size:13px !important}.es-infoblock p,.es-infoblock ul li,.es-infoblock ol li,.es-infoblock a{font-size:11px !important}*[class="gmail-fix"]{display:none !important}.es-m-txt-c,.es-m-txt-c h1,.es-m-txt-c h2,.es-m-txt-c 
                        h3{text-align:center !important}.es-m-txt-r,.es-m-txt-r h1,.es-m-txt-r h2,.es-m-txt-r h3{text-align:right !important}.es-m-txt-l,.es-m-txt-l h1,.es-m-txt-l h2,.es-m-txt-l h3{text-align:left !important}.es-m-txt-r img,.es-m-txt-c img,.es-m-txt-l img{display:inline !important}.es-button-border{display:block !important}a.es-button,button.es-button{font-size:14px !important;display:block !important;
                        border-left-width:0px !important;border-right-width:0px !important}.es-btn-fw{border-width:10px 0px !important;text-align:center !important}.es-adaptive table,.es-btn-fw,.es-btn-fw-brdr,.es-left,.es-right{width:100% !important}.es-content table,.es-header table,.es-footer table,.es-content,.es-footer,.es-header{width:100% !important;max-width:600px !important}.es-adapt-td{display:block !important;width:100% !important}
                        .adapt-img{width:100% !important;height:auto !important}.es-m-p0{padding:0px !important}.es-m-p0r{padding-right:0px !important}.es-m-p0l{padding-left:0px !important}.es-m-p0t{padding-top:0px !important}.es-m-p0b{padding-bottom:0 !important}.es-m-p20b{padding-bottom:20px !important}.es-mobile-hidden,.es-hidden{display:none !important}tr.es-desk-hidden,td.es-desk-hidden,table.es-desk-hidden{width:auto !important;overflow:visible !important;float:none !important;max-height:inherit !important;line-height:inherit !important}
                        tr.es-desk-hidden{display:table-row !important}table.es-desk-hidden{display:table !important}td.es-desk-menu-hidden{display:table-cell !important}.es-menu td{width:1% !important}table.es-table-not-adapt,.esd-block-html table{width:auto !important}table.es-social{display:inline-block !important}table.es-social td{display:inline-block !important}.es-desk-hidden{display:table-row !important;width:auto !important;overflow:visible !important;max-height:inherit !important}}@media screen and (max-width:384px){.mail-message-content{width:414px !important}}</style></head><body
                        style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#EFEFEF"><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;
                        border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#EFEFEF"><tr style="border-collapse:collapse"><td valign="top" style="padding:0;Margin:0"><div style="width: 100%; display: flex; height: 120px;flex-direction : column"><div style = "width: 100%; display: flex; justify-content: center; align-items: center; background-color: #820300;heigth: 50px;">
                        </div><div style = "width: 100%; display: flex; justify-content: center; align-items: center; background-color: #CC0500;heigth: 40px;"></div><div style = "width: 100%; display: flex; justify-content: center; align-items: center; background-color: #FF0600;heigth: 30px;"></div></div><table class="es-content es-visible-simple-html-only" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;">
                        <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="transparent" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td class="es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:321px">
                        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="transparent" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent" role="presentation"><tr class="es-mobile-hidden" style="border-collapse:collapse"><td align="center" height="62" style="padding:0;Margin:0"></td></tr><tr style="border-collapse:collapse"><td align="center" height="24" style="padding:0;Margin:0"></td></tr><tr style="border-collapse:collapse"><td bgcolor="transparent" align="center" style="padding:0;Margin:0;padding-left:5px;padding-right:5px;padding-top:35px"><h2
                        style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:24px;font-style:normal;font-weight:bold;color:#333333; background-color: #EFEFEF;">
                                                                                                                ¡Gracias por su compra!</h2></td></tr><tr style="border-collapse:collapse"><td bgcolor="transparent" align="center" style="Margin:0;padding-bottom:5px;padding-top:10px;padding-left:20px;padding-right:20px"><h3
                        style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#000000">
                                                                                                                Horneatito</h3></td></tr><tr style="border-collapse:collapse"><td bgcolor="transparent" align="center" style="padding:0;Margin:0;padding-bottom:5px;padding-left:10px;padding-right:10px"><p
                        style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><br>
                                                                                                                Nos complace saber que has elegido nuestros productos y confiamos en que los disfrutarás. <br><br></p></td></tr><tr style="border-collapse:collapse"><td bgcolor="transparent" align="center" style="padding:0;Margin:0;padding-bottom:5px;padding-left:10px;padding-right:10px"><p
                        style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                                                                                                Si tienes alguna pregunta no dudes en contactarnos. <br>
                                                                                                                Estamos aquí para ayudarte.</p></td></tr><tr style="border-collapse:collapse"><td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;padding-bottom:30px"><span class="es-button-border" style="border-style:solid;border-width:0px;display:inline-block;border-radius:4px;width:auto"><div
                        href="https://viewstripo.email/" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#EFEFEF;font-size:18px;display:inline-block;background:#820300;border-radius:4px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:22px;width:auto;text-align:center;padding:10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #820300">
                                                                                                                    Ticket: ${ticket}</div></span></td></tr><tr class="es-mobile-hidden" style="border-collapse:collapse"><td align="center" height="45" style="padding:0;Margin:0"></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                                                                                                                    <tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table bgcolor="#FFFFFF" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-position:center top;background-color:transparent" bgcolor="transparent"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                                                                                                                    <table class="es-left" cellspacing="0" cellpadding="0" align="left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:270px"><table
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center top" width="100%" cellspacing="0" cellpadding="0" role="presentation"><tr style="border-collapse:collapse"><td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-top:5px"><p
                        style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                                                                        Puedes seguirnos en nuestras redes sociales para
                                                                                        estar al tanto.
                                                                                        &nbsp;</p></td></tr></table></td></tr></table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]--><table class="es-right" cellspacing="0" cellpadding="0" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;width:270px"><table
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center top" width="100%" cellspacing="0" cellpadding="0" role="presentation"><tr style="border-collapse:collapse"><td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0"><table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><a href="https://www.facebook.com/horneatitos.bolivia"><img title="Facebook" src="https://fixblqe.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png" alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td></a><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><a href="https://www.tiktok.com/@horneatito?is_from_webapp=1&sender_device=pc"><img title="TikTok" src="https://fixblqe.stripocdn.email/content/assets/img/social-icons/logo-black/tiktok-logo-black.png" alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                        </a></td><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><a href="https://www.instagram.com/horneatitostja"><img title="Instagram" src="https://fixblqe.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png" alt="Inst" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td></tr></table></td></tr></table></td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></td></tr></table></td></tr></table></div></body></html>`
        });

        return response(res, 201, pedido, 'Pedido creado correctamente');
    }catch(error){
        console.error(error);
        return response(res, 500, null, `Error al crear el pedido: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function getPedidos (req, res) {
    try {
        const {page, pageSize} = req.query;
        const totalPedidos = await db.pedido.count();
        const pedidos = await db.pedido.findMany({
            orderBy: {
                id: 'desc'
            },
            skip: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : ((parseInt(page) - 1) * parseInt(pageSize)),
            take: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : parseInt(pageSize)
        });

        return response(res, 200, {
            pedidos,
            total_pages: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ?
                1 : Math.ceil(totalPedidos / parseInt(pageSize))
        }, 'Pedidos obtenidos correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al obtener los pedidos: ${error}`, false);
    }finally {
        db.$disconnect();
    }
};

export async function buscarPedidoByTicket (req, res) {
    try {
        const {ticket, page, pageSize} = req.query;
        if(!ticket){
            return response(res, 400, null, 'El ticket es obligatorio', false);
        }

        const totalPedidos = await db.pedido.count({
            where: {
                ticket: {
                    contains: ticket,
                },
            },
        });

        const pedidos = await db.pedido.findMany({
            where: {
                ticket: {
                    contains: ticket,
                },
            },
            orderBy: {
                id: 'desc'
            },
            skip: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : ((parseInt(page) - 1) * parseInt(pageSize)),
            take: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ? 
                undefined : parseInt(pageSize)
        });

        return response(res, 200, {
            pedidos,
            total_pages: (isNaN(page) || isNaN(pageSize) || page==='' || pageSize==='') ?
                1 : Math.ceil(totalPedidos / parseInt(pageSize))
        }, 'Pedidos obtenidos correctamente');

    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al buscar el pedido: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function completarPedido (req, res) {
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
        if(pedido.completado){
            return response(res, 400, null, 'El pedido ya fue completado', false);
        }
        await db.pedido.update({
            where: {
                id: pedido.id,
            },
            data: {
                completado: true,
            },
        });
        return response(res, 200, null, 'Pedido completado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al completar el pedido: ${error}`, false);
    }finally {
        db.$disconnect();
    }
}

export async function deletePedido (req, res) {
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
        
        if (pedido.completado === false) {
            return response(res, 400, null, 'No se puede eliminar el pedido porque no ha sido completado', false);
        }

        await db.pedido.delete({
            where: {
                id: pedido.id,
            },
        });

        return response(res, 200, null, 'Pedido eliminado correctamente');
    } catch (error) {
        console.error(error);
        return response(res, 500, null, `Error al eliminar el pedido: ${error}`, false);
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