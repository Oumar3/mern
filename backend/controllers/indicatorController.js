import Indicator from "../models/Indicator.js";
import Programme from "../models/Programme.js";
import Source from "../models/Source.js";
import UniteDeMesure from "../models/UniteDeMesure.js";
import { IndicatorService } from "../services/indicatorService.js";

// Create a new indicator
export const createIndicator = async (req, res) => {
    try {
        const indicator = await IndicatorService.createIndicator(req.body);
        res.status(201).json(indicator);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all indicators
export const getIndicators = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', programme, uniteDeMesure, sources, format } = req.query;
        
        // If no pagination parameters are provided, return simple array for backward compatibility
        const isSimpleRequest = !page || page == 1 && !limit || limit == 10 && !search && !programme && !uniteDeMesure && !sources;
        
        if (isSimpleRequest && Object.keys(req.query).length === 0) {
            // Simple list request - return just the array
            const indicators = await Indicator.find()
                .populate('uniteDeMesure', 'code name')
                .populate('programme', 'code name objectif')
                .populate('source', 'name description url')
                .sort({ createdAt: -1 });
            return res.json(indicators);
        }
        
        // Enhanced paginated request
        const filters = {};
        if (programme) filters.programme = programme;
        if (uniteDeMesure) filters.uniteDeMesure = uniteDeMesure;
        if (sources) filters.sources = Array.isArray(sources) ? sources : [sources];

        const result = await IndicatorService.getIndicators(
            parseInt(page), 
            parseInt(limit), 
            search, 
            filters
        );
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single indicator by ID
export const getIndicatorById = async (req, res) => {
    try {
        const indicator = await Indicator.findById(req.params.id)
            .populate('uniteDeMesure', 'code name')
            .populate('programme', 'code name objectif')
            .populate('source', 'name description url');
        if (!indicator) return res.status(404).json({ error: "Not found" });
        res.json(indicator);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an indicator
export const updateIndicator = async (req, res) => {
    try {
        const indicator = await IndicatorService.updateIndicator(req.params.id, req.body);
        res.json(indicator);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete an indicator
export const deleteIndicator = async (req, res) => {
    try {
        const result = await IndicatorService.deleteIndicator(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all programmes for dropdown
export const getProgrammes = async (req, res) => {
    try {
        const programmes = await Programme.find().select('_id code name objectif');
        res.json(programmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all sources for dropdown
export const getSources = async (req, res) => {
    try {
        const sources = await Source.find().select('_id name description url');
        res.json(sources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all unites de mesure for dropdown
export const getUnitesDeMesure = async (req, res) => {
    try {
        const unites = await UniteDeMesure.find().select('_id code name');
        res.json(unites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get indicator statistics
export const getIndicatorStatistics = async (req, res) => {
    try {
        const stats = await IndicatorService.getIndicatorStatistics();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
