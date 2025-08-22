import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { 
  DecoupageEntity, 
  IndicatorData, 
  Indicator, 
  Programme,
  Source,
  UniteDeMesure,
  MetaData
} from "../types/indicator";
import { BarChart3, LineChart, PieChart, TrendingUp, Activity, Target } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface Followup {
  _id: string;
  indicator: string | Indicator;
  dataIndex: number;
  year: number;
  value: number;
}

// French constants for dropdowns
const AGE_RANGES = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', 
  '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+',
  '0-14', '15-49', '15-64', '18+', '25-64', 'Tous les âges'
];

const GENDERS = ['Masculin', 'Féminin', 'Les deux', 'Autre'];

const SOCIAL_CATEGORIES = [
  'Urbain', 'Rural', 'Pauvre', 'Non pauvre', 'Vulnérable', 
  'Handicapé', 'Indigène', 'Réfugié', 'Déplacé', 'Jeune', 
  'Âgé', 'Toutes les catégories'
];

const GEO_TYPES = [
  { value: 'Global', label: 'National' },
  { value: 'Province', label: 'Province' },
  { value: 'Departement', label: 'Département' },
  { value: 'Sous-prefecture', label: 'Sous-préfecture' },
  { value: 'Canton', label: 'Canton' },
  { value: 'Commune', label: 'Commune' },
  { value: 'Village', label: 'Village' }
];

