import express from "express";
const router = express.Router();

import {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage
} from "../../controllers/Decoupage/villageController.js";

router.route("/").post(createVillage).get(getVillages);
router.route("/:id").get(getVillageById).put(updateVillage).delete(deleteVillage);

export default router;
