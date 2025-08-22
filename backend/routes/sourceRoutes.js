import express from "express";
const router = express.Router();
import {
  createSource,
  getSources,
  getSourceById,
  updateSource,
  deleteSource,
  getSourceOptions,
} from "../controllers/sourceController.js";

// For now, these routes are public. You'll likely want to add authentication middleware later.

router.post("/", createSource);
router.get("/", getSources);
// IMPORTANT: /options route must come BEFORE /:id to avoid conflicts
router.get("/options", getSourceOptions);
router.get("/:id", getSourceById);
router.put("/:id", updateSource);
router.delete("/:id", deleteSource);

export default router;