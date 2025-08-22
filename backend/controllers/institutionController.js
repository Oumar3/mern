import Institution from '../models/Institution.js';
import Programme from '../models/Programme.js';

// @desc    Create a new institution
// @route   POST /api/institutions
// @access  Private/Admin
const createInstitution = async (req, res) => {
  try {
    const { name, shortName, description, category, interventionAreas, promises, contact } = req.body;

    const institutionExists = await Institution.findOne({ name });

    if (institutionExists) {
      return res.status(400).json({ message: 'Institution already exists' });
    }

    // Validate intervention areas if provided
    if (interventionAreas && interventionAreas.length > 0) {
      const validProgrammes = await Programme.find({ _id: { $in: interventionAreas } });
      if (validProgrammes.length !== interventionAreas.length) {
        return res.status(400).json({ message: 'One or more intervention areas (programmes) are invalid' });
      }
    }

    // Only allow promises for financial backers
    let validatedPromises = [];
    if (category === 'financial_backer' && promises && promises.length > 0) {
      validatedPromises = promises;
    }

    const institution = await Institution.create({
      name,
      shortName,
      description,
      category,
      interventionAreas: interventionAreas || [],
      promises: validatedPromises,
      contact
    });

    // Populate intervention areas in response
    await institution.populate('interventionAreas');

    res.status(201).json(institution);
  } catch (error) {
    res.status(400).json({ message: 'Invalid institution data', error: error.message });
  }
};

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
const getAllInstitutions = async (req, res) => {
  try {
    const { category, interventionArea } = req.query;
    let filter = {};

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Filter by intervention area if provided
    if (interventionArea) {
      filter.interventionAreas = { $in: [interventionArea] };
    }

    const institutions = await Institution.find(filter).populate('interventionAreas');
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get institution by ID
// @route   GET /api/institutions/:id
// @access  Public
const getInstitutionById = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id).populate('interventionAreas');

    if (institution) {
      res.json(institution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update an institution
// @route   PUT /api/institutions/:id
// @access  Private/Admin
const updateInstitution = async (req, res) => {
  try {
    const { interventionAreas, promises, category } = req.body;

    // Validate intervention areas if provided
    if (interventionAreas && interventionAreas.length > 0) {
      const validProgrammes = await Programme.find({ _id: { $in: interventionAreas } });
      if (validProgrammes.length !== interventionAreas.length) {
        return res.status(400).json({ message: 'One or more intervention areas (programmes) are invalid' });
      }
    }

    // Only allow promises for financial backers
    if (promises && promises.length > 0 && category !== 'financial_backer') {
      return res.status(400).json({ message: 'Promises are only allowed for financial backer institutions' });
    }

    const institution = await Institution.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('interventionAreas');
    
    if (institution) {
      res.json(institution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Could not update institution', error: error.message });
  }
};

// @desc    Delete an institution
// @route   DELETE /api/institutions/:id
// @access  Private/Admin
const deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);
    if (institution) {
      res.json({ message: 'Institution removed' });
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add promise to financial backer institution
// @route   POST /api/institutions/:id/promises
// @access  Private/Admin
const addPromise = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    if (institution.category !== 'financial_backer') {
      return res.status(400).json({ message: 'Promises can only be added to financial backer institutions' });
    }

    institution.promises.push(req.body);
    await institution.save();
    await institution.populate('interventionAreas');

    res.json(institution);
  } catch (error) {
    res.status(400).json({ message: 'Could not add promise', error: error.message });
  }
};

// @desc    Update promise status
// @route   PUT /api/institutions/:id/promises/:promiseId
// @access  Private/Admin
const updatePromise = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    const promise = institution.promises.id(req.params.promiseId);
    
    if (!promise) {
      return res.status(404).json({ message: 'Promise not found' });
    }

    Object.assign(promise, req.body);
    await institution.save();
    await institution.populate('interventionAreas');

    res.json(institution);
  } catch (error) {
    res.status(400).json({ message: 'Could not update promise', error: error.message });
  }
};

// @desc    Get institutions by category
// @route   GET /api/institutions/category/:category
// @access  Public
const getInstitutionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const institutions = await Institution.find({ category }).populate('interventionAreas');
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get financial statistics
// @route   GET /api/institutions/stats/financial
// @access  Public
const getFinancialStats = async (req, res) => {
  try {
    const financialBackers = await Institution.find({ category: 'financial_backer' });
    
    const stats = financialBackers.reduce((acc, institution) => {
      const totalPromised = institution.promises.reduce((sum, promise) => sum + promise.amount, 0);
      const fulfilledAmount = institution.promises
        .filter(p => p.status === 'fulfilled')
        .reduce((sum, promise) => sum + promise.amount, 0);
      
      acc.totalPromised += totalPromised;
      acc.totalFulfilled += fulfilledAmount;
      acc.institutionCount += 1;
      acc.promiseCount += institution.promises.length;
      
      return acc;
    }, {
      totalPromised: 0,
      totalFulfilled: 0,
      institutionCount: 0,
      promiseCount: 0
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,
  addPromise,
  updatePromise,
  getInstitutionsByCategory,
  getFinancialStats
};
