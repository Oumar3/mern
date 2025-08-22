import express from "express";
import {
    createFollowup,
    getFollowups,
    getFollowupById,
    updateFollowup,
    deleteFollowup
} from "../controllers/indicatorFollowupController.js";
// import { auth } from "../middleware/auth.js"; // Commented out for now

const router = express.Router();

// Remove auth middleware for now to test
router.post("/", createFollowup);
router.get("/", getFollowups);
router.get("/:id", getFollowupById);
router.put("/:id", updateFollowup);
router.delete("/:id", deleteFollowup);

export default router;
