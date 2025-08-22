import express from 'express';
const router = express.Router();

import { createOrientation, getOrientations, getOrientationById, updateOrientation, deleteOrientation } from '../controllers/orientationController.js';

router.post('/', createOrientation);
router.get('/', getOrientations);
router.get('/:id', getOrientationById);
router.put('/:id', updateOrientation);
router.delete('/:id', deleteOrientation);

export default router;
