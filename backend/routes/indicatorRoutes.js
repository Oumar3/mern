import express from "express";
import {
    createIndicator,
    getIndicators,
    getIndicatorById,
    updateIndicator,
    deleteIndicator,
    getProgrammes,
    getSources,
    getUnitesDeMesure,
    getIndicatorStatistics
} from "../controllers/indicatorController.js";
import { validateIndicator, validateIndicatorData } from "../middleware/indicatorValidation.js";
// import { auth } from "../middleware/auth.js"; // Commented out for now

const router = express.Router();

// Related entities endpoints - these need to come before the /:id route
router.get("/options/programmes", getProgrammes);
router.get("/options/sources", getSources);
router.get("/options/unites-de-mesure", getUnitesDeMesure);
router.get("/statistics", getIndicatorStatistics);

// Remove auth middleware for now to test
router.post("/", validateIndicator, validateIndicatorData, createIndicator);
router.get("/", getIndicators);
router.get("/:id", getIndicatorById);
router.put("/:id", validateIndicator, validateIndicatorData, updateIndicator);
router.delete("/:id", deleteIndicator);

export default router;
