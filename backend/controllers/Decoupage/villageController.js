import Village from "../../models/Decoupage/Village.js";

// @desc    Create a new village
// @route   POST /api/villages
// @access  Private/Admin
const createVillage = async (req, res) => {
  try {
    const { code, name, description, canton, geolocation } = req.body;

    const villageExists = await Village.findOne({ code });
    if (villageExists) {
      return res.status(400).json({ message: 'Village already exists' });
    }
    const village = new Village({
      code,
      name,
      description,
      canton,
      geolocation
    });

    await village.save();
    res.status(201).json(village);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all villages
// @route   GET /api/villages
// @access  Public
const getVillages = async (req, res) => {
  try {
    const villages = await Village.find().populate({
      path: 'canton',
      populate: {
        path: 'sousPrefecture',
        populate: {
          path: 'departement',
          populate: {
            path: 'province'
          }
        }
      }
    });
    res.status(200).json(villages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get village by ID
// @route   GET /api/villages/:id
// @access  Public
const getVillageById = async (req, res) => {
  try {
    const village = await Village.findById(req.params.id).populate({
      path: 'canton',
      populate: {
        path: 'sousPrefecture',
        populate: {
          path: 'departement',
          populate: {
            path: 'province'
          }
        }
      }
    });
    
    if (!village) {
      return res.status(404).json({ message: 'Village not found' });
    }
    res.status(200).json(village);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Update village by ID
// @route   PUT /api/villages/:id
// @access  Private/Admin
const updateVillage = async (req, res) => {
  try {
    const { code, name, description, canton, geolocation } = req.body;

    const village = await Village.findById(req.params.id);

    if (!village) {
      return res.status(404).json({ message: 'Village not found' });
    }

    village.code = code || village.code;
    village.name = name || village.name;
    village.description = description || village.description;
    village.canton = canton || village.canton;
    village.geolocation = geolocation || village.geolocation;

    const updatedVillage = await village.save();
    res.json(updatedVillage);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid village data', error: error.message });
  }
};

// @desc    Delete village by ID
// @route   DELETE /api/villages/:id
// @access  Private/Admin
const deleteVillage = async (req, res) => {
  try {
    const village = await Village.findById(req.params.id);

    if (!village) {
      return res.status(404).json({ message: 'Village not found' });
    }

    await village.remove();

    res.json({ message: 'Village removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createVillage,
  getVillages,
  getVillageById,
  updateVillage,
  deleteVillage
};