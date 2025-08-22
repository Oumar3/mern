import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building, MapPin, Upload } from 'lucide-react';
import api from '../../lib/api';

interface Departement {
  _id: string;
  code: string;
  name: string;
}

interface SousPrefecture {
  _id: string;
  code: string;
  name: string;
  chefLieu: string;
  departement: Departement;
  createdAt: string;
  updatedAt: string;
}

interface SousPrefectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  sousPrefecture?: SousPrefecture | null;
}

const SousPrefectureModal = ({ isOpen, onClose, onSave, sousPrefecture }: SousPrefectureModalProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    chefLieu: '',
    departement: '',
  });
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartements();
    if (sousPrefecture) {
      setFormData({
        code: sousPrefecture.code,
        name: sousPrefecture.name,
        chefLieu: sousPrefecture.chefLieu || '',
        departement: sousPrefecture.departement._id,
      });
    } else {
      setFormData({ code: '', name: '', chefLieu: '', departement: '' });
    }
  }, [sousPrefecture]);

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
      if (sousPrefecture) {
        await api.put(`/decoupage/sous-prefectures/${sousPrefecture._id}`, formData);
      } else {
        await api.post('/decoupage/sous-prefectures', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving sous-prefecture:', error);
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
            {sousPrefecture ? 'Modifier la Sous-préfecture' : 'Nouvelle Sous-préfecture'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Sous-préfecture *
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
              Nom de la Sous-préfecture *
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
              Département *
            </label>
            <select
              value={formData.departement}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un département</option>
              {departements.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.code} - {dept.name}
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
              {loading ? 'Enregistrement...' : sousPrefecture ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SousPrefectureTab = () => {
  const [sousPrefectures, setSousPrefectures] = useState<SousPrefecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSousPrefecture, setSelectedSousPrefecture] = useState<SousPrefecture | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchSousPrefectures();
  }, []);

  const fetchSousPrefectures = async () => {
    try {
      const response = await api.get('/decoupage/sous-prefectures');
      setSousPrefectures(response.data);
    } catch (error) {
      console.error('Error fetching sous-prefectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sousPrefecture: SousPrefecture) => {
    setSelectedSousPrefecture(sousPrefecture);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-préfecture ?')) {
      try {
        await api.delete(`/decoupage/sous-prefectures/${id}`);
        fetchSousPrefectures();
      } catch (error) {
        console.error('Error deleting sous-prefecture:', error);
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

      if (window.confirm('Êtes-vous sûr de vouloir importer les sous-préfectures depuis ce fichier Excel ? Cette action peut écraser les données existantes.')) {
        setUploadLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await api.post('/excel-upload/sous-prefectures', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          alert(`Import terminé: ${response.data.results.successful}/${response.data.results.total} sous-préfectures importées avec succès.`);
          fetchSousPrefectures(); // Refresh the list
        } catch (error) {
          console.error('Error uploading sous-prefectures:', error);
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
    setSelectedSousPrefecture(null);
  };

  const filteredSousPrefectures = sousPrefectures.filter(sp =>
    sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.departement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sp.chefLieu && sp.chefLieu.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Building className="h-6 w-6 text-blue-600" />
            Sous-préfectures ({sousPrefectures.length})
          </h2>
          <p className="text-gray-600">Gestion des sous-préfectures</p>
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
            Nouvelle Sous-préfecture
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une sous-préfecture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sous-prefectures List */}
      {filteredSousPrefectures.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Aucune sous-préfecture trouvée</p>
          <p className="text-gray-500">
            {searchTerm ? 'Essayez un autre terme de recherche' : 'Commencez par ajouter une sous-préfecture'}
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
                    Département
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSousPrefectures.map((sp) => (
                  <tr key={sp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{sp.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{sp.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {sp.chefLieu || 'Non défini'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{sp.departement.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(sp)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sp._id)}
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
      <SousPrefectureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchSousPrefectures}
        sousPrefecture={selectedSousPrefecture}
      />
    </div>
  );
};

export default SousPrefectureTab;
