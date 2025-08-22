import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Home, Upload } from 'lucide-react';
import api from '../../lib/api';

interface SousPrefecture {
  _id: string;
  code: string;
  name: string;
  departement: {
    _id: string;
    name: string;
  };
}

interface Canton {
  _id: string;
  code: string;
  name: string;
  chefLieu: string;
  sousPrefecture: SousPrefecture;
  createdAt: string;
  updatedAt: string;
}

interface CantonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  canton?: Canton | null;
}

const CantonModal = ({ isOpen, onClose, onSave, canton }: CantonModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    chefLieu: '',
    sousPrefecture: '',
  });
  const [sousPrefectures, setSousPrefectures] = useState<SousPrefecture[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSousPrefectures();
    if (canton) {
      setFormData({
        code: canton.code,
        name: canton.name,
        chefLieu: canton.chefLieu || '',
        sousPrefecture: canton.sousPrefecture._id,
      });
    } else {
      setFormData({ code: '', name: '', chefLieu: '', sousPrefecture: '' });
    }
  }, [canton]);

  const fetchSousPrefectures = async () => {
    try {
      const response = await api.get('/decoupage/sous-prefectures');
      setSousPrefectures(response.data);
    } catch (error) {
      console.error('Error fetching sous-prefectures:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (canton) {
        await api.put(`/decoupage/cantons/${canton._id}`, formData);
      } else {
        await api.post('/decoupage/cantons', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving canton:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {canton ? 'Modifier le Canton' : 'Nouveau Canton'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Canton *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du Canton *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chef-lieu
            </label>
            <input
              type="text"
              value={formData.chefLieu}
              onChange={(e) => setFormData({ ...formData, chefLieu: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-préfecture *
            </label>
            <select
              value={formData.sousPrefecture}
              onChange={(e) => setFormData({ ...formData, sousPrefecture: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une sous-préfecture</option>
              {sousPrefectures.map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.code} - {sp.name} ({sp.departement.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : canton ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CantonTab = () => {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCanton, setSelectedCanton] = useState<Canton | null>(null);

  useEffect(() => {
    fetchCantons();
  }, []);

  const fetchCantons = async () => {
    try {
      const response = await api.get('/decoupage/cantons');
      setCantons(response.data);
    } catch (error) {
      console.error('Error fetching cantons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (canton: Canton) => {
    setSelectedCanton(canton);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce canton ?')) {
      try {
        await api.delete(`/decoupage/cantons/${id}`);
        fetchCantons();
      } catch (error) {
        console.error('Error deleting canton:', error);
      }
    }
  };

  const handleUploadExcel = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (window.confirm('Êtes-vous sûr de vouloir importer les cantons depuis ce fichier Excel ? Cette action peut écraser les données existantes.')) {
        setUploadLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await api.post('/excel-upload/cantons', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          alert(`Import terminé: ${response.data.results.successful}/${response.data.results.total} cantons importés avec succès.`);
          fetchCantons(); // Refresh the list
        } catch (error) {
          console.error('Error uploading cantons:', error);
          alert('Erreur lors de l\'import Excel. Vérifiez le format de votre fichier.');
        } finally {
          setUploadLoading(false);
        }
      }
    };
    fileInput.click();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCanton(null);
  };

  const filteredCantons = cantons.filter(canton =>
    canton.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canton.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canton.sousPrefecture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (canton.chefLieu && canton.chefLieu.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            Cantons ({cantons.length})
          </h2>
          <p className="text-gray-600">Gestion des cantons</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleUploadExcel}
            disabled={uploadLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploadLoading ? 'Import...' : 'Importer Excel'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouveau Canton
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un canton..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cantons List */}
      {filteredCantons.length === 0 ? (
        <div className="text-center py-12">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun canton trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Commencez par ajouter un canton'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef-lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sous-préfecture
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCantons.map((canton) => (
                  <tr key={canton._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Home className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{canton.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{canton.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {canton.chefLieu || 'Non défini'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{canton.sousPrefecture.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(canton)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(canton._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <CantonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchCantons}
        canton={selectedCanton}
      />
    </div>
  );
};

export default CantonTab;
