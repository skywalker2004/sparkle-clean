import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = express.Router();

router.use(protect);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', adminOnly, deleteClient); // Admin only

export default router;