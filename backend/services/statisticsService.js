import IndicatorFollowup from "../models/IndicatorFollowup.js";
import Indicator from "../models/Indicator.js";
import Province from "../models/Decoupage/Province.js";
import Departement from "../models/Decoupage/Departement.js";
import Commune from "../models/Decoupage/Commune.js";

export class StatisticsService {
    
    /**
     * Get statistics filtered by geographic level
     * @param {string} indicatorId - ID of the indicator
     * @param {string} geoLevel - Geographic level: 'Global', 'Province', 'Departement', 'Commune'
     * @param {string} geoEntityId - ID of the geographic entity (optional for Global)
     * @param {number} startYear - Start year filter (optional)
     * @param {number} endYear - End year filter (optional)
     */
    static async getFilteredStatistics(indicatorId, geoLevel = 'Global', geoEntityId = null, startYear = null, endYear = null) {
        try {
            // Get indicator with data
            const indicator = await Indicator.findById(indicatorId)
                .populate('uniteDeMesure', 'code name')
                .populate('programme', 'code name')
                .populate('source', 'name');

            if (!indicator) {
                throw new Error('Indicator not found');
            }

            // Filter indicator data based on geographic level
            let filteredDataIndices = [];
            
            if (geoLevel === 'Global') {
                // For global, include all data entries with Global type or specific entity if provided
                filteredDataIndices = indicator.data
                    .map((dataEntry, index) => {
                        if (dataEntry.geoLocation?.type === 'Global') return index;
                        if (geoEntityId && dataEntry.geoLocation?.referenceId?.toString() === geoEntityId) return index;
                        return null;
                    })
                    .filter(index => index !== null);
            } else {
                // For specific geographic level, filter by type and optionally by entity ID
                filteredDataIndices = indicator.data
                    .map((dataEntry, index) => {
                        if (dataEntry.geoLocation?.type === geoLevel) {
                            if (!geoEntityId || dataEntry.geoLocation?.referenceId?.toString() === geoEntityId) {
                                return index;
                            }
                        }
                        return null;
                    })
                    .filter(index => index !== null);
            }

            // Get followups for filtered data indices
            const followupQuery = {
                indicator: indicatorId,
                dataIndex: { $in: filteredDataIndices }
            };

            // Add year filters if provided
            if (startYear || endYear) {
                followupQuery.year = {};
                if (startYear) followupQuery.year.$gte = startYear;
                if (endYear) followupQuery.year.$lte = endYear;
            }

            const followups = await IndicatorFollowup.find(followupQuery).sort({ year: 1 });

            // Calculate statistics
            const statistics = this.calculateStatistics(followups, indicator, filteredDataIndices);

            // Get geographic entity details
            const geoEntityDetails = await this.getGeographicEntityDetails(geoLevel, geoEntityId);

            return {
                indicator: {
                    _id: indicator._id,
                    code: indicator.code,
                    name: indicator.name,
                    uniteDeMesure: indicator.uniteDeMesure,
                    programme: indicator.programme,
                    polarityDirection: indicator.polarityDirection
                },
                geoFilter: {
                    level: geoLevel,
                    entity: geoEntityDetails
                },
                timeFilter: {
                    startYear,
                    endYear
                },
                statistics,
                followups,
                dataIndices: filteredDataIndices
            };

        } catch (error) {
            console.error('Error in getFilteredStatistics:', error);
            throw error;
        }
    }

    // ============================================================================
    // 📊 CALCUL DES STATISTIQUES - Traitement des données de suivi
    // ============================================================================
    // Description: Calcule les métriques statistiques affichées dans l'interface
    // Responsabilités: Tendances, croissance, écarts aux cibles, valeurs de référence
    // ============================================================================
    
