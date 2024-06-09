import {Router} from 'express';

import * as categoriaCtrl from '../controllers/categoria/categoria.controller.js';

const router = Router();

router.get('/get_categorias', categoriaCtrl.getCategorias);
router.get('/get_categoria_by_id/:id', categoriaCtrl.getCategoriaById);
router.post('/create_categoria', categoriaCtrl.createCategoria);

export default router;