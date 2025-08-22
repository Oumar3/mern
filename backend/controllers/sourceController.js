import Source from "../models/Source.js";

export const createSource = async (req, res) => {
    try {
        const { code, name, description, producer, url } = req.body;
        const newSource = new Source({ code, name, description, producer, url });
        await newSource.save();
        const populatedSource = await Source.findById(newSource._id).populate('producer');
        res.status(201).json(populatedSource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSources = async (req, res) => {
    try {
        const sources = await Source.find().populate('producer');
        res.status(200).json(sources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSourceById = async (req, res) => {
    try {
        const source = await Source.findById(req.params.id).populate('producer');
        if (!source) {
            return res.status(404).json({ message: 'Source not found' });
        }
        res.status(200).json(source);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSource = async (req, res) => {
    try {
        const { code, name, description, producer, url } = req.body;
        const updatedSource = await Source.findByIdAndUpdate(
            req.params.id,
            { code, name, description, producer, url },
            { new: true }
        ).populate('producer');
        if (!updatedSource) {
            return res.status(404).json({ message: 'Source not found' });
        }
        res.status(200).json(updatedSource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSource = async (req, res) => {
    try {
        const source = await Source.findByIdAndDelete(req.params.id);
        if (!source) {
            return res.status(404).json({ message: 'Source not found' });
        }
        res.status(200).json({ message: 'Source deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Sources for dropdown/select options
export const getSourceOptions = async (req, res) => {
    try {
        const sources = await Source.find().select('_id name');
        res.json(sources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



