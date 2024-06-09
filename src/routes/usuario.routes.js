import {Router} from 'express';

import * as usuarioCtrl from '../controllers/usuario/usuario.controller.js';

const router = Router();

router.post('/create_usuario', usuarioCtrl.createUsuario);
router.get('/get_usuario_by_id/:id', usuarioCtrl.getUsuarioById);

export default router;