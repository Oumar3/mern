import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building, MapPin, Globe, Upload } from 'lucide-react';
import api from '../../lib/api';

interface Province {
  _id: string;
  code: string;
  name: string;
}

interface Departement {
  _id: string;
  code: string;
  name: string;
  chefLieu: string;
  province: Province;
  createdAt: string;
  updatedAt: string;
}

interface DepartementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  departement?: Departement | null;
}

const DepartementModal = ({ isOpen, onClose, onSave, departement }: DepartementModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    chefLieu: '',
    province: '',
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (departement) {
      setFormData({
        code: departement.code,
        name: departement.name,
        chefLieu: departement.chefLieu || '',
        province: departement.province._id,
      });
    } else {
      setFormData({ code: '', name: '', chefLieu: '', province: '' });
    }
  }, [departement]);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/decoupage/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (departement) {
        await api.put(`/decoupage/departements/${departement._id}`, formData);
      } else {
        await api.post('/decoupage/departements', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving departement:', error);
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
            {departement ? 'Modifier le Département' : 'Nouveau Département'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province *
            </label>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une province</option>
              {provinces.map((province) => (
                <option key={province._id} value={province._id}>
                  {province.name} ({province.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Département *
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
              Nom du Département *
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
              {loading ? 'Enregistrement...' : departement ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DepartementTab = () => {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartement, setSelectedDepartement] = useState<Departement | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchDepartements();
  }, []);

  const fetchDepartements = async () => {
    try {
      const response = await api.get('/decoupage/departements');
      setDepartements(response.data);
    } catch (error) {
      console.error('Error fetching departements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (departement: Departement) => {
    setSelectedDepartement(departement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      try {
        await api.delete(`/decoupage/departements/${id}`);
        fetchDepartements();
      } catch (error) {
        console.error('Error deleting departement:', error);
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

      if (window.confirm('Êtes-vous sûr de vouloir importer les départements depuis ce fichier Excel ? Cette action peut écraser les données existantes.')) {
        setUploadLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await api.post('/excel-upload/departements', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          alert(`Import terminé: ${response.data.results.successful}/${response.data.results.total} départements importés avec succès.`);
          fetchDepartements(); // Refresh the list
        } catch (error) {
          console.error('Error uploading departements:', error);
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
    setSelectedDepartement(null);
  };

  const filteredDepartements = departements.filter(departement =>
    departement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departement.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departement.province?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (departement.chefLieu && departement.chefLieu.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Building className="h-6 w-6 text-green-600" />
            Départements ({departements.length})
          </h2>
          <p className="text-gray-600">Gestion des départements par province</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadExcel}
            disabled={uploadLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            {uploadLoading ? 'Import...' : 'Import Excel'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nouveau Département
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Departements List */}
      {filteredDepartements.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucun département trouvé</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Commencez par ajouter un département'}
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
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef-lieu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartements.map((departement) => (
                  <tr key={departement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Building className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{departement.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{departement.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">{departement.province?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {departement.chefLieu || 'Non défini'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(departement)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(departement._id)}
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
      <DepartementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchDepartements}
        departement={selectedDepartement}
      />
    </div>
  );
};

export default DepartementTab;
