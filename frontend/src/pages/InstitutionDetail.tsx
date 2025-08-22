import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';
import api from '../lib/api';

type Programme = {
  _id: string;
  name: string;
  code: string;
  objectif?: string;
};

type Promise = {
  _id?: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'XAF' | 'XOF';
  description?: string;
  promiseDate: string;
  status: 'pending' | 'fulfilled' | 'partial' | 'cancelled';
};

type Institution = {
  _id?: string;
  name: string;
  shortName?: string;
  description?: string;
  category: 'financial_backer' | 'technical' | 'implementation' | 'governmental' | 'ngo' | 'private_sector' | 'academic' | 'international';
  interventionAreas?: string[];
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  promises?: Promise[];
  createdAt?: string;
  updatedAt?: string;
};

const CATEGORIES = [
  { value: 'financial_backer', label: 'Bailleur de Fonds', icon: DollarSign },
  { value: 'technical', label: 'Support Technique', icon: Target },
  { value: 'implementation', label: 'Mise en Œuvre', icon: Users },
  { value: 'governmental', label: 'Gouvernemental', icon: Building2 },
  { value: 'ngo', label: 'ONG', icon: Award },
  { value: 'private_sector', label: 'Secteur Privé', icon: TrendingUp },
  { value: 'academic', label: 'Académique', icon: Award },
  { value: 'international', label: 'International', icon: Globe },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'fulfilled', label: 'Accomplie' },
  { value: 'partial', label: 'Partiellement accomplie' },
  { value: 'cancelled', label: 'Annulée' },
];

const InstitutionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchInstitution(id);
      fetchProgrammes();
    }
  }, [id]);

  const fetchInstitution = async (institutionId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/institutions/${institutionId}`);
      setInstitution(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'institution:', error);
    }
    setLoading(false);
  };

  const fetchProgrammes = async () => {
    try {
      const response = await api.get('/programmes');
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  const handleDelete = async () => {
    if (institution?._id && window.confirm('Êtes-vous sûr de vouloir supprimer cette institution ?')) {
      try {
        await api.delete(`/institutions/${institution._id}`);
        navigate('/institutions');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = CATEGORIES.find(c => c.value === category);
    const IconComponent = categoryData?.icon || Building2;
    return <IconComponent className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      financial_backer: 'from-green-500 to-emerald-600',
      technical: 'from-blue-500 to-cyan-600',
      implementation: 'from-purple-500 to-violet-600',
      governmental: 'from-red-500 to-rose-600',
      ngo: 'from-yellow-500 to-orange-600',
      private_sector: 'from-indigo-500 to-purple-600',
      academic: 'from-pink-500 to-rose-600',
      international: 'from-teal-500 to-cyan-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find(c => c.value === category);
    return found ? found.label : category;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found ? found.label : status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ComponentType<{className?: string}>> = {
      pending: Clock,
      fulfilled: CheckCircle2,
      partial: TrendingUp,
      cancelled: AlertCircle
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Chargement des détails...</span>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Institution non trouvée</h2>
          <button
            onClick={() => navigate('/institutions')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour à la liste des institutions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${getCategoryColor(institution.category)} text-white`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/institutions')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-white/20 rounded-lg">
                {getCategoryIcon(institution.category)}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{institution.name}</h1>
                {institution.shortName && (
                  <p className="text-white/80 text-lg">({institution.shortName})</p>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border-white/30 mt-2">
                  {getCategoryLabel(institution.category)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/institutions/${institution._id}/edit`)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Edit className="w-5 h-5" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 className="w-5 h-5" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Quick Stats for Financial Backers */}
          {institution.category === 'financial_backer' && institution.promises && institution.promises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Promis</p>
                    {(() => {
                      const groupedByCurrency = institution.promises?.reduce((acc, p) => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                        return acc;
                      }, {} as Record<string, number>) || {};
                      
                      return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                        <div key={currency} className="text-white">
                          <span className="text-lg font-bold">
                            {new Intl.NumberFormat('fr-FR').format(amount)} {currency}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                  <DollarSign className="w-8 h-8 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Accompli</p>
                    {(() => {
                      const groupedByCurrency = institution.promises?.filter(p => p.status === 'fulfilled').reduce((acc, p) => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                        return acc;
                      }, {} as Record<string, number>) || {};
                      
                      return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                        <div key={currency} className="text-white">
                          <span className="text-lg font-bold">
                            {new Intl.NumberFormat('fr-FR').format(amount)} {currency}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Promesses</p>
                    <p className="text-2xl font-bold text-white">
                      {institution.promises.length}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-white/60" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Vue d'ensemble
              </div>
            </button>
            
            {institution.contact && Object.values(institution.contact).some(v => v) && (
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </div>
              </button>
            )}
            
            {institution.interventionAreas && institution.interventionAreas.length > 0 && (
              <button
                onClick={() => setActiveTab('interventions')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'interventions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Interventions
                </div>
              </button>
            )}
            
            {institution.category === 'financial_backer' && (
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'financial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financement
                </div>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Informations
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            {institution.description && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{institution.description}</p>
              </div>
            )}

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Type d'institution</h3>
                    <p className="text-gray-600">{getCategoryLabel(institution.category)}</p>
                  </div>
                </div>
              </div>

              {institution.contact?.email && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Contact principal</h3>
                      <p className="text-gray-600 truncate">{institution.contact.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {institution.interventionAreas && institution.interventionAreas.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Domaines d'intervention</h3>
                      <p className="text-gray-600">{institution.interventionAreas.length} domaine(s)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && institution.contact && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Mail className="w-7 h-7 text-blue-600" />
              Informations de contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institution.contact.email && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <a href={`mailto:${institution.contact.email}`} className="text-blue-600 hover:text-blue-800">
                      {institution.contact.email}
                    </a>
                  </div>
                </div>
              )}
              
              {institution.contact.phone && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Téléphone</h3>
                    <a href={`tel:${institution.contact.phone}`} className="text-green-600 hover:text-green-800">
                      {institution.contact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {institution.contact.address && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Adresse</h3>
                    <p className="text-gray-700">{institution.contact.address}</p>
                  </div>
                </div>
              )}
              
              {institution.contact.website && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Site web</h3>
                    <a 
                      href={institution.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 underline"
                    >
                      {institution.contact.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interventions Tab */}
        {activeTab === 'interventions' && institution.interventionAreas && institution.interventionAreas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Target className="w-7 h-7 text-purple-600" />
              Domaines d'intervention ({institution.interventionAreas.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institution.interventionAreas.map((areaId) => {
                const programme = programmes.find(p => p._id === areaId);
                return programme ? (
                  <div key={programme._id} className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-900 text-lg">{programme.code}</h3>
                        <h4 className="font-semibold text-purple-800 mt-1">{programme.name}</h4>
                      </div>
                    </div>
                    {programme.objectif && (
                      <p className="text-purple-700 leading-relaxed">{programme.objectif}</p>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && institution.category === 'financial_backer' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Promis</p>
                    {(() => {
                      const groupedByCurrency = institution.promises?.reduce((acc, p) => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                        return acc;
                      }, {} as Record<string, number>) || {};
                      
                      return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                        <div key={currency} className="mb-1">
                          <p className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('fr-FR').format(amount)}
                          </p>
                          <p className="text-gray-500 text-xs">{currency}</p>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Accompli</p>
                    {(() => {
                      const groupedByCurrency = institution.promises?.filter(p => p.status === 'fulfilled').reduce((acc, p) => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                        return acc;
                      }, {} as Record<string, number>) || {};
                      
                      return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                        <div key={currency} className="mb-1">
                          <p className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('fr-FR').format(amount)}
                          </p>
                          <p className="text-gray-500 text-xs">{currency}</p>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">En Attente</p>
                    {(() => {
                      const groupedByCurrency = institution.promises?.filter(p => p.status === 'pending').reduce((acc, p) => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                        return acc;
                      }, {} as Record<string, number>) || {};
                      
                      return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                        <div key={currency} className="mb-1">
                          <p className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('fr-FR').format(amount)}
                          </p>
                          <p className="text-gray-500 text-xs">{currency}</p>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Promesses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {institution.promises?.length || 0}
                    </p>
                    <p className="text-gray-500 text-xs">promesses</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Promises List */}
            {institution.promises && institution.promises.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Détail des promesses de financement</h3>
                <div className="space-y-6">
                  {institution.promises.map((promise, index) => (
                    <div key={promise._id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {new Intl.NumberFormat('fr-FR').format(promise.amount)} {promise.currency}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                Promis le {new Date(promise.promiseDate).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(promise.status)}`}>
                          <span className="mr-2">{getStatusIcon(promise.status)}</span>
                          {getStatusLabel(promise.status)}
                        </span>
                      </div>
                      {promise.description && (
                        <div className="pl-16">
                          <p className="text-gray-700 leading-relaxed">{promise.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!institution.promises || institution.promises.length === 0) && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Aucune promesse de financement</h3>
                <p className="text-gray-400">Cette institution n'a pas encore fait de promesses de financement.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Settings className="w-7 h-7 text-gray-600" />
              Informations système
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">ID Institution</h3>
                <p className="text-gray-600 font-mono text-sm">{institution._id}</p>
              </div>
              
              {institution.createdAt && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">Date de création</h3>
                  <p className="text-gray-600">{new Date(institution.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}
              
              {institution.updatedAt && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">Dernière modification</h3>
                  <p className="text-gray-600">{new Date(institution.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">Type d'institution</h3>
                <p className="text-gray-600">{getCategoryLabel(institution.category)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionDetail;
