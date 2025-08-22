import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Target, BarChart3, Users, ArrowRight, Search, Building2, TrendingUp } from 'lucide-react';

interface Indicateur {
  _id: string;
  name: string;
  code: string;
  anne_deReference: number;
  valeur_deReference: number;
  anne_cible: number;
  valeur_cible: number;
  impact: string;
  uniteDeMesure: string;
  programmeId: string;
  programme?: {
    _id: string;
    name: string;
    code: string;
    domaine?: {
      _id: string;
      name: string;
      code: string;
    };
  };
}

const Indicateurs = () => {
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchIndicateurs = async () => {
      try {
        const response = await api.get('/indicateurs');
        setIndicateurs(response.data);
      } catch (error) {
        console.error('Error fetching indicateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicateurs();
  }, []);

  const filteredIndicateurs = indicateurs.filter(indicateur =>
    indicateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicateur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicateur.programme?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    indicateur.uniteDeMesure.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (reference: number, target: number, current = reference) => {
    const progress = ((current - reference) / (target - reference)) * 100;
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Tous les Indicateurs
            </h1>
            <p className="text-gray-600 text-lg">Gestion centralisée des indicateurs du PND</p>
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <Target className="h-8 w-8" />
            {indicateurs.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un indicateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Indicateurs Grid */}
      {filteredIndicateurs.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun indicateur trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Aucun indicateur disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIndicateurs.map((indicateur) => (
            <div key={indicateur._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {indicateur.name}
                    </h3>
                    <p className="text-sm text-gray-500">Code: {indicateur.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-indigo-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{indicateur.uniteDeMesure}</span>
                  </div>
                </div>
              </div>

              {/* Programme Info */}
              {indicateur.programme && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Building2 className="h-4 w-4" />
                    {indicateur.programme.name}
                  </div>
                  {indicateur.programme.domaine && (
                    <div className="mt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        <Users className="h-3 w-3" />
                        {indicateur.programme.domaine.name}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Values */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Référence ({indicateur.anne_deReference})</p>
                    <p className="text-lg font-bold text-blue-800">
                      {indicateur.valeur_deReference} {indicateur.uniteDeMesure}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Cible ({indicateur.anne_cible})</p>
                    <p className="text-lg font-bold text-green-800">
                      {indicateur.valeur_cible} {indicateur.uniteDeMesure}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Impact
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {indicateur.impact || 'Aucun impact défini'}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progression vers l'objectif</span>
                  <span className={`font-bold ${getProgressColor(indicateur.valeur_deReference, indicateur.valeur_cible)}`}>
                    En attente de données
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to={`/dashboard/domaines/${indicateur.programme?.domaine?._id}/programmes/${indicateur.programmeId}/indicateurs/${indicateur._id}`}
                  className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 group"
                >
                  <span className="font-medium">Voir le détail</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiques des Indicateurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{indicateurs.length}</p>
            <p className="text-sm text-indigo-700">Total Indicateurs</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {[...new Set(indicateurs.map(i => i.programmeId))].length}
            </p>
            <p className="text-sm text-green-700">Programmes Couverts</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {[...new Set(indicateurs.map(i => i.uniteDeMesure))].length}
            </p>
            <p className="text-sm text-blue-700">Unités de Mesure</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">
              {Math.round(indicateurs.reduce((sum, i) => sum + i.anne_cible, 0) / indicateurs.length) || 'N/A'}
            </p>
            <p className="text-sm text-orange-700">Année Cible Moyenne</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indicateurs;
