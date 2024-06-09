import {Router} from 'express';

import * as productoCtrl from '../controllers/producto/producto.controller.js';

const router = Router();

router.get('/get_productos', productoCtrl.getProductos);
router.get('/get_producto_by_id/:id', productoCtrl.getProductoById);
router.post('/create_producto', productoCtrl.createProducto);
router.put('/update_producto/:id', productoCtrl.updateProducto);
router.delete('/delete_producto/:id', productoCtrl.deleteProducto);
router.get('/get_productos_by_categoria/:id', productoCtrl.getProductosByCategoria);

export default router;