import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

/**
 * Utility functions for reading and processing Excel files for decoupage data
 */

export const readExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

export const processProvinceData = (data) => {
  return data.map((row, index) => {
    // Debug: Log the first row to see available columns
    if (index === 0) {
      console.log('Province Excel columns:', Object.keys(row));
    }
    
    // Map Excel columns to database fields - use actual data from Excel
    // Try different common column names for provinces
    const code = row.code || row.Code || row.CODE || row.ID || row.id || row.IDProvince || 
                 row.Id_Province || row.ProvCode || row.PROV_CODE || row.prov_code || 
                 row.PROVINCE_CODE || row.ProvinceCode || row.CodeProvince || row.CODE_PROVINCE ||
                 row.NumProvince || row.NUM_PROVINCE || row.NoProvince || row.NO_PROVINCE;
    
    const name = row.name || row.Name || row.NAME || row.Nom || row.nom || row.NOM || 
                 row.Designation || row.DESIGNATION || row.designation || row.PROVINCE_NAME || 
                 row.ProvinceName || row.province_name || row.NomProvince || row.NOM_PROVINCE || 
                 row.LibelleProvince || row.LIBELLE_PROVINCE;
    
    const description = row.description || row.Description || row.DESCRIPTION || row.DESC || 
                       row.desc || row.Descriptif || row.DESCRIPTIF;
    
    const chefLieu = row.chefLieu || row.ChefLieu || row.CHEF_LIEU || row.chef_lieu || 
                     row['Chef lieu'] || row['CHEF LIEU'] || row.CapitalCity || row.Capital || 
                     row.CAPITAL || row.capitale || row.Capitale || row.CAPITALE;
    
    // Debug: Log when falling back to generated code
    if (!code) {
      console.warn(`No code found for province at row ${index + 1}, using fallback. Available keys:`, Object.keys(row));
    }
    
    return {
      code: code || `PROV-${String(index + 1).padStart(2, '0')}`,
      name: name || `Province ${index + 1}`,
      description: description || '',
      chefLieu: chefLieu || ''
    };
  });
};

export const processDepartementData = (data, provinceMap) => {
  return data.map((row, index) => {
    // Extract departement data from Excel
    const code = row.code || row.Code || row.ID || row.id || row.IDDepartement || row.DeptCode || row.DEPT_CODE;
    const name = row.name || row.Name || row.Nom || row.nom || row.Designation || row.DESIGNATION || row.DEPT_NAME;
    const chefLieu = row.chefLieu || row.ChefLieu || row.Chef_Lieu || row.chef_lieu || row['Chef lieu'] || 
                     row.CapitalCity || row.Capital || row.capitale || row.Capitale || '';
    
    // Find province by code - try different possible column names for province reference
    const provinceCode = row.Province || row.province || row.PROVINCE || row.ProvCode || row.prov_code || 
                        row.ProvinceCode || row.Region || row.region || row.REGION;
    const provinceId = provinceMap[provinceCode];
    
    if (!provinceId && provinceCode) {
      console.warn(`Province not found for code: ${provinceCode} in departement: ${name || `Département ${index + 1}`}`);
    }
    
    return {
      code: code || `DEPT-${String(index + 1).padStart(2, '0')}`,
      name: name || `Département ${index + 1}`,
      province: provinceId,
      chefLieu: chefLieu
    };
  });
};

export const processSousPrefectureData = (data, departementMap) => {
  return data.map((row, index) => {
    // Extract sous-prefecture data from Excel
    const code = row.code || row.Code || row.ID || row.id || row.IDSousprefecture || row.SPCode || row.SP_CODE;
    const name = row.name || row.Name || row.Nom || row.nom || row.Designation || row.DESIGNATION || row.SP_NAME;
    const description = row.description || row.Description || row.DESC || row.desc || '';
    
    // Find departement by code - try different possible column names
    const departementCode = row.Departement || row.departement || row.DEPARTEMENT || row.DeptCode || 
                           row.dept_code || row.DepartementCode || row.Department;
    const departementId = departementMap[departementCode];
    
    if (!departementId && departementCode) {
      console.warn(`Departement not found for code: ${departementCode} in sous-prefecture: ${name || `Sous-préfecture ${index + 1}`}`);
    }
    
    return {
      code: code || `SP-${String(index + 1).padStart(3, '0')}`,
      name: name || `Sous-préfecture ${index + 1}`,
      description: description,
      departement: departementId
    };
  });
};

