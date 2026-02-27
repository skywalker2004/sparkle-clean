import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getInvoices, markPaid } from '../controllers/invoice.controller';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/mark-paid', markPaid);

export default router;