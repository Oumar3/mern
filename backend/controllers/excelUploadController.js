import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import excelProcessor from '../utils/excelProcessor.js';
import Province from '../models/Decoupage/Province.js';
import Departement from '../models/Decoupage/Departement.js';
import Commune from '../models/Decoupage/Commune.js';
import SousPrefecture from '../models/Decoupage/Sous-prefecture.js';
import Canton from '../models/Decoupage/Canton.js';
import Village from '../models/Decoupage/Village.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload and process Communes
export const uploadCommunes = async (req, res) => {
  try {
    let filePath;
    
    if (req.file) {
      // File was uploaded via form data
      filePath = req.file.path;
      console.log('Processing uploaded file:', req.file.originalname);
    } else {
      // Fallback to predefined file (for backward compatibility)
      filePath = path.join(__dirname, '../uploads/Communes.xlsx');
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Excel file not found' });
    }
    
    // Analyze the file structure first for debugging
    const analysis = excelProcessor.analyzeExcelStructure(filePath);
    console.log('File analysis completed for communes');
    
    const rawData = excelProcessor.readExcelFile(filePath);
    console.log(`Read ${rawData.length} rows from Excel file`);

    // Create departement mapping (code -> _id)
    const departements = await Departement.find();
    const departementMap = {};
    departements.forEach(dept => {
      departementMap[dept.code] = dept._id;
    });
    
    console.log('Available departement codes:', Object.keys(departementMap));
    console.log('Total departements in database:', departements.length);

    const processedData = excelProcessor.processCommuneData(rawData, departementMap);
    console.log(`Processed ${processedData.length} communes`);
    
    // Log first few processed items to see the structure
    if (processedData.length > 0) {
      console.log('Sample processed commune data:', JSON.stringify(processedData.slice(0, 3), null, 2));
    }
    
    // Count how many communes have valid departement references
    const communesWithValidDept = processedData.filter(c => c.departement).length;
    console.log(`Communes with valid departement references: ${communesWithValidDept}/${processedData.length}`);

    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const communeData of processedData) {
      try {
        if (!communeData.departement) {
          throw new Error(`Departement not found for commune: ${communeData.name} (code: ${communeData.code})`);
        }

        const existingCommune = await Commune.findOne({ code: communeData.code });

        if (existingCommune) {
          await Commune.findByIdAndUpdate(existingCommune._id, communeData);
          console.log(`Updated commune: ${communeData.name} (${communeData.code})`);
        } else {
          const commune = new Commune(communeData);
          await commune.save();
          console.log(`Created commune: ${communeData.name} (${communeData.code})`);
        }

        results.successful++;
      } catch (error) {
        console.error(`Error processing commune ${communeData.name}:`, error.message);
        results.failed++;
        results.errors.push({
          row: communeData,
          error: error.message
        });
      }
    }

    // Clean up uploaded file if it was a temporary file
    if (req.file) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: `Upload completed: ${results.successful}/${results.total} communes processed successfully`,
      results,
      analysis: {
        headers: analysis.headers,
        rowCount: analysis.rowCount
      }
    });
  } catch (error) {
    console.error('Error uploading communes:', error);
    res.status(500).json({ error: 'Failed to upload communes', message: error.message });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Analyze Excel file structure
export const analyzeExcelFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    const analysis = excelProcessor.analyzeExcelStructure(filePath);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    res.status(500).json({ error: 'Failed to analyze Excel file', message: error.message });
  }
};

// Analyze uploaded Excel file structure
export const analyzeUploadedFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const analysis = excelProcessor.analyzeExcelStructure(filePath);
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing uploaded Excel file:', error);
    res.status(500).json({ error: 'Failed to analyze Excel file', message: error.message });
  }
};

