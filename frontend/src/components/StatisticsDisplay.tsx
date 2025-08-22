// ============================================================================
// 📊 COMPOSANT D'AFFICHAGE DES STATISTIQUES - Interface utilisateur
// ============================================================================
// Description: Affiche les statistiques filtrées d'un indicateur
// Responsabilités: Cartes de statistiques, indicateurs de tendance, comparaisons
// ============================================================================

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Activity
} from 'lucide-react';

// ============================================================================
// 📝 TYPES ET INTERFACES - Définitions des données requises
// ============================================================================

interface StatisticsDisplayProps {
  // Statistiques calculées (uniquement celles affichées)
  statistics: {
    totalDataPoints: number;           // Nombre total de points de données
    latestValue: number;              // Dernière valeur enregistrée
    yearRange: string;                // Plage d'années (ex: "2020 - 2024")
    trendDirection: 'up' | 'down' | 'stable';  // Direction de la tendance
    yearlyGrowthRate: number;         // Taux de croissance annuel moyen (%)
    changeFromPrevious: number;       // Changement par rapport à la période précédente
    percentChangeFromPrevious: number; // Changement en pourcentage (%)
    referenceValue: number;           // Valeur de référence (ligne de base)
    targetValue: number;              // Valeur cible à atteindre
    targetYear: number | null;        // Année cible
    referenceYear: number | null;     // Année de référence
    gapToTarget: number;              // Écart par rapport à la cible
    percentGapToTarget: number;       // Écart en pourcentage par rapport à la cible
  };
  
  // Informations de l'indicateur
  indicator: {
    name: string;                     // Nom de l'indicateur
    code: string;                     // Code unique de l'indicateur
    uniteDeMesure?: { 
      name: string; 
      code: string; 
    };                               // Unité de mesure (optionnelle)
    polarityDirection?: 'positive' | 'negative';  // Direction de polarité pour l'interprétation
  };
  
  // Filtre géographique appliqué
  geoFilter: {
    level: string;                    // Niveau géographique ('Global', 'Province', etc.)
    entity?: {
      name: string;
      code: string;
      type: string;
    };                               // Entité géographique sélectionnée (optionnelle)
  };
  
  // Fonctions utilitaires pour l'affichage
  formatValue: (value: number, precision?: number) => string;  // Formatage des valeurs
  getPolarityColor: (direction: string) => string;            // Couleur selon la polarité
  getPolarityLabel: (direction: string) => string;            // Label selon la polarité
}

