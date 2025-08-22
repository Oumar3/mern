import DataProducer from "../models/DataProducer.js";

const createDataProducer = async (req, res) => {
    try {
        const { name, description, contactInfo, url } = req.body;
        const newDataProducer = new DataProducer({ name, description, contactInfo, url });
        await newDataProducer.save();
        res.status(201).json(newDataProducer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDataProducers = async (req, res) => {
    try {
        const dataProducers = await DataProducer.find();
        res.status(200).json(dataProducers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDataProducerById = async (req, res) => {
    try {
        const { id } = req.params;
        const dataProducer = await DataProducer.findById(id);
        if (!dataProducer) {
            return res.status(404).json({ message: "Data producer not found" });
        }
        res.status(200).json(dataProducer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDataProducer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, contactInfo, url } = req.body;
        const updatedDataProducer = await DataProducer.findByIdAndUpdate(id, { name, description, contactInfo, url }, { new: true });
        if (!updatedDataProducer) {
            return res.status(404).json({ message: "Data producer not found" });
        }
        res.status(200).json(updatedDataProducer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDataProducer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDataProducer = await DataProducer.findByIdAndDelete(id);
        if (!deletedDataProducer) {
            return res.status(404).json({ message: "Data producer not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createDataProducer, getDataProducers, getDataProducerById, updateDataProducer, deleteDataProducer };
