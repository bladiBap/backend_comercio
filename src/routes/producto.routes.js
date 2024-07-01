import {Router} from 'express';

import * as productoCtrl from '../controllers/producto/producto.controller.js';

const router = Router();

router.get('/get_productos', productoCtrl.getProductos);
router.get('/get_producto_by_id/:id', productoCtrl.getProductoById);
router.post('/create_producto', productoCtrl.createProducto);
router.put('/update_producto/:id', productoCtrl.updateProducto);
router.delete('/delete_producto/:id', productoCtrl.deleteProducto);
router.get('/buscar_producto', productoCtrl.buscarProducto);
router.post('/add_imagen_to_producto/:id', productoCtrl.addImagen);
router.delete('/delete_imagenes_producto/:id', productoCtrl.deleteManyImages);

export default router;