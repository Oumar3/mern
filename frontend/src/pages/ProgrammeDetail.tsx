import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import api from '../lib/api';
import { FileText, Tag, Layers, DollarSign, Flag, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import ProjectCrud from '../components/ProjectCrud';
import IndicateurCrud from '../components/IndicateurCrud';
import ProgrammeIndicatorCrud from '../components/ProgrammeIndicatorCrud';
import OrientationCrud from '../components/OrientationCrud';

interface Programme {
  _id?: string;
  code: string;
  name: string;
  objectif: string;
  domaine: { name: string; code: string } | string;
  cost: number;
  currency: string;
  startDate: string;
  endDate: string;
}

const ProgrammeDetail = () => {
  const { id, domaineId } = useParams<{ id: string; domaineId: string }>();
  const navigate = useNavigate();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orientation' | 'projects' | 'indicateur' | 'indicators'>('orientation');

  useEffect(() => {
    const fetchProgramme = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/programmes/${id}`);
        setProgramme(res.data);
      } catch {
        setProgramme(null);
      }
      setLoading(false);
    };
    fetchProgramme();
  }, [id]);

  const getTabConfig = (tab: string) => {
    const configs = {
      orientation: { icon: Flag, label: 'Orientations', color: 'text-purple-600' },
      projects: { icon: Layers, label: 'Projets', color: 'text-blue-600' },
      indicateur: { icon: FileText, label: 'Indicateur (Ancien)', color: 'text-orange-600' },
      indicators: { icon: Tag, label: 'Indicateurs', color: 'text-green-600' },
    };
    return configs[tab as keyof typeof configs] || configs.orientation;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-gray-500 font-medium">Chargement du programme...</p>
        </div>
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-red-600 text-xl font-semibold">Programme introuvable</p>
          <p className="text-gray-500 mt-2">Le programme que vous recherchez n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 px-2 md:px-6 lg:px-12 xl:px-8 py-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-3 mb-8">
        <Button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border border-gray-200 hover:border-purple-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour</span>
        </Button>
        <div className="h-6 w-px bg-gray-300"></div>
        <nav className="text-sm text-gray-600">
          <span className="hover:text-purple-600 transition-colors">Programmes</span>
          <span className="mx-2">/</span>
          <span className="text-purple-600 font-medium">{programme.name}</span>
        </nav>
      </div>

      {/* Card principal avec informations du programme */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        {/* Header du programme avec gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm">
                    <FileText size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{programme.name}</h1>
                    <p className="text-purple-100 mt-1 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Code: {programme.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
                    <Flag className="w-4 h-4" />
                    {typeof programme.domaine === 'object' ? programme.domaine.name : programme.domaine}
                  </span>
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-purple-100 text-xl mb-1">Budget total</p>
                  <div className="flex items-center justify-end gap-2 text-2xl lg:text-3xl font-bold">
                    <DollarSign className="w-6 h-6" />
                    <span>{programme.cost?.toLocaleString()} {programme.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section objectif */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="text-purple-600" />
              Objectif du programme
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {programme.objectif || <span className="text-gray-400 italic">Aucun objectif défini</span>}
            </p>
          </div>

          {/* Informations additionnelles */}
          {(programme.startDate || programme.endDate) && (
            <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Calendrier du programme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programme.startDate && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600 font-medium">Date de début</span>
                    <span className="text-gray-800 font-semibold">
                      {new Date(programme.startDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                {programme.endDate && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600 font-medium">Date de fin</span>
                    <span className="text-gray-800 font-semibold">
                      {new Date(programme.endDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section avec onglets */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Navigation par onglets améliorée */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 px-8 pt-4 pb-0">
            {[
              { key: 'orientation', icon: Flag, label: 'Orientations', color: 'purple' },
              { key: 'projects', icon: Layers, label: 'Projets', color: 'blue' },
              { key: 'indicators', icon: Tag, label: 'Indicateurs', color: 'green' },
            ].map(({ key, icon: Icon, label, color }) => (
              <button
                key={key}
                className={`py-3 px-6 font-medium rounded-t-xl transition-all duration-200 flex items-center gap-2 ${
                  activeTab === key 
                    ? `bg-white text-${color}-700 border-t-2 border-${color}-500 shadow-sm -mb-px` 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(key as any)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="p-8">
          {activeTab === 'projects' && (
            <div className="animate-fadeIn">
              <ProjectCrud programmeId={programme._id!} />
            </div>
          )}
          {activeTab === 'indicateur' && (
            <div className="animate-fadeIn">
              <IndicateurCrud programmeId={programme._id!} domaineId={domaineId} />
            </div>
          )}
          {activeTab === 'indicators' && (
            <div className="animate-fadeIn">
              <ProgrammeIndicatorCrud programmeId={programme._id!} domaineId={domaineId} />
            </div>
          )}
          {activeTab === 'orientation' && programme._id && (
            <div className="animate-fadeIn">
              <OrientationCrud programmeId={programme._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammeDetail;
