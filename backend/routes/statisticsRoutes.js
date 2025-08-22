import express from 'express';
import {
    getIndicatorStatistics,
    getIndicatorChartData,
    getComparisonStatistics,
    getGeographicEntities,
    getAvailableYears
} from '../controllers/statisticsController.js';

const router = express.Router();

// @route GET /api/statistics/indicator/:indicatorId
// @desc Get filtered statistics for an indicator
// @access Public
router.get('/indicator/:indicatorId', getIndicatorStatistics);

// @route GET /api/statistics/chart/:indicatorId
// @desc Get chart data for an indicator
// @access Public
router.get('/chart/:indicatorId', getIndicatorChartData);

// @route POST /api/statistics/compare/:indicatorId
// @desc Get comparison statistics between different geographic entities
// @access Public
router.post('/compare/:indicatorId', getComparisonStatistics);

// @route GET /api/statistics/geographic-entities
// @desc Get geographic entities for filtering
// @access Public
router.get('/geographic-entities', getGeographicEntities);

// @route GET /api/statistics/years/:indicatorId
// @desc Get available years for an indicator
// @access Public
router.get('/years/:indicatorId', getAvailableYears);

export default router;
