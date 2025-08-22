/* ============================================================================
   📋 INDICATOR DETAIL PAGE - Page de détail des indicateurs
   ============================================================================
   
   🎯 DESCRIPTION: Page complète de gestion et visualisation des indicateurs
   
   📚 SECTIONS PRINCIPALES:
   
   📦 IMPORTS (ligne ~8)           - Importation des dépendances
   📝 TYPES ET INTERFACES (~60)   - Définitions TypeScript
   🔧 CONSTANTES (~95)             - Configuration et valeurs fixes
   📊 GESTION D'ÉTAT (~130)        - États React et variables d'état
   🔄 FONCTIONS DE RÉCUPÉRATION (~200) - API calls et chargement des données
   🛠️ FONCTIONS UTILITAIRES (~350) - Fonctions helper et validations
   📝 GESTIONNAIRES D'ÉVÉNEMENTS (~450) - Handlers pour les formulaires
   📈 GESTIONNAIRES DES SUIVIS (~550) - Gestion des données de suivi
   📊 CALCULS STATISTIQUES (~650)  - Analyses et métriques
   🎨 FONCTIONS DE POLARITÉ (~700) - Gestion de l'affichage selon polarité
   ⏳ GESTION DES ÉTATS (~720)     - Loading et gestion d'erreurs
   🎨 RENDU PRINCIPAL (~750)       - Interface utilisateur complète
   
   ⚡ FONCTIONNALITÉS:
   - 📊 Gestion des données d'indicateurs
   - 📈 Statistiques avancées et visualisations
   - 🗺️ Filtrage géographique multi-niveaux
   - 📋 Formulaires de saisie et modification
   - 🎯 Affichage adapté selon la polarité
   
   ============================================================================ */

// ============================================================================
// 📦 IMPORTS - Importation des dépendances
// ============================================================================

// React et hooks de base
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Composants UI personnalisés
import Button from '../components/ui/Button';
import GeographicFilterComponent from '../components/GeographicFilter';
import StatisticsDisplay from '../components/StatisticsDisplay';
import FilteredChart from '../components/FilteredChart';

// API et hooks personnalisés
import api from '../lib/api';
import { useFilteredStatistics } from '../hooks/useFilteredStatistics';

// Icônes Lucide React
import { 
  ArrowLeft, 
  BarChart3, 
  Target, 
  Activity,
  TrendingUp,
  PieChart,
  Calendar,
  MapPin,
  Users,
  Tag,
  FileText,
  Filter
} from 'lucide-react';

// Configuration Chart.js
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

// ============================================================================
// 📝 TYPES ET INTERFACES - Définition des types TypeScript
// ============================================================================

// Interface pour les entités de découpage géographique
interface DecoupageEntity {
  _id: string;
  name: string;
  code?: string;
}

// Interface pour les programmes
interface Programme {
  _id: string;
  code: string;
  name: string;
}

// Interface pour les sources de données
interface Source {
  _id: string;
  name: string;
}

// Interface pour les unités de mesure
interface UniteDeMesure {
  _id: string;
  code: string;
  name: string;
}

// Interface pour les métadonnées
interface MetaData {
  _id: string;
  code: string;
  name: string;
}

// Interface pour les données d'indicateur (entrées de données)
interface IndicatorData {
  geoLocation?: {
    type?: 'Global' | 'Province' | 'Departement' | 'Sous-prefecture' | 'Canton' | 'Commune' | 'Village';
    referenceId?: string;
  };
  ageRange?: string;
  gender?: string;
  residentialArea?: string;
  socialCategory?: string;
  ref_year?: number;      // Année de référence
  ref_value?: number;     // Valeur de référence
  target_year?: number;   // Année cible
  target_value?: number;  // Valeur cible
}

// Interface principale pour un indicateur
interface Indicator {
  _id: string;
  code: string;
  name: string;
  type?: string;
  polarityDirection?: 'positive' | 'negative';  // Direction de polarité (positive = augmentation souhaitable)
  uniteDeMesure?: UniteDeMesure | string;
  programme: Programme | string;
  source: (Source | string)[];
  metaData?: MetaData | string;
  data: IndicatorData[];                        // Tableau des entrées de données
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les suivis d'indicateurs
interface Followup {
  _id: string;
  indicator: string | Indicator;
  dataIndex: number;  // Index de l'entrée de données associée
  year: number;       // Année du suivi
  value: number;      // Valeur mesurée
}

// ============================================================================
// 🔧 CONSTANTES ET CONFIGURATIONS - Valeurs statiques et options
// ============================================================================

// Tranches d'âge disponibles pour le filtrage
const AGE_RANGES = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', 
  '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+',
  '0-14', '15-49', '15-64', '18+', '25-64', 'Tout'
];

// Options de genre
const GENDERS = ['Homme', 'Femme', 'Tout'];

