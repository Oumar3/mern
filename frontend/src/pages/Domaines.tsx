import { useEffect, useState, FormEvent } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

type Domaine = {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  nature: 'Specifique' | 'Transversale';
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
    nature: 'Specifique'
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
      nature: 'Specifique'
    });
    setModalOpen(true);
  };

  const openEditModal = (domaine: Domaine) => {
    setEditDomaine(domaine);
    setForm({
      code: domaine.code,
      name: domaine.name,
      description: domaine.description || '',
      nature: domaine.nature
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {domaines.map((domaine) => (
            <div key={domaine._id} className="bg-white shadow rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">{domaine.code}</span>
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">{domaine.nature}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1 truncate" title={domaine.name}>{domaine.name}</h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2 min-h-[40px]">{domaine.description || <span className="text-gray-400">Aucune description</span>}</p>
                {/* stratégie removed */}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => openEditModal(domaine)} variant="secondary" className="flex-1">Modifier</Button>
                <Button onClick={() => handleDelete(domaine._id)} variant="danger" className="flex-1">Supprimer</Button>
                <Button onClick={() => window.location.href = `/dashboard/domaines/${domaine._id}`} className="flex-1">Voir</Button>
              </div>
            </div>
          ))}
        </div>
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

          {/* stratégie removed from form */}

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