    /**
     * Calcule les statistiques essentielles à partir des données de suivi
     * @param {Array} followups - Données de suivi triées par année
     * @param {Object} indicator - Informations de l'indicateur
     * @param {Array} dataIndices - Indices des données filtrées
     * @returns {Object} - Statistiques calculées pour l'affichage
     */
    static calculateStatistics(followups, indicator, dataIndices) {
        // ========== GESTION DU CAS SANS DONNÉES ==========
        if (!followups || followups.length === 0) {
            return {
                totalDataPoints: 0,                    // Nombre de points de données
                latestValue: 0,                        // Dernière valeur enregistrée
                yearRange: null,                       // Plage d'années
                trendDirection: 'stable',              // Direction de tendance
                yearlyGrowthRate: 0,                   // Taux de croissance annuel
                changeFromPrevious: 0,                 // Changement vs période précédente
                percentChangeFromPrevious: 0,          // Changement en pourcentage
                referenceValue: 0,                     // Valeur de référence
                targetValue: 0,                        // Valeur cible
                targetYear: null,                      // Année cible
                referenceYear: null,                   // Année de référence
                gapToTarget: 0,                        // Écart à la cible
                percentGapToTarget: 0                  // Écart en pourcentage à la cible
            };
        }

        // ========== PRÉPARATION DES DONNÉES ==========
        const values = followups.map(f => f.value);                              // Toutes les valeurs
        const years = followups.map(f => f.year);                                // Toutes les années
        const sortedFollowups = [...followups].sort((a, b) => a.year - b.year); // Tri chronologique

        // ========== STATISTIQUES DE BASE ==========
        const totalDataPoints = followups.length;                               // Nombre total de points
        const latestValue = sortedFollowups[sortedFollowups.length - 1]?.value || 0;  // Dernière valeur
        const yearRange = `${Math.min(...years)} - ${Math.max(...years)}`;      // Plage temporelle

        // ========== ANALYSE DE TENDANCE ==========
        let trendDirection = 'stable';              // Direction par défaut
        let yearlyGrowthRate = 0;                   // Taux de croissance annuel
        let changeFromPrevious = 0;                 // Changement absolu
        let percentChangeFromPrevious = 0;             // Changement en pourcentage

        // Analyse des tendances si au moins 2 points de données existent
        if (sortedFollowups.length >= 2) {
            const recentValues = sortedFollowups.slice(-2);  // 2 dernières valeurs
            changeFromPrevious = recentValues[1].value - recentValues[0].value;
            
            // Calcul du pourcentage de changement
            percentChangeFromPrevious = recentValues[0].value !== 0 ? 
                (changeFromPrevious / recentValues[0].value) * 100 : 0;

            // Détermination de la direction de tendance
            trendDirection = changeFromPrevious > 0 ? 'up' : 
                           changeFromPrevious < 0 ? 'down' : 'stable';

            // Calcul du taux de croissance annuel moyen
            const earliestValue = sortedFollowups[0]?.value || 0;
            const yearSpan = Math.max(...years) - Math.min(...years);
            if (yearSpan > 0 && earliestValue !== 0) {
                yearlyGrowthRate = Math.pow(latestValue / earliestValue, 1 / yearSpan) - 1;
                yearlyGrowthRate *= 100; // Conversion en pourcentage
            }
        }

        // ========== VALEURS DE RÉFÉRENCE ET CIBLES ==========
        let referenceValue = 0;        // Valeur de référence (ligne de base)
        let targetValue = 0;           // Valeur cible à atteindre
        let targetYear = null;         // Année cible
        let referenceYear = null;      // Année de référence
        
        // Extraction des valeurs depuis la première entrée de données pertinente
        if (indicator.data && dataIndices.length > 0) {
            const relevantData = indicator.data[dataIndices[0]];
            if (relevantData) {
                referenceValue = relevantData.ref_value || 0;
                targetValue = relevantData.target_value || 0;
                targetYear = relevantData.target_year || null;
                referenceYear = relevantData.ref_year || null;
            }
        }

        // ========== CALCUL DES ÉCARTS À LA CIBLE ==========
        const gapToTarget = targetValue !== 0 ? latestValue - targetValue : 0;
        const percentGapToTarget = targetValue !== 0 ? 
            ((latestValue - targetValue) / targetValue) * 100 : 0;

        // ========== RETOUR DES STATISTIQUES CALCULÉES ==========
        return {
            totalDataPoints,                                                    // Nombre de points de données
            latestValue,                                                       // Dernière valeur
            yearRange,                                                         // Plage d'années
            trendDirection,                                                    // Direction de tendance
            yearlyGrowthRate: Math.round(yearlyGrowthRate * 100) / 100,       // Taux de croissance annuel (arrondi)
            changeFromPrevious: Math.round(changeFromPrevious * 100) / 100,   // Changement absolu (arrondi)
            percentChangeFromPrevious: Math.round(percentChangeFromPrevious * 100) / 100, // Changement % (arrondi)
            referenceValue,                                                    // Valeur de référence
            targetValue,                                                       // Valeur cible
            targetYear,                                                        // Année cible
            referenceYear,                                                     // Année de référence
            gapToTarget: Math.round(gapToTarget * 100) / 100,                 // Écart à la cible (arrondi)
            percentGapToTarget: Math.round(percentGapToTarget * 100) / 100    // Écart % à la cible (arrondi)
        };
    }

