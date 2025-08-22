import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';
import { FiEye, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

// Types from IndicatorMasterDetailCrud
interface Programme {
  _id: string;
  code: string;
  name: string;
}

interface Source {
  _id: string;
  name: string;
}

interface UniteDeMesure {
  _id: string;
  code: string;
  name: string;
}

interface MetaData {
  _id: string;
  code: string;
  name: string;
}

interface IndicatorData {
  geoLocation?: {
    type?: 'Global' | 'Province' | 'Departement' | 'Commune';
    referenceId?: string;
  };
  ageRange?: string;
  gender?: string;
  residentialArea?: string;
  socialCategory?: string;
  ref_year?: number;
  ref_value?: number;
  target_year?: number;
  target_value?: number;
}

interface Indicator {
  _id: string;
  code: string;
  name: string;
  type?: string;
  polarityDirection?: 'positive' | 'negative';
  uniteDeMesure?: UniteDeMesure | string;
  programme: Programme | string;
  source: (Source | string)[];
  metaData?: MetaData | string;
  data: IndicatorData[];
  createdAt?: string;
  updatedAt?: string;
}

interface IndicatorForm {
  code: string;
  name: string;
  type: string;
  polarityDirection: 'positive' | 'negative';
  uniteDeMesure: string;
  programme: string;
  source: string[];
  metaData: string;
}

interface ProgrammeIndicatorCrudProps {
  programmeId: string;
  domaineId?: string;
}

const ProgrammeIndicatorCrud = ({ programmeId, domaineId }: ProgrammeIndicatorCrudProps) => {
  const navigate = useNavigate();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  
  // Form state
  const [indicatorForm, setIndicatorForm] = useState<IndicatorForm>({
    code: "",
    name: "",
    type: "",
    polarityDirection: "positive",
    uniteDeMesure: "",
    programme: programmeId,
    source: [],
    metaData: ""
  });

  // Options for dropdowns
  const [sources, setSources] = useState<Source[]>([]);
  const [unitesDeMesure, setUnitesDeMesure] = useState<UniteDeMesure[]>([]);
  const [metaDataOptions, setMetaDataOptions] = useState<MetaData[]>([]);

  // Fetch indicators for this programme
  const fetchIndicators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/indicators?programme=${programmeId}`);
      
      // Handle both paginated and non-paginated responses
      if (res.data.indicators) {
        setIndicators(res.data.indicators.filter((ind: Indicator) => {
          const programmId = typeof ind.programme === 'object' ? ind.programme._id : ind.programme;
          return programmId === programmeId;
        }));
      } else if (Array.isArray(res.data)) {
        setIndicators(res.data.filter((ind: Indicator) => {
          const programmId = typeof ind.programme === 'object' ? ind.programme._id : ind.programme;
          return programmId === programmeId;
        }));
      } else {
        setIndicators([]);
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
      setError("Échec du chargement des indicateurs. Veuillez réessayer.");
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  }, [programmeId]);

  const fetchOptions = useCallback(async () => {
    try {
      const [srcRes, uniteRes, metaDataRes] = await Promise.all([
        api.get("/indicators/options/sources"),
        api.get("/indicators/options/unites-de-mesure"),
        api.get("/meta-data/options")
      ]);
      setSources(srcRes.data);
      setUnitesDeMesure(uniteRes.data);
      setMetaDataOptions(metaDataRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
    fetchOptions();
  }, [fetchIndicators, fetchOptions]);

  const resetIndicatorForm = () => {
    setIndicatorForm({
      code: "",
      name: "",
      type: "",
      polarityDirection: "positive",
      uniteDeMesure: "",
      programme: programmeId,
      source: [],
      metaData: ""
    });
  };

  const openCreate = () => {
    setEditingIndicator(null);
    resetIndicatorForm();
    setModalOpen(true);
  };

  const openEdit = (indicator: Indicator) => {
    const uniteDeMesureId = typeof indicator.uniteDeMesure === 'object' && indicator.uniteDeMesure?._id 
      ? indicator.uniteDeMesure._id 
      : (typeof indicator.uniteDeMesure === 'string' ? indicator.uniteDeMesure : "");
    
    setIndicatorForm({
      code: indicator.code,
      name: indicator.name,
      type: indicator.type || "",
      polarityDirection: indicator.polarityDirection || "positive",
      uniteDeMesure: uniteDeMesureId,
      programme: typeof indicator.programme === 'object' ? indicator.programme._id : indicator.programme,
      source: indicator.source.map(s => typeof s === 'object' ? s._id : s),
      metaData: typeof indicator.metaData === 'object' && indicator.metaData?._id ? indicator.metaData._id : (typeof indicator.metaData === 'string' ? indicator.metaData : "")
    });
    setEditingIndicator(indicator);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!indicatorForm.programme) {
      alert("Le programme est requis");
      return;
    }
    
    if (!indicatorForm.source.length) {
      alert("Au moins une source est requise");
      return;
    }
    
    try {
      const submitData = {
        ...indicatorForm,
        uniteDeMesure: indicatorForm.uniteDeMesure || undefined,
        source: indicatorForm.source.length > 0 ? indicatorForm.source : []
      };

      if (editingIndicator) {
        await api.put(`/indicators/${editingIndicator._id}`, submitData);
      } else {
        await api.post("/indicators", submitData);
      }
      
      resetIndicatorForm();
      setEditingIndicator(null);
      setModalOpen(false);
      fetchIndicators();
    } catch (error) {
      console.error("Error saving indicator:", error);
      alert("Erreur lors de la sauvegarde de l'indicateur. Veuillez vérifier les données du formulaire.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr ? Cela supprimera également toutes les données et suivis associés.")) {
      try {
        await api.delete(`/indicators/${id}`);
        fetchIndicators();
      } catch (error) {
        console.error("Error deleting indicator:", error);
        alert("Erreur lors de la suppression de l'indicateur.");
      }
    }
  };

  const getUniteName = (indicator: Indicator) => {
    if (typeof indicator.uniteDeMesure === 'object' && indicator.uniteDeMesure?.name) {
      return indicator.uniteDeMesure.name;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse text-gray-500">Chargement des indicateurs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Indicateurs (Nouveau système)</h2>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <FiPlus className="inline" />
          Créer un Indicateur
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={[
          { header: 'Code', accessor: 'code' },
          { header: 'Nom', accessor: 'name' },
          { 
            header: 'Type', 
            accessor: (indicator: Indicator) => indicator.type || 'Non spécifié' 
          },
          { 
            header: 'Unité', 
            accessor: getUniteName
          },
          { 
            header: 'Actions', 
            accessor: (indicator: Indicator) => (
              <div className="flex gap-2 justify-center">
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/dashboard/domaines/${domaineId}/programmes/${programmeId}/indicators/${indicator._id}`)} 
                  variant="secondary" 
                  aria-label="Voir le détail"
                >
                  <FiEye className="inline" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => openEdit(indicator)} 
                  variant="secondary" 
                  aria-label="Modifier"
                >
                  <FiEdit2 className="inline" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDelete(indicator._id)} 
                  variant="danger" 
                  aria-label="Supprimer"
                >
                  <FiTrash2 className="inline" />
                </Button>
              </div>
            )
          }
        ]}
        data={indicators}
      />

      {indicators.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Aucun indicateur trouvé pour ce programme</p>
          <p className="text-sm mt-2">Créez votre premier indicateur en cliquant sur le bouton "Créer un Indicateur"</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetIndicatorForm();
          setEditingIndicator(null);
        }}
        title={editingIndicator ? "Modifier l'indicateur" : "Créer un indicateur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code de l'indicateur *</label>
            <input 
              type="text"
              value={indicatorForm.code} 
              onChange={(e) => setIndicatorForm({...indicatorForm, code: e.target.value})} 
              placeholder="Code de l'indicateur" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'indicateur *</label>
            <input 
              type="text"
              value={indicatorForm.name} 
              onChange={(e) => setIndicatorForm({...indicatorForm, name: e.target.value})} 
              placeholder="Nom de l'indicateur" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={indicatorForm.type}
              onChange={(e) => setIndicatorForm({...indicatorForm, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner le type</option>
              <option value="Indicateur d'impact socio-economique">Indicateur d'impact socio-economique</option>
              <option value="Indicateur de resultat de programme">Indicateur de resultat de programme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polarité *</label>
            <select
              value={indicatorForm.polarityDirection}
              onChange={(e) => setIndicatorForm({...indicatorForm, polarityDirection: e.target.value as 'positive' | 'negative'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="positive">Positif (Bon quand augmente)</option>
              <option value="negative">Négatif (Bon quand diminue)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité de mesure</label>
            <select
              value={indicatorForm.uniteDeMesure}
              onChange={(e) => setIndicatorForm({...indicatorForm, uniteDeMesure: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionner l'unité</option>
              {unitesDeMesure.map(unite => (
                <option key={unite._id} value={unite._id}>
                  {unite.code} - {unite.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sources *</label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md">
              {sources.map(source => (
                <label key={source._id} className="flex items-center p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    value={source._id}
                    checked={indicatorForm.source.includes(source._id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const sourceId = source._id;
                      
                      setIndicatorForm(prev => ({
                        ...prev,
                        source: isChecked
                          ? [...prev.source, sourceId]
                          : prev.source.filter(id => id !== sourceId)
                      }));
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{source.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sélectionnez au moins une source</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier/Métadonnée associée</label>
            <select
              value={indicatorForm.metaData}
              onChange={e => setIndicatorForm(prev => ({ ...prev, metaData: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionner un fichier/métadonnée</option>
              {metaDataOptions.map(meta => (
                <option key={meta._id} value={meta._id}>
                  {meta.code ? `${meta.code} - ` : ''}{meta.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Optionnel : Associer un fichier ou métadonnée</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingIndicator ? "Modifier l'indicateur" : "Créer l'indicateur"}
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setModalOpen(false);
                resetIndicatorForm();
                setEditingIndicator(null);
              }}
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

export default ProgrammeIndicatorCrud;