// ============================================================================
// 🎨 COMPOSANT PRINCIPAL - Affichage des statistiques
// ============================================================================

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  statistics,
  indicator,
  geoFilter,
  formatValue,
  getPolarityColor,
  getPolarityLabel
}) => {
  // ============================================================================
  // 📊 CALCULS POUR L'AFFICHAGE - Préparation des données visuelles
  // ============================================================================
  
  // Détermination de la couleur et du label de tendance selon la polarité
  const trendColor = getPolarityColor(statistics.trendDirection);
  const trendLabel = getPolarityLabel(statistics.trendDirection);

  // ============================================================================
  // 🃏 COMPOSANT CARTE STATISTIQUE - Élément réutilisable d'affichage
  // ============================================================================
  
  const StatCard: React.FC<{
    title: string;                    // Titre de la carte
    value: string | number;           // Valeur principale à afficher
    icon: React.ElementType;          // Icône Lucide React
    color: string;                    // Couleur de thème (blue, green, red, etc.)
    subtitle?: string;                // Sous-titre explicatif (optionnel)
    trend?: {                         // Indicateur de tendance (optionnel)
      value: number;                  // Valeur de la tendance en pourcentage
      isPositive: boolean;            // Direction positive ou négative
    };
  }> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Contenu principal de la carte */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? formatValue(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {/* Icône avec couleur thématique */}
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      
      {/* Indicateur de tendance (affiché si fourni) */}
      {trend && (
        <div className="mt-4 flex items-center">
          <div className={`flex items-center text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-gray-500 text-sm ml-2">vs précédent</span>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // 🎨 RENDU PRINCIPAL - Structure de l'interface utilisateur
  // ============================================================================
  
  return (
    <div className="space-y-6">
      
      {/* ========== EN-TÊTE AVEC INFORMATIONS CONTEXTUELLES ========== */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Statistiques - {indicator.name}</h2>
            <p className="text-blue-100 mt-1">
              Niveau {geoFilter.level === 'Global' ? 'National' : geoFilter.level.toLowerCase()} 
              {/* {geoFilter.entity && ` - ${geoFilter.entity.name}`} */}
            </p>
          </div>
          {/* Affichage de la période si disponible */}
          {statistics.yearRange && (
            <div className="text-right">
              <div className="text-sm text-blue-100">Période</div>
              <div className="font-semibold">{statistics.yearRange}</div>
            </div>
          )}
        </div>
      </div>

      {/* ========== STATISTIQUES PRINCIPALES ========== */}
      {/* Ces 4 cartes affichent les métriques les plus importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. VALEUR ACTUELLE - Dernière valeur mesurée */}
        <StatCard
          title="Valeur Actuelle"
          value={`${statistics.latestValue} %`}
          icon={Target}
          color="blue"
          subtitle={`${indicator.uniteDeMesure?.name || ''} (Dernière observation)`}
          trend={{
            value: Math.abs(statistics.percentChangeFromPrevious),
            isPositive: statistics.changeFromPrevious > 0
          }}
        />

        {/* 2. TENDANCE - Direction d'évolution de l'indicateur */}
        <StatCard
          title="Tendance"
          value={trendLabel}
          icon={statistics.trendDirection === 'up' ? TrendingUp : 
                statistics.trendDirection === 'down' ? TrendingDown : Activity}
          color={trendColor}
          subtitle={`${statistics.changeFromPrevious > 0 ? '+' : ''}${formatValue(statistics.changeFromPrevious)} ${indicator.uniteDeMesure?.name || ''}`}
        />

        {/* 3. CROISSANCE ANNUELLE - Évolution moyenne par an */}
        <StatCard
          title="Croissance Annuelle"
          value={`${statistics.yearlyGrowthRate > 0 ? '+' : ''}${formatValue(statistics.yearlyGrowthRate)} %`}
          icon={BarChart3}
          color="green"
          subtitle="Taux moyen par an"
        />

        {/* 4. ÉCART À LA CIBLE - Performance par rapport à l'objectif */}
        <StatCard
          title="Écart à la Cible"
          value={`${statistics.gapToTarget > 0 ? '+' : ''}${formatValue(statistics.gapToTarget)} %`}
          icon={Target}
          color={statistics.gapToTarget >= 0 ? "green" : "red"}
          subtitle={`${statistics.percentGapToTarget > 0 ? '+' : ''}${formatValue(statistics.percentGapToTarget)}% de la cible`}
        />
      </div>

      {/* ========== VALEURS DE RÉFÉRENCE ET CIBLES ========== */}
      {/* Section affichée uniquement si des valeurs de référence ou cibles sont définies */}
      {(statistics.referenceValue > 0 || statistics.targetValue > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* VALEUR DE RÉFÉRENCE - Ligne de base pour les comparaisons */}
          <StatCard
            title="Valeur de Référence"
            value={`${formatValue(statistics.referenceValue)} %`}
            icon={Activity}
            color="gray"
            subtitle={`${indicator.uniteDeMesure?.name || ''}${statistics.referenceYear ? ` (${statistics.referenceYear})` : ''}`}
          />

          {/* VALEUR CIBLE - Objectif à atteindre */}
          <StatCard
            title="Valeur Cible"
            value={`${formatValue(statistics.targetValue)} %`}
            icon={Target}
            color="blue"
            subtitle={statistics.targetYear ? `Année cible: ${statistics.targetYear}` : ''}
          />

          {/* ÉCART VS CIBLE - Performance par rapport à l'objectif */}
          <StatCard
            title="Écart vs Cible"
            value={`${statistics.gapToTarget > 0 ? '+' : ''}${formatValue(statistics.gapToTarget)} %`}
            icon={statistics.gapToTarget >= 0 ? TrendingUp : TrendingDown}
            color={statistics.gapToTarget >= 0 ? "green" : "red"}
            subtitle={`${Math.abs(statistics.percentGapToTarget).toFixed(1)}% ${statistics.gapToTarget >= 0 ? 'au-dessus' : 'en-dessous'}`}
          />
        </div>
      )}

     
    </div>
  );
};

export default StatisticsDisplay;
