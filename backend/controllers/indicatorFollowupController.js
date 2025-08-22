import IndicatorFollowup from "../models/IndicatorFollowup.js";
import Indicator from "../models/Indicator.js";

// Create a new followup
export const createFollowup = async (req, res) => {
    try {
        const followup = new IndicatorFollowup(req.body);
        await followup.save();
        
        // Populate indicator for response
        await followup.populate('indicator');
        res.status(201).json(followup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all followups with indicator data
export const getFollowups = async (req, res) => {
    try {
        const followups = await IndicatorFollowup.find().populate('indicator');
        res.json(followups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single followup by ID
export const getFollowupById = async (req, res) => {
    try {
        const followup = await IndicatorFollowup.findById(req.params.id).populate('indicator');
        if (!followup) return res.status(404).json({ error: "Not found" });
        res.json(followup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a followup
export const updateFollowup = async (req, res) => {
    try {
        const followup = await IndicatorFollowup.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('indicator');
        if (!followup) return res.status(404).json({ error: "Not found" });
        res.json(followup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a followup
export const deleteFollowup = async (req, res) => {
    try {
        const followup = await IndicatorFollowup.findByIdAndDelete(req.params.id);
        if (!followup) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
