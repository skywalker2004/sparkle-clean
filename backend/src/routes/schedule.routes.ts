import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getUpcoming, completeCleaning } from '../controllers/schedule.controller';

const router = express.Router();

router.use(protect);

router.get('/upcoming', getUpcoming);
router.post('/complete', completeCleaning);

export default router;