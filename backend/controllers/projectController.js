import Project from "../models/Project.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const {
      code,
      name,
      slug,
      description,
      type,
      typology,
      zone,
      programme,
      createdBy,
      startDate,
      endDate,
      budget,
      currency,
      status,
    } = req.body;

    const project = await Project.create({
      code,
      name,
      slug,
      description,
      type,
      typology,
      zone,
      programme,
      createdBy,
      startDate,
      endDate,
      budget,
      currency,
      status,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid project data', error: error.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
    try {
        const filter = {};
        if (req.query.programme) {
            filter.programme = req.query.programme;
        }
        const projects = await Project.find(filter)
            .populate('programme', 'name code')
            .populate('createdBy', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('programme', 'name code')
            .populate('createdBy', 'name email');

        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const {
      code,
      name,
      slug,
      description,
      type,
      typology,
      zone,
      programme,
      createdBy,
      startDate,
      endDate,
      budget,
      currency,
      status,
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.code = code || project.code;
    project.name = name || project.name;
    project.slug = slug || project.slug;
    project.description = description || project.description;
    project.type = type || project.type;
    project.typology = typology || project.typology;
    project.zone = zone || project.zone;
    project.programme = programme || project.programme;
    project.createdBy = createdBy || project.createdBy;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.budget = budget || project.budget;
    project.currency = currency || project.currency;
    project.status = status || project.status;

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid project data', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
};  