export const processCantonData = (data, sousPrefectureMap) => {
  return data.map((row, index) => {
    // Extract canton data from Excel
    const code = row.code || row.Code || row.ID || row.id || row.IDCanton || row.CantonCode || row.CANTON_CODE;
    const name = row.name || row.Name || row.Nom || row.nom || row.Designation || row.DESIGNATION || row.CANTON_NAME;
    const description = row.description || row.Description || row.DESC || row.desc || '';
    
    // Find sous-prefecture by code - try different possible column names
    const sousPrefectureCode = row.Sousprefecture || row.sousPrefecture || row.SOUSPREFECTURE || 
                              row.SousPrefectureCode || row.sous_prefecture || row.SubPrefecture || row.sp_code;
    const sousPrefectureId = sousPrefectureMap[sousPrefectureCode];
    
    if (!sousPrefectureId && sousPrefectureCode) {
      console.warn(`Sous-prefecture not found for code: ${sousPrefectureCode} in canton: ${name || `Canton ${index + 1}`}`);
    }
    
    return {
      code: code || `CAN-${String(index + 1).padStart(3, '0')}`,
      name: name || `Canton ${index + 1}`,
      description: description,
      sousPrefecture: sousPrefectureId
    };
  });
};

export const processVillageData = (data, cantonMap) => {
  console.log(`\n=== Processing ${data.length} village rows ===`);
  
  return data.map((row, index) => {
    // Debug: Log the first few rows to see available columns
    if (index < 3) {
      console.log(`\nRow ${index + 1} data:`, JSON.stringify(row, null, 2));
      console.log(`Available keys: [${Object.keys(row).join(', ')}]`);
    }
    
    // Extract village data from Excel - try comprehensive column name variations
    const codeAttempts = [
      // Your specific Excel column names
      row['Code '], row['code '], row['CODE '], // Exact match with trailing space
      // Standard patterns
      row.code, row.Code, row.CODE, row.ID, row.id, row.IDVillage, row.Id_Village, 
      row.VillageCode, row.VILLAGE_CODE, row.village_code, row.CodeVillage, 
      row.Code_Village, row.CODEVILLAGE, row.VillageId, row.VILLAGE_ID, 
      row.NumVillage, row.NUM_VILLAGE, row.NoVillage, row.NO_VILLAGE,
      row.IdentifiantVillage, row.IDENTIFIANT_VILLAGE, row.Identifiant,
      // French administrative patterns
      row.CodeCommune, row.CODE_COMMUNE, row.code_commune, row.IdCommune,
      row.ID_COMMUNE, row.NumeroVillage, row.NUMERO_VILLAGE, row.numero_village,
      row.RefVillage, row.REF_VILLAGE, row.ref_village, row.ReferenceVillage,
      row.REFERENCE_VILLAGE, row.reference_village,
      // Numeric ID patterns (for your 11-digit codes like 01020301001)
      row.CodeNumerique, row.CODE_NUMERIQUE, row.code_numerique,
      row.IdentifiantNumerique, row.IDENTIFIANT_NUMERIQUE, row.identifiant_numerique,
      // Common database field names
      row._id, row.Id, row.ID_Field, row.id_field,
      // African administrative patterns
      row.CodeLocal, row.CODE_LOCAL, row.code_local, row.IdLocal, row.ID_LOCAL,
      // Additional patterns from administrative systems
      row.CodeOfficial, row.CODE_OFFICIAL, row.code_official,
      row.NumeroOfficial, row.NUMERO_OFFICIAL, row.numero_official
    ].filter(val => val !== undefined && val !== null && val !== ''); // Remove empty values
    
    const code = codeAttempts[0];
    
    const nameAttempts = [
      // Your specific Excel column names
      row['Name'], row['name'], row['NAME'], // Exact match from Excel
      row.name, row.Name, row.NAME, row.Nom, row.nom, row.NOM, 
      row.Designation, row.DESIGNATION, row.designation, row.VILLAGE_NAME, 
      row.VillageName, row.village_name, row.NomVillage, row.NOM_VILLAGE, 
      row.LibelleVillage, row.LIBELLE_VILLAGE
    ].filter(Boolean);
    
    const name = nameAttempts[0];
    
    const description = row.description || row.Description || row.DESCRIPTION || row.DESC || 
                       row.desc || row.Descriptif || row.DESCRIPTIF || '';
    
    // Find canton by code - try different possible column names
    const cantonCodeAttempts = [
      // Your specific Excel column names
      row['CantonCode'], row['cantoncode'], row['CANTONCODE'], // Exact match from Excel
      row.Canton, row.canton, row.CANTON, row.CantonCode, 
      row.canton_code, row.cnt_code, row.CodeCanton, row.CODE_CANTON,
      row.IdCanton, row.ID_CANTON, row.CantId, row.CANT_ID
    ].filter(Boolean);
    
    const cantonCode = cantonCodeAttempts[0];
    const cantonId = cantonMap[cantonCode];
    
    if (!cantonId && cantonCode) {
      console.warn(`Canton not found for code: ${cantonCode} in village: ${name || `Village ${index + 1}`}`);
    }
    
    // Debug logging for first few rows
    if (index < 3) {
      console.log(`\nProcessing row ${index + 1}:`);
      console.log(`  - Code attempts: [${codeAttempts.join(', ')}]`);
      console.log(`  - Selected code: "${code}"`);
      console.log(`  - Name attempts: [${nameAttempts.join(', ')}]`);
      console.log(`  - Selected name: "${name}"`);
      console.log(`  - Canton code attempts: [${cantonCodeAttempts.join(', ')}]`);
      console.log(`  - Selected canton code: "${cantonCode}"`);
      console.log(`  - Will use fallback code: ${!code ? 'YES' : 'NO'}`);
    }
    
    return {
      code: code || `VILL-${String(index + 1).padStart(4, '0')}`,
      name: name || `Village ${index + 1}`,
      description: description,
      canton: cantonId,
      geolocation: {
        latitude: row.Latitude || row.latitude || row.LAT || row.lat || row.LATITUDE ? parseFloat(row.Latitude || row.latitude || row.LAT || row.lat || row.LATITUDE) : null,
        longitude: row.Longitude || row.longitude || row.LON || row.lon || row.LNG || row.lng || row.LONGITUDE ? parseFloat(row.Longitude || row.longitude || row.LON || row.lon || row.LNG || row.lng || row.LONGITUDE) : null
      }
    };
  });
};

