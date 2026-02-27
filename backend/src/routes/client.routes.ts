import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = express.Router();

router.use(protect);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', admin, deleteClient); // Admin only

export default router;