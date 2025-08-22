import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MetaData, FocalPoint, Source, UniteDeMesure, Programme } from "../types/indicator";
import {
  fetchMetaDataList,
  createMetaData,
  updateMetaData,
  deleteMetaData,
  importMetaDataFromExcel,
} from "../lib/metaDataApi";
import { fetchSourceOptions } from "../lib/sourceApi";
import { fetchProgrammeOptions } from "../lib/programmeApi";
import { fetchUniteDeMesureOptions } from "../lib/uniteDeMesureApi";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Users,
  Mail,
  Phone,
  Save,
  Filter,
  Download,
  Database,
  Upload,
} from "lucide-react";


const COVERED_POPULATION_OPTIONS = [
  { value: '', label: 'Sélectionnez une population' },
  { value: 'Individus', label: 'Individus' },
  { value: 'Ménages', label: 'Ménages' },
  { value: 'Entreprises', label: 'Entreprises' },
  { value: 'Autre', label: 'Autre' },
];

const GEOGRAPHIC_COVERAGE_OPTIONS = [
  { value: '', label: 'Sélectionnez une couverture' },
  { value: 'National', label: 'National' },
  { value: 'Provincial', label: 'Provincial' },
  { value: 'Departmental', label: 'Départemental' },
  { value: 'Communal', label: 'Communal' },
  { value: 'Autre', label: 'Autre' },
];

const PUBLICATION_PERIODICITY_OPTIONS = [
  { value: '', label: 'Sélectionnez une périodicité' },
  { value: 'Mensuelle', label: 'Mensuelle' },
  { value: 'Trimestrielle', label: 'Trimestrielle' },
  { value: 'Semestrielle', label: 'Semestrielle' },
  { value: 'Annuelle', label: 'Annuelle' },
  { value: 'Autre', label: 'Autre' },
];

const DISAGGREGATION_LEVEL_OPTIONS = [
  { value: 'Région', label: 'Région' },
  { value: 'Âge', label: 'Âge' },
  { value: 'Sexe', label: 'Sexe' },
  { value: 'Autre', label: 'Autre' },
];

const emptyMetaData: Partial<MetaData> = {
  code: "",
  name: "",
  internationalDefinition: "",
  nationalDefinition: "",
  thematicArea: "",
  goal: "",
  mainDataSource: "",
  primaryDataSource: "",
  dataCollectionMethod: "",
  calculationMethod: "",
  measurementUnit: "",
  coveredPopulation: "",
  geographicCoverage: "",
  disaggregationLevel: [],
  publicationPeriodicity: "",
  responsibleProductionStructure: "",
  implementationStructure: "",
  focalPoints: [] as FocalPoint[],
};

