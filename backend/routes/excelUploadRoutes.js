import express from 'express';
import {
  analyzeExcelFile,
  analyzeUploadedFile,
  uploadProvinces,
  uploadDepartements,
  uploadSousPrefectures,
  uploadCantons,
  uploadVillages,
  uploadCommunes,
  uploadAllDecoupageData,
  upload
} from '../controllers/excelUploadController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Analyze Excel file structure
router.get('/analyze/:fileName', auth, analyzeExcelFile);
router.post('/analyze', auth, upload.single('file'), analyzeUploadedFile);

// Individual uploads with file upload support
router.post('/provinces', auth, upload.single('file'), uploadProvinces);
router.post('/departements', auth, upload.single('file'), uploadDepartements);
router.post('/sous-prefectures', auth, upload.single('file'), uploadSousPrefectures);
router.post('/cantons', auth, upload.single('file'), uploadCantons);
router.post('/villages', auth, upload.single('file'), uploadVillages);
router.post('/communes', auth, upload.single('file'), uploadCommunes);

// Complete upload (all files in correct order)
router.post('/all', auth, uploadAllDecoupageData);

export default router;
