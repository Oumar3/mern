import Domaine from "../models/Domaine.js";

// @desc    Create a new domaine
// @route   POST /api/domaines
// @access  Private/Admin
const createDomaine = async (req, res) => {
  try {
    const { code, name, description, strategy } = req.body;
    const { nature } = req.body;

    const domaineExists = await Domaine.findOne({ code });

    if (domaineExists) {
      return res.status(400).json({ message: 'Domaine already exists' });
    }

    const domaine = await Domaine.create({
      code,
      name,
      description,
      strategy,
      nature,
      slug: name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
    });

    res.status(201).json(domaine);
  } catch (error) {
    res.status(400).json({ message: 'Invalid domaine data', error: error.message });
  }
};

// @desc    Get all domaines
// @route   GET /api/domaines
// @access  Public
const getAllDomaines = async (req, res) => {
    try {
        const domaines = await Domaine.find({});
        res.json(domaines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Get domaine by ID
// @route   GET /api/domaines/:id
// @access  Public
const getDomaineById = async (req, res) => {
    try {
        const domaine = await Domaine.findById(req.params.id);

        if (domaine) {
            res.json(domaine);
        } else {
            res.status(404).json({ message: 'Domaine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// @desc    Update a domaine
// @route   PUT /api/domaines/:id
// @access  Private/Admin
const updateDomaine = async (req, res) => {
  try {
    const { code, name, description, strategy } = req.body;
    const { nature } = req.body;

    const domaine = await Domaine.findById(req.params.id);

    if (!domaine) {
      return res.status(404).json({ message: 'Domaine not found' });
    }

    domaine.code = code || domaine.code;
    domaine.name = name || domaine.name;
    domaine.description = description || domaine.description;
    domaine.strategy = strategy || domaine.strategy;
    domaine.nature = nature || domaine.nature;

    await domaine.save();

    res.json(domaine);
  } catch (error) {
    res.status(400).json({ message: 'Invalid domaine data', error: error.message });
  }
};

// @desc    Delete a domaine
// @route   DELETE /api/domaines/:id
// @access  Private/Admin
const deleteDomaine = async (req, res) => {
  try {
    const domaine = await Domaine.findByIdAndDelete(req.params.id);

    if (domaine) {
      res.json({ message: 'Domaine removed' });
    } else {
      res.status(404).json({ message: 'Domaine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createDomaine,
  getAllDomaines,
  getDomaineById,
  updateDomaine,
  deleteDomaine,
};