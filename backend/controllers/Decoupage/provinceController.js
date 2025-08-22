import Province from "../../models/Decoupage/Province.js";

// @desc    Create a new province
// @route   POST /api/provinces
// @access  Private/Admin
const createProvince = async (req, res) => {
  try {
    const { code, name, description, chefLieu } = req.body;

    const provinceExists = await Province.findOne({ code });

    if (provinceExists) {
      return res.status(400).json({ message: 'Province already exists' });
    }

    const province = new Province({
      code,
      name,
      description,
      chefLieu
    });

    await province.save();

    res.status(201).json(province);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all provinces
// @route   GET /api/provinces
// @access  Public
const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find();
    res.status(200).json(provinces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get province by ID
// @route   GET /api/provinces/:id
// @access  Public
const getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json(province);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update province by ID
// @route   PUT /api/provinces/:id
// @access  Private/Admin
const updateProvince = async (req, res) => {
  try {
    const { code, name, description, chefLieu } = req.body;

    const province = await Province.findById(req.params.id);

    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }

    province.code = code || province.code;
    province.name = name || province.name;
    province.description = description || province.description;
    province.chefLieu = chefLieu || province.chefLieu;

    await province.save();

    res.status(200).json(province);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete province by ID
// @route   DELETE /api/provinces/:id
// @access  Private/Admin
const deleteProvince = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);

    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }

    await province.remove();

    res.status(200).json({ message: 'Province removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { createProvince, getProvinces, getProvinceById, updateProvince, deleteProvince };