// Upload and process Provinces
export const uploadProvinces = async (req, res) => {
  try {
    let filePath;
    
    if (req.file) {
      // File was uploaded via form data
      filePath = req.file.path;
      console.log('Processing uploaded file:', req.file.originalname);
    } else {
      // Fallback to predefined file (for backward compatibility)
      filePath = path.join(__dirname, '../uploads/Provinces.xlsx');
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Excel file not found' });
    }
    
    // Analyze the file structure first for debugging
    const analysis = excelProcessor.analyzeExcelStructure(filePath);
    console.log('File analysis completed for provinces');
    
    const rawData = excelProcessor.readExcelFile(filePath);
    console.log(`Read ${rawData.length} rows from Excel file`);
    
    const processedData = excelProcessor.processProvinceData(rawData);
    console.log(`Processed ${processedData.length} provinces`);
    
    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const provinceData of processedData) {
      try {
        // Check if province already exists by code
        const existingProvince = await Province.findOne({ code: provinceData.code });
        
        if (existingProvince) {
          // Update existing province
          await Province.findByIdAndUpdate(existingProvince._id, provinceData);
          console.log(`Updated province: ${provinceData.name} (${provinceData.code})`);
        } else {
          // Create new province
          const province = new Province(provinceData);
          await province.save();
          console.log(`Created province: ${provinceData.name} (${provinceData.code})`);
        }
        results.successful++;
      } catch (error) {
        console.error(`Error processing province ${provinceData.name}:`, error);
        results.failed++;
        results.errors.push({
          row: provinceData,
          error: error.message
        });
      }
    }
    
    // Clean up uploaded file if it was a temporary file
    if (req.file) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      message: `Upload completed: ${results.successful}/${results.total} provinces processed successfully`,
      results,
      analysis: {
        headers: analysis.headers,
        rowCount: analysis.rowCount
      }
    });
  } catch (error) {
    console.error('Error uploading provinces:', error);
    res.status(500).json({ error: 'Failed to upload provinces', message: error.message });
  }
};

// Upload and process Departements
export const uploadDepartements = async (req, res) => {
  try {
    let filePath;
    
    if (req.file) {
      // File was uploaded via form data
      filePath = req.file.path;
      console.log('Processing uploaded file:', req.file.originalname);
    } else {
      // Fallback to predefined file (for backward compatibility)
      filePath = path.join(__dirname, '../uploads/Departements.xlsx');
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Excel file not found' });
    }
    
    // Analyze the file structure first for debugging
    const analysis = excelProcessor.analyzeExcelStructure(filePath);
    console.log('File analysis completed for departements');
    
    const rawData = excelProcessor.readExcelFile(filePath);
    console.log(`Read ${rawData.length} rows from Excel file`);
    
    // Create province mapping (code -> _id)
    const provinces = await Province.find();
    const provinceMap = {};
    provinces.forEach(province => {
      provinceMap[province.code] = province._id;
    });
    
    const processedData = excelProcessor.processDepartementData(rawData, provinceMap);
    console.log(`Processed ${processedData.length} departements`);
    
    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const departementData of processedData) {
      try {
        if (!departementData.province) {
          throw new Error('Province not found');
        }
        
        const existingDepartement = await Departement.findOne({ code: departementData.code });
        
        if (existingDepartement) {
          await Departement.findByIdAndUpdate(existingDepartement._id, departementData);
          console.log(`Updated departement: ${departementData.name} (${departementData.code})`);
        } else {
          const departement = new Departement(departementData);
          await departement.save();
          console.log(`Created departement: ${departementData.name} (${departementData.code})`);
        }
        
        results.successful++;
      } catch (error) {
        console.error(`Error processing departement ${departementData.name}:`, error);
        results.failed++;
        results.errors.push({
          row: departementData,
          error: error.message
        });
      }
    }

    // Clean up uploaded file if it was a temporary file
    if (req.file) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: `Upload completed: ${results.successful}/${results.total} departements processed successfully`,
      results,
      analysis: {
        headers: analysis.headers,
        rowCount: analysis.rowCount
      }
    });
  } catch (error) {
    console.error('Error uploading departements:', error);
    res.status(500).json({ error: 'Failed to upload departements', message: error.message });
  }
};

