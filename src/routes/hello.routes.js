import {Router} from 'express';

import * as helloCtrl from '../controllers/hello/hello.controller.js';

const router = Router();

router.get('/hello', helloCtrl.getHello);
router.get('/data', helloCtrl.getDataToDB);

export default router;