import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Target, Users, ArrowRight, Search, FolderTree } from 'lucide-react';

interface Programme {
  _id: string;
  name: string;
  code: string;
  objectif: string;
  domaineId: string;
  domaine?: {
    _id: string;
    name: string;
    code: string;
  };
}

const Programmes = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const response = await api.get('/programmes');
        setProgrammes(response.data);
      } catch (error) {
        console.error('Error fetching programmes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammes();
  }, []);

  const filteredProgrammes = programmes.filter(programme =>
    programme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    programme.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    programme.domaine?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Tous les Programmes
            </h1>
            <p className="text-gray-600 text-lg">Gestion centralisée des programmes du PND</p>
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
            <FolderTree className="h-8 w-8" />
            {programmes.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un programme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Programs Grid */}
      {filteredProgrammes.length === 0 ? (
        <div className="text-center py-16">
          <FolderTree className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun programme trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Aucun programme disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProgrammes.map((programme) => (
            <div key={programme._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-tr from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FolderTree className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {programme.name}
                    </h3>
                    <p className="text-sm text-gray-500">Code: {programme.code}</p>
                  </div>
                </div>
              </div>

              {/* Domain Info */}
              {programme.domaine && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Users className="h-4 w-4" />
                    {programme.domaine.name}
                  </div>
                </div>
              )}

              {/* Objective */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Objectif
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {programme.objectif || 'Aucun objectif défini'}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to={`/dashboard/domaines/${programme.domaineId}/programmes/${programme._id}`}
                  className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 group"
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiques des Programmes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{programmes.length}</p>
            <p className="text-sm text-green-700">Total Programmes</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {[...new Set(programmes.map(p => p.domaineId))].length}
            </p>
            <p className="text-sm text-blue-700">Domaines Couverts</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {programmes.filter(p => p.objectif && p.objectif.length > 0).length}
            </p>
            <p className="text-sm text-purple-700">Avec Objectifs</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">100%</p>
            <p className="text-sm text-orange-700">Accessibilité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programmes;
