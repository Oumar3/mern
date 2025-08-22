// ============================================================================
// 🗺️ COMPOSANT DE FILTRAGE GÉOGRAPHIQUE - Sélection des zones et périodes
// ============================================================================
// Description: Interface pour filtrer les données par niveau géographique et temporel
// Responsabilités: Sélection niveau/entité, filtre temporel, état des filtres
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Building, Home, Calendar, BarChart3, Filter } from 'lucide-react';
import api from '../lib/api';

// ============================================================================
// 📝 TYPES ET INTERFACES - Définitions des structures de données
// ============================================================================

// Structure d'une entité géographique (province, département, commune)
interface GeographicEntity {
  _id: string;                                    // Identifiant unique
  name: string;                                   // Nom de l'entité
  code: string;                                   // Code officiel
  province?: { name: string; code: string };      // Province parente (optionnelle)
  departement?: { name: string; code: string };   // Département parent (optionnel)
}

// Props du composant principal
interface GeographicFilterProps {
  onFilterChange: (filter: GeographicFilter) => void;  // Callback pour les changements de filtre
  currentFilter: GeographicFilter;                     // État actuel du filtre
}

// Structure du filtre géographique et temporel
export interface GeographicFilter {
  level: 'Global' | 'Province' | 'Departement' | 'Commune';  // Niveau géographique
  entityId?: string;                              // ID de l'entité sélectionnée (optionnel)
  entityName?: string;                            // Nom de l'entité sélectionnée (optionnel)
  startYear?: number;                             // Année de début (optionnelle)
  endYear?: number;                               // Année de fin (optionnelle)
}

// ============================================================================
// 🔧 CONFIGURATION - Niveaux géographiques disponibles
// ============================================================================

// Configuration des niveaux géographiques avec icônes et couleurs
const GEOGRAPHIC_LEVELS = [
  { value: 'Global', label: 'National', icon: Globe, color: 'blue' },
  { value: 'Province', label: 'Provincial', icon: MapPin, color: 'green' },
  { value: 'Departement', label: 'Départemental', icon: Building, color: 'purple' },
  { value: 'Commune', label: 'Communal', icon: Home, color: 'orange' },
];

// ============================================================================
// 🎨 COMPOSANT PRINCIPAL - Interface de filtrage géographique et temporel
// ============================================================================

