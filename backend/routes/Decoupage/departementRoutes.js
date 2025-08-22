import express from "express";
const router = express.Router();
import {
  createDepartement,
  getDepartements,
  getDepartementById,
  updateDepartement,
  deleteDepartement
} from "../../controllers/Decoupage/departementController.js";

router.route("/").post(createDepartement).get(getDepartements);
router.route("/:id").get(getDepartementById).put(updateDepartement).delete(deleteDepartement);


export default router;