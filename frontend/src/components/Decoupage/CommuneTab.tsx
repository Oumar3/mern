import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Building, Globe, Upload } from 'lucide-react';
import api from '../../lib/api';

interface Province {
  _id: string;
  name: string;
  code: string;
}

interface Departement {
  _id: string;
  name: string;
  code: string;
  province: Province;
}

interface Commune {
  _id: string;
  code: string;
  name: string;
  description: string;
  departement: Departement;
  createdAt: string;
  updatedAt: string;
}

interface CommuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  commune?: Commune | null;
}

const CommuneModal = ({ isOpen, onClose, onSave, commune }: CommuneModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    departement: '',
  });
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartements();
  }, []);

  useEffect(() => {
    if (commune) {
      setFormData({
        code: commune.code,
        name: commune.name,
        description: commune.description || '',
        departement: commune.departement._id,
      });
    } else {
      setFormData({ code: '', name: '', description: '', departement: '' });
    }
  }, [commune]);

  const fetchDepartements = async () => {
    try {
      const response = await api.get('/decoupage/departements');
      setDepartements(response.data);
    } catch (error) {
      console.error('Error fetching departements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (commune) {
        await api.put(`/decoupage/communes/${commune._id}`, formData);
      } else {
        await api.post('/decoupage/communes', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving commune:', error);
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
            {commune ? 'Modifier la Commune' : 'Nouvelle Commune'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département *
            </label>
            <select
              value={formData.departement}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un département</option>
              {departements.map((departement) => (
                <option key={departement._id} value={departement._id}>
                  {departement.name} ({departement.province?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Commune *
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
              Nom de la Commune *
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
              Description
            </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description de la commune..."
          />
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
              {loading ? 'Enregistrement...' : commune ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommuneTab = () => {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchCommunes();
  }, []);

  const fetchCommunes = async () => {
    try {
      const response = await api.get('/decoupage/communes');
      setCommunes(response.data);
    } catch (error) {
      console.error('Error fetching communes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (commune: Commune) => {
    setSelectedCommune(commune);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commune ?')) {
      try {
        await api.delete(`/decoupage/communes/${id}`);
        fetchCommunes();
      } catch (error) {
        console.error('Error deleting commune:', error);
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

      if (window.confirm('Êtes-vous sûr de vouloir importer les communes depuis ce fichier Excel ? Cette action peut écraser les données existantes.')) {
        setUploadLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await api.post('/excel-upload/communes', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          alert(`Import terminé: ${response.data.results.successful}/${response.data.results.total} communes importées avec succès.`);
          fetchCommunes();
        } catch (error) {
          console.error('Error uploading communes:', error);
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
    setSelectedCommune(null);
  };

  const filteredCommunes = communes.filter(commune =>
    commune.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commune.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commune.departement?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commune.departement?.province?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (commune.description && commune.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <MapPin className="h-6 w-6 text-purple-600" />
            Communes ({communes.length})
          </h2>
          <p className="text-gray-600">Gestion des communes par département</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadExcel}
            disabled={uploadLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            {uploadLoading ? 'Import...' : 'Import Excel'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouvelle Commune
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une commune..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Communes List */}
      {filteredCommunes.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucune commune trouvée</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Commencez par ajouter une commune'}
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
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommunes.map((commune) => (
                  <tr key={commune._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{commune.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{commune.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">{commune.departement?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">{commune.departement?.province?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {commune.description || 'Non défini'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(commune)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(commune._id)}
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
      <CommuneModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchCommunes}
        commune={selectedCommune}
      />
    </div>
  );
};

export default CommuneTab;