export const analyzeExcelStructure = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Get headers (first row)
    const headers = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = worksheet[cellAddress];
      headers.push(cell ? cell.v : `Column${col}`);
    }
    
    // Get first few rows as sample data
    const sampleData = XLSX.utils.sheet_to_json(worksheet, { range: 5 }); // First 5 rows
    
    // Log analysis for debugging
    console.log(`\n=== Excel Analysis for ${path.basename(filePath)} ===`);
    console.log('Headers:', headers);
    console.log('Sample data (first 2 rows):');
    console.log(JSON.stringify(sampleData.slice(0, 2), null, 2));
    console.log('=== End Analysis ===\n');
    
    return {
      fileName: path.basename(filePath),
      sheetName,
      headers,
      rowCount: range.e.r + 1,
      columnCount: range.e.c + 1,
      sampleData
    };
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    throw error;
  }
};

export const processCommuneData = (data, departementMap) => {
  console.log('Processing commune data...');
  console.log('Available departement codes for mapping:', Object.keys(departementMap));
  
  return data.map((row, index) => {
    // Extract commune data from Excel
    const code = row.code || row.Code || row.ID || row.id || row.IDCommune || row.CommuneCode || row.COMMUNE_CODE;
    const name = row.name || row.Name || row.Nom || row.nom || row.Designation || row.DESIGNATION || row.COMMUNE_NAME;
    const description = row.description || row.Description || row.DESC || row.desc || row.Descriptif || row.DESCRIPTIF || '';

    // Find departement by code - try different possible column names
    const departementCode = row.Departement || row.departement || row.DEPARTEMENT || row.DeptCode || row.dept_code || row.DepartementCode || row.departementCode || row.Department;
    const departementId = departementMap[departementCode];

    if (!departementId && departementCode) {
      console.warn(`Departement not found for code: ${departementCode} in commune: ${name || `Commune ${index + 1}`}`);
      console.warn('Row data:', JSON.stringify(row, null, 2));
    }
    
    // Log first few items for debugging
    if (index < 3) {
      console.log(`Processing commune ${index + 1}:`, {
        code,
        name,
        departementCode,
        departementFound: !!departementId
      });
    }

    return {
      code: code || `COMM-${String(index + 1).padStart(3, '0')}`,
      name: name || `Commune ${index + 1}`,
      departement: departementId,
      description: description
    };
  });
};

export default {
  readExcelFile,
  processProvinceData,
  processDepartementData,
  processSousPrefectureData,
  processCantonData,
  processVillageData,
  processCommuneData,
  analyzeExcelStructure
};
