import express from "express";
const router = express.Router();
import {
    createIndicateur,
    getAllIndicateurs,
    getIndicateurById,
    updateIndicateur,
    deleteIndicateur
} from "../controllers/indicateurController.js";

router.route("/")
    .post(createIndicateur)
    .get(getAllIndicateurs);

router.route("/:id")
    .get(getIndicateurById)
    .put(updateIndicateur)
    .delete(deleteIndicateur);

export default router;
// Note: Ensure to import this controller in your routes file and set up the necessary routes.