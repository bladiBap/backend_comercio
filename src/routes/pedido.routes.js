import {Router} from 'express';

import * as pedidoCtrl from '../controllers/pedido/pedido.controller.js';

const router = Router();

router.get('/get_pedido_by_id/:id', pedidoCtrl.getPedidoById);
router.post('/create_pedido', pedidoCtrl.createPedido);
// getPedidos
// buscarPedidoByTicket
router.get('/get_pedidos', pedidoCtrl.getPedidos);
router.get('/buscar_pedido_by_ticket', pedidoCtrl.buscarPedidoByTicket);

export default router;