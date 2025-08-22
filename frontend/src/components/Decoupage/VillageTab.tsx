import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Map, MapPin, Building, Upload } from 'lucide-react';
import api from '../../lib/api';

interface SousPrefecture {
  _id: string;
  name: string;
  code: string;
  departement: {
    _id: string;
    name: string;
    province: {
      _id: string;
      name: string;
    };
  };
}

interface Canton {
  _id: string;
  name: string;
  code: string;
  sousPrefecture: SousPrefecture;
}

interface Village {
  _id: string;
  code: string;
  name: string;
  description: string;
  canton: Canton;
  geolocation?: {
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface VillageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  village?: Village | null;
}

const VillageModal = ({ isOpen, onClose, onSave, village }: VillageModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    canton: '',
    geolocation: {
      latitude: '',
      longitude: '',
    },
  });
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCantons();
  }, []);

  useEffect(() => {
    if (village) {
      setFormData({
        code: village.code,
        name: village.name,
        description: village.description || '',
        canton: village.canton._id,
        geolocation: {
          latitude: village.geolocation?.latitude?.toString() || '',
          longitude: village.geolocation?.longitude?.toString() || '',
        },
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        canton: '',
        geolocation: { latitude: '', longitude: '' },
      });
    }
  }, [village]);

  const fetchCantons = async () => {
    try {
      const response = await api.get('/decoupage/cantons');
      setCantons(response.data);
    } catch (error) {
      console.error('Error fetching cantons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        geolocation: {
          latitude: formData.geolocation.latitude ? parseFloat(formData.geolocation.latitude) : undefined,
          longitude: formData.geolocation.longitude ? parseFloat(formData.geolocation.longitude) : undefined,
        },
      };

      if (village) {
        await api.put(`/decoupage/villages/${village._id}`, submitData);
      } else {
        await api.post('/decoupage/villages', submitData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving village:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {village ? 'Modifier le Village' : 'Nouveau Village'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canton *
            </label>
            <select
              value={formData.canton}
              onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un canton</option>
              {cantons.map((canton) => (
                <option key={canton._id} value={canton._id}>
                  {canton.name} ({canton.sousPrefecture?.name}, {canton.sousPrefecture?.departement?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Village *
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
              Nom du Village *
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.geolocation.latitude}
                onChange={(e) => setFormData({
                  ...formData,
                  geolocation: { ...formData.geolocation, latitude: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 12.1348"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.geolocation.longitude}
                onChange={(e) => setFormData({
                  ...formData,
                  geolocation: { ...formData.geolocation, longitude: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 15.0557"
              />
            </div>
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
              {loading ? 'Enregistrement...' : village ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VillageTab = () => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      const response = await api.get('/decoupage/villages');
      setVillages(response.data);
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (village: Village) => {
    setSelectedVillage(village);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce village ?')) {
      try {
        await api.delete(`/decoupage/villages/${id}`);
        fetchVillages();
      } catch (error) {
        console.error('Error deleting village:', error);
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

      if (window.confirm('Êtes-vous sûr de vouloir importer les villages depuis ce fichier Excel ? Cette action peut écraser les données existantes.')) {
        setUploadLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await api.post('/excel-upload/villages', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          alert(`Import terminé: ${response.data.results.successful}/${response.data.results.total} villages importés avec succès.`);
          fetchVillages(); // Refresh the list
        } catch (error) {
          console.error('Error uploading villages:', error);
          alert('Erreur lors de l\'import Excel. Vérifiez le format de votre fichier.');
        } finally {
          setUploadLoading(false);
        }
      }
    };
    fileInput.click();
  };

  const handleAnalyzeExcel = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      setUploadLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/excel-upload/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Display analysis results in a more readable format
        const analysis = response.data;
        const message = `
📊 Analysis Results for ${analysis.fileName}:
        
📋 Sheet: ${analysis.sheetName}
📊 Rows: ${analysis.rowCount}
📊 Columns: ${analysis.columnCount}

📝 Available Columns:
${analysis.headers.join(', ')}

📋 Sample Data (first row):
${JSON.stringify(analysis.sampleData[0] || {}, null, 2)}
        `;
        
        alert(message);
      } catch (error) {
        console.error('Error analyzing Excel file:', error);
        alert('Erreur lors de l\'analyse du fichier Excel.');
      } finally {
        setUploadLoading(false);
      }
    };
    fileInput.click();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVillage(null);
  };

  const filteredVillages = villages.filter(village =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.canton?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.canton?.sousPrefecture?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.canton?.sousPrefecture?.departement?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village.description && village.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Map className="h-6 w-6 text-red-600" />
            Villages ({villages.length})
          </h2>
          <p className="text-gray-600">Gestion des villages par canton</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAnalyzeExcel}
            disabled={uploadLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {uploadLoading ? 'Analyse...' : 'Analyser Excel'}
          </button>
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouveau Village
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Villages List */}
      {filteredVillages.length === 0 ? (
        <div className="text-center py-12">
          <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun village trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Commencez par ajouter un village'}
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
                    Canton
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sous-préfecture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Géolocalisation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVillages.map((village) => (
                  <tr key={village._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <Map className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{village.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{village.name}</div>
                        {village.description && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {village.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-purple-500 mr-1" />
                        <span className="text-sm text-gray-600">{village.canton?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">{village.canton?.sousPrefecture?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {village.geolocation?.latitude && village.geolocation?.longitude ? (
                        <div className="text-xs text-gray-600">
                          <div>Lat: {village.geolocation.latitude}</div>
                          <div>Lng: {village.geolocation.longitude}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Non défini</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(village)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(village._id)}
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
      <VillageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchVillages}
        village={selectedVillage}
      />
    </div>
  );
};

export default VillageTab;
