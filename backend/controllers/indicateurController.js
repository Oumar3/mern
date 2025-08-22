import Indicateur from "../models/Indicateur.js";

// @desc    Create a new indicateur
// @route   POST /api/indicateurs
// @access  Private/Admin
const createIndicateur = async (req, res) => {
  try {
    const { 
      code, 
      name, 
      description, 
      programme, 
      anne_deReference, 
      valeur_deReference, 
      anne_cible, 
      valeur_cible, 
      impact, 
      uniteDeMesure, 
      source, 
      sourceDescription
    } = req.body;

    const indicateurExists = await Indicateur.findOne({ code });

    if (indicateurExists) {
      return res.status(400).json({ message: 'Indicateur already exists' });
    }

    const newIndicateur = new Indicateur({
      code,
      name,
      description,
      programme,
      anne_deReference,
      valeur_deReference,
      anne_cible,
      valeur_cible,
      impact,
      uniteDeMesure,
      source,
      sourceDescription
    });

    await newIndicateur.save();
    res.status(201).json(newIndicateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all indicateurs
// @route   GET /api/indicateurs
// @access  Public
const getAllIndicateurs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.programme) {
      filter.programme = req.query.programme;
    }
    const indicateurs = await Indicateur.find(filter).populate('programme', 'name code').populate('source', 'name');
    res.status(200).json(indicateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get indicateur by ID
// @route   GET /api/indicateurs/:id
// @access  Public
const getIndicateurById = async (req, res) => {
  try {
    const indicateur = await Indicateur.findById(req.params.id).populate('programme', 'name code').populate('source', 'name');

    if (indicateur) {
      res.status(200).json(indicateur);
    } else {
      res.status(404).json({ message: 'Indicateur not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an indicateur
// @route   PUT /api/indicateurs/:id
// @access  Private/Admin
const updateIndicateur = async (req, res) => {
  try {
    const { 
      code, 
      name, 
      description, 
      programme, 
      anne_deReference, 
      valeur_deReference, 
      anne_cible, 
      valeur_cible, 
      impact, 
      uniteDeMesure, 
      source, 
      sourceDescription
    } = req.body;

    const indicateur = await Indicateur.findById(req.params.id);

    if (!indicateur) {
      return res.status(404).json({ message: 'Indicateur not found' });
    }

    indicateur.code = code || indicateur.code;
    indicateur.name = name || indicateur.name;
    indicateur.description = description || indicateur.description;
    indicateur.programme = programme || indicateur.programme;
    indicateur.anne_deReference = anne_deReference !== undefined ? anne_deReference : indicateur.anne_deReference;
    indicateur.valeur_deReference = valeur_deReference !== undefined ? valeur_deReference : indicateur.valeur_deReference;
    indicateur.anne_cible = anne_cible !== undefined ? anne_cible : indicateur.anne_cible;
    indicateur.valeur_cible = valeur_cible !== undefined ? valeur_cible : indicateur.valeur_cible;
    indicateur.impact = impact || indicateur.impact;
    indicateur.uniteDeMesure = uniteDeMesure || indicateur.uniteDeMesure;
    indicateur.source = source !== undefined ? source : indicateur.source;
    indicateur.sourceDescription = sourceDescription !== undefined ? sourceDescription : indicateur.sourceDescription;

    await indicateur.save();
    res.status(200).json(indicateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an indicateur
// @route   DELETE /api/indicateurs/:id
// @access  Private/Admin
const deleteIndicateur = async (req, res) => {
  try {
    const indicateur = await Indicateur.findById(req.params.id);

    if (!indicateur) {
      return res.status(404).json({ message: 'Indicateur not found' });
    }

    await indicateur.remove();
    res.status(200).json({ message: 'Indicateur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createIndicateur,
  getAllIndicateurs,
  getIndicateurById,
  updateIndicateur,
  deleteIndicateur
};
// Note: Ensure to import this controller in your routes file and set up the necessary routes.