    // ============================================================================
    // 🗺️ GESTION DES ENTITÉS GÉOGRAPHIQUES - Détails des zones géographiques
    // ============================================================================
    
    /**
     * Récupère les détails d'une entité géographique
     * @param {string} geoLevel - Niveau géographique ('Global', 'Province', etc.)
     * @param {string} geoEntityId - ID de l'entité géographique
     * @returns {Object} - Détails de l'entité géographique
     */
    static async getGeographicEntityDetails(geoLevel, geoEntityId) {
        // Cas spécial pour le niveau national
        if (geoLevel === 'Global' && !geoEntityId) {
            return {
                _id: null,
                name: 'National',
                code: 'NAT',
                type: 'Global'
            };
        }

        if (!geoEntityId) return null;

        try {
            let entity = null;
            switch (geoLevel) {
                case 'Province':
                    entity = await Province.findById(geoEntityId);
                    break;
                case 'Departement':
                    entity = await Departement.findById(geoEntityId).populate('province', 'name code');
                    break;
                case 'Commune':
                    entity = await Commune.findById(geoEntityId).populate('departement', 'name code');
                    break;
            }

            if (entity) {
                return {
                    _id: entity._id,
                    name: entity.name,
                    code: entity.code,
                    type: geoLevel,
                    parent: entity.province || entity.departement || null
                };
            }
        } catch (error) {
            console.error('Error fetching geographic entity:', error);
        }

        return null;
    }

    // ============================================================================
    // 📈 GÉNÉRATION DES DONNÉES DE GRAPHIQUE - Données filtrées pour Chart.js
    // ============================================================================
    
