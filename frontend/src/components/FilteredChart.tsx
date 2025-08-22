// ============================================================================
// 📈 COMPOSANT GRAPHIQUE FILTRÉ - Visualisation des données d'indicateurs
// ============================================================================
// Description: Graphique en ligne avec données filtrées géographiquement et temporellement
// Responsabilités: Affichage Chart.js, tooltips, gestion des états vides/chargement
// ============================================================================

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// ============================================================================
// 🔧 CONFIGURATION CHART.JS - Enregistrement des composants nécessaires
// ============================================================================

ChartJS.register(
  CategoryScale,    // Échelle des catégories (années)
  LinearScale,      // Échelle linéaire (valeurs)
  PointElement,     // Points sur les lignes
  LineElement,      // Lignes du graphique
  Title,           // Titre du graphique
  Tooltip,         // Info-bulles
  Legend,          // Légende
  Filler           // Remplissage sous les courbes
);

// ============================================================================
// 📝 TYPES ET INTERFACES - Structure des données du graphique
// ============================================================================

interface FilteredChartProps {
  // Données formatées pour Chart.js
  chartData: {
    labels: string[];                         // Labels des années (axe X)
    datasets: Array<{                        // Séries de données
      label: string;                         // Nom de la série
      data: (number | null)[];               // Valeurs (null pour données manquantes)
      borderColor: string;                   // Couleur de la ligne
      backgroundColor: string;               // Couleur de fond
      fill: boolean;                         // Remplissage sous la courbe
      tension: number;                       // Courbure de la ligne
      pointBackgroundColor: string;          // Couleur des points
      pointBorderColor: string;              // Couleur de bordure des points
      pointBorderWidth: number;              // Épaisseur bordure points
      pointRadius: number;                   // Taille des points
      spanGaps: boolean;                     // Connexion à travers les données manquantes
    }>;
  };
  
  // Informations de l'indicateur affiché
  indicator: {
    name: string;                            // Nom de l'indicateur
    code: string;                            // Code de l'indicateur
    uniteDeMesure?: { name: string; code: string };  // Unité de mesure
    polarityDirection?: 'positive' | 'negative';     // Direction de polarité
  };
  
  // Filtre géographique appliqué
  geoFilter: {
    level: string;                           // Niveau géographique
    entity?: {                               // Entité géographique (optionnelle)
      name: string;
      code: string;
      type: string;
    };
  };
  
  loading?: boolean;                         // État de chargement (optionnel)
}

// ============================================================================
// 🎨 COMPOSANT PRINCIPAL - Graphique filtré avec gestion des états
// ============================================================================

const FilteredChart: React.FC<FilteredChartProps> = ({
  chartData,
  indicator,
  geoFilter,
  loading = false
}) => {
  // ============================================================================
  // ⚙️ CONFIGURATION DU GRAPHIQUE - Options de Chart.js
  // ============================================================================
  
  const options = {
    responsive: true,                         // Graphique responsive
    maintainAspectRatio: false,              // Permet de contrôler la hauteur
    
    // ========== CONFIGURATION DES PLUGINS ==========
    plugins: {
      // Configuration de la légende
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,               // Utilise des points dans la légende
          pointStyle: 'circle' as const,     // Style de point circulaire
          padding: 20,                       // Espacement dans la légende
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      
      // Configuration du titre
      title: {
        display: true,
        text: `${indicator.name} - Niveau ${geoFilter.level === 'Global' ? 'National' : geoFilter.level}${
          geoFilter.entity ? ` (${geoFilter.entity.name})` : ''
        }`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: '#374151',
        padding: {
          bottom: 30
        }
      },
      
      // Configuration des info-bulles (tooltips)
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          weight: 'bold' as const
        },
        
        // Callbacks pour personnaliser le contenu des tooltips
        callbacks: {
          // Titre du tooltip (année)
          title: function(context: any) {
            return `Année ${context[0].label}`;
          },
          
          // Contenu principal du tooltip
          label: function(context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = indicator.uniteDeMesure?.name || '';
            
            if (value === null || value === undefined) {
              return `${datasetLabel}: Pas de données`;
            }
            
            return `${datasetLabel}: ${value.toLocaleString()} ${unit}`;
          },
          
          // Informations supplémentaires (évolution)
          afterBody: function(context: any) {
            if (context.length > 0) {
              const currentValue = context[0].parsed.y;
              const dataIndex = context[0].dataIndex;
              const dataset = context[0].dataset;
              
              // Calcul de l'évolution par rapport à la valeur précédente
              if (dataIndex > 0 && currentValue !== null) {
                const previousValue = dataset.data[dataIndex - 1];
                if (previousValue !== null && previousValue !== undefined) {
                  const change = currentValue - previousValue;
                  const percentChange = previousValue !== 0 ? ((change / previousValue) * 100) : 0;
                  
                  return [
                    '',
                    `Évolution: ${change > 0 ? '+' : ''}${change.toFixed(2)} ${indicator.uniteDeMesure?.name || ''}`,
                    `(${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)} %)`
                  ];
                }
              }
            }
            return '';
          }
        }
      }
    },
    
    // ========== CONFIGURATION DES AXES ==========
    scales: {
      // Axe X (années)
      x: {
        title: {
          display: true,
          text: 'Années',
          font: {
            weight: 'bold' as const
          },
          color: '#6B7280'
        },
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      
      // Axe Y (valeurs)
      y: {
        title: {
          display: true,
          text: indicator.uniteDeMesure?.name || 'Valeur',
          font: {
            weight: 'bold' as const
          },
          color: '#6B7280'
        },
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          // Formatage des nombres sur l'axe Y
          callback: function(value: any) {
            // Formatage pour les grands nombres
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString();
          }
        },
        beginAtZero: false
      }
    },
    
    // ========== INTERACTIONS ET ANIMATIONS ==========
    interaction: {
      intersect: false,                      // Détection sur toute la ligne verticale
      mode: 'index' as const                 // Mode d'interaction par index
    },
    elements: {
      point: {
        hoverRadius: 8,                      // Taille des points au survol
        hoverBorderWidth: 3                  // Épaisseur bordure au survol
      },
      line: {
        tension: 0.4                         // Courbure des lignes
      }
    },
    animation: {
      duration: 1000,                        // Durée de l'animation
      easing: 'easeInOutCubic' as const     // Type d'animation
    }
  };

  // ============================================================================
  // 🔄 GESTION DES ÉTATS - Affichage conditionnel selon l'état
  // ============================================================================
  
  // État de chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Chargement du graphique...</p>
          </div>
        </div>
      </div>
    );
  }

  // État sans données
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-500 max-w-md">
              Aucune donnée n'est disponible pour les filtres sélectionnés. 
              Essayez de modifier les critères de filtrage ou vérifiez que des données 
              ont été saisies pour cet indicateur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 RENDU PRINCIPAL - Graphique avec informations complémentaires
  // ============================================================================
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* ========== GRAPHIQUE PRINCIPAL ========== */}
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
      
      {/* ========== INFORMATIONS COMPLÉMENTAIRES ========== */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
          {/* Statistiques sur les données */}
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <span>
              <strong>{chartData.datasets.length}</strong> série{chartData.datasets.length > 1 ? 's' : ''} de données
            </span>
            <span>
              <strong>{chartData.labels.length}</strong> période{chartData.labels.length > 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Badge de polarité (affiché si défini) */}
          {/* <div className="flex items-center space-x-2">
            {indicator.polarityDirection && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                indicator.polarityDirection === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Polarité {indicator.polarityDirection === 'positive' ? 'positive' : 'négative'}
              </span>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default FilteredChart;
