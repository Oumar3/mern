import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { GeographicFilter } from '../components/GeographicFilter';

interface FilteredStatistics {
  indicator: {
    _id: string;
    code: string;
    name: string;
    uniteDeMesure?: any;
    programme?: any;
    polarityDirection?: 'positive' | 'negative';
  };
  geoFilter: {
    level: string;
    entity?: {
      _id: string;
      name: string;
      code: string;
      type: string;
      parent?: any;
    };
  };
  timeFilter: {
    startYear?: number;
    endYear?: number;
  };
  statistics: {
    totalDataPoints: number;
    averageValue: number;
    latestValue: number;
    earliestValue: number;
    minValue: number;
    maxValue: number;
    yearRange: string;
    trendDirection: 'up' | 'down' | 'stable';
    growthRate: number;
    yearlyGrowthRate: number;
    variance: number;
    standardDeviation: number;
    changeFromPrevious: number;
    percentChangeFromPrevious: number;
    referenceValue: number;
    targetValue: number;
    targetYear: number | null;
    referenceYear: number | null;
    gapToTarget: number;
    percentGapToTarget: number;
  };
  followups: any[];
  dataIndices: number[];
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointBorderWidth: number;
    pointRadius: number;
    spanGaps: boolean;
  }>;
}

export const useFilteredStatistics = (indicatorId: string | undefined) => {
  const [statistics, setStatistics] = useState<FilteredStatistics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<GeographicFilter>({
    level: 'Global',
    entityName: 'National'
  });

  // Fetch statistics based on current filter
  const fetchStatistics = useCallback(async () => {
    if (!indicatorId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('geoLevel', filter.level);
      if (filter.entityId) params.append('geoEntityId', filter.entityId);
      if (filter.startYear) params.append('startYear', filter.startYear.toString());
      if (filter.endYear) params.append('endYear', filter.endYear.toString());

      const [statsResponse, chartResponse] = await Promise.all([
        api.get(`/statistics/indicator/${indicatorId}?${params}`),
        api.get(`/statistics/chart/${indicatorId}?${params}`)
      ]);

      setStatistics(statsResponse.data);
      setChartData(chartResponse.data);
    } catch (err: any) {
      console.error('Error fetching filtered statistics:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [indicatorId, filter]);

  // Fetch statistics when indicator or filter changes
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilter: GeographicFilter) => {
    setFilter(newFilter);
  }, []);

  // Get polarity-aware styling
  const getPolarityColor = useCallback((trendDirection: string) => {
    if (!statistics?.indicator?.polarityDirection) return 'gray';
    
    if (statistics.indicator.polarityDirection === 'positive') {
      return trendDirection === 'up' ? 'green' : trendDirection === 'down' ? 'red' : 'gray';
    } else {
      return trendDirection === 'down' ? 'green' : trendDirection === 'up' ? 'red' : 'gray';
    }
  }, [statistics?.indicator?.polarityDirection]);

  const getPolarityIcon = useCallback((trendDirection: string) => {
    if (!statistics?.indicator?.polarityDirection) return '→';
    
    if (statistics.indicator.polarityDirection === 'positive') {
      return trendDirection === 'up' ? '📈' : trendDirection === 'down' ? '📉' : '→';
    } else {
      return trendDirection === 'down' ? '📈' : trendDirection === 'up' ? '📉' : '→';
    }
  }, [statistics?.indicator?.polarityDirection]);

  const getPolarityLabel = useCallback((trendDirection: string) => {
    if (!statistics?.indicator?.polarityDirection) return 'Stable';
    
    const isGood = (statistics.indicator.polarityDirection === 'positive' && trendDirection === 'up') ||
                   (statistics.indicator.polarityDirection === 'negative' && trendDirection === 'down');
    
    if (trendDirection === 'up') {
      return isGood ? 'Amélioration ↗' : 'Dégradation ↗';
    } else if (trendDirection === 'down') {
      return isGood ? 'Amélioration ↘' : 'Dégradation ↘';
    }
    return 'Stable →';
  }, [statistics?.indicator?.polarityDirection]);

  // Format number with appropriate precision
  const formatValue = useCallback((value: number, precision: number = 2) => {
    if (value === 0) return '0';
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(precision);
  }, []);

  return {
    statistics,
    chartData,
    loading,
    error,
    filter,
    handleFilterChange,
    fetchStatistics,
    getPolarityColor,
    getPolarityIcon,
    getPolarityLabel,
    formatValue
  };
};
