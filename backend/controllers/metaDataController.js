import MetaData from "../models/MetaData.js";
import excelProcessor from "../utils/excelProcessor.js";
import fs from "fs";
import Source from "../models/Source.js";
import UniteDeMesure from "../models/UniteDeMesure.js";

// Create MetaData
export const createMetaData = async (req, res) => {
  try {
    const metaData = new MetaData(req.body);
    await metaData.save();
    const populated = await MetaData.findById(metaData._id).populate('thematicArea');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all MetaData
export const getMetaDataList = async (req, res) => {
  try {
    const metaDataList = await MetaData.find().populate('thematicArea').sort({ createdAt: -1 });
    res.json(metaDataList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get MetaData by ID
export const getMetaDataById = async (req, res) => {
  try {
    const metaData = await MetaData.findById(req.params.id).populate('thematicArea');
    if (!metaData) return res.status(404).json({ error: "Not found" });
    res.json(metaData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update MetaData
export const updateMetaData = async (req, res) => {
  try {
    const metaData = await MetaData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!metaData) return res.status(404).json({ error: "Not found" });
    const populated = await MetaData.findById(metaData._id).populate('thematicArea');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete MetaData
export const deleteMetaData = async (req, res) => {
  try {
    const metaData = await MetaData.findByIdAndDelete(req.params.id);
    if (!metaData) return res.status(404).json({ error: "Not found" });
    res.json({ message: "MetaData deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all MetaData for dropdown/select
export const getMetaDataOptions = async (req, res) => {
  try {
    const metaDataList = await MetaData.find().select('_id code name');
    res.json(metaDataList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Import MetaData from Excel
export const importMetaDataFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }

    const filePath = req.file.path;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Excel file not found' });
    }

    // Read Excel file
    const rawData = excelProcessor.readExcelFile(filePath);
    console.log(`Read ${rawData.length} rows from Excel file`);

    // Get sources and units for reference mapping
    const sources = await Source.find();
    const unitesDeMesure = await UniteDeMesure.find();
    
    const sourceMap = {};
    const unitMap = {};
    
    sources.forEach(source => {
      sourceMap[source.name.toLowerCase()] = source._id;
    });
    
    unitesDeMesure.forEach(unit => {
      unitMap[unit.name.toLowerCase()] = unit._id;
    });

    const processedData = [];
    const errors = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        // Map Excel columns to MetaData fields
        const metaDataObj = {
          code: row['Code'] || row['code'] || `META_${Date.now()}_${i}`,
          name: row['Nom'] || row['Name'] || row['nom'] || row['name'],
          internationalDefinition: row['Définition Internationale'] || row['International Definition'] || row['definition_internationale'] || row['international_definition'] || '',
          nationalDefinition: row['Définition Nationale'] || row['National Definition'] || row['definition_nationale'] || row['national_definition'] || '',
          thematicArea: row['Domaine Thématique'] || row['Thematic Area'] || row['domaine_thematique'] || row['thematic_area'] || '',
          goal: row['Objectif'] || row['Goal'] || row['objectif'] || row['goal'] || '',
          dataCollectionMethod: row['Méthode de Collecte'] || row['Collection Method'] || row['methode_collecte'] || row['collection_method'] || '',
          calculationMethod: row['Méthode de Calcul'] || row['Calculation Method'] || row['methode_calcul'] || row['calculation_method'] || '',
          coveredPopulation: row['Population Couverte'] || row['Covered Population'] || row['population_couverte'] || row['covered_population'] || '',
          geographicCoverage: row['Couverture Géographique'] || row['Geographic Coverage'] || row['couverture_geographique'] || row['geographic_coverage'] || '',
          publicationPeriodicity: row['Périodicité'] || row['Periodicity'] || row['periodicite'] || row['periodicity'] || '',
          responsibleProductionStructure: row['Structure Responsable'] || row['Responsible Structure'] || row['structure_responsable'] || row['responsible_structure'] || '',
          implementationStructure: row['Structure de Mise en Œuvre'] || row['Implementation Structure'] || row['structure_implementation'] || row['implementation_structure'] || ''
        };

        // Handle main data source
        const mainSourceName = row['Source Principale'] || row['Main Source'] || row['source_principale'] || row['main_source'];
        if (mainSourceName) {
          metaDataObj.mainDataSource = sourceMap[mainSourceName.toLowerCase()] || mainSourceName;
        }

        // Handle primary data source
        const primarySourceName = row['Source Primaire'] || row['Primary Source'] || row['source_primaire'] || row['primary_source'];
        if (primarySourceName) {
          metaDataObj.primaryDataSource = sourceMap[primarySourceName.toLowerCase()] || primarySourceName;
        }

        // Handle measurement unit
        const unitName = row['Unité de Mesure'] || row['Measurement Unit'] || row['unite_mesure'] || row['measurement_unit'];
        if (unitName) {
          metaDataObj.measurementUnit = unitMap[unitName.toLowerCase()] || unitName;
        }

        // Handle disaggregation level (can be comma-separated)
        const disaggregationStr = row['Niveau de Désagrégation'] || row['Disaggregation Level'] || row['niveau_desagregation'] || row['disaggregation_level'];
        if (disaggregationStr) {
          metaDataObj.disaggregationLevel = disaggregationStr.split(',').map(level => level.trim()).filter(level => level);
        } else {
          metaDataObj.disaggregationLevel = [];
        }

        processedData.push(metaDataObj);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message,
          data: row
        });
      }
    }

    // Save processed data to database
    const savedMetaData = [];
    for (const metaData of processedData) {
      try {
        const newMetaData = new MetaData(metaData);
        await newMetaData.save();
        savedMetaData.push(newMetaData);
      } catch (error) {
        errors.push({
          error: `Failed to save MetaData with code ${metaData.code}: ${error.message}`,
          data: metaData
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: `Successfully imported ${savedMetaData.length} MetaData entries`,
      imported: savedMetaData.length,
      errors: errors,
      data: savedMetaData
    });

  } catch (err) {
    console.error('Excel import error:', err);
    res.status(500).json({ error: err.message });
  }
};