const IndicatorMasterDetailCrud = () => {
  // Master (Indicators) state
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorForm, setIndicatorForm] = useState({
    code: "",
    name: "",
    type: "",
    uniteDeMesure: "",
    programme: "",
    source: [] as string[],
    metaData: ""
  });

  // MetaData options for dropdown
  const [metaDataOptions, setMetaDataOptions] = useState<MetaData[]>([]);
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Options for dropdowns
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [unitesDeMesure, setUnitesDeMesure] = useState<UniteDeMesure[]>([]);
  
  // Detail (Selected Indicator & its data) state
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [indicatorDataForm, setIndicatorDataForm] = useState<IndicatorData>({
    geoLocation: { type: undefined, referenceId: undefined },
    ageRange: undefined,
    gender: undefined,
    socialCategory: undefined,
    ref_year: undefined,
    ref_value: undefined,
    target_year: undefined,
    target_value: undefined,
  });
  const [editingDataIndex, setEditingDataIndex] = useState<number | null>(null);
  
  // Active tab for statistics
  const [activeTab, setActiveTab] = useState<'data' | 'statistics' | 'global'>('data');
  
    // Followups state
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupForm, setFollowupForm] = useState({
    indicator: "",
    dataIndex: "",
    year: "",
    value: ""
  });
  const [editingFollowupId, setEditingFollowupId] = useState<string | null>(null);

  // Decoupage entities state
  const [decoupageEntities, setDecoupageEntities] = useState<{
    provinces: DecoupageEntity[];
    departements: DecoupageEntity[];
    sousPrefectures: DecoupageEntity[];
    cantons: DecoupageEntity[];
    communes: DecoupageEntity[];
    villages: DecoupageEntity[];
  }>({
    provinces: [],
    departements: [],
    sousPrefectures: [],
    cantons: [],
    communes: [],
    villages: []
  });

  // Fetch functions
  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/indicators");
      
      // Handle both paginated and non-paginated responses
      if (res.data.indicators) {
        // Paginated response from our enhanced service
        setIndicators(res.data.indicators);
      } else if (Array.isArray(res.data)) {
        // Simple array response (backward compatibility)
        setIndicators(res.data);
      } else {
        // Fallback - initialize as empty array
        console.warn("Unexpected API response format:", res.data);
        setIndicators([]);
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
      setError("Échec du chargement des indicateurs. Veuillez réessayer.");
      setIndicators([]); // Set empty array on error to prevent map errors
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [progRes, srcRes, uniteRes, metaDataRes] = await Promise.all([
        api.get("/indicators/options/programmes"),
        api.get("/indicators/options/sources"),
        api.get("/indicators/options/unites-de-mesure"),
        api.get("/meta-data/options")
      ]);
      setProgrammes(progRes.data);
      setSources(srcRes.data);
      setUnitesDeMesure(uniteRes.data);
      setMetaDataOptions(metaDataRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  // Helper function to reset indicator form
  const resetIndicatorForm = () => {
    setIndicatorForm({
      code: "",
      name: "",
      type: "",
      uniteDeMesure: "",
      programme: "",
      source: [],
      metaData: ""
    });
  };

  const fetchDecoupageEntities = async () => {
    try {
      const [provinces, departements, sousPrefectures, cantons, communes, villages] = await Promise.all([
        api.get("/decoupage/provinces"),
        api.get("/decoupage/departements"), 
        api.get("/decoupage/sous-prefectures"),
        api.get("/decoupage/cantons"),
        api.get("/decoupage/communes"),
        api.get("/decoupage/villages")
      ]);

      setDecoupageEntities({
        provinces: provinces.data,
        departements: departements.data,
        sousPrefectures: sousPrefectures.data,
        cantons: cantons.data,
        communes: communes.data,
        villages: villages.data
      });
    } catch (error) {
      console.error("Error fetching decoupage entities:", error);
    }
  };

  const fetchFollowups = async (indicatorId?: string) => {
    try {
      const res = await api.get("/indicator-followups");
      // Filter followups by selected indicator if needed
      if (indicatorId && selectedIndicator) {
        const filteredFollowups = res.data.filter((f: Followup) => {
          const followupIndicatorId = typeof f.indicator === 'string' ? f.indicator : f.indicator._id;
          return followupIndicatorId === indicatorId;
        });
        setFollowups(filteredFollowups);
      } else {
        setFollowups(res.data);
      }
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  };

  useEffect(() => {
    fetchIndicators();
    fetchDecoupageEntities();
    fetchOptions();
  }, []);

  useEffect(() => {
    const loadFollowups = async () => {
      if (selectedIndicator) {
        try {
          const res = await api.get("/indicator-followups");
          const filteredFollowups = res.data.filter((f: Followup) => {
            const followupIndicatorId = typeof f.indicator === 'string' ? f.indicator : f.indicator._id;
            return followupIndicatorId === selectedIndicator._id;
          });
          setFollowups(filteredFollowups);
        } catch (error) {
          console.error("Error fetching followups:", error);
        }
      } else {
        setFollowups([]);
      }
    };

    loadFollowups();
  }, [selectedIndicator]);

  // Indicator CRUD handlers
  const handleIndicatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!indicatorForm.programme) {
      alert("Le programme est requis");
      return;
    }
    
    if (!indicatorForm.source.length) {
      alert("Au moins une source est requise");
      return;
    }
    
    try {
      const submitData = {
        ...indicatorForm,
        uniteDeMesure: indicatorForm.uniteDeMesure || undefined,
        source: indicatorForm.source.length > 0 ? indicatorForm.source : []
      };

      if (editingIndicatorId) {
        await api.put(`/indicators/${editingIndicatorId}`, submitData);
      } else {
        await api.post("/indicators", submitData);
      }
      resetIndicatorForm();
      setEditingIndicatorId(null);
      fetchIndicators();
    } catch (error) {
      console.error("Error saving indicator:", error);
      alert("Erreur lors de la sauvegarde de l'indicateur. Veuillez vérifier les données du formulaire.");
    }
  };

  const handleIndicatorEdit = (indicator: Indicator) => {
    const uniteDeMesureId = typeof indicator.uniteDeMesure === 'object' && indicator.uniteDeMesure?._id 
      ? indicator.uniteDeMesure._id 
      : (typeof indicator.uniteDeMesure === 'string' ? indicator.uniteDeMesure : "");
    setIndicatorForm({
      code: indicator.code,
      name: indicator.name,
      type: indicator.type || "",
      uniteDeMesure: uniteDeMesureId,
      programme: typeof indicator.programme === 'object' ? indicator.programme._id : indicator.programme,
      source: indicator.source.map(s => typeof s === 'object' ? s._id : s),
      metaData: typeof indicator.metaData === 'object' && indicator.metaData?._id ? indicator.metaData._id : (typeof indicator.metaData === 'string' ? indicator.metaData : "")
    });
    setEditingIndicatorId(indicator._id);
  };

  const handleIndicatorDelete = async (id: string) => {
    if (confirm("Are you sure? This will also delete all related data and followups.")) {
      try {
        await api.delete(`/indicators/${id}`);
        fetchIndicators();
        if (selectedIndicator?._id === id) {
          setSelectedIndicator(null);
          setFollowups([]);
        }
      } catch (error) {
        console.error("Error deleting indicator:", error);
      }
    }
  };

const handleIndicatorSelect = (indicator: Indicator) => {
  setSelectedIndicator(indicator);
  setEditingDataIndex(null);
  setIndicatorDataForm({
    geoLocation: { type: undefined, referenceId: undefined },
    ageRange: undefined,
    gender: undefined,
    socialCategory: undefined,
    ref_year: undefined,
    ref_value: undefined,
    target_year: undefined,
    target_value: undefined,
  });
};  // Indicator Data CRUD handlers
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndicatorDataForm({ 
      ...indicatorDataForm, 
      [name]: name.includes('year') || name.includes('value') 
        ? (value === '' ? undefined : Number(value))
        : value 
    });
  };

  const handleDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndicator) return;

    try {
      const updatedIndicator = { ...selectedIndicator };
      
      if (editingDataIndex !== null) {
        // Update existing data
        updatedIndicator.data[editingDataIndex] = indicatorDataForm;
      } else {
        // Add new data
        updatedIndicator.data = [...updatedIndicator.data, indicatorDataForm];
      }

      await api.put(`/indicators/${selectedIndicator._id}`, updatedIndicator);
      
      setSelectedIndicator(updatedIndicator);
      setEditingDataIndex(null);
      setIndicatorDataForm({
        geoLocation: { type: undefined, referenceId: undefined },
        ageRange: undefined,
        gender: undefined,
        socialCategory: undefined,
        ref_year: undefined,
        ref_value: undefined,
        target_year: undefined,
        target_value: undefined,
      });
      fetchIndicators();
    } catch (error) {
      console.error("Error saving indicator data:", error);
    }
  };

  const handleDataEdit = (dataItem: IndicatorData, index: number) => {
    setIndicatorDataForm(dataItem);
    setEditingDataIndex(index);
  };

  const handleDataDelete = async (index: number) => {
    if (!selectedIndicator || !confirm("Are you sure?")) return;

    try {
      const updatedIndicator = { ...selectedIndicator };
      updatedIndicator.data.splice(index, 1);

      await api.put(`/indicators/${selectedIndicator._id}`, updatedIndicator);
      setSelectedIndicator(updatedIndicator);
      fetchIndicators();
      fetchFollowups(selectedIndicator._id);
    } catch (error) {
      console.error("Error deleting indicator data:", error);
    }
  };

  // Followup CRUD handlers
  const handleFollowupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFollowupForm({ ...followupForm, [e.target.name]: e.target.value });
  };

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const followupData = {
        indicator: followupForm.indicator,
        dataIndex: parseInt(followupForm.dataIndex),
        year: parseInt(followupForm.year),
        value: parseFloat(followupForm.value)
      };

      if (editingFollowupId) {
        await api.put(`/indicator-followups/${editingFollowupId}`, followupData);
      } else {
        await api.post("/indicator-followups", followupData);
      }
      setFollowupForm({ indicator: "", dataIndex: "", year: "", value: "" });
      setEditingFollowupId(null);
      fetchFollowups(selectedIndicator?._id);
    } catch (error) {
      console.error("Error saving followup:", error);
    }
  };

  const handleFollowupEdit = (followup: Followup) => {
    const followupIndicatorId = typeof followup.indicator === 'string' ? followup.indicator : followup.indicator._id;
    setFollowupForm({ 
      indicator: followupIndicatorId,
      dataIndex: followup.dataIndex.toString(),
      year: followup.year.toString(), 
      value: followup.value.toString() 
    });
    setEditingFollowupId(followup._id);
  };

  const handleFollowupDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(`/indicator-followups/${id}`);
        fetchFollowups(selectedIndicator?._id);
      } catch (error) {
        console.error("Error deleting followup:", error);
      }
    }
  };

  const getDecoupageOptions = (type: string): DecoupageEntity[] => {
    switch (type) {
      case 'Province': return decoupageEntities.provinces;
      case 'Departement': return decoupageEntities.departements;
      case 'Sous-prefecture': return decoupageEntities.sousPrefectures;
      case 'Canton': return decoupageEntities.cantons;
      case 'Commune': return decoupageEntities.communes;
      case 'Village': return decoupageEntities.villages;
      default: return [];
    }
  };

  const getDecoupageEntityName = (type?: string, referenceId?: string): string => {
    if (type === 'Global') return 'National';
    if (!type || !referenceId) return type || '-';
    const entities = getDecoupageOptions(type);
    const entity = entities.find(e => e._id === referenceId);
    return entity ? `${type}: ${entity.name}` : `${type}: (${referenceId})`;
  };

  const getDataOptionsForFollowup = () => {
    if (!selectedIndicator) return [];
    return selectedIndicator.data.map((d, idx) => ({
      value: `${selectedIndicator._id}:${idx}`,
              label: `${getDecoupageEntityName(d.geoLocation?.type, d.geoLocation?.referenceId)} - ${d.ageRange || 'All ages'} - ${d.gender || 'Both'}`,
      indicatorId: selectedIndicator._id,
      dataIndex: idx
    }));
  };

  // Global/National summary calculation
  const calculateGlobalSummary = () => {
    if (!selectedIndicator || followups.length === 0) return null;

    const globalSummary = {
      years: [] as number[],
      totalValues: [] as { year: number; value: number }[]
    };

    // Group followups by year
    const followupsByYear = followups.reduce((acc, followup) => {
      if (!acc[followup.year]) {
        acc[followup.year] = [];
      }
      acc[followup.year].push(followup);
      return acc;
    }, {} as Record<number, typeof followups>);

    // Calculate global values for each year (sum, average, or other aggregation method)
    for (const [year, yearFollowups] of Object.entries(followupsByYear)) {
      const yearNumber = parseInt(year);
      
      // Calculate total/average for the year across all data entries
      const totalValue = yearFollowups.reduce((sum, f) => sum + f.value, 0);
      const averageValue = totalValue / yearFollowups.length;
      
      globalSummary.years.push(yearNumber);
      globalSummary.totalValues.push({
        year: yearNumber,
        value: Math.round(averageValue * 100) / 100 // Use average as global indicator
      });
    }

    // Sort by year
    globalSummary.years.sort((a, b) => a - b);
    globalSummary.totalValues.sort((a, b) => a.year - b.year);

    return globalSummary;
  };

  const getGlobalChartData = () => {
    const globalSummary = calculateGlobalSummary();
    if (!globalSummary) return null;

    return {
      labels: globalSummary.years.map(y => y.toString()),
      datasets: [
        {
          label: 'Moyenne nationale',
          data: globalSummary.totalValues.map(tv => tv.value),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 8
        }
      ]
    };
  };
  const getGlobalStatistics = () => {
    if (!selectedIndicator || followups.length === 0) {
      return {
        averageValue: 0,
        latestValue: 0,
        totalDataPoints: 0,
        yearRange: '',
        trendDirection: 'stable',
        growthRate: 0
      };
    }

    const values = followups.map(f => f.value);
    const years = followups.map(f => f.year);
    const sortedByYear = [...followups].sort((a, b) => a.year - b.year);
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latestValue = sortedByYear[sortedByYear.length - 1]?.value || 0;
    const earliestValue = sortedByYear[0]?.value || 0;
    const yearRange = `${Math.min(...years)} - ${Math.max(...years)}`;
    
    let trendDirection = 'stable';
    if (sortedByYear.length >= 2) {
      const recentValues = sortedByYear.slice(-2);
      trendDirection = recentValues[1].value > recentValues[0].value ? 'up' : 
                     recentValues[1].value < recentValues[0].value ? 'down' : 'stable';
    }
    
    const yearSpan = Math.max(...years) - Math.min(...years);
    const growthRate = yearSpan > 0 ? 
      Math.round(((latestValue - earliestValue) / earliestValue) * 100 / yearSpan) : 0;

    return {
      averageValue: Math.round(averageValue * 100) / 100,
      latestValue,
      totalDataPoints: followups.length,
      yearRange,
      trendDirection,
      growthRate
    };
  };

  const getDataEntryStatistics = () => {
    if (!selectedIndicator || followups.length === 0) return [];

    return selectedIndicator.data.map((dataEntry, index) => {
      const relatedFollowups = followups.filter(f => f.dataIndex === index);
      
      if (relatedFollowups.length === 0) {
        return {
          dataIndex: index,
          dataLabel: `${getDecoupageEntityName(dataEntry.geoLocation?.type, dataEntry.geoLocation?.referenceId)} - ${dataEntry.ageRange || 'No age'} - ${dataEntry.gender || 'No gender'}`,
          followupCount: 0,
          averageValue: 0,
          latestValue: 0,
          trendDirection: 'stable',
          hasTarget: !!(dataEntry.target_value),
          targetProgress: 0
        };
      }

      const values = relatedFollowups.map(f => f.value);
      const sortedByYear = [...relatedFollowups].sort((a, b) => a.year - b.year);
      
      const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      const latestValue = sortedByYear[sortedByYear.length - 1]?.value || 0;
      
      let trendDirection = 'stable';
      if (sortedByYear.length >= 2) {
        const recent = sortedByYear.slice(-2);
        trendDirection = recent[1].value > recent[0].value ? 'up' : 
                        recent[1].value < recent[0].value ? 'down' : 'stable';
      }

      const targetProgress = dataEntry.target_value && dataEntry.ref_value ? 
        Math.round(((latestValue - dataEntry.ref_value) / (dataEntry.target_value - dataEntry.ref_value)) * 100) : 0;

      return {
        dataIndex: index,
        dataLabel: `${getDecoupageEntityName(dataEntry.geoLocation?.type, dataEntry.geoLocation?.referenceId)} - ${dataEntry.ageRange || 'No age'} - ${dataEntry.gender || 'No gender'}`,
        followupCount: relatedFollowups.length,
        averageValue: Math.round(averageValue * 100) / 100,
        latestValue,
        trendDirection,
        hasTarget: !!(dataEntry.target_value),
        targetProgress,
        referenceValue: dataEntry.ref_value,
        targetValue: dataEntry.target_value
      };
    });
  };

  // Chart data generation
  const getLineChartData = () => {
    if (!selectedIndicator || followups.length === 0) return null;

    const sortedFollowups = [...followups].sort((a, b) => a.year - b.year);
    const years = [...new Set(sortedFollowups.map(f => f.year))].sort();
    
    // Get data for each data entry
    const datasets = selectedIndicator.data.map((dataEntry, index) => {
      const entryFollowups = followups.filter(f => f.dataIndex === index);
      const data = years.map(year => {
        const followup = entryFollowups.find(f => f.year === year);
        return followup ? followup.value : null;
      });

      return {
        label: `${getDecoupageEntityName(dataEntry.geoLocation?.type, dataEntry.geoLocation?.referenceId)} (${dataEntry.ageRange || 'All'})`,
        data,
        borderColor: `hsl(${(index * 360 / selectedIndicator.data.length)}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 360 / selectedIndicator.data.length)}, 70%, 50%, 0.1)`,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: `hsl(${(index * 360 / selectedIndicator.data.length)}, 70%, 50%)`,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        spanGaps: true
      };
    });

    return {
      labels: years.map(y => y.toString()),
      datasets
    };
  };

  const getBarChartData = () => {
    if (!selectedIndicator || followups.length === 0) return null;

    const dataStats = getDataEntryStatistics();
    
    return {
      labels: dataStats.map(stat => stat.dataLabel.substring(0, 30) + '...'),
      datasets: [
        {
          label: 'Average Value',
          data: dataStats.map(stat => stat.averageValue),
          backgroundColor: dataStats.map((_, index) => 
            `hsla(${(index * 360 / dataStats.length)}, 70%, 50%, 0.8)`
          ),
          borderColor: dataStats.map((_, index) => 
            `hsl(${(index * 360 / dataStats.length)}, 70%, 50%)`
          ),
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Système de gestion des indicateurs</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Indicators List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Indicateurs</h2>
          
          {/* Add/Edit Indicator Form */}
          <form onSubmit={handleIndicatorSubmit} className="mb-4 space-y-2">
            <input 
              name="code" 
              value={indicatorForm.code} 
              onChange={(e) => setIndicatorForm({...indicatorForm, code: e.target.value})} 
              placeholder="Code de l'indicateur" 
              className="w-full border p-2 rounded" 
              required 
            />
            <input 
              name="name" 
              value={indicatorForm.name} 
              onChange={(e) => setIndicatorForm({...indicatorForm, name: e.target.value})} 
              placeholder="Nom de l'indicateur" 
              className="w-full border p-2 rounded" 
              required 
            />
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={indicatorForm.type}
                onChange={(e) => setIndicatorForm({...indicatorForm, type: e.target.value})}
                className="w-full border p-2 rounded text-sm"
                required
              >
                <option value="">Select Type</option>
                <option value="Indicateur d'impact socio-economique">Indicateur d'impact socio-economique</option>
                <option value="Indicateur de resultat de programme">Indicateur de resultat de programme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Programme *</label>
              <select
                value={indicatorForm.programme}
                onChange={(e) => setIndicatorForm({...indicatorForm, programme: e.target.value})}
                className="w-full border p-2 rounded text-sm"
                required
              >
                <option value="">Select Programme</option>
                {programmes.map(prog => (
                  <option key={prog._id} value={prog._id}>
                    {prog.code} - {prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit of Measure</label>
              <select
                value={indicatorForm.uniteDeMesure}
                onChange={(e) => setIndicatorForm({...indicatorForm, uniteDeMesure: e.target.value})}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Select Unit</option>
                {unitesDeMesure.map(unite => (
                  <option key={unite._id} value={unite._id}>
                    {unite.code} - {unite.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sources *</label>
              <select
                multiple
                value={indicatorForm.source}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setIndicatorForm({...indicatorForm, source: selectedOptions});
                }}
                className="w-full border p-2 rounded h-20 text-sm"
                size={4}
              >
                {sources.map(source => (
                  <option key={source._id} value={source._id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple</p>
            </div>

          {/* MetaData Section */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Fichier/Métadonnée associée</label>
            <select
              className="w-full border p-2 rounded"
              value={indicatorForm.metaData}
              onChange={e => setIndicatorForm(prev => ({ ...prev, metaData: e.target.value }))}
            >
              <option value="">Sélectionner un fichier/métadonnée</option>
              {metaDataOptions.map(meta => (
                <option key={meta._id} value={meta._id}>
                  {meta.code ? `${meta.code} - ` : ''}{meta.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Ajoutez de nouveaux fichiers/métadonnées dans la section dédiée.</p>
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4">
            {editingIndicatorId ? "Modifier l'indicateur" : "Ajouter l'indicateur"}
          </button>
          {editingIndicatorId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingIndicatorId(null);
                resetIndicatorForm();
              }}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 mt-2"
            >
              Annuler
            </button>
          )}
          </form>

          {/* Indicators List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && (
              <div className="text-center py-4">
                <div className="animate-pulse text-gray-500">Chargement des indicateurs...</div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}
            
            {!loading && !error && Array.isArray(indicators) && indicators.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Aucun indicateur trouvé. Ajoutez-en un ci-dessus.
              </div>
            )}
            
            {!loading && !error && Array.isArray(indicators) && indicators.map((indicator) => (
              <div 
                key={indicator._id} 
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedIndicator?._id === indicator._id 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleIndicatorSelect(indicator)}
              >
                <div className="font-semibold">{indicator.code}</div>
                <div className="text-sm text-gray-600">{indicator.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Programme: {typeof indicator.programme === 'object' ? indicator.programme.name : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  Data entries: {indicator.data?.length || 0} | Sources: {indicator.source?.length || 0}
                </div>
                <div className="mt-2 flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndicatorEdit(indicator);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndicatorDelete(indicator._id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Indicator Details & Followups */}
        <div className="lg:col-span-2 space-y-6">
          {selectedIndicator ? (
            <>
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow border-b">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'data'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
                    }`}
                  >
                    Gestion des données
                  </button>
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'global'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    Vue globale/nationale
                  </button>
                  <button
                    onClick={() => setActiveTab('statistics')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'statistics'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Statistiques et analyses
                  </button>
                </nav>
              </div>

              {activeTab === 'data' && (
                <div className="space-y-6">
              {/* Indicator Data Section */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-bold mb-4">
                  Data for: {selectedIndicator.code} - {selectedIndicator.name}
                </h3>

                {/* Add/Edit Data Form */}
                <form onSubmit={handleDataSubmit} className="mb-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Geographic Location Type</label>
                    <select 
                      name="geoLocationType" 
                      value={indicatorDataForm.geoLocation?.type || ''} 
                      onChange={(e) => setIndicatorDataForm(prev => ({
                        ...prev,
                        geoLocation: { 
                          ...prev.geoLocation, 
                          type: e.target.value as 'Global' | 'Province' | 'Departement' | 'Sous-prefecture' | 'Canton' | 'Commune' | 'Village'
                        }
                      }))}
                      className="w-full border p-2 rounded" 
                    >
                      <option value="">Sélectionner le type de localisation</option>
                      {GEO_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  {indicatorDataForm.geoLocation?.type && indicatorDataForm.geoLocation.type !== 'Global' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select {indicatorDataForm.geoLocation.type}</label>
                      <select 
                        name="geoLocationReference" 
                        value={indicatorDataForm.geoLocation?.referenceId || ''} 
                        onChange={(e) => setIndicatorDataForm(prev => ({
                          ...prev,
                          geoLocation: { 
                            ...prev.geoLocation, 
                            referenceId: e.target.value
                          }
                        }))}
                        className="w-full border p-2 rounded" 
                      >
                        <option value="">Select {indicatorDataForm.geoLocation.type}</option>
                        {getDecoupageOptions(indicatorDataForm.geoLocation.type).map(entity => (
                          <option key={entity._id} value={entity._id}>
                            {entity.name} ({entity.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <select 
                      name="ageRange" 
                      value={indicatorDataForm.ageRange || ''} 
                      onChange={(e) => setIndicatorDataForm(prev => ({
                        ...prev,
                        ageRange: e.target.value as '0-4' | '5-9' | '10-14' | '15-19' | '20-24' | '25-29' | '30-34' | 
                                 '35-39' | '40-44' | '45-49' | '50-54' | '55-59' | '60-64' | '65+' |
                                 '0-14' | '15-49' | '15-64' | '18+' | '25-64' | 'Tous les âges'
                      }))}
                      className="w-full border p-2 rounded" 
                    >
                      <option value="">Sélectionner la tranche d'âge</option>
                      {AGE_RANGES.map(ageRange => (
                        <option key={ageRange} value={ageRange}>{ageRange}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select 
                      name="gender" 
                      value={indicatorDataForm.gender || ''} 
                      onChange={(e) => setIndicatorDataForm(prev => ({
                        ...prev,
                        gender: e.target.value as 'Masculin' | 'Féminin' | 'Les deux' | 'Autre'
                      }))}
                      className="w-full border p-2 rounded" 
                    >
                      <option value="">Sélectionner le sexe</option>
                      {GENDERS.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie sociale</label>
                    <select 
                      name="socialCategory" 
                      value={indicatorDataForm.socialCategory || ''} 
                      onChange={(e) => setIndicatorDataForm(prev => ({
                        ...prev,
                        socialCategory: e.target.value as 'Urbain' | 'Rural' | 'Pauvre' | 'Non pauvre' | 'Vulnérable' | 
                                       'Handicapé' | 'Indigène' | 'Réfugié' | 'Déplacé' | 'Jeune' | 
                                       'Âgé' | 'Toutes les catégories'
                      }))}
                      className="w-full border p-2 rounded" 
                    >
                      <option value="">Sélectionner la catégorie sociale</option>
                      {SOCIAL_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <input 
                    name="ref_year" 
                    value={indicatorDataForm.ref_year || ''} 
                    onChange={handleDataChange} 
                    placeholder="Reference Year" 
                    type="number"
                    className="border p-2 rounded" 
                  />
                  <input 
                    name="ref_value" 
                    value={indicatorDataForm.ref_value || ''} 
                    onChange={handleDataChange} 
                    placeholder="Reference Value" 
                    type="number"
                    step="any"
                    className="border p-2 rounded" 
                  />
                  <input 
                    name="target_year" 
                    value={indicatorDataForm.target_year || ''} 
                    onChange={handleDataChange} 
                    placeholder="Target Year" 
                    type="number"
                    className="border p-2 rounded" 
                  />
                  <input 
                    name="target_value" 
                    value={indicatorDataForm.target_value || ''} 
                    onChange={handleDataChange} 
                    placeholder="Target Value" 
                    type="number"
                    step="any"
                    className="border p-2 rounded" 
                  />
                  <div className="col-span-2 flex space-x-2">
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      {editingDataIndex !== null ? "Update Data" : "Add Data"}
                    </button>
                    {editingDataIndex !== null && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingDataIndex(null);
                          setIndicatorDataForm({
                            geoLocation: { type: undefined, referenceId: undefined },
                            ageRange: undefined,
                            gender: undefined,
                            socialCategory: undefined,
                            ref_year: undefined,
                            ref_value: undefined,
                            target_year: undefined,
                            target_value: undefined,
                          });
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-2 py-1 text-xs">Location</th>
                        <th className="border px-2 py-1 text-xs">Age</th>
                        <th className="border px-2 py-1 text-xs">Gender</th>
                        <th className="border px-2 py-1 text-xs">Category</th>
                        <th className="border px-2 py-1 text-xs">Ref Year</th>
                        <th className="border px-2 py-1 text-xs">Ref Value</th>
                        <th className="border px-2 py-1 text-xs">Target Year</th>
                        <th className="border px-2 py-1 text-xs">Target Value</th>
                        <th className="border px-2 py-1 text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIndicator.data?.map((dataItem, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 text-xs">
                            {getDecoupageEntityName(dataItem.geoLocation?.type, dataItem.geoLocation?.referenceId)}
                          </td>
                          <td className="border px-2 py-1 text-xs">{dataItem.ageRange || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.gender || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.socialCategory || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.ref_year || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.ref_value || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.target_year || '-'}</td>
                          <td className="border px-2 py-1 text-xs">{dataItem.target_value || '-'}</td>
                          <td className="border px-2 py-1 text-xs">
                            <button 
                              onClick={() => handleDataEdit(dataItem, index)} 
                              className="mr-1 text-blue-600 hover:underline text-xs"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDataDelete(index)} 
                              className="text-red-600 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Followups Section */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-bold mb-4">Followups</h3>

                {/* Add/Edit Followup Form */}
                <form onSubmit={handleFollowupSubmit} className="mb-4 flex gap-2">
                  <select 
                    name="dataIndex" 
                    value={followupForm.dataIndex} 
                    onChange={(e) => {
                      const selectedOption = getDataOptionsForFollowup().find(opt => opt.dataIndex.toString() === e.target.value);
                      if (selectedOption) {
                        setFollowupForm({
                          ...followupForm,
                          indicator: selectedOption.indicatorId,
                          dataIndex: e.target.value
                        });
                      }
                    }}
                    className="border p-2 rounded flex-1" 
                    required
                  >
                    <option value="">Select Data Entry</option>
                    {getDataOptionsForFollowup().map(opt => (
                      <option key={opt.dataIndex} value={opt.dataIndex}>{opt.label}</option>
                    ))}
                  </select>
                  <input 
                    name="year" 
                    value={followupForm.year} 
                    onChange={handleFollowupChange} 
                    placeholder="Year" 
                    className="border p-2 rounded w-24" 
                    required 
                    type="number" 
                  />
                  <input 
                    name="value" 
                    value={followupForm.value} 
                    onChange={handleFollowupChange} 
                    placeholder="Value" 
                    className="border p-2 rounded w-32" 
                    required 
                    type="number" 
                    step="any"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {editingFollowupId ? "Update" : "Add"}
                  </button>
                  {editingFollowupId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingFollowupId(null);
                        setFollowupForm({ indicator: "", dataIndex: "", year: "", value: "" });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  )}
                </form>

                {/* Followups Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-4 py-2">Data Reference</th>
                        <th className="border px-4 py-2">Year</th>
                        <th className="border px-4 py-2">Value</th>
                        <th className="border px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followups.map((followup) => {
                        const dataEntry = selectedIndicator?.data[followup.dataIndex];
                        const dataLabel = dataEntry 
                          ? `${getDecoupageEntityName(dataEntry.geoLocation?.type, dataEntry.geoLocation?.referenceId)} - ${dataEntry.ageRange || 'All ages'} - ${dataEntry.gender || 'Both'}`
                          : `Data entry ${followup.dataIndex}`;
                        
                        return (
                          <tr key={followup._id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{dataLabel}</td>
                            <td className="border px-4 py-2">{followup.year}</td>
                            <td className="border px-4 py-2">{followup.value}</td>
                            <td className="border px-4 py-2">
                              <button 
                                onClick={() => handleFollowupEdit(followup)} 
                                className="mr-2 text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleFollowupDelete(followup._id)} 
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
                </div>
              )}

              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  {(() => {
                    const globalStats = getGlobalStatistics();
                    const dataStats = getDataEntryStatistics();
                    const lineChartData = getLineChartData();
                    const barChartData = getBarChartData();

                    return (
                      <>
                        {followups.length === 0 ? (
                          <div className="bg-white rounded-lg shadow p-8 text-center">
                            <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-600">No followup data available</p>
                            <p className="text-gray-500">Add followup data to see statistics and analytics</p>
                          </div>
                        ) : (
                          <>
                            {/* Global Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-blue-100 text-sm">Average Value</p>
                                    <p className="text-3xl font-bold">{globalStats.averageValue}</p>
                                  </div>
                                  <Target className="h-10 w-10 text-blue-200" />
                                </div>
                              </div>
                              
                              <div className={`rounded-2xl p-6 text-white ${
                                globalStats.trendDirection === 'up' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                globalStats.trendDirection === 'down' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                'bg-gradient-to-br from-gray-500 to-gray-600'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white/80 text-sm">Trend</p>
                                    <p className="text-2xl font-bold capitalize">{
                                      globalStats.trendDirection === 'up' ? '↗ Rising' : 
                                      globalStats.trendDirection === 'down' ? '↘ Falling' : '→ Stable'
                                    }</p>
                                  </div>
                                  <TrendingUp className="h-10 w-10 text-white/70" />
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-purple-100 text-sm">Growth Rate</p>
                                    <p className="text-3xl font-bold">{globalStats.growthRate}%</p>
                                  </div>
                                  <Activity className="h-10 w-10 text-purple-200" />
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-orange-100 text-sm">Data Points</p>
                                    <p className="text-3xl font-bold">{globalStats.totalDataPoints}</p>
                                  </div>
                                  <BarChart3 className="h-10 w-10 text-orange-200" />
                                </div>
                              </div>
                            </div>

                            {/* Charts */}
                            {lineChartData && (
                              <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                  <LineChart className="h-6 w-6 text-indigo-500" />
                                  Evolution by Data Entry
                                </h3>
                                <div className="h-80">
                                  <Line 
                                    data={lineChartData} 
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: { position: 'top' as const },
                                        tooltip: {
                                          callbacks: {
                                            label: function(context: unknown) {
                                              const ctx = context as { dataset: { label: string }; parsed: { y: number } };
                                              return `${ctx.dataset.label}: ${ctx.parsed.y}`;
                                            }
                                          }
                                        }
                                      },
                                      scales: {
                                        y: { beginAtZero: true },
                                        x: { grid: { display: false } }
                                      }
                                    }} 
                                  />
                                </div>
                              </div>
                            )}

                            {barChartData && (
                              <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                                  Average Values by Data Entry
                                </h3>
                                <div className="h-80">
                                  <Bar 
                                    data={barChartData}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      plugins: {
                                        legend: { display: false }
                                      },
                                      scales: {
                                        y: { beginAtZero: true },
                                        x: { 
                                          ticks: { maxRotation: 45, minRotation: 45 }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Data Entry Statistics Table */}
                            <div className="bg-white rounded-lg shadow p-6">
                              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <PieChart className="h-6 w-6 text-indigo-500" />
                                Detailed Statistics by Data Entry
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full border">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="border px-4 py-2 text-left">Data Entry</th>
                                      <th className="border px-4 py-2 text-left">Followups</th>
                                      <th className="border px-4 py-2 text-left">Average</th>
                                      <th className="border px-4 py-2 text-left">Latest</th>
                                      <th className="border px-4 py-2 text-left">Trend</th>
                                      <th className="border px-4 py-2 text-left">Target Progress</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dataStats.map((stat, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2 text-sm">{stat.dataLabel}</td>
                                        <td className="border px-4 py-2 text-center">{stat.followupCount}</td>
                                        <td className="border px-4 py-2 text-center">{stat.averageValue}</td>
                                        <td className="border px-4 py-2 text-center">{stat.latestValue}</td>
                                        <td className="border px-4 py-2 text-center">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            stat.trendDirection === 'up' ? 'bg-green-100 text-green-800' :
                                            stat.trendDirection === 'down' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {stat.trendDirection === 'up' ? '↗ Up' : 
                                             stat.trendDirection === 'down' ? '↘ Down' : '→ Stable'}
                                          </span>
                                        </td>
                                        <td className="border px-4 py-2 text-center">
                                          {stat.hasTarget ? (
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                  className={`h-2 rounded-full ${
                                                    stat.targetProgress >= 100 ? 'bg-green-500' :
                                                    stat.targetProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                  }`}
                                                  style={{ width: `${Math.min(stat.targetProgress, 100)}%` }}
                                                ></div>
                                              </div>
                                              <span className="text-xs">{stat.targetProgress}%</span>
                                            </div>
                                          ) : (
                                            <span className="text-gray-400 text-xs">No target</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'global' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Vue globale/nationale</h3>
                      <div className="text-sm text-gray-500">
                        Synthèse de toutes les données par année
                      </div>
                    </div>

                    {(() => {
                      const globalSummary = calculateGlobalSummary();
                      const globalChartData = getGlobalChartData();

                      if (!globalSummary || globalSummary.totalValues.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <Target className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-xl text-gray-600">Aucune donnée de suivi disponible</p>
                            <p className="text-gray-500">Ajoutez des données de suivi pour voir la synthèse nationale</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Global Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-green-100 text-sm">Années couvertes</p>
                                  <p className="text-3xl font-bold">{globalSummary.years.length}</p>
                                  <p className="text-green-100 text-xs">
                                    {Math.min(...globalSummary.years)} - {Math.max(...globalSummary.years)}
                                  </p>
                                </div>
                                <Activity className="h-10 w-10 text-green-200" />
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-blue-100 text-sm">Valeur la plus récente</p>
                                  <p className="text-3xl font-bold">
                                    {globalSummary.totalValues[globalSummary.totalValues.length - 1]?.value || 0}
                                  </p>
                                  <p className="text-blue-100 text-xs">
                                    Année {globalSummary.years[globalSummary.years.length - 1] || 'N/A'}
                                  </p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-blue-200" />
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-purple-100 text-sm">Moyenne globale</p>
                                  <p className="text-3xl font-bold">
                                    {Math.round((globalSummary.totalValues.reduce((sum, tv) => sum + tv.value, 0) / globalSummary.totalValues.length) * 100) / 100}
                                  </p>
                                  <p className="text-purple-100 text-xs">
                                    Sur {globalSummary.totalValues.length} années
                                  </p>
                                </div>
                                <Target className="h-10 w-10 text-purple-200" />
                              </div>
                            </div>
                          </div>

                          {/* Global Chart */}
                          {globalChartData && (
                            <div className="bg-gray-50 rounded-xl p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution nationale</h4>
                              <div className="h-96">
                                <Line 
                                  data={globalChartData} 
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'top' as const,
                                      },
                                      tooltip: {
                                        backgroundColor: '#1f2937',
                                        titleColor: '#f9fafb',
                                        bodyColor: '#f9fafb',
                                        borderColor: '#374151',
                                        borderWidth: 1,
                                        callbacks: {
                                          label: function(context) {
                                            return `${context.dataset.label}: ${context.parsed.y}`;
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      x: {
                                        title: {
                                          display: true,
                                          text: 'Année',
                                          font: { weight: 'bold' }
                                        }
                                      },
                                      y: {
                                        title: {
                                          display: true,
                                          text: 'Valeur moyenne nationale',
                                          font: { weight: 'bold' }
                                        }
                                      }
                                    }
                                  }} 
                                />
                              </div>
                            </div>
                          )}

                          {/* Global Data Table */}
                          <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-900">Données nationales par année</h4>
                              <p className="text-sm text-gray-600">Moyennes calculées à partir de toutes les données régionales</p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur nationale moyenne</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de régions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {globalSummary.totalValues.map((yearData) => {
                                    const yearFollowups = followups.filter(f => f.year === yearData.year);
                                    const uniqueRegions = new Set(yearFollowups.map(f => f.dataIndex)).size;
                                    
                                    return (
                                      <tr key={yearData.year} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{yearData.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{yearData.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{uniqueRegions}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">Select an indicator from the left panel to manage its data and followups</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicatorMasterDetailCrud;