    /**
     * Récupère les données de graphique filtrées par niveau géographique
     * @param {string} indicatorId - ID de l'indicateur
     * @param {string} geoLevel - Niveau géographique ('Global', 'Province', etc.)
     * @param {array} geoEntityIds - IDs des entités spécifiques (optionnel)
     * @param {number} startYear - Année de début (optionnelle)
     * @param {number} endYear - Année de fin (optionnelle)
     * @returns {Object} - Données formatées pour Chart.js
     */
    static async getFilteredChartData(indicatorId, geoLevel = 'Global', geoEntityIds = [], startYear = null, endYear = null) {
        try {
            console.log(`🚀 getFilteredChartData appelé avec:`, {
                indicatorId, 
                geoLevel, 
                geoEntityIds: geoEntityIds,
                startYear, 
                endYear
            });

            const indicator = await Indicator.findById(indicatorId);
            if (!indicator) {
                throw new Error('Indicator not found');
            }

            // ========== LOGIQUE DE SÉLECTION DES ENTITÉS ==========
            let targetEntityIds = [];
            
            if (geoLevel === 'Global') {
                // Niveau global : pas d'entités spécifiques
                targetEntityIds = [];
                console.log(`🌍 Niveau Global sélectionné - aucune entité spécifique`);
            } else if (geoEntityIds.length > 0) {
                // Une ou plusieurs entités spécifiques sont sélectionnées
                targetEntityIds = geoEntityIds;
                console.log(`🎯 Entité(s) spécifique(s) sélectionnée(s) (${geoLevel}):`, targetEntityIds);
            } else {
                // Aucune entité spécifique : afficher TOUTES les entités du niveau
                console.log(`📊 Aucune entité spécifique, chargement de toutes les ${geoLevel}s`);
                let entities = [];
                const Province = (await import("../models/Decoupage/Province.js")).default;
                const Departement = (await import("../models/Decoupage/Departement.js")).default;
                const Commune = (await import("../models/Decoupage/Commune.js")).default;
                
                switch (geoLevel) {
                    case 'Province':
                        entities = await Province.find({}, '_id');
                        break;
                    case 'Departement':
                        entities = await Departement.find({}, '_id');
                        break;
                    case 'Commune':
                        entities = await Commune.find({}, '_id');
                        break;
                }
                targetEntityIds = entities.map(e => e._id.toString());
                console.log(`✅ Trouvé ${entities.length} entités ${geoLevel}, premières: [${targetEntityIds.slice(0, 3).join(', ')}...]`);
            }

            // ========== FILTRAGE DES INDICES DE DONNÉES ==========
            let filteredDataIndices = [];
            if (geoLevel === 'Global') {
                // Pour Global : toutes les données de type Global
                filteredDataIndices = indicator.data
                    .map((dataEntry, index) => dataEntry.geoLocation?.type === 'Global' ? index : null)
                    .filter(index => index !== null);
            } else {
                // Pour les autres niveaux : filtrer selon les entités cibles
                filteredDataIndices = indicator.data
                    .map((dataEntry, index) => {
                        if (dataEntry.geoLocation?.type === geoLevel) {
                            const entityId = dataEntry.geoLocation?.referenceId?.toString();
                            // Si targetEntityIds est vide (toutes les entités) OU contient cette entité
                            if (targetEntityIds.length === 0 || targetEntityIds.includes(entityId)) {
                                return index;
                            }
                        }
                        return null;
                    })
                    .filter(index => index !== null);
            }

            console.log(`📈 Indices de données filtrés pour ${geoLevel}:`, filteredDataIndices.length, 'entrées');

            // ========== REQUÊTE DES DONNÉES DE SUIVI ==========
            const followupQuery = {
                indicator: indicatorId,
                dataIndex: { $in: filteredDataIndices }
            };

            // Ajout des filtres temporels si fournis
            if (startYear || endYear) {
                followupQuery.year = {};
                if (startYear) followupQuery.year.$gte = startYear;
                if (endYear) followupQuery.year.$lte = endYear;
            }

            const followups = await IndicatorFollowup.find(followupQuery).sort({ year: 1, dataIndex: 1 });
            console.log(`📊 Données de suivi récupérées:`, followups.length, 'points');

            // ========== ORGANISATION DES DONNÉES POUR LE GRAPHIQUE ==========
            const chartData = await this.organizeChartData(followups, indicator, geoLevel);

            return chartData;

        } catch (error) {
            console.error('Error in getFilteredChartData:', error);
            throw error;
        }
    }

