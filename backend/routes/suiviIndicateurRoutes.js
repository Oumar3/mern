import express from "express";
const router = express.Router();
import {
  createSuiviIndicateur,
  getAllSuiviIndicateurs,
  getSuiviIndicateurById,
  updateSuiviIndicateur,
  deleteSuiviIndicateur,
} from "../controllers/suiviIndicateurController.js";
import { auth } from '../middleware/auth.js';

// Require authentication for create, update, and delete
router.route("/").post(auth, createSuiviIndicateur).get(getAllSuiviIndicateurs);
router.route("/:id").get(getSuiviIndicateurById).put(auth, updateSuiviIndicateur).delete(auth, deleteSuiviIndicateur);
export default router;