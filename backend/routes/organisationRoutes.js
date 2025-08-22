import express from 'express';
const router = express.Router();
import {
  createOrganisation,
  getAllOrganisations,
  getOrganisationById,
  updateOrganisation,
  deleteOrganisation,
} from '../controllers/organisationController.js';

// For now, these routes are public. You'll likely want to add authentication
// and authorization middleware here, for example:
// import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(createOrganisation).get(getAllOrganisations);

router
  .route('/:id')
  .get(getOrganisationById)
  .put(updateOrganisation)
  .delete(deleteOrganisation);

export default router;