import express from 'express';
const router = express.Router();
import {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,
  addPromise,
  updatePromise,
  getInstitutionsByCategory,
  getFinancialStats
} from '../controllers/institutionController.js';

// For now, these routes are public. You'll likely want to add authentication
// and authorization middleware here, for example:
// import { protect, admin } from '../middleware/authMiddleware.js';

// Main institution routes
router.route('/').post(createInstitution).get(getAllInstitutions);

// Get institutions by category
router.route('/category/:category').get(getInstitutionsByCategory);

// Get financial statistics
router.route('/stats/financial').get(getFinancialStats);

// Promise management routes
router.route('/:id/promises').post(addPromise);
router.route('/:id/promises/:promiseId').put(updatePromise);

// Individual institution routes
router
  .route('/:id')
  .get(getInstitutionById)
  .put(updateInstitution)
  .delete(deleteInstitution);

export default router;
