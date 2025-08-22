import Commune from "../../models/Decoupage/Commune.js";

// @desc    Create a new commune
// @route   POST /api/communes
// @access  Private/Admin
const createCommune = async (req, res) => {
  try {
    const { code, name, departement, description } = req.body;

    const communeExists = await Commune.findOne({ code });

    if (communeExists) {
      return res.status(400).json({ message: 'Commune already exists' });
    }

    const commune = new Commune({
      code,
      name,
      departement,
      description
    });

    await commune.save();

    res.status(201).json(commune);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all communes
// @route   GET /api/communes
// @access  Public
const getCommunes = async (req, res) => {
  try {
    const communes = await Commune.find().populate('departement', 'name');
    res.status(200).json(communes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single commune
// @route   GET /api/communes/:id
// @access  Public
const getCommuneById = async (req, res) => {
  try {
    const commune = await Commune.findById(req.params.id).populate('departement', 'name');
    if (!commune) {
      return res.status(404).json({ message: 'Commune not found' });
    }
    res.status(200).json(commune);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update commune by ID
// @route   PUT /api/communes/:id
// @access  Private/Admin
const updateCommune = async (req, res) => {
  try {
    const { code, name, departement, description } = req.body;

    const commune = await Commune.findById(req.params.id);

    if (!commune) {
      return res.status(404).json({ message: 'Commune not found' });
    }

    commune.code = code || commune.code;
    commune.name = name || commune.name;
    commune.departement = departement || commune.departement;
    commune.description = description || commune.description;

    const updatedCommune = await commune.save();

    res.json(updatedCommune);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid commune data', error: error.message });
  }
};

// @desc    Delete commune by ID
// @route   DELETE /api/communes/:id
// @access  Private/Admin
const deleteCommune = async (req, res) => {
  try {
    const commune = await Commune.findById(req.params.id);

    if (!commune) {
      return res.status(404).json({ message: 'Commune not found' });
    }

    await commune.remove();

    res.json({ message: 'Commune removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createCommune,
  getCommunes,
  getCommuneById,
  updateCommune,
  deleteCommune
};
