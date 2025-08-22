import StatisticsService from "../services/statisticsService.js";

/**
 * Get filtered statistics for an indicator based on geographic level
 * @route GET /api/statistics/indicator/:indicatorId
 * @access Public
 */
export const getIndicatorStatistics = async (req, res) => {
    try {
        const { indicatorId } = req.params;
        const { 
            geoLevel = 'Global', 
            geoEntityId, 
            startYear, 
            endYear 
        } = req.query;

        const startYearNum = startYear ? parseInt(startYear) : null;
        const endYearNum = endYear ? parseInt(endYear) : null;

        const statistics = await StatisticsService.getFilteredStatistics(
            indicatorId,
            geoLevel,
            geoEntityId,
            startYearNum,
            endYearNum
        );

        res.json(statistics);
    } catch (error) {
        console.error('Error getting indicator statistics:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get chart data for an indicator filtered by geographic level
 * @route GET /api/statistics/chart/:indicatorId
 * @access Public
 */
export const getIndicatorChartData = async (req, res) => {
    try {
        const { indicatorId } = req.params;
        const { 
            geoLevel = 'Global', 
            geoEntityIds = [], 
            geoEntityId,           // Nouveau: paramètre singulier depuis le frontend
            startYear, 
            endYear 
        } = req.query;

        const startYearNum = startYear ? parseInt(startYear) : null;
        const endYearNum = endYear ? parseInt(endYear) : null;
        
        // Gestion des entités géographiques : prioriser geoEntityId (singulier) si fourni
        let entityIds = [];
        if (geoEntityId) {
            // Cas normal: une seule entité depuis le frontend
            entityIds = [geoEntityId];
            console.log(`🎯 Entité unique sélectionnée: ${geoEntityId}`);
        } else if (geoEntityIds) {
            // Cas multiple: plusieurs entités (pour usage futur)
            entityIds = typeof geoEntityIds === 'string' 
                ? geoEntityIds.split(',').filter(Boolean)
                : Array.isArray(geoEntityIds) ? geoEntityIds : [];
            console.log(`📍 Entités multiples: ${entityIds.join(', ')}`);
        }

        console.log(`📊 Chart request - Level: ${geoLevel}, Entities: [${entityIds.join(', ')}]`);

        const chartData = await StatisticsService.getFilteredChartData(
            indicatorId,
            geoLevel,
            entityIds,
            startYearNum,
            endYearNum
        );

        res.json(chartData);
    } catch (error) {
        console.error('Error getting indicator chart data:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get comparison statistics between different geographic entities
 * @route POST /api/statistics/compare/:indicatorId
 * @access Public
 */
export const getComparisonStatistics = async (req, res) => {
    try {
        const { indicatorId } = req.params;
        const { comparisons } = req.body;

        if (!comparisons || !Array.isArray(comparisons)) {
            return res.status(400).json({ error: 'Comparisons array is required' });
        }

        const statistics = await StatisticsService.getComparisonStatistics(
            indicatorId,
            comparisons
        );

        res.json(statistics);
    } catch (error) {
        console.error('Error getting comparison statistics:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get geographic entities for filtering
 * @route GET /api/statistics/geographic-entities
 * @access Public
 */
export const getGeographicEntities = async (req, res) => {
    try {
        const { level, parentId } = req.query;

        let entities = [];
        
        switch (level) {
            case 'Province':
                const Province = (await import("../models/Decoupage/Province.js")).default;
                entities = await Province.find({}, 'name code').sort({ name: 1 });
                break;
                
            case 'Departement':
                const Departement = (await import("../models/Decoupage/Departement.js")).default;
                const query = parentId ? { province: parentId } : {};
                entities = await Departement.find(query, 'name code province')
                    .populate('province', 'name code')
                    .sort({ name: 1 });
                break;
                
            case 'Commune':
                const Commune = (await import("../models/Decoupage/Commune.js")).default;
                const communeQuery = parentId ? { departement: parentId } : {};
                entities = await Commune.find(communeQuery, 'name code departement')
                    .populate('departement', 'name code')
                    .sort({ name: 1 });
                break;
                
            default:
                return res.status(400).json({ error: 'Invalid level specified' });
        }

        res.json(entities);
    } catch (error) {
        console.error('Error getting geographic entities:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get available years for an indicator
 * @route GET /api/statistics/years/:indicatorId
 * @access Public
 */
export const getAvailableYears = async (req, res) => {
    try {
        const { indicatorId } = req.params;
        const { geoLevel, geoEntityId } = req.query;

        const IndicatorFollowup = (await import("../models/IndicatorFollowup.js")).default;
        const Indicator = (await import("../models/Indicator.js")).default;

        // Get indicator to filter data indices
        const indicator = await Indicator.findById(indicatorId);
        if (!indicator) {
            return res.status(404).json({ error: 'Indicator not found' });
        }

        // Filter data indices based on geographic criteria
        let filteredDataIndices = [];
        if (geoLevel === 'Global') {
            filteredDataIndices = indicator.data
                .map((dataEntry, index) => dataEntry.geoLocation?.type === 'Global' ? index : null)
                .filter(index => index !== null);
        } else if (geoLevel && geoEntityId) {
            filteredDataIndices = indicator.data
                .map((dataEntry, index) => {
                    return (dataEntry.geoLocation?.type === geoLevel && 
                           dataEntry.geoLocation?.referenceId?.toString() === geoEntityId) ? index : null;
                })
                .filter(index => index !== null);
        } else {
            // If no specific filter, get all data indices
            filteredDataIndices = indicator.data.map((_, index) => index);
        }

        // Get unique years from followups
        const followups = await IndicatorFollowup.find({
            indicator: indicatorId,
            ...(filteredDataIndices.length > 0 && { dataIndex: { $in: filteredDataIndices } })
        }).distinct('year');

        const years = followups.sort((a, b) => a - b);

        res.json({
            years,
            minYear: years.length > 0 ? Math.min(...years) : null,
            maxYear: years.length > 0 ? Math.max(...years) : null,
            totalYears: years.length
        });
    } catch (error) {
        console.error('Error getting available years:', error);
        res.status(500).json({ error: error.message });
    }
};
