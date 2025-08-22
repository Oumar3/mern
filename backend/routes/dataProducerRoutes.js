import express from 'express';
const router = express.Router();

import { createDataProducer, getDataProducers, getDataProducerById, updateDataProducer, deleteDataProducer } from '../controllers/dataProducerController.js';

router.post('/', createDataProducer);
router.get('/', getDataProducers);
router.get('/:id', getDataProducerById);
router.put('/:id', updateDataProducer);
router.delete('/:id', deleteDataProducer);

export default router;
