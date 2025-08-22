import express from "express";
const router = express.Router();
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from "../controllers/projectController.js";

// For now, these routes are public. You'll likely want to add authentication middleware later.
router.route("/").post(createProject).get(getAllProjects);
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

export default router;

