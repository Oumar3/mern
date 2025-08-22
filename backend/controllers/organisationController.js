import Organisation from '../models/Organisation.js';

// @desc    Create a new organisation
// @route   POST /api/organisations
// @access  Private/Admin
const createOrganisation = async (req, res) => {
  try {
    const { name, shortName, description } = req.body;

    const organisationExists = await Organisation.findOne({ name });

    if (organisationExists) {
      return res.status(400).json({ message: 'Organisation already exists' });
    }

    const organisation = await Organisation.create({
      name,
      shortName,
      description,
    });

    res.status(201).json(organisation);
  } catch (error) {
    res.status(400).json({ message: 'Invalid organisation data', error: error.message });
  }
};

// @desc    Get all organisations
// @route   GET /api/organisations
// @access  Public
const getAllOrganisations = async (req, res) => {
  try {
    const organisations = await Organisation.find({});
    res.json(organisations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get organisation by ID
// @route   GET /api/organisations/:id
// @access  Public
const getOrganisationById = async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);

    if (organisation) {
      res.json(organisation);
    } else {
      res.status(404).json({ message: 'Organisation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update an organisation
// @route   PUT /api/organisations/:id
// @access  Private/Admin
const updateOrganisation = async (req, res) => {
  try {
    const organisation = await Organisation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (organisation) {
      res.json(organisation);
    } else {
      res.status(404).json({ message: 'Organisation not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Could not update organisation', error: error.message });
  }
};

// @desc    Delete an organisation
// @route   DELETE /api/organisations/:id
// @access  Private/Admin
const deleteOrganisation = async (req, res) => {
  try {
    const organisation = await Organisation.findByIdAndDelete(req.params.id);
    if (organisation) {
      res.json({ message: 'Organisation removed' });
    } else {
      res.status(404).json({ message: 'Organisation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createOrganisation,
  getAllOrganisations,
  getOrganisationById,
  updateOrganisation,
  deleteOrganisation,
};