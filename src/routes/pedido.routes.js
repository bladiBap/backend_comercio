import {Router} from 'express';

import * as pedidoCtrl from '../controllers/pedido/pedido.controller.js';
import { verificarRolAdmin } from "../utils/jwt.js";

const router = Router();

router.get('/get_pedido_by_id/:id', pedidoCtrl.getPedidoById);
router.post('/create_pedido' ,pedidoCtrl.createPedido);
router.get('/get_pedidos', pedidoCtrl.getPedidos);
router.get('/buscar_pedido_by_ticket',pedidoCtrl.buscarPedidoByTicket);
router.patch('/completar_pedido/:id', verificarRolAdmin, pedidoCtrl.completarPedido);
router.delete('/delete_pedido/:id', verificarRolAdmin, pedidoCtrl.deletePedido);

export default router;