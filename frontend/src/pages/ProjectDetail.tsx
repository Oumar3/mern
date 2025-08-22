import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { FiArrowLeft, FiHash, FiFileText, FiTag, FiMapPin, FiDollarSign, FiCheckCircle, FiCalendar, FiClock } from 'react-icons/fi';

interface Project {
  _id?: string;
  code: string;
  name: string;
  slug?: string;
  description: string;
  type: string;
  typology: string;
  zone?: string;
  programme: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  status: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'En cours': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'Terminé': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'Annulé': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'En attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'Suspendus': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['En cours'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <FiCheckCircle className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const getTypologyBadge = (typology: string) => {
    const config = typology === 'Gouvernance' 
      ? { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
      : { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {typology}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-gray-500 font-medium">Chargement du projet...</p>
      </div>
    </div>
  );
  if (!project) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-red-600 text-xl font-semibold">Projet introuvable</p>
        <p className="text-gray-500 mt-2">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 px-2 md:px-6 lg:px-12 xl:px-8 py-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="secondary" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border border-gray-200 hover:border-indigo-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour</span>
        </Button>
        <div className="h-6 w-px bg-gray-300"></div>
        <nav className="text-sm text-gray-600">
          <span className="hover:text-indigo-600 transition-colors">Projets</span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">{project.name}</span>
        </nav>
      </div>

      {/* Card principal avec gradient */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header du projet avec gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xl">
                    <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
                    <p className="text-indigo-100 mt-1 flex items-center gap-2">
                      <FiHash className="w-4 h-4" />
                      Code: {project.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium flex items-center gap-2">
                    <FiTag className="w-4 h-4" />
                    {project.type}
                  </span>
                  {getTypologyBadge(project.typology)}
                  {project.zone && (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      {project.zone}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-indigo-100 lg:text-2xl text-sm mb-1">Budget total</p>
                  <div className="flex items-center justify-end gap-2 text-xl font-bold">
                    <FiDollarSign className="w-6 h-6" />
                    <span>{project.budget.toLocaleString()} {project.currency}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  {getStatusBadge(project.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiFileText className="text-indigo-600" />
                  Description du projet
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.description || "Aucune description disponible."}
                </p>
              </div>
            </div>

            {/* Informations temporelles */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiCalendar className="text-blue-600" />
                  Calendrier du projet
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600 font-medium">Date de début</span>
                    <span className="text-gray-800 font-semibold">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600 font-medium">Date de fin</span>
                    <span className="text-gray-800 font-semibold">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '-'}
                    </span>
                  </div>
                  {project.startDate && project.endDate && (
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <span className="text-indigo-700 font-medium flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        Durée estimée
                      </span>
                      <span className="text-indigo-800 font-bold">
                        {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
