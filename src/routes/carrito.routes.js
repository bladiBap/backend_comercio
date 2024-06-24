import Router from 'express';
import * as carritoCtrl from '../controllers/carrito/carrito.controller.js';

const router = Router();

router.get('/carrito/:id', carritoCtrl.getCarritoById);
router.post('/carrito-item', carritoCtrl.addItemToCarrito);
router.put('/carrito-item/:id', carritoCtrl.updateItemFromCarrito);
router.delete('/carrito-item/:id', carritoCtrl.deleteItemFromCarrito);
router.post('/sincronizar_carrito', carritoCtrl.sincronizarCarrito);
router.post('/check_out', carritoCtrl.checkOut);

export default router;