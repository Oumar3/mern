import Programme from "../models/Programme.js";

// @desc    Create a new programme
// @route   POST /api/programmes
// @access  Private/Admin
const createProgramme = async (req, res) => {
  try {
    const { code, name, objectif, domaine, cost, currency, startDate, endDate } = req.body;

    const programmeExists = await Programme.findOne({ code });

    if (programmeExists) {
      return res.status(400).json({ message: 'Programme already exists' });
    }

    const programme = await Programme.create({
      code,
      name,
      objectif,
      domaine,
      cost,
      currency,
      startDate,
      endDate,
    });

    res.status(201).json(programme);
  } catch (error) {
    res.status(400).json({ message: 'Invalid programme data', error: error.message });
  }
};

// @desc    Get all programmes
// @route   GET /api/programmes
// @access  Public
const getAllProgrammes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.domaine) {
            filter.domaine = req.query.domaine;
        }
        const programmes = await Programme.find(filter).populate('domaine', 'name code');
        res.json(programmes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get programme by ID
// @route   GET /api/programmes/:id
// @access  Public
const getProgrammeById = async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id).populate('domaine', 'name code');

        if (programme) {
            res.json(programme);
        } else {
            res.status(404).json({ message: 'Programme not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a programme
// @route   PUT /api/programmes/:id
// @access  Private/Admin
const updateProgramme = async (req, res) => {
    try {
        const { code, name, objectif, domaine, cost, currency, startDate, endDate } = req.body;

        const programme = await Programme.findById(req.params.id);

        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }

        programme.code = code || programme.code;
        programme.name = name || programme.name;
        programme.objectif = objectif || programme.objectif;
        programme.domaine = domaine || programme.domaine;
        programme.cost = cost || programme.cost;
        programme.currency = currency || programme.currency;
        programme.startDate = startDate || programme.startDate;
        programme.endDate = endDate || programme.endDate;

        const updatedProgramme = await programme.save();
        res.json(updatedProgramme);
    } catch (error) {
        res.status(400).json({ message: 'Invalid programme data', error: error.message });
    }
};

// @desc    Delete a programme
// @route   DELETE /api/programmes/:id
// @access  Private/Admin
const deleteProgramme = async (req, res) => {
    try {
        const programme = await Programme.findByIdAndDelete(req.params.id);

        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }

        res.json({ message: 'Programme removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export {
    createProgramme,
    getAllProgrammes,
    getProgrammeById,
    updateProgramme,
    deleteProgramme,
};