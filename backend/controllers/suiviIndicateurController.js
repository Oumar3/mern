import SuiviIndicateur from "../models/SuiviIndicateur.js";

// @desc    Create a new suivi indicateur
// @route   POST /api/suivi-indicateurs
// @access  Private/Admin
const createSuiviIndicateur = async (req, res) => {
  try {
    const { code, anne, valeur, indicateur, source, sourceDetail } = req.body;

    const suiviIndicateurExists = await SuiviIndicateur.findOne({ code, anne });

    if (suiviIndicateurExists) {
      return res.status(400).json({ message: 'Suivi Indicateur already exists for this code and year' });
    }

    const suiviIndicateur = await SuiviIndicateur.create({
      code,
      anne,
      valeur,
      indicateur,
      source,
      sourceDetail,
      createdBy: req.user._id,
    });

    res.status(201).json(suiviIndicateur);
  } catch (error) {
    res.status(400).json({ message: 'Invalid suivi indicateur data', error: error.message });
  }
};

// @desc    Get all suivi indicateurs
// @route   GET /api/suivi-indicateurs
// @access  Public
const getAllSuiviIndicateurs = async (req, res) => {
  try {
    // Build filter object based on query parameters
    const filter = {};
    
    // Filter by indicateur if provided in query
    if (req.query.indicateur) {
      filter.indicateur = req.query.indicateur;
    }

    const suiviIndicateurs = await SuiviIndicateur.find(filter)
      .populate('indicateur', 'name')
      .populate('source', 'name');

    res.json(suiviIndicateurs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get suivi indicateur by ID
// @route   GET /api/suivi-indicateurs/:id
// @access  Public
const getSuiviIndicateurById = async (req, res) => {
  try {
    const suiviIndicateur = await SuiviIndicateur.findById(req.params.id)
      .populate('indicateur', 'name')
      .populate('source', 'name');

    if (suiviIndicateur) {
      res.json(suiviIndicateur);
    } else {
      res.status(404).json({ message: 'Suivi Indicateur not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a suivi indicateur
// @route   PUT /api/suivi-indicateurs/:id
// @access  Private/Admin
const updateSuiviIndicateur = async (req, res) => {
  try {
    const { code, anne, valeur, indicateur, source, sourceDetail } = req.body;

    const suiviIndicateur = await SuiviIndicateur.findById(req.params.id);

    if (!suiviIndicateur) {
      return res.status(404).json({ message: 'Suivi Indicateur not found' });
    }

    suiviIndicateur.code = code || suiviIndicateur.code;
    suiviIndicateur.anne = anne || suiviIndicateur.anne;
    suiviIndicateur.valeur = valeur || suiviIndicateur.valeur;
    suiviIndicateur.indicateur = indicateur || suiviIndicateur.indicateur;
    suiviIndicateur.source = source || suiviIndicateur.source;
    suiviIndicateur.sourceDetail = sourceDetail || suiviIndicateur.sourceDetail;

    const updatedSuiviIndicateur = await suiviIndicateur.save();

    res.json(updatedSuiviIndicateur);
  } catch (error) {
    res.status(400).json({ message: 'Invalid suivi indicateur data', error: error.message });
  }
};

// @desc    Delete a suivi indicateur
// @route   DELETE /api/suivi-indicateurs/:id
// @access  Private/Admin
const deleteSuiviIndicateur = async (req, res) => {
  try {
    const suiviIndicateur = await SuiviIndicateur.findById(req.params.id);

    if (!suiviIndicateur) {
      return res.status(404).json({ message: 'Suivi Indicateur not found' });
    }

    await SuiviIndicateur.deleteOne({ _id: req.params.id });

    res.json({ message: 'Suivi Indicateur removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createSuiviIndicateur,
  getAllSuiviIndicateurs,
  getSuiviIndicateurById,
  updateSuiviIndicateur,
  deleteSuiviIndicateur,
};