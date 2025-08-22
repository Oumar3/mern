import SousPrefecture from "../../models/Decoupage/Sous-prefecture.js";

// Create a new sous-préfecture
export const createSousPrefecture = async (req, res) => {
    try {
        const sousPrefecture = new SousPrefecture(req.body);
        await sousPrefecture.save();
        res.status(201).json(sousPrefecture);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all sous-préfectures
export const getSousPrefectures = async (req, res) => {
    try {
        const sousPrefectures = await SousPrefecture.find().populate('departement');
        res.json(sousPrefectures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get sous-préfectures by département
export const getSousPrefecturesByDepartement = async (req, res) => {
    try {
        const { departementId } = req.params;
        const sousPrefectures = await SousPrefecture.find({ departement: departementId }).populate('departement');
        res.json(sousPrefectures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single sous-préfecture by ID
export const getSousPrefectureById = async (req, res) => {
    try {
        const sousPrefecture = await SousPrefecture.findById(req.params.id).populate('departement');
        if (!sousPrefecture) return res.status(404).json({ error: "Sous-préfecture not found" });
        res.json(sousPrefecture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a sous-préfecture
export const updateSousPrefecture = async (req, res) => {
    try {
        const sousPrefecture = await SousPrefecture.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('departement');
        if (!sousPrefecture) return res.status(404).json({ error: "Sous-préfecture not found" });
        res.json(sousPrefecture);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a sous-préfecture
export const deleteSousPrefecture = async (req, res) => {
    try {
        const sousPrefecture = await SousPrefecture.findByIdAndDelete(req.params.id);
        if (!sousPrefecture) return res.status(404).json({ error: "Sous-préfecture not found" });
        res.json({ message: "Sous-préfecture deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
