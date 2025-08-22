
import { useEffect, useState, FormEvent } from 'react';

import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';
import VerticalInfographicMenu from '../components/VerticalInfographicMenu';

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

const Domaines = () => {
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
    if (!window.confirm('Are you sure you want to delete this domaine?')) return;
    
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Axes stratégiques</h1>
        <Button onClick={openCreateModal}>
          Créer un Axe stratégique
        </Button>
      </div>


      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <VerticalInfographicMenu
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDomaine ? 'Modifier l\'Axe stratégique' : 'Créer un Axe stratégique'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <input
              type="text"
              id="code"
              value={form.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrer le code de l'Axe"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'Axe *
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrer le nom de l'Axe"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description de l'Axe
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrer la description de l'Axe"
            />
          </div>

          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-1">
              Stratégie
            </label>
            <textarea
              id="strategy"
              value={form.strategy ?? ''}
              onChange={(e) => handleInputChange('strategy', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrer la stratégie de l'Axe"
            />
          </div>

          <div>
            <label htmlFor="nature" className="block text-sm font-medium text-gray-700 mb-1">
              Nature de l'Axe *
            </label>
            <select
              id="nature"
              value={form.nature}
              onChange={(e) => handleInputChange('nature', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Specifique">Spécifique</option>
              <option value="Transversale">Transversale</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editDomaine ? 'Modifier' : 'Créer'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              variant="secondary"
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Domaines;
