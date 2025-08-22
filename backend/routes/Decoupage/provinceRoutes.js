import express from "express";
const router = express.Router();
import {
  createProvince,
  getProvinces,
  getProvinceById,
  updateProvince,
  deleteProvince
} from "../../controllers/Decoupage/provinceController.js";

router.route("/").post(createProvince).get(getProvinces);
router.route("/:id").get(getProvinceById).put(updateProvince).delete(deleteProvince);


export default router;
