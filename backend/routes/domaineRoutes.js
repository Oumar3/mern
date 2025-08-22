import express from "express";
const router = express.Router();
import {
  createDomaine,
  getAllDomaines,
  getDomaineById,
  updateDomaine,
  deleteDomaine,
} from "../controllers/domaineController.js";

// For now, these routes are public. You'll likely want to add authentication middleware later.

router.route("/").post(createDomaine).get(getAllDomaines);

router
  .route("/:id")
  .get(getDomaineById)
  .put(updateDomaine)
  .delete(deleteDomaine);

export default router;  