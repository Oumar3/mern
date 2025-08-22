import express from "express";
import {
    createSousPrefecture,
    getSousPrefectures,
    getSousPrefecturesByDepartement,
    getSousPrefectureById,
    updateSousPrefecture,
    deleteSousPrefecture
} from "../../controllers/Decoupage/sousPrefectureController.js";

const router = express.Router();

// Base routes
router.post("/", createSousPrefecture);
router.get("/", getSousPrefectures);
router.get("/:id", getSousPrefectureById);
router.put("/:id", updateSousPrefecture);
router.delete("/:id", deleteSousPrefecture);

// Filtered routes
router.get("/departement/:departementId", getSousPrefecturesByDepartement);

export default router;
