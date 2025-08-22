import express from "express";
const router = express.Router();
import {
  createCommune,
  getCommunes,
  getCommuneById,
  updateCommune,
  deleteCommune
} from "../../controllers/Decoupage/communeController.js";

router.route("/").post(createCommune).get(getCommunes);
router.route("/:id").get(getCommuneById).put(updateCommune).delete(deleteCommune);  

export default router;