    /**
     * Organize chart data by data entries
     */
    static async organizeChartData(followups, indicator, geoLevel) {
        // Group followups by dataIndex
        const groupedData = followups.reduce((acc, followup) => {
            if (!acc[followup.dataIndex]) {
                acc[followup.dataIndex] = [];
            }
            acc[followup.dataIndex].push(followup);
            return acc;
        }, {});

        // Get all unique years
        const allYears = [...new Set(followups.map(f => f.year))].sort();

        // Create datasets for each data entry
        const datasets = [];
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

        for (const [dataIndexStr, dataFollowups] of Object.entries(groupedData)) {
            const dataIndex = parseInt(dataIndexStr);
            const dataEntry = indicator.data[dataIndex];
            
            if (!dataEntry) continue;

            // Get entity name for this data entry
            let entityName = await this.getEntityNameForDataEntry(dataEntry, geoLevel);

            // Create data array with values for each year
            const data = allYears.map(year => {
                const followup = dataFollowups.find(f => f.year === year);
                return followup ? followup.value : null;
            });

            datasets.push({
                label: entityName,
                data,
                borderColor: colors[dataIndex % colors.length],
                backgroundColor: colors[dataIndex % colors.length] + '20',
                fill: false,
                tension: 0.4,
                pointBackgroundColor: colors[dataIndex % colors.length],
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                spanGaps: true
            });
        }

        return {
            labels: allYears.map(y => y.toString()),
            datasets
        };
    }

    /**
     * Get entity name for a data entry
     */
    static async getEntityNameForDataEntry(dataEntry, geoLevel) {
        const geoType = dataEntry.geoLocation?.type;
        const referenceId = dataEntry.geoLocation?.referenceId;

        if (geoType === 'Global') {
            return 'National';
        }

        if (!referenceId) {
            return `${geoType || 'Inconnu'}`;
        }

        try {
            let entity = null;
            switch (geoType) {
                case 'Province':
                    entity = await Province.findById(referenceId);
                    break;
                case 'Departement':
                    entity = await Departement.findById(referenceId);
                    break;
                case 'Commune':
                    entity = await Commune.findById(referenceId);
                    break;
            }

            if (entity) {
                // Filtrer et nettoyer les informations démographiques
                const demographicInfo = [
                    dataEntry.ageRange && dataEntry.ageRange.trim() !== '' && dataEntry.ageRange.toLowerCase() !== 'tous' && dataEntry.ageRange.toLowerCase() !== 'tout' ? dataEntry.ageRange : null,
                    dataEntry.gender && dataEntry.gender.trim() !== '' && dataEntry.gender.toLowerCase() !== 'tous' && dataEntry.gender.toLowerCase() !== 'tout' ? dataEntry.gender : null,
                    dataEntry.residentialArea && dataEntry.residentialArea.trim() !== '' && dataEntry.residentialArea.toLowerCase() !== 'tous' && dataEntry.residentialArea.toLowerCase() !== 'tout' ? dataEntry.residentialArea : null
                ].filter(Boolean);

                // Si il y a des informations démographiques significatives, les inclure
                if (demographicInfo.length > 0) {
                    return `${entity.name} (${demographicInfo.join(' - ')})`;
                } else {
                    // Sinon, afficher seulement le nom de l'entité géographique
                    return entity.name;
                }
            }
        } catch (error) {
            console.error('Error fetching entity for data entry:', error);
        }

        return `${geoType}: (${referenceId})`;
    }

    /**
     * Get comparison statistics between different geographic entities
     */
    static async getComparisonStatistics(indicatorId, comparisons = []) {
        try {
            const results = [];

            for (const comparison of comparisons) {
                const stats = await this.getFilteredStatistics(
                    indicatorId,
                    comparison.geoLevel,
                    comparison.geoEntityId,
                    comparison.startYear,
                    comparison.endYear
                );
                results.push({
                    ...stats,
                    comparisonLabel: comparison.label || stats.geoFilter.entity?.name || 'Sans nom'
                });
            }

            return results;
        } catch (error) {
            console.error('Error in getComparisonStatistics:', error);
            throw error;
        }
    }
}

export default StatisticsService;
