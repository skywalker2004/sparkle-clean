import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getInvoices, markPaid, getDashboardStats } from '../controllers/invoice.controller';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/mark-paid', markPaid);
router.get('/dashboard-stats', getDashboardStats);

export default router;