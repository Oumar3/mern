import express from "express";
import {
    createCanton,
    getCantons,
    getCantonsBySousPrefecture,
    getCantonById,
    updateCanton,
    deleteCanton
} from "../../controllers/Decoupage/cantonController.js";

const router = express.Router();

// Base routes
router.post("/", createCanton);
router.get("/", getCantons);
router.get("/:id", getCantonById);
router.put("/:id", updateCanton);
router.delete("/:id", deleteCanton);

// Filtered routes
router.get("/sous-prefecture/:sousPrefectureId", getCantonsBySousPrefecture);

export default router;