// Types de zones résidentielles
const RESIDENTIAL_AREAS = ['Urbain', 'Rural', 'Tout'];

// Catégories sociales disponibles
const SOCIAL_CATEGORIES = [
  'Cadre supérieur', 
  'Cadre moyen/agent de maîtrise',
  'Employé/Ouvrier', 
  'Manoeuvre',
  'Travailleur indépendant',
  'Patron', 
  'Aide familial/Apprenti',
  'Tout'
];

// Types de localisation géographique
const GEO_TYPES = [
  { value: 'Global', label: 'National' },
  { value: 'Province', label: 'Province' },
  { value: 'Departement', label: 'Département' },
  { value: 'Commune', label: 'Commune' },
];

// ============================================================================
// 🎯 COMPOSANT PRINCIPAL - IndicatorDetail
// ============================================================================

const IndicatorDetail = () => {
  // Récupération des paramètres d'URL et navigation
  const { id } = useParams<{ id: string; domaineId: string; programmeId: string }>();
  const navigate = useNavigate();
  
  // ============================================================================
  // 📊 GESTION D'ÉTAT - States du composant
  // ============================================================================
  
  // États principaux des données
  const [indicator, setIndicator] = useState<Indicator | null>(null);     // Indicateur principal
  const [followups, setFollowups] = useState<Followup[]>([]);             // Liste des suivis
  const [loading, setLoading] = useState(true);                           // État de chargement
  const [error, setError] = useState<string | null>(null);                // Gestion des erreurs
  const [activeTab, setActiveTab] = useState<'data' | 'advanced-stats' | 'global'>('data'); // Onglet actif
  
  // Hook pour les statistiques filtrées (onglet Analyses Avancées)
  const {
    statistics: filteredStats,
    chartData: filteredChartData,
    loading: statsLoading,
    error: statsError,
    filter,
    handleFilterChange,
    getPolarityColor: getFilteredPolarityColor,
    getPolarityLabel: getFilteredPolarityLabel,
    formatValue: formatFilteredValue
  } = useFilteredStatistics(id);
  
  // États des formulaires - Gestion des données d'indicateur
  const [indicatorDataForm, setIndicatorDataForm] = useState<IndicatorData>({
    geoLocation: { type: undefined, referenceId: undefined },
    ageRange: undefined,
    gender: undefined,
    residentialArea: undefined,
    socialCategory: undefined,
    ref_year: undefined,      // Année de référence
    ref_value: undefined,     // Valeur de référence
    target_year: undefined,   // Année cible
    target_value: undefined,  // Valeur cible
  });
  const [editingDataIndex, setEditingDataIndex] = useState<number | null>(null); // Index en cours d'édition
  
  // États des formulaires - Gestion des suivis
  const [followupForm, setFollowupForm] = useState({
    indicator: "",
    dataIndex: "",
    year: "",
    value: ""
  });
  const [editingFollowupId, setEditingFollowupId] = useState<string | null>(null); // ID du suivi en cours d'édition

  // État des entités de découpage géographique
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

  // ============================================================================
  // 🔄 FONCTIONS DE RÉCUPÉRATION DE DONNÉES - API calls
  // ============================================================================
  
  // Récupération des détails de l'indicateur
  const fetchIndicator = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/indicators/${id}`);
      setIndicator(res.data);
    } catch (error) {
      console.error("Error fetching indicator:", error);
      setError("Échec du chargement de l'indicateur.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Récupération des suivis de l'indicateur
  const fetchFollowups = useCallback(async () => {
    try {
      const res = await api.get("/indicator-followups");
      // Filtrer les suivis pour cet indicateur spécifique
      const filteredFollowups = res.data.filter((f: Followup) => {
        const followupIndicatorId = typeof f.indicator === 'string' ? f.indicator : f.indicator._id;
        return followupIndicatorId === id;
      });
      setFollowups(filteredFollowups);
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  }, [id]);

  // Récupération des entités de découpage géographique
  const fetchDecoupageEntities = useCallback(async () => {
    try {
      // Appels parallèles pour toutes les entités géographiques
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
  }, []);

  // Initialisation des données au montage du composant
  useEffect(() => {
    fetchIndicator();
    fetchFollowups();
    fetchDecoupageEntities();
  }, [fetchIndicator, fetchFollowups, fetchDecoupageEntities]);

  // ============================================================================
  // 🛠️ FONCTIONS UTILITAIRES - Helpers et fonctions de calcul
  // ============================================================================
  
  // Obtenir les options de découpage selon le type
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

  // Obtenir le nom d'une entité de découpage
  const getDecoupageEntityName = (type?: string, referenceId?: string): string => {
    if (type === 'Global') return 'National';
    if (!type || !referenceId) return type || '-';
    const entities = getDecoupageOptions(type);
    const entity = entities.find(e => e._id === referenceId);
    return entity ? `${type}: ${entity.name}` : `${type}: (${referenceId})`;
  };

  // ============================================================================
  // 📝 GESTIONNAIRES D'ÉVÉNEMENTS - Gestion des formulaires et actions
  // ============================================================================
  
  // Gestion des changements dans le formulaire de données d'indicateur
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIndicatorDataForm({ 
      ...indicatorDataForm, 
      [name]: name.includes('year') || name.includes('value') 
        ? (value === '' ? undefined : Number(value))  // Conversion en nombre pour les années et valeurs
        : value 
    });
  };

  // Soumission du formulaire de données d'indicateur
  const handleDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicator) return;

    try {
      const updatedIndicator = { ...indicator };
      
      // Mise à jour ou ajout d'une nouvelle entrée de données
      if (editingDataIndex !== null) {
        updatedIndicator.data[editingDataIndex] = indicatorDataForm;
      } else {
        updatedIndicator.data = [...updatedIndicator.data, indicatorDataForm];
      }

      // Préparation des données pour le backend - conversion des objets peuplés en ObjectIds
      const updatePayload = {
        code: updatedIndicator.code,
        name: updatedIndicator.name,
        type: updatedIndicator.type,
        polarityDirection: updatedIndicator.polarityDirection,
        uniteDeMesure: typeof updatedIndicator.uniteDeMesure === 'object' && updatedIndicator.uniteDeMesure?._id 
          ? updatedIndicator.uniteDeMesure._id 
          : updatedIndicator.uniteDeMesure,
        programme: typeof updatedIndicator.programme === 'object' && updatedIndicator.programme?._id
          ? updatedIndicator.programme._id
          : updatedIndicator.programme,
        source: updatedIndicator.source.map(s => typeof s === 'object' && s._id ? s._id : s),
        metaData: typeof updatedIndicator.metaData === 'object' && updatedIndicator.metaData?._id
          ? updatedIndicator.metaData._id
          : updatedIndicator.metaData,
        // Nettoyage et validation des entrées de données
        data: updatedIndicator.data.map(dataEntry => {
          const cleanedEntry = { ...dataEntry };
          
          // 🧹 Nettoyage de la catégorie sociale
          if (cleanedEntry.socialCategory) {
            cleanedEntry.socialCategory = cleanedEntry.socialCategory.trim();
            if (!SOCIAL_CATEGORIES.includes(cleanedEntry.socialCategory)) {
              console.warn(`Invalid socialCategory found: "${cleanedEntry.socialCategory}". Setting to undefined.`);
              cleanedEntry.socialCategory = undefined;
            }
          }
          
          // 🧹 Validation des autres champs énumérés
          if (cleanedEntry.ageRange && !AGE_RANGES.includes(cleanedEntry.ageRange)) {
            console.warn(`Invalid ageRange found: "${cleanedEntry.ageRange}". Setting to undefined.`);
            cleanedEntry.ageRange = undefined;
          }
          
          if (cleanedEntry.gender && !GENDERS.includes(cleanedEntry.gender)) {
            console.warn(`Invalid gender found: "${cleanedEntry.gender}". Setting to undefined.`);
            cleanedEntry.gender = undefined;
          }
          
          if (cleanedEntry.residentialArea && !RESIDENTIAL_AREAS.includes(cleanedEntry.residentialArea)) {
            console.warn(`Invalid residentialArea found: "${cleanedEntry.residentialArea}". Setting to undefined.`);
            cleanedEntry.residentialArea = undefined;
          }
          
          return cleanedEntry;
        })
      };

      // 🐛 Logs de débogage pour le développement
      console.log('Update payload:', updatePayload);
      console.log('Programme ID:', updatePayload.programme);
      console.log('Programme type:', typeof updatePayload.programme);
      console.log('Data being sent:', updatePayload.data);
      
      // Logs détaillés de chaque entrée de données
      updatePayload.data.forEach((dataEntry, index) => {
        console.log(`Data entry ${index}:`, dataEntry);
        if (dataEntry.socialCategory) {
          console.log(`  socialCategory at index ${index}: "${dataEntry.socialCategory}"`);
          console.log(`  socialCategory length: ${dataEntry.socialCategory.length}`);
          console.log(`  socialCategory charCodes:`, [...dataEntry.socialCategory].map(c => c.charCodeAt(0)));
        }
      });
      
      console.log('First data entry:', updatePayload.data[0]);
      if (updatePayload.data[0]) {
        console.log('Age range value:', updatePayload.data[0].ageRange);
        console.log('Age range type:', typeof updatePayload.data[0].ageRange);
      }

      // Envoi de la mise à jour vers l'API
      await api.put(`/indicators/${indicator._id}`, updatePayload);
      
      // Mise à jour des états locaux après succès
      setIndicator(updatedIndicator);
      setEditingDataIndex(null);
      // Réinitialisation du formulaire
      setIndicatorDataForm({
        geoLocation: { type: undefined, referenceId: undefined },
        ageRange: undefined,
        gender: undefined,
        residentialArea: undefined,
        socialCategory: undefined,
        ref_year: undefined,
        ref_value: undefined,
        target_year: undefined,
        target_value: undefined,
      });
    } catch (error) {
      console.error("Error saving indicator data:", error);
    }
  };

  // Gestion de l'édition d'une entrée de données
  const handleDataEdit = (dataItem: IndicatorData, index: number) => {
    setIndicatorDataForm(dataItem);
    setEditingDataIndex(index);
  };

  // Suppression d'une entrée de données
  const handleDataDelete = async (index: number) => {
    if (!indicator || !confirm("Are you sure?")) return;

    try {
      const updatedIndicator = { ...indicator };
      updatedIndicator.data.splice(index, 1);

      // Préparation des données pour le backend (même logique que handleDataSubmit)
      const updatePayload = {
        code: updatedIndicator.code,
        name: updatedIndicator.name,
        type: updatedIndicator.type,
        polarityDirection: updatedIndicator.polarityDirection,
        uniteDeMesure: typeof updatedIndicator.uniteDeMesure === 'object' && updatedIndicator.uniteDeMesure?._id 
          ? updatedIndicator.uniteDeMesure._id 
          : updatedIndicator.uniteDeMesure,
        programme: typeof updatedIndicator.programme === 'object' && updatedIndicator.programme?._id
          ? updatedIndicator.programme._id
          : updatedIndicator.programme,
        source: updatedIndicator.source.map(s => typeof s === 'object' && s._id ? s._id : s),
        metaData: typeof updatedIndicator.metaData === 'object' && updatedIndicator.metaData?._id
          ? updatedIndicator.metaData._id
          : updatedIndicator.metaData,
        // Même logique de nettoyage des données pour la suppression
        data: updatedIndicator.data.map(dataEntry => {
          const cleanedEntry = { ...dataEntry };
          
          if (cleanedEntry.socialCategory) {
            cleanedEntry.socialCategory = cleanedEntry.socialCategory.trim();
            if (!SOCIAL_CATEGORIES.includes(cleanedEntry.socialCategory)) {
              console.warn(`Invalid socialCategory found: "${cleanedEntry.socialCategory}". Setting to undefined.`);
              cleanedEntry.socialCategory = undefined;
            }
          }
          
          if (cleanedEntry.ageRange && !AGE_RANGES.includes(cleanedEntry.ageRange)) {
            console.warn(`Invalid ageRange found: "${cleanedEntry.ageRange}". Setting to undefined.`);
            cleanedEntry.ageRange = undefined;
          }
          
          if (cleanedEntry.gender && !GENDERS.includes(cleanedEntry.gender)) {
            console.warn(`Invalid gender found: "${cleanedEntry.gender}". Setting to undefined.`);
            cleanedEntry.gender = undefined;
          }
          
          if (cleanedEntry.residentialArea && !RESIDENTIAL_AREAS.includes(cleanedEntry.residentialArea)) {
            console.warn(`Invalid residentialArea found: "${cleanedEntry.residentialArea}". Setting to undefined.`);
            cleanedEntry.residentialArea = undefined;
          }
          
          return cleanedEntry;
        })
      };

      await api.put(`/indicators/${indicator._id}`, updatePayload);
      setIndicator(updatedIndicator);
      fetchFollowups(); // Rafraîchissement des suivis après suppression
    } catch (error) {
      console.error("Error deleting indicator data:", error);
    }
  };

  // ============================================================================
  // 📈 GESTIONNAIRES DES SUIVIS - Gestion des suivis d'indicateurs
  // ============================================================================
  
  // Gestion des changements dans le formulaire de suivi
  const handleFollowupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFollowupForm({ ...followupForm, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire de suivi (création ou modification)
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const followupData = {
        indicator: followupForm.indicator,
        dataIndex: parseInt(followupForm.dataIndex),  // Conversion en entier
        year: parseInt(followupForm.year),            // Conversion en entier
        value: parseFloat(followupForm.value)         // Conversion en nombre décimal
      };

      if (editingFollowupId) {
        // Mise à jour d'un suivi existant
        await api.put(`/indicator-followups/${editingFollowupId}`, followupData);
      } else {
        // Création d'un nouveau suivi
        await api.post("/indicator-followups", followupData);
      }
      
      // Réinitialisation du formulaire et des états
      setFollowupForm({ indicator: "", dataIndex: "", year: "", value: "" });
      setEditingFollowupId(null);
      fetchFollowups(); // Rafraîchissement de la liste des suivis
    } catch (error) {
      console.error("Error saving followup:", error);
    }
  };

  // Préparation de l'édition d'un suivi
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

  // Suppression d'un suivi
  const handleFollowupDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await api.delete(`/indicator-followups/${id}`);
        fetchFollowups(); // Rafraîchissement après suppression
      } catch (error) {
        console.error("Error deleting followup:", error);
      }
    }
  };

  // Génération des options de données pour les suivis
  const getDataOptionsForFollowup = () => {
    if (!indicator) return [];
    return indicator.data.map((d, idx) => ({
      value: `${indicator._id}:${idx}`,
      label: `${getDecoupageEntityName(d.geoLocation?.type, d.geoLocation?.referenceId)} - ${d.ageRange || 'All ages'} - ${d.gender || 'Both'} - ${d.residentialArea || 'All'}`,
      indicatorId: indicator._id,
      dataIndex: idx
    }));
  };

  // ============================================================================
  // 📊 FONCTIONS DE CALCUL DES STATISTIQUES - Analyses et métriques
  // ============================================================================
  
  // Calcul des statistiques globales de l'indicateur
  const getGlobalStatistics = () => {
    if (!indicator || followups.length === 0) {
      return {
        averageValue: 0,
        latestValue: 0,
        totalDataPoints: 0,
        yearRange: '',
        trendDirection: 'stable',
        growthRate: 0
      };
    }

    const values = followups.map(f => f.value);                          // Toutes les valeurs
    const years = followups.map(f => f.year);                            // Toutes les années
    const sortedByYear = [...followups].sort((a, b) => a.year - b.year); // Tri chronologique
    
    // Calculs de base
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latestValue = sortedByYear[sortedByYear.length - 1]?.value || 0;
    const earliestValue = sortedByYear[0]?.value || 0;
    const yearRange = `${Math.min(...years)} - ${Math.max(...years)}`;
    
    // Calcul de la tendance basée sur les 2 dernières valeurs
    let trendDirection = 'stable';
    if (sortedByYear.length >= 2) {
      const recentValues = sortedByYear.slice(-2);
      trendDirection = recentValues[1].value > recentValues[0].value ? 'up' : 
                     recentValues[1].value < recentValues[0].value ? 'down' : 'stable';
    }
    
    // Calcul du taux de croissance annuel moyen
    const yearSpan = Math.max(...years) - Math.min(...years);
    const growthRate = yearSpan > 0 ? 
      Math.round(((latestValue - earliestValue) / earliestValue) * 100 / yearSpan) : 0;

    return {
      averageValue: Math.round(averageValue * 100) / 100,  // Arrondi à 2 décimales
      latestValue,
      totalDataPoints: followups.length,
      yearRange,
      trendDirection,
      growthRate
    };
  };

  // ============================================================================
  // 🎨 FONCTIONS DE POLARITÉ - Gestion de l'affichage selon la polarité
  // ============================================================================
  
  // Détermination de la couleur selon la polarité et la tendance
  const getPolarityColor = (trendDirection: string) => {
    if (!indicator?.polarityDirection) return 'gray';
    
    if (indicator.polarityDirection === 'positive') {
      // Polarité positive : augmentation = bon (vert), diminution = mauvais (rouge)
      return trendDirection === 'up' ? 'green' : trendDirection === 'down' ? 'red' : 'gray';
    } else {
      // Polarité négative : diminution = bon (vert), augmentation = mauvais (rouge)
      return trendDirection === 'down' ? 'green' : trendDirection === 'up' ? 'red' : 'gray';
    }
  };

  // Icône appropriée selon la polarité et la tendance
  const getPolarityIcon = (trendDirection: string) => {
    if (!indicator?.polarityDirection) return '→';
    
    if (indicator.polarityDirection === 'positive') {
      return trendDirection === 'up' ? '📈' : trendDirection === 'down' ? '📉' : '→';
    } else {
      return trendDirection === 'down' ? '📈' : trendDirection === 'up' ? '📉' : '→';
    }
  };

  // Label descriptif selon la polarité et la tendance
  const getPolarityLabel = (trendDirection: string) => {
    if (!indicator?.polarityDirection) return 'Stable';
    
    const isGood = (indicator.polarityDirection === 'positive' && trendDirection === 'up') ||
                   (indicator.polarityDirection === 'negative' && trendDirection === 'down');
    
    if (trendDirection === 'up') {
      return isGood ? 'Amélioration ↗' : 'Dégradation ↗';
    } else if (trendDirection === 'down') {
      return isGood ? 'Amélioration ↘' : 'Dégradation ↘';
    }
    return 'Stable →';
  };

  // ============================================================================
  // ⏳ GESTION DES ÉTATS DE CHARGEMENT ET D'ERREUR
  // ============================================================================
  
  // Affichage pendant le chargement
  // ============================================================================
  // ⏳ GESTION DES ÉTATS DE CHARGEMENT ET D'ERREUR
  // ============================================================================
  
  // Affichage pendant le chargement des données
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse text-gray-500">Chargement de l'indicateur...</div>
      </div>
    );
  }

  // ============================================================================
  // ❌ GESTION DES ERREURS ET CAS D'EXCEPTION
  // ============================================================================
  
  // Affichage en cas d'erreur ou d'indicateur non trouvé
  if (error || !indicator) {
    return (
      <div className="p-6">
        <Button onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Indicateur non trouvé"}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 📊 PRÉPARATION DES DONNÉES POUR L'AFFICHAGE
  // ============================================================================
  
  // Calcul des statistiques globales pour l'interface utilisateur
  const globalStats = getGlobalStatistics();

  // ============================================================================
  // 🎨 RENDU PRINCIPAL DU COMPOSANT - Interface utilisateur complète
  // ============================================================================
  
  // Rendu principal avec design moderne et glassmorphisme
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* ========== EN-TÊTE AVEC EFFET GLASSMORPHISM ========== */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Détail de l'indicateur
              </h1>
              <p className="text-gray-600 text-sm">Analyse complète et gestion des données</p>
            </div>
            <div className="w-20"></div> {/* Spacer pour l'alignement flex */}
          </div>
        </div>

        {/* ========== CARTE D'INFORMATIONS DE L'INDICATEUR ========== */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6 hover:shadow-xl transition-all duration-300">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{indicator.code}</h2>
                  <p className="text-gray-600 leading-relaxed">{indicator.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-indigo-600 font-medium">Indicateur actif</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Tag className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Type:</span> 
                    <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs font-medium shadow-sm">
                      {indicator.type || 'Non spécifié'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Polarité:</span> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      indicator.polarityDirection === 'negative' 
                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200' 
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200'
                    }`}>
                      {indicator.polarityDirection === 'negative' 
                        ? '📉 Négatif (Diminution positive)' 
                        : '📈 Positif (Augmentation positive)'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Unité de mesure:</span> 
                    <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs font-medium shadow-sm">
                      {typeof indicator.uniteDeMesure === 'object' 
                        ? `${indicator.uniteDeMesure.code} - ${indicator.uniteDeMesure.name}`
                        : 'Non spécifiée'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Programme:</span> 
                    <span className="ml-2 px-2 py-1 bg-white rounded-full text-xs font-medium shadow-sm">
                      {typeof indicator.programme === 'object' 
                        ? `${indicator.programme.code} - ${indicator.programme.name}`
                        : 'Non spécifié'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Statistiques rapides
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold">{indicator.data?.length || 0}</div>
                  </div>
                  <div className="text-blue-100 font-medium text-sm">Entrées de données</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold">{followups.length}</div>
                  </div>
                  <div className="text-green-100 font-medium text-sm">Suivis enregistrés</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <PieChart className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold">{indicator.source?.length || 0}</div>
                  </div>
                  <div className="text-purple-100 font-medium text-sm">Sources</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold">{globalStats.latestValue || 0}</div>
                  </div>
                  <div className="text-orange-100 font-medium text-sm">Dernière valeur</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation avec design amélioré */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6">
          <nav className="flex overflow-hidden rounded-2xl">
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 flex-1 justify-center ${
                activeTab === 'data'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Gestion des données
            </button>
            <button
              onClick={() => setActiveTab('advanced-stats')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 flex-1 justify-center ${
                activeTab === 'advanced-stats'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Analyses Avancées
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300 flex-1 justify-center ${
                activeTab === 'global'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Target className="h-4 w-4" />
              Vue globale
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Add/Edit Data Form avec design amélioré */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingDataIndex !== null ? 'Modifier' : 'Ajouter'} une entrée de données
                </h3>
              </div>

              <form onSubmit={handleDataSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Type de localisation géographique</label>
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
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  >
                    <option value="">Sélectionner le type de localisation</option>
                    {GEO_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {indicatorDataForm.geoLocation?.type && indicatorDataForm.geoLocation.type !== 'Global' && (
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Sélectionner {indicatorDataForm.geoLocation.type}</label>
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
                      className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                    >
                      <option value="">Sélectionner </option>
                      {getDecoupageOptions(indicatorDataForm.geoLocation.type).map(entity => (
                        <option key={entity._id} value={entity._id}>{entity.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Tranche d'âge</label>
                  <select 
                    name="ageRange" 
                    value={indicatorDataForm.ageRange || ''} 
                    onChange={handleDataChange}
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  >
                    <option value="">Sélectionner la tranche d'âge</option>
                    {AGE_RANGES.map(ageRange => (
                      <option key={ageRange} value={ageRange}>{ageRange}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Genre</label>
                  <select 
                    name="gender" 
                    value={indicatorDataForm.gender || ''} 
                    onChange={handleDataChange}
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  >
                    <option value="">Sélectionner le sexe</option>
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Catégorie sociale</label>
                  <select 
                    name="socialCategory" 
                    value={indicatorDataForm.socialCategory || ''} 
                    onChange={handleDataChange}
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  >
                    <option value="">Sélectionner la catégorie sociale</option>
                    {SOCIAL_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Milieu de résidence</label>
                  <select 
                    name="residentialArea" 
                    value={indicatorDataForm.residentialArea || ''} 
                    onChange={handleDataChange}
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  >
                    <option value="">Sélectionner le milieu de résidence</option>
                    {RESIDENTIAL_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Année de référence</label>
                  <input 
                    name="ref_year" 
                    value={indicatorDataForm.ref_year || ''} 
                    onChange={handleDataChange} 
                    placeholder="Année de référence" 
                    type="number"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Valeur de référence</label>
                  <input 
                    name="ref_value" 
                    value={indicatorDataForm.ref_value || ''} 
                    onChange={handleDataChange} 
                    placeholder="Valeur de référence" 
                    type="number"
                    step="any"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Année cible</label>
                  <input 
                    name="target_year" 
                    value={indicatorDataForm.target_year || ''} 
                    onChange={handleDataChange} 
                    placeholder="Année cible" 
                    type="number"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Valeur cible</label>
                  <input 
                    name="target_value" 
                    value={indicatorDataForm.target_value || ''} 
                    onChange={handleDataChange} 
                    placeholder="Valeur cible" 
                    type="number"
                    step="any"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-3">
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    {editingDataIndex !== null ? (
                      <>
                        <Activity className="w-4 h-4" />
                        Mettre à jour
                      </>
                    ) : (
                      <>
                        <PieChart className="w-4 h-4" />
                        Ajouter
                      </>
                    )}
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
                          residentialArea: undefined,
                          socialCategory: undefined,
                          ref_year: undefined,
                          ref_value: undefined,
                          target_year: undefined,
                          target_value: undefined,
                        });
                      }}
                      className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Data Table avec design amélioré */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Entrées de données existantes</h3>
                <div className="ml-auto bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-blue-700 font-semibold text-sm">{indicator.data?.length || 0} entrées</span>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Localisation</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Âge</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Genre</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Zone Rés.</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Catégorie</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Année Réf.</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Valeur Réf.</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Année Cible</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Valeur Cible</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {indicator.data?.map((dataItem, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors duration-200">
                          <td className="px-3 py-2 text-xs font-medium text-gray-900">{getDecoupageEntityName(dataItem.geoLocation?.type, dataItem.geoLocation?.referenceId)}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.ageRange || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.gender || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.residentialArea || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.socialCategory || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.ref_year || '-'}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-indigo-600">{dataItem.ref_value || '-'}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{dataItem.target_year || '-'}</td>
                          <td className="px-3 py-2 text-xs font-semibold text-green-600">{dataItem.target_value || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <button 
                                onClick={() => handleDataEdit(dataItem, index)}
                                className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs font-medium flex items-center gap-1"
                              >
                                <Activity className="w-3 h-3" />
                                Modifier
                              </button>
                              <button 
                                onClick={() => handleDataDelete(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-xs font-medium flex items-center gap-1"
                              >
                                <Target className="w-3 h-3" />
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Followups Section avec design amélioré */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Suivis des données</h3>
                <div className="ml-auto bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-semibold text-sm">{followups.length} suivis</span>
                </div>
              </div>

              <form onSubmit={handleFollowupSubmit} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl mb-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Entrée de données</label>
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
                      className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                      required
                    >
                      <option value="">Sélectionner une entrée de données</option>
                      {getDataOptionsForFollowup().map(opt => (
                        <option key={opt.dataIndex} value={opt.dataIndex}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Année</label>
                    <input 
                      name="year" 
                      value={followupForm.year} 
                      onChange={handleFollowupChange} 
                      placeholder="Année" 
                      className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                      required 
                      type="number" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700">Valeur</label>
                    <input 
                      name="value" 
                      value={followupForm.value} 
                      onChange={handleFollowupChange} 
                      placeholder="Valeur" 
                      className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                      required 
                      type="number" 
                      step="any"
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2 flex-1"
                    >
                      {editingFollowupId ? (
                        <>
                          <Activity className="w-4 h-4" />
                          Modifier
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Ajouter
                        </>
                      )}
                    </button>
                    {editingFollowupId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingFollowupId(null);
                          setFollowupForm({ indicator: "", dataIndex: "", year: "", value: "" });
                        }}
                        className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-2 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>

              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Référence des données</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Année</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Valeur</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {followups.map((followup) => {
                        const dataEntry = indicator.data[followup.dataIndex];
                        const dataLabel = dataEntry 
                          ? `${getDecoupageEntityName(dataEntry.geoLocation?.type, dataEntry.geoLocation?.referenceId)}`
                          : `Data entry ${followup.dataIndex}`;
                        
                        return (
                          <tr key={followup._id} className="hover:bg-green-50 transition-colors duration-200">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{dataLabel}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium text-xs">
                                {followup.year}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">{followup.value}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => handleFollowupEdit(followup)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs font-medium flex items-center gap-1"
                                >
                                  <Activity className="w-3 h-3" />
                                  Modifier
                                </button>
                                <button 
                                  onClick={() => handleFollowupDelete(followup._id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-xs font-medium flex items-center gap-1"
                                >
                                  <Target className="w-3 h-3" />
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Vue globale de l'indicateur</h3>
                <p className="text-gray-600 text-sm">Synthèse complète et tendances générales</p>
              </div>
            </div>
            
            {followups.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full">
                    <Target className="h-16 w-16 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-700 mb-2">Aucune donnée de suivi disponible</h4>
                    <p className="text-gray-500">Ajoutez des données de suivi pour voir la synthèse globale</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-xl">
                    <span className="text-indigo-700 font-medium">🚀 Commencez par ajouter des données de suivi dans l'onglet "Gestion des données"</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                      <PieChart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-1">{globalStats.averageValue}</div>
                      <div className="text-green-100 text-xs uppercase tracking-wider font-semibold">Moyenne globale</div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="text-xs text-white/90">
                      📊 Calculée sur {followups.length} points de données
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-1">{globalStats.latestValue}</div>
                      <div className="text-blue-100 text-xs uppercase tracking-wider font-semibold">Valeur actuelle</div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="text-xs text-white/90">
                      📅 Période: {globalStats.yearRange}
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group ${
                  getPolarityColor(globalStats.trendDirection) === 'green' ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700' :
                  getPolarityColor(globalStats.trendDirection) === 'red' ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700' :
                  'bg-gradient-to-br from-gray-500 via-gray-600 to-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-4xl opacity-80">{getPolarityIcon(globalStats.trendDirection)}</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold mb-1">{getPolarityLabel(globalStats.trendDirection)}</div>
                    <div className="text-white/80 font-medium mb-2">Tendance générale</div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-xs text-white/90">
                        🎯 Polarité: {indicator.polarityDirection === 'negative' ? 'Négatif (diminution souhaitable)' : 'Positif (augmentation souhaitable)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advanced-stats' && (
          <div className="space-y-6">
            {/* Geographic Filter Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                    <Filter className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Analyses Avancées par Niveau Géographique</h3>
                    <p className="text-gray-600 text-sm">Filtrez les statistiques par niveau territorial et période temporelle</p>
                  </div>
                </div>
              </div>
              
              {/* Geographic Filter Component */}
              <GeographicFilterComponent
                currentFilter={filter}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Error Display */}
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Erreur lors du chargement des statistiques</span>
                </div>
                <p className="text-red-600 text-sm mt-2">{statsError}</p>
              </div>
            )}

            {/* Loading State */}
            {statsLoading && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Chargement des statistiques filtrées...</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Niveau: {filter.level === 'Global' ? 'National' : filter.level} 
                    {filter.entityName && ` - ${filter.entityName}`}
                  </p>
                </div>
              </div>
            )}

            {/* Insertion de la Statistics Display */}
            {!statsLoading && !statsError && filteredStats && (
              <StatisticsDisplay
                statistics={filteredStats.statistics}
                indicator={filteredStats.indicator}
                geoFilter={filteredStats.geoFilter}
                formatValue={formatFilteredValue}
                getPolarityColor={getFilteredPolarityColor}
                // getPolarityIcon={getFilteredPolarityIcon}
                getPolarityLabel={getFilteredPolarityLabel}
              />
            )}

            {/* Chart Display */}
            {!statsLoading && !statsError && filteredChartData && (
              <FilteredChart
                chartData={filteredChartData}
                indicator={filteredStats?.indicator || { name: '', code: '' }}
                geoFilter={filteredStats?.geoFilter || { level: 'Global' }}
                loading={statsLoading}
              />
            )}

            {/* No Data State */}
            {!statsLoading && !statsError && filteredStats && filteredStats.statistics.totalDataPoints === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune donnée pour ce filtre</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Aucune donnée n'est disponible pour les critères de filtrage sélectionnés. 
                    Essayez de modifier les filtres ou vérifiez que des données de suivi ont été saisies.
                  </p>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <strong>Suggestion :</strong> Essayez le niveau "National" ou vérifiez l'onglet "Gestion des données" 
                      pour ajouter des données de suivi pour cet indicateur.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicatorDetail;
