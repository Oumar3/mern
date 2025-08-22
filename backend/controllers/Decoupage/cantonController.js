import Canton from "../../models/Decoupage/Canton.js";

// Create a new canton
export const createCanton = async (req, res) => {
    try {
        const canton = new Canton(req.body);
        await canton.save();
        res.status(201).json(canton);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all cantons
export const getCantons = async (req, res) => {
    try {
        const cantons = await Canton.find().populate({
            path: 'sousPrefecture',
            populate: {
                path: 'departement',
                populate: {
                    path: 'province'
                }
            }
        });
        res.json(cantons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get cantons by sous-préfecture
export const getCantonsBySousPrefecture = async (req, res) => {
    try {
        const { sousPrefectureId } = req.params;
        const cantons = await Canton.find({ sousPrefecture: sousPrefectureId }).populate({
            path: 'sousPrefecture',
            populate: {
                path: 'departement',
                populate: {
                    path: 'province'
                }
            }
        });
        res.json(cantons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single canton by ID
export const getCantonById = async (req, res) => {
    try {
        const canton = await Canton.findById(req.params.id).populate({
            path: 'sousPrefecture',
            populate: {
                path: 'departement',
                populate: {
                    path: 'province'
                }
            }
        });
        if (!canton) return res.status(404).json({ error: "Canton not found" });
        res.json(canton);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a canton
export const updateCanton = async (req, res) => {
    try {
        const canton = await Canton.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate({
            path: 'sousPrefecture',
            populate: {
                path: 'departement',
                populate: {
                    path: 'province'
                }
            }
        });
        if (!canton) return res.status(404).json({ error: "Canton not found" });
        res.json(canton);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a canton
export const deleteCanton = async (req, res) => {
    try {
        const canton = await Canton.findByIdAndDelete(req.params.id);
        if (!canton) return res.status(404).json({ error: "Canton not found" });
        res.json({ message: "Canton deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
