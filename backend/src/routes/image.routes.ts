import { Router } from 'express';
import { getServiceImage } from '../controllers/image.controller';

const router = Router();

router.get('/service-image', getServiceImage);

export default router;
