import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Indicator, 
  Programme, 
  Source, 
  UniteDeMesure
} from "../types/indicator";

const EnhancedIndicatorCrud = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [unitesDeMesure, setUnitesDeMesure] = useState<UniteDeMesure[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    totalItems: 0,
    perPage: 10
  });
  
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Indicateur d'impact socio-economique" as "Indicateur d'impact socio-economique" | "Indicateur de resultat de programme",
    uniteDeMesure: "",
    programme: "",
    source: [] as string[],
    metaData: "",
    polarityDirection: "positive" as 'positive' | 'negative'
  });

  // Fetch all data
  const fetchIndicators = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/indicators?page=${page}&limit=10`);
      
      // Handle both paginated and non-paginated responses for backward compatibility
      if (res.data.indicators) {
        setIndicators(res.data.indicators);
        setPagination(res.data.pagination);
      } else {
        // Fallback for non-paginated response
        setIndicators(res.data);
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [progRes, srcRes, uniteRes] = await Promise.all([
        axios.get("/api/programmes/options"),
        axios.get("/api/sources/options"),
        axios.get("/api/unites-de-mesure/options")
      ]);
      
      setProgrammes(progRes.data);
      setSources(srcRes.data);
      setUnitesDeMesure(uniteRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };  useEffect(() => {
    fetchIndicators();
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, source: selectedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        type: form.type,
        uniteDeMesure: form.uniteDeMesure || undefined,
        source: form.source.length > 0 ? form.source : [],
        metaData: form.metaData || undefined
      };

      if (editingId) {
        await axios.put(`/api/indicators/${editingId}`, submitData);
      } else {
        await axios.post("/api/indicators", submitData);
      }
      setForm({
        code: "",
        name: "",
        type: "Indicateur d'impact socio-economique",
        uniteDeMesure: "",
        programme: "",
        source: [],
        metaData: "",
        polarityDirection: "positive"
      });
      setEditingId(null);
      fetchIndicators();
    } catch (error) {
      console.error("Error saving indicator:", error);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    const uniteDeMesureId = typeof indicator.uniteDeMesure === 'object' && indicator.uniteDeMesure?._id 
      ? indicator.uniteDeMesure._id 
      : (typeof indicator.uniteDeMesure === 'string' ? indicator.uniteDeMesure : "");
    
    const metaDataId = typeof indicator.metaData === 'object' && indicator.metaData?._id
      ? indicator.metaData._id
      : (typeof indicator.metaData === 'string' ? indicator.metaData : "");
      
    setForm({
      code: indicator.code,
      name: indicator.name,
      type: indicator.type || "Indicateur d'impact socio-economique",
      uniteDeMesure: uniteDeMesureId,
      programme: typeof indicator.programme === 'object' ? indicator.programme._id : indicator.programme,
      source: indicator.source.map(s => typeof s === 'object' ? s._id : s),
      metaData: metaDataId,
      polarityDirection: indicator.polarityDirection || 'positive'
    });
    setEditingId(indicator._id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this indicator?")) {
      try {
        await axios.delete(`/api/indicators/${id}`);
        fetchIndicators();
      } catch (error) {
        console.error("Error deleting indicator:", error);
      }
    }
  };

  const getProgrammeName = (programme: Programme | string) => {
    if (typeof programme === 'object') return `${programme.code} - ${programme.name}`;
    const prog = programmes.find(p => p._id === programme);
    return prog ? `${prog.code} - ${prog.name}` : programme;
  };

  const getUniteName = (unite: UniteDeMesure | string | undefined) => {
    if (!unite) return "N/A";
    if (typeof unite === 'object') return `${unite.code} - ${unite.name}`;
    const unit = unitesDeMesure.find(u => u._id === unite);
    return unit ? `${unit.code} - ${unit.name}` : unite;
  };

  const getSourceNames = (sources: (Source | string)[]) => {
    return sources.map(s => {
      if (typeof s === 'object') return s.name;
      const source = sources.find(src => typeof src === 'object' && src._id === s);
      return typeof source === 'object' ? source.name : s;
    }).join(", ");
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Enhanced Indicators Management</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="Indicateur d'impact socio-economique">Indicateur d'impact socio-économique</option>
              <option value="Indicateur de resultat de programme">Indicateur de résultat de programme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polarity Direction *</label>
            <select
              name="polarityDirection"
              value={form.polarityDirection}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="positive">Positive (Good when increasing)</option>
              <option value="negative">Negative (Good when decreasing)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programme *</label>
            <select
              name="programme"
              value={form.programme}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Programme</option>
              {programmes.map(prog => (
                <option key={prog._id} value={prog._id}>
                  {prog.code} - {prog.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
            <select
              name="uniteDeMesure"
              value={form.uniteDeMesure}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Unit</option>
              {unitesDeMesure.map(unite => (
                <option key={unite._id} value={unite._id}>
                  {unite.code} - {unite.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sources</label>
          <select
            multiple
            value={form.source}
            onChange={handleSourceChange}
            className="w-full border border-gray-300 px-3 py-2 rounded h-24 focus:outline-none focus:border-blue-500"
            size={4}
          >
            {sources.map(source => (
              <option key={source._id} value={source._id}>
                {source.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {sources.length === 0 ? "Loading sources..." : "Hold Ctrl (Cmd on Mac) to select multiple sources"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">MetaData Reference</label>
          <select
            name="metaData"
            value={form.metaData}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">Select MetaData (Optional)</option>
            {/* MetaData options will be loaded when available */}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
        >
          {editingId ? "Update Indicator" : "Create Indicator"}
        </button>
        
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ 
                code: "", 
                name: "", 
                type: "Indicateur d'impact socio-economique",
                uniteDeMesure: "", 
                programme: "", 
                source: [], 
                metaData: "", 
                polarityDirection: "positive" 
              });
            }}
            className="ml-3 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Programme</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Sources</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Polarity</th>
              <th className="border border-gray-300 px-4 py-2 text-left">MetaData</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((indicator) => (
              <tr key={indicator._id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{indicator.code}</td>
                <td className="border border-gray-300 px-4 py-2">{indicator.name}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {getProgrammeName(indicator.programme)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getUniteName(indicator.uniteDeMesure)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getSourceNames(indicator.source)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {indicator.polarityDirection === 'negative' ? 'Negative (Good when decreasing)' : 'Positive (Good when increasing)'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {indicator.metaData ? (typeof indicator.metaData === 'object' ? indicator.metaData.name : 'MetaData Linked') : 'No MetaData'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit(indicator)}
                    className="mr-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(indicator._id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {indicators.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No indicators found. Create your first indicator above.
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-300 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.current * pagination.perPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchIndicators(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              const pageNumber = i + Math.max(1, pagination.current - 2);
              if (pageNumber <= pagination.total) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => fetchIndicators(pageNumber)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium ${
                      pageNumber === pagination.current
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => fetchIndicators(pagination.current + 1)}
              disabled={pagination.current >= pagination.total}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedIndicatorCrud;
