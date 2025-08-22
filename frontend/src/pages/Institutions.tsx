import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Mail, 
  Phone, 
  Globe,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  X
} from 'lucide-react';
import Modal from '../components/ui/Modal';
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

const CURRENCIES = [
  { value: 'XAF', label: 'XAF (Franc CFA)' },
  { value: 'USD', label: 'USD (Dollar Américain)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'XOF', label: 'XOF (Franc CFA Ouest)' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'fulfilled', label: 'Accomplie' },
  { value: 'partial', label: 'Partiellement accomplie' },
  { value: 'cancelled', label: 'Annulée' },
];

const Institutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const navigate = useNavigate();

  const [form, setForm] = useState<Institution>({
    name: '',
    shortName: '',
    description: '',
    category: 'financial_backer',
    interventionAreas: [],
    contact: {},
    promises: []
  });

  useEffect(() => {
    fetchInstitutions();
    fetchProgrammes();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des institutions:', error);
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

  const resetForm = () => {
    setForm({
      name: '',
      shortName: '',
      description: '',
      category: 'financial_backer',
      interventionAreas: [],
      contact: {},
      promises: []
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editInstitution) {
        await api.put(`/institutions/${editInstitution._id}`, form);
      } else {
        await api.post('/institutions', form);
      }
      fetchInstitutions();
      setModalOpen(false);
      setEditInstitution(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditInstitution(null);
    setModalOpen(true);
  };

  const openEditModal = (institution: Institution) => {
    setForm(institution);
    setEditInstitution(institution);
    setModalOpen(true);
  };

  const openDetailModal = (institution: Institution) => {
    navigate(`/dashboard/institutions/${institution._id}`);
  };

  const handleDelete = async (id: string | undefined) => {
    if (id && window.confirm('Êtes-vous sûr de vouloir supprimer cette institution ?')) {
      try {
        await api.delete(`/institutions/${id}`);
        fetchInstitutions();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const addPromise = () => {
    const newPromise: Promise = {
      amount: 0,
      currency: 'XAF',
      description: '',
      promiseDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setForm({
      ...form,
      promises: [...(form.promises || []), newPromise]
    });
  };

  const removePromise = (index: number) => {
    const promises = [...(form.promises || [])];
    promises.splice(index, 1);
    setForm({
      ...form,
      promises
    });
  };

  const updatePromise = (index: number, field: keyof Promise, value: string | number) => {
    const promises = [...(form.promises || [])];
    promises[index] = {
      ...promises[index],
      [field]: value
    };
    setForm({
      ...form,
      promises
    });
  };

  // Filter institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inst.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inst.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || inst.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const totalInstitutions = institutions.length;
  const financialBackers = institutions.filter(inst => inst.category === 'financial_backer').length;
  const totalPromises = institutions.reduce((sum, inst) => sum + (inst.promises?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-600" />
              Gestion des Institutions
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez vos institutions partenaires, bailleurs de fonds et organismes d'implémentation
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 text-lg"
          >
            <Plus className="w-6 h-6" />
            Créer Institution
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Institutions</p>
                <p className="text-3xl font-bold text-gray-900">{totalInstitutions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bailleurs de Fonds</p>
                <p className="text-3xl font-bold text-green-600">{financialBackers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Promesses</p>
                <p className="text-3xl font-bold text-purple-600">{totalPromises}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Financement Total</p>
                {(() => {
                  const groupedByCurrency = institutions
                    .filter(inst => inst.category === 'financial_backer')
                    .reduce((acc, inst) => {
                      inst.promises?.forEach(p => {
                        acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                      });
                      return acc;
                    }, {} as Record<string, number>);
                  
                  const entries = Object.entries(groupedByCurrency);
                  if (entries.length === 0) {
                    return <p className="text-xl font-bold text-amber-600">0</p>;
                  }
                  
                  return entries.map(([currency, amount]) => (
                    <div key={currency} className="mb-1">
                      <p className="text-lg font-bold text-amber-600">
                        {new Intl.NumberFormat('fr-FR').format(amount)} {currency}
                      </p>
                    </div>
                  ));
                })()}
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une institution..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Institutions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-600">Chargement des institutions...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInstitutions.map(institution => {
            const category = CATEGORIES.find(c => c.value === institution.category);
            const IconComponent = category?.icon || Building2;
            
            const getCategoryColor = (catValue: string) => {
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
              return colors[catValue] || 'from-gray-500 to-gray-600';
            };

            return (
              <div key={institution._id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:scale-[1.02]">
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(institution.category)} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-1 line-clamp-1">{institution.name}</h3>
                        {institution.shortName && (
                          <p className="text-white/80 text-sm">({institution.shortName})</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {category?.label}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {institution.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {institution.description}
                    </p>
                  )}

                  {/* Contact Info Preview */}
                  {institution.contact && (
                    <div className="mb-4 space-y-2">
                      {institution.contact.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{institution.contact.email}</span>
                        </div>
                      )}
                      {institution.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span>{institution.contact.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Intervention Areas */}
                  {institution.interventionAreas && institution.interventionAreas.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Domaines d'intervention:</p>
                      <p className="text-sm text-purple-600 font-medium">
                        {institution.interventionAreas.length} domaine(s) d'intervention
                      </p>
                    </div>
                  )}

                  {/* Financial Info for Backers */}
                  {institution.category === 'financial_backer' && institution.promises && institution.promises.length > 0 && (
                    <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <div className="font-semibold text-sm">
                          {(() => {
                            const groupedByCurrency = institution.promises!.reduce((acc, p) => {
                              acc[p.currency] = (acc[p.currency] || 0) + p.amount;
                              return acc;
                            }, {} as Record<string, number>);
                            
                            return Object.entries(groupedByCurrency).map(([currency, amount]) => (
                              <div key={currency} className="text-green-700">
                                {amount.toLocaleString()} {currency}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                      <p className="text-green-600 text-xs">
                        {institution.promises.length} promesse(s) de financement
                      </p>
                      <div className="mt-2 flex gap-1">
                        {['fulfilled', 'pending', 'partial', 'cancelled'].map(status => {
                          const count = institution.promises?.filter(p => p.status === status).length || 0;
                          if (count === 0) return null;
                          return (
                            <span key={status} className={`px-2 py-1 text-xs rounded-full ${
                              status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                              status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              status === 'partial' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {count} {status === 'fulfilled' ? 'accomplie(s)' : 
                                     status === 'pending' ? 'en attente' :
                                     status === 'partial' ? 'partielle(s)' : 'annulée(s)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(institution)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    <button
                      onClick={() => openEditModal(institution)}
                      className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(institution._id)}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInstitutions.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Aucune institution trouvée</h3>
          <p className="text-gray-400 mb-8">
            {searchTerm || categoryFilter 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première institution'
            }
          </p>
          {!searchTerm && !categoryFilter && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer une Institution
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editInstitution ? 'Modifier Institution' : 'Créer Institution'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'institution *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom complet de l'institution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom court</label>
                <input
                  type="text"
                  value={form.shortName}
                  onChange={e => setForm({ ...form, shortName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Abréviation ou sigle"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as Institution['category'] })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description détaillée de l'institution"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Informations de contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={form.contact?.email || ''}
                  onChange={e => setForm({ 
                    ...form, 
                    contact: { ...form.contact, email: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@institution.org"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={form.contact?.phone || ''}
                  onChange={e => setForm({ 
                    ...form, 
                    contact: { ...form.contact, phone: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+237 XXX XXX XXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={form.contact?.address || ''}
                  onChange={e => setForm({ 
                    ...form, 
                    contact: { ...form.contact, address: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adresse physique"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  value={form.contact?.website || ''}
                  onChange={e => setForm({ 
                    ...form, 
                    contact: { ...form.contact, website: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.institution.org"
                />
              </div>
            </div>
          </div>

          {/* Intervention Areas */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Domaines d'intervention
            </h3>
            
            <select
              multiple
              value={form.interventionAreas}
              onChange={e => setForm({ 
                ...form, 
                interventionAreas: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            >
              {programmes.map(prog => (
                <option key={prog._id} value={prog._id}>
                  {prog.code} - {prog.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">Maintenez Ctrl/Cmd pour sélectionner plusieurs domaines</p>
          </div>

          {/* Promises Section - Only for Financial Backers */}
          {form.category === 'financial_backer' && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Promesses de financement
                </h3>
                <button 
                  type="button" 
                  onClick={addPromise}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une promesse
                </button>
              </div>
              
              <div className="space-y-4">
                {form.promises?.map((promise, index) => (
                  <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Promesse #{index + 1}</h4>
                      <button 
                        type="button" 
                        onClick={() => removePromise(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Montant *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={promise.amount}
                          onChange={e => updatePromise(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                        <select
                          value={promise.currency}
                          onChange={e => updatePromise(index, 'currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          {CURRENCIES.map(curr => (
                            <option key={curr.value} value={curr.value}>{curr.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date de promesse</label>
                        <input
                          type="date"
                          value={promise.promiseDate.split('T')[0]}
                          onChange={e => updatePromise(index, 'promiseDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select
                          value={promise.status}
                          onChange={e => updatePromise(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={promise.description || ''}
                        onChange={e => updatePromise(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={2}
                        placeholder="Description de la promesse de financement"
                      />
                    </div>
                  </div>
                ))}
                
                {(!form.promises || form.promises.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Aucune promesse de financement ajoutée</p>
                    <p className="text-sm">Cliquez sur "Ajouter une promesse" pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {editInstitution ? 'Modifier' : 'Créer'}
            </button>
            <button 
              type="button" 
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Institutions;
