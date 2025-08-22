import express from "express";
import {
  createUniteDeMesure,
  getUnitesDeMesure,
  getUniteDeMesureById,
  updateUniteDeMesure,
  deleteUniteDeMesure,
  getUniteDeMesureOptions
} from "../controllers/uniteDeMesureController.js";

const router = express.Router();

router.post("/", createUniteDeMesure);
router.get("/", getUnitesDeMesure);
router.get("/options", getUniteDeMesureOptions);
router.get("/:id", getUniteDeMesureById);
router.put("/:id", updateUniteDeMesure);
router.delete("/:id", deleteUniteDeMesure);

export default router;
