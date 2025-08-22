import { useEffect, useState, FormEvent } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';
import ModernCircularDashboard from '../components/ModernCircularDashboard';

type Domaine = {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  nature: 'Specifique' | 'Transversale';
  strategy?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

const ModernAxes = () => {
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDomaine, setEditDomaine] = useState<Domaine | null>(null);
  const [form, setForm] = useState<Domaine>({
    code: '',
    name: '',
    description: '',
    nature: 'Specifique',
    strategy: ''
  });

  const fetchDomaines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/domaines');
      setDomaines(res.data);
    } catch (error) {
      console.error('Error fetching domaines:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDomaines();
  }, []);

  const openCreateModal = () => {
    setEditDomaine(null);
    setForm({
      code: '',
      name: '',
      description: '',
      nature: 'Specifique',
      strategy: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (domaine: Domaine) => {
    setEditDomaine(domaine);
    setForm({
      code: domaine.code,
      name: domaine.name,
      description: domaine.description || '',
      nature: domaine.nature,
      strategy: domaine.strategy || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet axe stratégique?')) return;
    
    try {
      await api.delete(`/domaines/${id}`);
      fetchDomaines();
    } catch (error) {
      console.error('Error deleting domaine:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editDomaine && editDomaine._id) {
        await api.put(`/domaines/${editDomaine._id}`, form);
      } else {
        await api.post('/domaines', form);
      }
      setModalOpen(false);
      fetchDomaines();
    } catch (error) {
      console.error('Error saving domaine:', error);
    }
  };

  const handleInputChange = (field: keyof Domaine, value: string) => {
    if (field === 'nature') {
      setForm(prev => ({ ...prev, nature: value as 'Specifique' | 'Transversale' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Axes Stratégiques</h1>
              <p className="text-gray-600 mt-1">Plan National de Développement 2026-2030</p>
            </div>
            <Button 
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 hover:shadow-lg"
            >
              + Nouvel Axe Stratégique
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Chargement des axes stratégiques...</div>
            </div>
          </div>
        ) : domaines.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg mb-4">Aucun axe stratégique trouvé</div>
            <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
              Créer le premier axe
            </Button>
          </div>
        ) : (
          <ModernCircularDashboard
            items={domaines.map((domaine) => ({
              code: domaine.code,
              name: domaine.name,
              description: domaine.description,
              nature: domaine.nature,
              onView: () => window.location.href = `/dashboard/domaines/${domaine._id}`,
              onEdit: () => openEditModal(domaine),
              onDelete: () => handleDelete(domaine._id),
            }))}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDomaine ? 'Modifier l\'Axe Stratégique' : 'Créer un Axe Stratégique'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code de l'Axe *
              </label>
              <input
                type="text"
                id="code"
                value={form.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 1, 2, 3..."
              />
            </div>

            <div>
              <label htmlFor="nature" className="block text-sm font-medium text-gray-700 mb-2">
                Nature de l'Axe *
              </label>
              <select
                id="nature"
                value={form.nature}
                onChange={(e) => handleInputChange('nature', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Specifique">Spécifique</option>
                <option value="Transversale">Transversale</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'Axe Stratégique *
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrer le nom complet de l'axe stratégique"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description de l'Axe
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée de l'axe stratégique..."
            />
          </div>

          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-2">
              Stratégie de Mise en Œuvre
            </label>
            <textarea
              id="strategy"
              value={form.strategy ?? ''}
              onChange={(e) => handleInputChange('strategy', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Détails de la stratégie de mise en œuvre..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              {editDomaine ? 'Mettre à Jour' : 'Créer l\'Axe'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              variant="secondary"
              className="flex-1 py-3 rounded-lg font-medium"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ModernAxes;
