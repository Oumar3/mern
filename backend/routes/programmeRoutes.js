import express from "express";
const router = express.Router();
import { createProgramme, getAllProgrammes, getProgrammeById, updateProgramme, deleteProgramme } from "../controllers/programmeController.js";

// For now, these routes are public. You'll likely want to add authentication middleware later.
router.route("/").post(createProgramme).get(getAllProgrammes);

router
  .route("/:id")
  .get(getProgrammeById)
  .put(updateProgramme)
  .delete(deleteProgramme);

export default router;  