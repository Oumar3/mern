import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Briefcase, Target, Users, ArrowRight, Search, Building2 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  budget?: number;
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.programme?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en cours':
        return 'bg-green-100 text-green-800';
      case 'en pause':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminé':
        return 'bg-blue-100 text-blue-800';
      case 'suspendu':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Tous les Projets
            </h1>
            <p className="text-gray-600 text-lg">Gestion centralisée des projets du PND</p>
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
            <Briefcase className="h-8 w-8" />
            {projects.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun projet trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Aucun projet disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">Code: {project.code}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
              </div>

              {/* Programme Info */}
              {project.programme && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Building2 className="h-4 w-4" />
                    {project.programme.name}
                  </div>
                  {project.programme.domaine && (
                    <div className="mt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        <Users className="h-3 w-3" />
                        {project.programme.domaine.name}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {project.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Budget */}
              {project.budget && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Budget:</span>
                    <span className="text-green-600 font-bold">
                      {project.budget.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to={`/dashboard/programmes/${project.programmeId}/projects/${project._id}`}
                  className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 group"
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiques des Projets</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{projects.length}</p>
            <p className="text-sm text-purple-700">Total Projets</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {projects.filter(p => p.status.toLowerCase() === 'en cours').length}
            </p>
            <p className="text-sm text-green-700">En Cours</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {projects.filter(p => p.status.toLowerCase() === 'terminé').length}
            </p>
            <p className="text-sm text-blue-700">Terminés</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">
              {projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-orange-700">Budget Total (FCFA)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
