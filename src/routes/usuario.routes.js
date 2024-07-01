import {Router} from 'express';

import * as usuarioCtrl from '../controllers/usuario/usuario.controller.js';


const router = Router();

router.post('/create_usuario', usuarioCtrl.createUsuario);
router.get('/get_usuario_by_id/:id', usuarioCtrl.getUsuarioById);
router.get('/get_user_by_token', usuarioCtrl.getUserByToken);
router.post('/login', usuarioCtrl.login);
router.put('/update_usuario/:id', usuarioCtrl.updateUsuario);
router.get('/get_usuario_info/:id', usuarioCtrl.getMyInfo);
router.post('/login_admin', usuarioCtrl.loginAdmin);

export default router;