const GeographicFilterComponent: React.FC<GeographicFilterProps> = ({ 
  onFilterChange, 
  currentFilter 
}) => {
  // ============================================================================
  // 📊 GESTION D'ÉTAT - Variables d'état du composant
  // ============================================================================
  
  const [isOpen, setIsOpen] = useState(false);                    // État d'ouverture du panneau
  const [entities, setEntities] = useState<GeographicEntity[]>([]);  // Liste des entités géographiques
  const [loadingEntities, setLoadingEntities] = useState(false);  // État de chargement des entités

  // ============================================================================
  // 🔄 EFFETS ET CHARGEMENT DES DONNÉES
  // ============================================================================
  
  // Chargement des entités quand le niveau géographique change
  useEffect(() => {
    if (currentFilter.level !== 'Global') {
      loadEntities(currentFilter.level);
    } else {
      setEntities([]);  // Pas d'entités pour le niveau Global
    }
  }, [currentFilter.level]);

  // ============================================================================
  // 🛠️ FONCTIONS UTILITAIRES - Chargement et gestion des données
  // ============================================================================
  
  /**
   * Charge les entités géographiques selon le niveau sélectionné
   * @param level - Niveau géographique ('Province', 'Departement', 'Commune')
   */
  const loadEntities = async (level: string) => {
    try {
      setLoadingEntities(true);
      const response = await api.get(`/statistics/geographic-entities?level=${level}`);
      setEntities(response.data);
    } catch (error) {
      console.error('Error loading entities:', error);
      setEntities([]);
    } finally {
      setLoadingEntities(false);
    }
  };

  // ============================================================================
  // 📝 GESTIONNAIRES D'ÉVÉNEMENTS - Callbacks pour les interactions utilisateur
  // ============================================================================
  
  /**
   * Gère le changement de niveau géographique
   * @param level - Nouveau niveau géographique sélectionné
   */
  const handleLevelChange = (level: GeographicFilter['level']) => {
    const newFilter: GeographicFilter = {
      level,
      startYear: currentFilter.startYear,
      endYear: currentFilter.endYear
    };

    // Réinitialisation de l'entité lors du changement de niveau
    if (level === 'Global') {
      newFilter.entityId = undefined;
      newFilter.entityName = 'National';
    }

    onFilterChange(newFilter);
  };

  /**
   * Gère le changement d'entité géographique
   * @param entityId - ID de la nouvelle entité sélectionnée
   */
  const handleEntityChange = (entityId: string) => {
    const entity = entities.find(e => e._id === entityId);
    onFilterChange({
      ...currentFilter,
      entityId,
      entityName: entity?.name || ''
    });
  };

  /**
   * Gère le changement des années de début et fin
   * @param type - Type de changement ('startYear' ou 'endYear')
   * @param value - Nouvelle valeur (chaîne à convertir en nombre)
   */
  const handleYearChange = (type: 'startYear' | 'endYear', value: string) => {
    onFilterChange({
      ...currentFilter,
      [type]: value ? parseInt(value) : undefined
    });
  };

  /**
   * Réinitialise tous les filtres à leurs valeurs par défaut
   */
  const resetFilter = () => {
    onFilterChange({
      level: 'Global',
      entityName: 'National'
    });
  };

  // ============================================================================
  // 🎨 PRÉPARATION DE L'AFFICHAGE - Variables pour le rendu
  // ============================================================================
  
  // Récupération des informations du niveau actuel pour l'affichage
  const currentLevel = GEOGRAPHIC_LEVELS.find(l => l.value === currentFilter.level);
  const IconComponent = currentLevel?.icon || Globe;

  // ============================================================================
  // 🎨 RENDU PRINCIPAL - Interface utilisateur du filtre
  // ============================================================================
  
  return (
    <div className="relative">
      
      {/* ========== BOUTON DÉCLENCHEUR DU FILTRE ========== */}
      {/* Bouton principal qui affiche l'état actuel et ouvre/ferme le panneau */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200
          ${isOpen 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }
        `}
      >
        {/* Icône du niveau géographique actuel */}
        <div className={`p-2 rounded-full bg-${currentLevel?.color || 'blue'}-100`}>
          <IconComponent className={`h-5 w-5 text-${currentLevel?.color || 'blue'}-600`} />
        </div>
        
        {/* Informations textuelles du filtre actuel */}
        <div className="text-left">
          <div className="font-medium">
            Niveau {currentLevel?.label || 'National'}
          </div>
          <div className="text-sm text-gray-900">
            {currentFilter.entityName}
            {/* Affichage de la période si sélectionnée */}
            {(currentFilter.startYear || currentFilter.endYear) && (
              <span className="ml-2 text-blue-600">
                ({currentFilter.startYear || ''}{currentFilter.startYear && currentFilter.endYear ? ' - ' : ''}{currentFilter.endYear || ''})
              </span>
            )}
          </div>
        </div>
        
        {/* Icône d'état (rotation selon ouverture/fermeture) */}
        <Filter className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ========== PANNEAU DE FILTRES ========== */}
      {/* Panneau modal qui s'affiche au-dessus des autres éléments */}
      {isOpen && (
        <>
          {/* Arrière-plan semi-transparent pour fermer le panneau */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Contenu principal du panneau de filtres */}
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-6">
              
              {/* En-tête du panneau avec titre et bouton de réinitialisation */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Filtres Géographiques et Temporels
                </h3>
                <button
                  onClick={resetFilter}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Réinitialiser
                </button>
              </div>

              {/* ========== SÉLECTION DU NIVEAU GÉOGRAPHIQUE ========== */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Niveau géographique
                </label>
                {/* Grille de boutons pour chaque niveau */}
                <div className="grid grid-cols-2 gap-2">
                  {GEOGRAPHIC_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isActive = currentFilter.level === level.value;
                    
                    return (
                      <button
                        key={level.value}
                        onClick={() => handleLevelChange(level.value as GeographicFilter['level'])}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                          ${isActive
                            ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700`
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? `text-${level.color}-600` : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ========== SÉLECTION DE L'ENTITÉ SPÉCIFIQUE ========== */}
              {/* Affiché uniquement si un niveau autre que Global est sélectionné */}
              {currentFilter.level !== 'Global' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner {currentLevel?.label.toLowerCase()}
                  </label>
                  {/* Indicateur de chargement ou liste déroulante */}
                  {loadingEntities ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <select
                      value={currentFilter.entityId || ''}
                      onChange={(e) => handleEntityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      {entities.map((entity) => (
                        <option key={entity._id} value={entity._id}>
                          {entity.name} ({entity.code})
                          {entity.province && ` - ${entity.province.name}`}
                          {entity.departement && ` - ${entity.departement.name}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* ========== SÉLECTION DE LA PÉRIODE TEMPORELLE ========== */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Période temporelle (optionnelle)
                </label>
                {/* Champs pour année de début et fin */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Année de début (optionnelle)</label>
                    <input
                      type="number"
                      placeholder="Ex: 2020"
                      value={currentFilter.startYear || ''}
                      onChange={(e) => handleYearChange('startYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1900"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Année de fin (optionnelle)</label>
                    <input
                      type="number"
                      placeholder="Ex: 2024"
                      value={currentFilter.endYear || ''}
                      onChange={(e) => handleYearChange('endYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1900"
                      max="2100"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Laissez vide pour inclure toutes les années disponibles
                </p>
              </div>

              {/* ========== BOUTON D'APPLICATION DES FILTRES ========== */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Appliquer les filtres
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GeographicFilterComponent;
