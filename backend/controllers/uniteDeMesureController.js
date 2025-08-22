import UniteDeMesure from "../models/UniteDeMesure.js";

// Create a new unit
export const createUniteDeMesure = async (req, res) => {
  try {
    const unite = new UniteDeMesure(req.body);
    await unite.save();
    res.status(201).json(unite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all units
export const getUnitesDeMesure = async (req, res) => {
  try {
    const unites = await UniteDeMesure.find();
    res.json(unites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single unit by ID
export const getUniteDeMesureById = async (req, res) => {
  try {
    const unite = await UniteDeMesure.findById(req.params.id);
    if (!unite) return res.status(404).json({ error: "Not found" });
    res.json(unite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a unit
export const updateUniteDeMesure = async (req, res) => {
  try {
    const unite = await UniteDeMesure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!unite) return res.status(404).json({ error: "Not found" });
    res.json(unite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a unit
export const deleteUniteDeMesure = async (req, res) => {
  try {
    const unite = await UniteDeMesure.findByIdAndDelete(req.params.id);
    if (!unite) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get units for dropdown options
export const getUniteDeMesureOptions = async (req, res) => {
  try {
    const unites = await UniteDeMesure.find().select('_id name');
    res.json(unites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
