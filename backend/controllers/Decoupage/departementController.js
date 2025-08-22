import Departement from "../../models/Decoupage/Departement.js";

// @desc    Create a new departement
// @route   POST /api/departements
// @access  Private/Admin
const createDepartement = async (req, res) => {
  try {
    const { code, name, province, chefLieu } = req.body;

    const departementExists = await Departement.findOne({ code });

    if (departementExists) {
      return res.status(400).json({ message: 'Departement already exists' });
    }
    const departement = new Departement({
      code,
      name,
      province,
      chefLieu
    });

    await departement.save();

    res.status(201).json(departement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all departements
// @route   GET /api/departements
// @access  Public
const getDepartements = async (req, res) => {
  try {
    const departements = await Departement.find().populate('province', 'name');
    res.status(200).json(departements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get departement by ID
// @route   GET /api/departements/:id
// @access  Public
const getDepartementById = async (req, res) => {
  try {
    const departement = await Departement.findById(req.params.id).populate('province', 'name');
    if (!departement) {
      return res.status(404).json({ message: 'Departement not found' });
    }
    res.status(200).json(departement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update departement by ID
// @route   PUT /api/departements/:id
// @access  Private/Admin
const updateDepartement = async (req, res) => {
  try {
    const { code, name, province, chefLieu } = req.body;

    const departement = await Departement.findById(req.params.id);

    if (!departement) {
      return res.status(404).json({ message: 'Departement not found' });
    }

    departement.code = code || departement.code;
    departement.name = name || departement.name;
    departement.province = province || departement.province;
    departement.chefLieu = chefLieu || departement.chefLieu;

    const updatedDepartement = await departement.save();
    res.json(updatedDepartement);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid departement data', error: error.message });
  }
};

// @desc    Delete departement by ID
// @route   DELETE /api/departements/:id
// @access  Private/Admin
const deleteDepartement = async (req, res) => {
  try {
    const departement = await Departement.findById(req.params.id);
    if (!departement) {
      return res.status(404).json({ message: 'Departement not found' });
    }
    await departement.remove();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createDepartement,
  getDepartements,
  getDepartementById,
  updateDepartement,
  deleteDepartement
};