const MetaDataCrud: React.FC = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const navigate = useNavigate();
  const [metaDataList, setMetaDataList] = useState<MetaData[]>([]);
  const [filteredList, setFilteredList] = useState<MetaData[]>([]);
  const [form, setForm] = useState<Partial<MetaData>>(emptyMetaData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [unitesDeMesure, setUnitesDeMesure] = useState<UniteDeMesure[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMetaDataList();
      setMetaDataList(data);
      setFilteredList(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to fetch MetaData");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const data = await fetchSourceOptions();
      setSources(data);
    } catch (e: unknown) {
      console.error("Failed to fetch sources:", e);
    }
  };

  const fetchUnites = async () => {
    try {
      const data = await fetchUniteDeMesureOptions();
      setUnitesDeMesure(data);
    } catch (e: unknown) {
      console.error("Failed to fetch unites de mesure:", e);
    }
  };

  useEffect(() => {
    fetchList();
    fetchSources();
    fetchUnites();
    fetchProgrammeOptions().then(setProgrammes);
  }, []);

  useEffect(() => {
    const filtered = metaDataList.filter(meta => {
      const thematicLabel = typeof meta.thematicArea === 'object' && meta.thematicArea !== null
        ? `${meta.thematicArea.code} ${meta.thematicArea.name}`
        : meta.thematicArea || '';
      return (
        meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meta.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thematicLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredList(filtered);
  }, [searchTerm, metaDataList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocalPointChange = (idx: number, field: keyof FocalPoint, value: string) => {
    setForm((prev) => ({
      ...prev,
      focalPoints: (prev.focalPoints || []).map((fp, i) => i === idx ? { ...fp, [field]: value } : fp),
    }));
  };

  const addFocalPoint = () => {
    setForm((prev) => ({
      ...prev,
      focalPoints: [...(prev.focalPoints || []), { name: "", email: "", phone: "" }],
    }));
  };

  const removeFocalPoint = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      focalPoints: (prev.focalPoints || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Clean up the form data before submission
      const cleanedForm = {
        ...form,
        // Filter out empty strings from disaggregationLevel
        disaggregationLevel: (form.disaggregationLevel || []).filter(level => level && level.trim() !== ''),
        // Ensure focalPoints array doesn't have undefined values
        focalPoints: (form.focalPoints || []).map(fp => ({
          name: fp.name || '',
          email: fp.email || '',
          phone: fp.phone || ''
        }))
      };

      // Debug log to check cleaned data
      console.log('Cleaned form data:', cleanedForm);
      console.log('Disaggregation levels:', cleanedForm.disaggregationLevel);

      if (editingId) {
        await updateMetaData(editingId, cleanedForm);
      } else {
        await createMetaData(cleanedForm);
      }
      await fetchList();
      setForm(emptyMetaData);
      setEditingId(null);
      setShowModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to save MetaData");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meta: MetaData) => {
    // Clean up the metadata when editing to ensure proper format
    const cleanedMeta = {
      ...meta,
      // Ensure disaggregationLevel is an array and filter out empty values
      disaggregationLevel: Array.isArray(meta.disaggregationLevel) 
        ? meta.disaggregationLevel.filter(level => level && level.trim() !== '')
        : [],
      // Ensure focalPoints is an array
      focalPoints: Array.isArray(meta.focalPoints) ? meta.focalPoints : []
    };
    
    setForm(cleanedMeta);
    setEditingId(meta._id || null);
    setShowModal(true);
  };

  const handleCreate = () => {
    setForm(emptyMetaData);
    setEditingId(null);
    setShowModal(true);
  };

  const handleView = (meta: MetaData) => {
    navigate(`/dashboard/meta-data/${meta._id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleImportExcel = async () => {
    if (!importFile) return;

    setImportLoading(true);
    try {
      const result = await importMetaDataFromExcel(importFile);
      
      if (result.errors && result.errors.length > 0) {
        console.warn('Import completed with errors:', result.errors);
        setError(`Imported ${result.imported} entries with ${result.errors.length} errors. Check console for details.`);
      } else {
        setError(null);
      }

      // Refresh the list
      fetchList();
      
      // Reset import state
      setShowImportModal(false);
      setImportFile(null);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Import failed: ${err.message}`);
      } else {
        setError("Import failed: Unknown error");
      }
    } finally {
      setImportLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError(null);
    try {
      await deleteMetaData(deleteId);
      await fetchList();
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to delete MetaData");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyMetaData);
    setEditingId(null);
    setShowModal(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Gestion des Métadonnées
              </h1>
              <p className="text-slate-600 text-lg">
                Gérez les métadonnées des indicateurs statistiques du PND
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Database className="h-4 w-4" />
                  {metaDataList.length} Métadonnées
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    ⚠️ Erreur
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="h-5 w-5" />
                Nouvelle Métadonnée
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Upload className="h-5 w-5" />
                Importer Excel
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                <Download className="h-5 w-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, code ou domaine thématique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200">
              <Filter className="h-5 w-5" />
              Filtrer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Domaine Thématique</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Points Focaux</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredList.map((meta) => (
                      <tr key={meta._id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {meta.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={meta.name}>
                            {meta.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 truncate max-w-xs" title={
                            typeof meta.thematicArea === 'object' && meta.thematicArea !== null
                              ? `${meta.thematicArea.code} ${meta.thematicArea.name}`
                              : meta.thematicArea || '-'}>
                            {typeof meta.thematicArea === 'object' && meta.thematicArea !== null
                              ? `${meta.thematicArea.code} - ${meta.thematicArea.name}`
                              : meta.thematicArea || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {(meta.focalPoints || []).length} point(s)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(meta)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(meta)}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(meta._id!)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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

              {filteredList.length === 0 && !loading && (
                <div className="text-center py-20">
                  <Database className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-xl text-slate-600 mb-2">Aucune métadonnée trouvée</p>
                  <p className="text-slate-500 mb-6">
                    {searchTerm ? "Essayez de modifier votre recherche" : "Commencez par créer une nouvelle métadonnée"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleCreate}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Créer une métadonnée
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={handleCancel}></div>
              
              <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                      {editingId ? 'Modifier la Métadonnée' : 'Nouvelle Métadonnée'}
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Informations de Base
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="code"
                          value={form.code || ""}
                          onChange={handleChange}
                          placeholder="Ex: IND001"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          value={form.name || ""}
                          onChange={handleChange}
                          placeholder="Nom de l'indicateur"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Domaine Thématique
                        </label>
                        <select
                          name="thematicArea"
                          value={typeof form.thematicArea === 'object' && form.thematicArea !== null ? form.thematicArea._id : form.thematicArea || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          <option value="">Sélectionner un programme</option>
                          {programmes.map((prog) => (
                            <option key={prog._id} value={prog._id}>
                              {prog.code} - {prog.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Objectif
                        </label>
                        <textarea
                          name="goal"
                          value={form.goal || ""}
                          onChange={handleChange}
                          placeholder="Objectif de l'indicateur"
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>
                    </div>

                    {/* Definitions */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Définitions
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Définition Internationale
                        </label>
                        <textarea
                          name="internationalDefinition"
                          value={form.internationalDefinition || ""}
                          onChange={handleChange}
                          placeholder="Définition selon les standards internationaux"
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Définition Nationale
                        </label>
                        <textarea
                          name="nationalDefinition"
                          value={form.nationalDefinition || ""}
                          onChange={handleChange}
                          placeholder="Définition adaptée au contexte national"
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Sources de Données
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Source Principale
                        </label>
                        <select
                          name="mainDataSource"
                          value={typeof form.mainDataSource === 'string' ? form.mainDataSource : form.mainDataSource?._id || ""}
                          onChange={(e) => setForm({ ...form, mainDataSource: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        >
                          <option value="">Sélectionner une source principale</option>
                          {sources.map(source => (
                            <option key={source._id} value={source._id}>
                              {source.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Source Primaire
                        </label>
                        <select
                          name="primaryDataSource"
                          value={typeof form.primaryDataSource === 'string' ? form.primaryDataSource : form.primaryDataSource?._id || ""}
                          onChange={(e) => setForm({ ...form, primaryDataSource: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Sélectionner une source primaire</option>
                          {sources.map(source => (
                            <option key={source._id} value={source._id}>
                              {source.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Méthode de Collecte
                        </label>
                        <input
                          name="dataCollectionMethod"
                          value={form.dataCollectionMethod || ""}
                          onChange={handleChange}
                          placeholder="Ex: Enquête, Recensement, Administration"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Détails Techniques
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Méthode de Calcul
                        </label>
                        <textarea
                          name="calculationMethod"
                          value={form.calculationMethod || ""}
                          onChange={handleChange}
                          placeholder="Formule ou méthode de calcul"
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Unité de Mesure
                        </label>
                        <select
                          name="measurementUnit"
                          value={typeof form.measurementUnit === 'string' ? form.measurementUnit : form.measurementUnit?._id || ""}
                          onChange={(e) => setForm({ ...form, measurementUnit: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Sélectionner une unité de mesure</option>
                          {unitesDeMesure.map(unite => (
                            <option key={unite._id} value={unite._id}>
                              {unite.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Population Couverte
                        </label>
                        <select
                          name="coveredPopulation"
                          value={form.coveredPopulation || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {COVERED_POPULATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Geographic and Temporal */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Couverture Géographique et Temporelle
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Couverture Géographique
                        </label>
                        <select
                          name="geographicCoverage"
                          value={form.geographicCoverage || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {GEOGRAPHIC_COVERAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Niveau de Désagrégation
                        </label>
                        <div className="relative">
                          <div className="w-full px-4 py-3 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 bg-white">
                            {DISAGGREGATION_LEVEL_OPTIONS.map(option => (
                              <div key={option.value} className="flex items-center mb-2 last:mb-0">
                                <input
                                  type="checkbox"
                                  id={`disaggregation-${option.value}`}
                                  checked={form.disaggregationLevel?.includes(option.value) || false}
                                  onChange={(e) => {
                                    const currentLevels = form.disaggregationLevel || [];
                                    if (e.target.checked) {
                                      setForm({ 
                                        ...form, 
                                        disaggregationLevel: [...currentLevels, option.value] 
                                      });
                                    } else {
                                      setForm({ 
                                        ...form, 
                                        disaggregationLevel: currentLevels.filter(level => level !== option.value) 
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label 
                                  htmlFor={`disaggregation-${option.value}`}
                                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Périodicité de Publication
                        </label>
                        <select
                          name="publicationPeriodicity"
                          value={form.publicationPeriodicity || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {PUBLICATION_PERIODICITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Institutional */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Structures Institutionnelles
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Structure Responsable de la Production
                        </label>
                        <input
                          name="responsibleProductionStructure"
                          value={form.responsibleProductionStructure || ""}
                          onChange={handleChange}
                          placeholder="Ex: ANSD, Direction des Statistiques"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Structure de Mise en Œuvre
                        </label>
                        <input
                          name="implementationStructure"
                          value={form.implementationStructure || ""}
                          onChange={handleChange}
                          placeholder="Structure chargée de l'implémentation"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Focal Points Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-slate-800">Points Focaux</h4>
                      <button
                        type="button"
                        onClick={addFocalPoint}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un Point Focal
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(form.focalPoints || []).map((fp, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-slate-700">Point Focal #{idx + 1}</h5>
                            <button
                              type="button"
                              onClick={() => removeFocalPoint(idx)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Nom Complet
                              </label>
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                  value={fp.name || ""}
                                  onChange={e => handleFocalPointChange(idx, "name", e.target.value)}
                                  placeholder="Nom et prénom"
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Email
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                  type="email"
                                  value={fp.email || ""}
                                  onChange={e => handleFocalPointChange(idx, "email", e.target.value)}
                                  placeholder="email@exemple.com"
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Téléphone
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                  type="tel"
                                  value={fp.phone || ""}
                                  onChange={e => handleFocalPointChange(idx, "phone", e.target.value)}
                                  placeholder="+221 XX XXX XX XX"
                                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!form.focalPoints || form.focalPoints.length === 0) && (
                        <div className="text-center py-8 text-slate-500">
                          <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                          <p>Aucun point focal ajouté</p>
                          <p className="text-sm">Cliquez sur "Ajouter un Point Focal" pour commencer</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          {editingId ? 'Mettre à Jour' : 'Créer'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50"></div>
              
              <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Confirmer la Suppression</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">Êtes-vous sûr de vouloir supprimer cette métadonnée ?</p>
                      <p className="text-slate-600 text-sm mt-1">Cette action est irréversible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteId(null);
                      }}
                      className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Excel Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Importer des Métadonnées depuis Excel
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sélectionner un fichier Excel
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setImportFile(file || null);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Formats supportés: .xlsx, .xls
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Format Excel attendu:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Code (obligatoire)</li>
                      <li>• Nom/Name (obligatoire)</li>
                      <li>• Définition Internationale</li>
                      <li>• Définition Nationale</li>
                      <li>• Source Principale</li>
                      <li>• Source Primaire</li>
                      <li>• Unité de Mesure</li>
                      <li>• Niveau de Désagrégation (séparés par virgule)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
                    disabled={importLoading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleImportExcel}
                    disabled={!importFile || importLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {importLoading ? 'Importation...' : 'Importer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaDataCrud;