// Upload and process Sous-prefectures
export const uploadSousPrefectures = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/Sous-prefectures.xlsx');
    const rawData = excelProcessor.readExcelFile(filePath);
    
    // Create departement mapping
    const departements = await Departement.find();
    const departementMap = {};
    departements.forEach(dept => {
      departementMap[dept.code] = dept._id;
    });
    
    const processedData = excelProcessor.processSousPrefectureData(rawData, departementMap);
    
    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const spData of processedData) {
      try {
        if (!spData.departement) {
          throw new Error('Departement not found');
        }
        
        const existingSP = await SousPrefecture.findOne({ code: spData.code });
        
        if (existingSP) {
          await SousPrefecture.findByIdAndUpdate(existingSP._id, spData);
        } else {
          const sousPrefecture = new SousPrefecture(spData);
          await sousPrefecture.save();
        }
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: spData,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Sous-prefectures upload completed',
      results,
      processedData
    });
  } catch (error) {
    console.error('Error uploading sous-prefectures:', error);
    res.status(500).json({ error: 'Failed to upload sous-prefectures', message: error.message });
  }
};

// Upload and process Cantons
export const uploadCantons = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/Cantons.xlsx');
    const rawData = excelProcessor.readExcelFile(filePath);
    
    // Create sous-prefecture mapping
    const sousPrefectures = await SousPrefecture.find();
    const spMap = {};
    sousPrefectures.forEach(sp => {
      spMap[sp.code] = sp._id;
    });
    
    const processedData = excelProcessor.processCantonData(rawData, spMap);
    
    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const cantonData of processedData) {
      try {
        if (!cantonData.sousPrefecture) {
          throw new Error('Sous-prefecture not found');
        }
        
        const existingCanton = await Canton.findOne({ code: cantonData.code });
        
        if (existingCanton) {
          await Canton.findByIdAndUpdate(existingCanton._id, cantonData);
        } else {
          const canton = new Canton(cantonData);
          await canton.save();
        }
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: cantonData,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Cantons upload completed',
      results,
      processedData
    });
  } catch (error) {
    console.error('Error uploading cantons:', error);
    res.status(500).json({ error: 'Failed to upload cantons', message: error.message });
  }
};

// Upload and process Villages
export const uploadVillages = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/Villages.xlsx');
    const rawData = excelProcessor.readExcelFile(filePath);
    
    // Create canton mapping
    const cantons = await Canton.find();
    const cantonMap = {};
    cantons.forEach(canton => {
      cantonMap[canton.code] = canton._id;
    });
    
    const processedData = excelProcessor.processVillageData(rawData, cantonMap);
    
    const results = {
      total: processedData.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const villageData of processedData) {
      try {
        if (!villageData.canton) {
          throw new Error('Canton not found');
        }
        
        const existingVillage = await Village.findOne({ code: villageData.code });
        
        if (existingVillage) {
          await Village.findByIdAndUpdate(existingVillage._id, villageData);
        } else {
          const village = new Village(villageData);
          await village.save();
        }
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: villageData,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Villages upload completed',
      results,
      processedData
    });
  } catch (error) {
    console.error('Error uploading villages:', error);
    res.status(500).json({ error: 'Failed to upload villages', message: error.message });
  }
};

// Upload all data in correct order
export const uploadAllDecoupageData = async (req, res) => {
  try {
    const results = {};
    
    console.log('Starting full decoupage data upload...');
    
    // 1. Upload Provinces first
    console.log('1. Uploading Provinces...');
    const provinceResult = await uploadProvincesHelper();
    results.provinces = provinceResult;
    
    // 2. Upload Departements
    console.log('2. Uploading Departements...');
    const departementResult = await uploadDepartementsHelper();
    results.departements = departementResult;
    
    // 3. Upload Sous-prefectures
    console.log('3. Uploading Sous-prefectures...');
    const spResult = await uploadSousPrefecturesHelper();
    results.sousPrefectures = spResult;
    
    // 4. Upload Cantons
    console.log('4. Uploading Cantons...');
    const cantonResult = await uploadCantonsHelper();
    results.cantons = cantonResult;
    
    // 5. Upload Villages
    console.log('5. Uploading Villages...');
    const villageResult = await uploadVillagesHelper();
    results.villages = villageResult;
    
    res.json({
      message: 'Complete decoupage data upload completed',
      results
    });
    
  } catch (error) {
    console.error('Error in full upload:', error);
    res.status(500).json({ error: 'Failed to complete full upload', message: error.message });
  }
};

