import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { FileText, Target, Hash, BarChart3, Info, Users, BookOpen, TrendingUp, Activity, PieChart, LineChart } from 'lucide-react';
import SuiviIndicateurCrud from '../components/SuiviIndicateurCrud';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

interface Source {
  _id: string;
  name: string;
  description?: string;
}

interface SuiviIndicateur {
  _id: string;
  code: string;
  anne: number;
  valeur: number;
  indicateur: string;
  source: string | { _id: string; name: string };
  sourceDetail?: string;
  createdAt: string;
}

interface IndicateurDetail {
  _id: string;
  code: string;
  name: string;
  description: string;
  anne_deReference: number;
  valeur_deReference: number;
  anne_cible: number;
  programme?: { _id: string; name: string; code: string };
  valeur_cible: number;
  impact: string;
  uniteDeMesure: string;
  source?: Source[];
  domaine?: { _id: string; name: string; code: string };
}

const IndicateurDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [indicateur, setIndicateur] = useState<IndicateurDetail | null>(null);
  const [suiviData, setSuiviData] = useState<SuiviIndicateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'data'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicateurRes, suiviRes] = await Promise.all([
          api.get(`/indicateurs/${id}`),
          api.get(`/suivi-indicateurs?indicateur=${id}`)
        ]);
        setIndicateur(indicateurRes.data);
        setSuiviData(suiviRes.data);
      } catch {
        setIndicateur(null);
        setSuiviData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Statistics calculations
  const getProgressPercentage = () => {
    if (!indicateur || suiviData.length === 0) return 0;
    const latestValue = Math.max(...suiviData.map(s => s.valeur));
    const reference = indicateur.valeur_deReference;
    const target = indicateur.valeur_cible;
    return Math.round(((latestValue - reference) / (target - reference)) * 100);
  };

  const getTrendDirection = () => {
    if (suiviData.length < 2) return 'stable';
    const sorted = [...suiviData].sort((a, b) => a.anne - b.anne);
    const recent = sorted.slice(-2);
    return recent[1].valeur > recent[0].valeur ? 'up' : recent[1].valeur < recent[0].valeur ? 'down' : 'stable';
  };

  const getYearlyGrowthRate = () => {
    if (suiviData.length < 2) return 0;
    const sorted = [...suiviData].sort((a, b) => a.anne - b.anne);
    const firstValue = sorted[0].valeur;
    const lastValue = sorted[sorted.length - 1].valeur;
    const years = sorted[sorted.length - 1].anne - sorted[0].anne;
    return years > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100 / years) : 0;
  };

  // Chart data
  const lineChartData = {
    labels: [...suiviData].sort((a, b) => a.anne - b.anne).map(s => s.anne.toString()),
    datasets: [
      {
        label: 'Valeurs Réelles',
        data: [...suiviData].sort((a, b) => a.anne - b.anne).map(s => s.valeur),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Objectif',
        data: Array(suiviData.length).fill(indicateur?.valeur_cible || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: 'Référence',
        data: Array(suiviData.length).fill(indicateur?.valeur_deReference || 0),
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderDash: [10, 5],
        pointRadius: 0,
      }
    ],
  };

  const barChartData = {
    labels: [...suiviData].sort((a, b) => a.anne - b.anne).map(s => s.anne.toString()),
    datasets: [
      {
        label: 'Progression Annuelle',
        data: [...suiviData].sort((a, b) => a.anne - b.anne).map(s => s.valeur),
        backgroundColor: suiviData.map((_, index) => 
          `rgba(79, 70, 229, ${0.3 + (index * 0.7 / suiviData.length)})`
        ),
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const sourceDistributionData = {
    labels: [...new Set(suiviData.map(s => 
      typeof s.source === 'string' ? s.source : s.source.name
    ))],
    datasets: [
      {
        data: [...new Set(suiviData.map(s => 
          typeof s.source === 'string' ? s.source : s.source.name
        ))].map(sourceName => 
          suiviData.filter(s => 
            (typeof s.source === 'string' ? s.source : s.source.name) === sourceName
          ).length
        ),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { label?: string }, parsed: { y: number } }) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = indicateur?.uniteDeMesure || '';
            return `${label}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: string | number) {
            return `${value} ${indicateur?.uniteDeMesure || ''}`;
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
    },
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (!indicateur) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Indicateur introuvable.</p>
      </div>
    </div>
  );

  const progressPercentage = getProgressPercentage();
  const trendDirection = getTrendDirection();
  const yearlyGrowthRate = getYearlyGrowthRate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {indicateur.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">Code: {indicateur.code}</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(-1)} 
              variant="secondary"
              className="bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-gray-200"
            >
              <BookOpen className="h-5 w-5 mr-2" /> 
              Retour
            </Button>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Progression</p>
                  <p className="text-3xl font-bold">{progressPercentage}%</p>
                </div>
                <Target className="h-10 w-10 text-blue-200" />
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 text-white ${
              trendDirection === 'up' ? 'bg-gradient-to-br from-green-500 to-green-600' :
              trendDirection === 'down' ? 'bg-gradient-to-br from-red-500 to-red-600' :
              'bg-gradient-to-br from-gray-500 to-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Tendance</p>
                  <p className="text-2xl font-bold capitalize">{
                    trendDirection === 'up' ? '↗ Hausse' : 
                    trendDirection === 'down' ? '↘ Baisse' : '→ Stable'
                  }</p>
                </div>
                <TrendingUp className="h-10 w-10 text-white/70" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Croissance/An</p>
                  <p className="text-3xl font-bold">{yearlyGrowthRate}%</p>
                </div>
                <Activity className="h-10 w-10 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Points de Données</p>
                  <p className="text-3xl font-bold">{suiviData.length}</p>
                </div>
                <Hash className="h-10 w-10 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200/50">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
                { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
                { id: 'data', label: 'Données', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'statistics' | 'data')}
                  className={`flex items-center gap-2 px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-indigo-500 hover:bg-gray-50/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{indicateur.description}</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-500" />
                        Valeurs Clés
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <p className="text-sm text-blue-600 font-medium">Référence ({indicateur.anne_deReference})</p>
                          <p className="text-2xl font-bold text-blue-800">{indicateur.valeur_deReference} {indicateur.uniteDeMesure}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <p className="text-sm text-green-600 font-medium">Cible ({indicateur.anne_cible})</p>
                          <p className="text-2xl font-bold text-green-800">{indicateur.valeur_cible} {indicateur.uniteDeMesure}</p>
                        </div>
                        {/* Last year data */}
                        {suiviData.length > 0 && (() => {
                          const last = [...suiviData].sort((a, b) => b.anne - a.anne)[0];
                          return (
                            <div className="col-span-2 text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl mt-2">
                              <p className="text-sm text-indigo-600 font-medium">Dernière donnée ({last.anne})</p>
                              <p className="text-2xl font-bold text-indigo-800">{last.valeur} {indicateur.uniteDeMesure}</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-indigo-500" />
                        Unité de Mesure
                      </h3>
                      <p className="text-lg text-gray-800 font-medium">{indicateur.uniteDeMesure}</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-500" />
                        Impact
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{indicateur.impact}</p>
                    </div>
                    
                    {indicateur.source && indicateur.source.length > 0 && (
                      <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-500" />
                          Sources
                        </h3>
                        <div className="space-y-3">
                          {indicateur.source.map((s) => (
                            <div key={s._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-gray-900">{s.name}</p>
                                {s.description && <p className="text-sm text-gray-600">{s.description}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="space-y-8">
                {suiviData.length === 0 ? (
                  <div className="text-center py-16">
                    <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Aucune donnée de suivi disponible</p>
                    <p className="text-gray-500">Ajoutez des données pour voir les statistiques</p>
                  </div>
                ) : (
                  <>
                    {/* Evolution Chart */}
                    <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <LineChart className="h-6 w-6 text-indigo-500" />
                        Évolution des Valeurs
                      </h3>
                      <div className="h-80">
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Bar Chart */}
                      <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <BarChart3 className="h-6 w-6 text-indigo-500" />
                          Progression Annuelle
                        </h3>
                        <div className="h-64">
                          <Bar data={barChartData} options={chartOptions} />
                        </div>
                      </div>

                      {/* Source Distribution */}
                      <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <PieChart className="h-6 w-6 text-indigo-500" />
                          Répartition par Source
                        </h3>
                        <div className="h-64">
                          <Doughnut data={sourceDistributionData} options={doughnutOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Performance Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Meilleure Performance</h4>
                          <Target className="h-8 w-8 text-emerald-200" />
                        </div>
                        <p className="text-3xl font-bold">{Math.max(...suiviData.map(s => s.valeur))} {indicateur.uniteDeMesure}</p>
                        <p className="text-emerald-100 text-sm mt-1">
                          Année {suiviData.find(s => s.valeur === Math.max(...suiviData.map(s => s.valeur)))?.anne}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Moyenne</h4>
                          <BarChart3 className="h-8 w-8 text-amber-200" />
                        </div>
                        <p className="text-3xl font-bold">
                          {Math.round(suiviData.reduce((sum, s) => sum + s.valeur, 0) / suiviData.length)} {indicateur.uniteDeMesure}
                        </p>
                        <p className="text-amber-100 text-sm mt-1">Sur {suiviData.length} années</p>
                      </div>

                      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Écart à l'Objectif</h4>
                          <Activity className="h-8 w-8 text-rose-200" />
                        </div>
                        <p className="text-3xl font-bold">
                          {Math.abs(Math.max(...suiviData.map(s => s.valeur)) - indicateur.valeur_cible)} {indicateur.uniteDeMesure}
                        </p>
                        <p className="text-rose-100 text-sm mt-1">
                          {Math.max(...suiviData.map(s => s.valeur)) >= indicateur.valeur_cible ? 'Objectif atteint' : 'Reste à atteindre'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="mt-10">
                <SuiviIndicateurCrud indicateurId={indicateur._id} uniteDeMesure={indicateur.uniteDeMesure} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicateurDetailPage;
