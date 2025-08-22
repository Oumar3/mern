import Orientation from "../models/Orientation.js";

const createOrientation = async (req, res) => {
    const { code, description, programme } = req.body;
    try {
        const newOrientation = new Orientation({ code, description, programme });
        await newOrientation.save();
        res.status(201).json(newOrientation);
    } catch (error) {
        res.status(500).json({ message: "Error creating orientation", error });
    }
};

const getOrientations = async (req, res) => {
    try {
        const filter = {};
        if (req.query.programme) {
            filter.programme = req.query.programme;
        }
        const orientations = await Orientation.find(filter).populate("programme");
        res.status(200).json(orientations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orientations", error });
    }
};

const getOrientationById = async (req, res) => {
    const { id } = req.params;
    try {
        const orientation = await Orientation.findById(id).populate("programme");
        if (!orientation) {
            return res.status(404).json({ message: "Orientation not found" });
        }
        res.status(200).json(orientation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orientation", error });
    }
};

const updateOrientation = async (req, res) => {
    const { id } = req.params;
    const { code, description, programme } = req.body;
    try {
        const updatedOrientation = await Orientation.findByIdAndUpdate(id, { code, description, programme }, { new: true });
        res.status(200).json(updatedOrientation);
    } catch (error) {
        res.status(500).json({ message: "Error updating orientation", error });
    }
};

const deleteOrientation = async (req, res) => {
    const { id } = req.params;
    try {
        await Orientation.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting orientation", error });
    }
};

export { createOrientation, getOrientations, getOrientationById, updateOrientation, deleteOrientation };