// Helper functions for internal use
const uploadProvincesHelper = async () => {
  const filePath = path.join(__dirname, '../uploads/Provinces.xlsx');
  const rawData = excelProcessor.readExcelFile(filePath);
  const processedData = excelProcessor.processProvinceData(rawData);
  
  const results = { total: processedData.length, successful: 0, failed: 0, errors: [] };
  
  for (const provinceData of processedData) {
    try {
      const existingProvince = await Province.findOne({ code: provinceData.code });
      if (existingProvince) {
        await Province.findByIdAndUpdate(existingProvince._id, provinceData);
      } else {
        const province = new Province(provinceData);
        await province.save();
      }
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ row: provinceData, error: error.message });
    }
  }
  
  return results;
};

const uploadDepartementsHelper = async () => {
  const filePath = path.join(__dirname, '../uploads/Departements.xlsx');
  const rawData = excelProcessor.readExcelFile(filePath);
  
  const provinces = await Province.find();
  const provinceMap = {};
  provinces.forEach(province => { provinceMap[province.code] = province._id; });
  
  const processedData = excelProcessor.processDepartementData(rawData, provinceMap);
  const results = { total: processedData.length, successful: 0, failed: 0, errors: [] };
  
  for (const departementData of processedData) {
    try {
      if (!departementData.province) throw new Error('Province not found');
      const existingDepartement = await Departement.findOne({ code: departementData.code });
      if (existingDepartement) {
        await Departement.findByIdAndUpdate(existingDepartement._id, departementData);
      } else {
        const departement = new Departement(departementData);
        await departement.save();
      }
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ row: departementData, error: error.message });
    }
  }
  
  return results;
};

const uploadSousPrefecturesHelper = async () => {
  const filePath = path.join(__dirname, '../uploads/Sous-prefectures.xlsx');
  const rawData = excelProcessor.readExcelFile(filePath);
  
  const departements = await Departement.find();
  const departementMap = {};
  departements.forEach(dept => { departementMap[dept.code] = dept._id; });
  
  const processedData = excelProcessor.processSousPrefectureData(rawData, departementMap);
  const results = { total: processedData.length, successful: 0, failed: 0, errors: [] };
  
  for (const spData of processedData) {
    try {
      if (!spData.departement) throw new Error('Departement not found');
      const existingSP = await SousPrefecture.findOne({ code: spData.code });
      if (existingSP) {
        await SousPrefecture.findByIdAndUpdate(existingSP._id, spData);
      } else {
        const sousPrefecture = new SousPrefecture(spData);
        await sousPrefecture.save();
      }
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ row: spData, error: error.message });
    }
  }
  
  return results;
};

const uploadCantonsHelper = async () => {
  const filePath = path.join(__dirname, '../uploads/Cantons.xlsx');
  const rawData = excelProcessor.readExcelFile(filePath);
  
  const sousPrefectures = await SousPrefecture.find();
  const spMap = {};
  sousPrefectures.forEach(sp => { spMap[sp.code] = sp._id; });
  
  const processedData = excelProcessor.processCantonData(rawData, spMap);
  const results = { total: processedData.length, successful: 0, failed: 0, errors: [] };
  
  for (const cantonData of processedData) {
    try {
      if (!cantonData.sousPrefecture) throw new Error('Sous-prefecture not found');
      const existingCanton = await Canton.findOne({ code: cantonData.code });
      if (existingCanton) {
        await Canton.findByIdAndUpdate(existingCanton._id, cantonData);
      } else {
        const canton = new Canton(cantonData);
        await canton.save();
      }
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ row: cantonData, error: error.message });
    }
  }
  
  return results;
};

const uploadVillagesHelper = async () => {
  const filePath = path.join(__dirname, '../uploads/Villages.xlsx');
  const rawData = excelProcessor.readExcelFile(filePath);
  
  const cantons = await Canton.find();
  const cantonMap = {};
  cantons.forEach(canton => { cantonMap[canton.code] = canton._id; });
  
  const processedData = excelProcessor.processVillageData(rawData, cantonMap);
  const results = { total: processedData.length, successful: 0, failed: 0, errors: [] };
  
  for (const villageData of processedData) {
    try {
      if (!villageData.canton) throw new Error('Canton not found');
      const existingVillage = await Village.findOne({ code: villageData.code });
      if (existingVillage) {
        await Village.findByIdAndUpdate(existingVillage._id, villageData);
      } else {
        const village = new Village(villageData);
        await village.save();
      }
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({ row: villageData, error: error.message });
    }
  }
  
  return results;
};
