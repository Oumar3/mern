import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MetaData } from '../types/indicator';
import { fetchMetaDataById } from '../lib/metaDataApi';
import { 
  ArrowLeft, 
  Edit2, 
  Globe, 
  Target, 
  Database, 
  Calendar, 
  Building, 
  Users, 
  Mail, 
  Phone 
} from 'lucide-react';

const MetaDataDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMetaDataById(id);
        setMetaData(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to fetch MetaData");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/dashboard/meta-data/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/dashboard/meta-data');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h2>
              <p className="text-slate-600 mb-6">{error || 'Métadonnée non trouvée'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Détails de la Métadonnée
                </h1>
                <p className="text-slate-600 text-lg">{metaData.code}</p>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Edit2 className="h-5 w-5" />
              Modifier
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Informations de Base
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Nom:</span>
                <p className="text-slate-900 mt-1 text-lg">{metaData.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Code:</span>
                <p className="text-slate-900 mt-1 font-mono bg-white px-3 py-1 rounded border">
                  {metaData.code}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Domaine Thématique:</span>
                <p className="text-slate-900 mt-1">
                  {typeof metaData.thematicArea === 'object' && metaData.thematicArea !== null
                    ? `${metaData.thematicArea.code} - ${metaData.thematicArea.name}`
                    : metaData.thematicArea || 'Non spécifié'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Objectif:</span>
                <p className="text-slate-900 mt-1">{metaData.goal || 'Non spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Definitions */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Définitions
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Définition Internationale:</span>
                <p className="text-slate-900 mt-1">{metaData.internationalDefinition || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Définition Nationale:</span>
                <p className="text-slate-900 mt-1">{metaData.nationalDefinition || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>

          {/* Sources and Collection */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sources et Collecte
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Source Principale:</span>
                <p className="text-slate-900 mt-1">
                  {typeof metaData.mainDataSource === 'object' 
                    ? metaData.mainDataSource?.name 
                    : metaData.mainDataSource || 'Non spécifiée'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Source Primaire:</span>
                <p className="text-slate-900 mt-1">
                  {typeof metaData.primaryDataSource === 'object' 
                    ? metaData.primaryDataSource?.name 
                    : metaData.primaryDataSource || 'Non spécifiée'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Méthode de Collecte:</span>
                <p className="text-slate-900 mt-1">{metaData.dataCollectionMethod || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Détails Techniques
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Méthode de Calcul:</span>
                <p className="text-slate-900 mt-1">{metaData.calculationMethod || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Unité de Mesure:</span>
                <p className="text-slate-900 mt-1">
                  {typeof metaData.measurementUnit === 'object' 
                    ? metaData.measurementUnit?.name 
                    : metaData.measurementUnit || 'Non spécifiée'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Population Couverte:</span>
                <p className="text-slate-900 mt-1">{metaData.coveredPopulation || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Couverture Géographique:</span>
                <p className="text-slate-900 mt-1">{metaData.geographicCoverage || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Niveau de Désagrégation:</span>
                <div className="mt-1">
                  {metaData.disaggregationLevel && metaData.disaggregationLevel.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {metaData.disaggregationLevel.map((level, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-900">Non spécifié</p>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Périodicité de Publication:</span>
                <p className="text-slate-900 mt-1">{metaData.publicationPeriodicity || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width sections */}
        <div className="space-y-8">
          {/* Institutional */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Structures Institutionnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-slate-600">Structure de Production:</span>
                <p className="text-slate-900 mt-1">{metaData.responsibleProductionStructure || 'Non spécifiée'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Structure de Mise en Œuvre:</span>
                <p className="text-slate-900 mt-1">{metaData.implementationStructure || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>

          {/* Focal Points */}
          <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
            <h4 className="font-semibold text-rose-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Points Focaux ({(metaData.focalPoints || []).length})
            </h4>
            {(metaData.focalPoints || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metaData.focalPoints?.map((fp, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-rose-100 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-rose-600" />
                        <span className="font-medium text-slate-900">{fp.name || 'Nom non spécifié'}</span>
                      </div>
                      {fp.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3 w-3" />
                          <a 
                            href={`mailto:${fp.email}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {fp.email}
                          </a>
                        </div>
                      )}
                      {fp.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-3 w-3" />
                          <a 
                            href={`tel:${fp.phone}`}
                            className="text-green-600 hover:text-green-800 hover:underline"
                          >
                            {fp.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p>Aucun point focal défini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaDataDetail;
