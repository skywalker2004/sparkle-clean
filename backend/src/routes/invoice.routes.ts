import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getInvoices, createInvoice, markPaid, getDashboardStats, getMonthlyRevenue } from '../controllers/invoice.controller';
import { completeCleaning } from '../controllers/schedule.controller';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.post('/record-cleaning', completeCleaning);
router.put('/mark-paid', markPaid);
router.get('/dashboard-stats', getDashboardStats);
router.get('/monthly-revenue', getMonthlyRevenue);

export default router;