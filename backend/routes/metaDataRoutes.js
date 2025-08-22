import express from "express";
import multer from "multer";
import {
  createMetaData,
  getMetaDataList,
  getMetaDataById,
  updateMetaData,
  deleteMetaData,
  getMetaDataOptions,
  importMetaDataFromExcel
} from "../controllers/metaDataController.js";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getMetaDataList);
router.post("/", createMetaData);
router.get("/options", getMetaDataOptions);
router.post("/import-excel", upload.single('file'), importMetaDataFromExcel);
router.get("/:id", getMetaDataById);
router.put("/:id", updateMetaData);
router.delete("/:id", deleteMetaData);

export default router;
