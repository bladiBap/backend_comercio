import {Router} from 'express';

import * as productoCtrl from '../controllers/producto/producto.controller.js';
import { verificarRolAdmin } from "../utils/jwt.js";

const router = Router();

router.get('/get_productos', productoCtrl.getProductos);
router.get('/get_producto_by_id/:id', productoCtrl.getProductoById);
router.post('/create_producto', verificarRolAdmin,productoCtrl.createProducto);
router.put('/update_producto/:id', verificarRolAdmin,productoCtrl.updateProducto);
router.delete('/delete_producto/:id', verificarRolAdmin,productoCtrl.deleteProducto);
router.get('/buscar_producto', productoCtrl.buscarProducto);
router.post('/add_imagen_to_producto/:id', verificarRolAdmin,productoCtrl.addImagen);
router.delete('/delete_imagenes_producto/:id', verificarRolAdmin,productoCtrl.deleteManyImages);

export default router;