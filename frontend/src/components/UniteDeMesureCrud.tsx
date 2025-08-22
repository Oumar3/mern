import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { XCircleIcon, PencilSquareIcon, TrashIcon, ScaleIcon } from '@heroicons/react/24/outline';

interface UniteDeMesure {
  _id?: string;
  code: string;
  name: string;
  description?: string;
}

const UniteDeMesureCrud: React.FC = () => {
  const [units, setUnits] = useState<UniteDeMesure[]>([]);
  const [form, setForm] = useState<UniteDeMesure>({ code: "", name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/unites-de-mesure");
      setUnits(res.data);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data) {
        setError((err as { response: { data: { error: string } } }).response.data.error);
      } else {
        setError("Failed to fetch units");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api.put(`/unites-de-mesure/${editingId}`, form);
      } else {
        await api.post("/unites-de-mesure", form);
      }
      setForm({ code: "", name: "", description: "" });
      setEditingId(null);
      fetchUnits();
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data
      ) {
        setError((err as { response: { data: { error: string } } }).response.data.error);
      } else {
        setError("Failed to save unit");
      }
    }
  };
  const handleEdit = (unit: UniteDeMesure) => {
    setForm({ code: unit.code, name: unit.name, description: unit.description || "" });
    setEditingId(unit._id || null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    setError(null);
    try {
      await api.delete(`/unites-de-mesure/${id}`);
      fetchUnits();
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data
      ) {
        setError((err as { response: { data: { error: string } } }).response.data.error);
      } else {
        setError("Failed to delete unit");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-5">
  <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 shadow">
            <ScaleIcon className="h-8 w-8 text-blue-500" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestion des Unités de Mesure</h2>
            <p className="text-gray-500 text-sm mt-1">Ajoutez, modifiez ou supprimez les unités utilisées dans le système.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-500 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-blue-700">Code *</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="w-full border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg transition"
                placeholder="Code de l'unité"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-700">Nom *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 p-3 rounded-lg transition"
                placeholder="Nom de l'unité"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-50 p-3 rounded-lg transition"
                placeholder="Description (optionnelle)"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition-all">
                {editingId ? "Mettre à jour" : "Ajouter"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ code: "", name: "", description: "" });
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
          {error && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg animate-fade-in">
              <XCircleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-purple-500 animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-blue-500 font-medium">Chargement...</span>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Aucune unité trouvée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {units.map((unit) => (
                    <tr key={unit._id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shadow-sm">
                          {unit.code}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs shadow-sm">
                          {unit.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{unit.description || '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 shadow transition"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(unit._id)}
                          className="inline-flex items-center justify-center p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow transition"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default UniteDeMesureCrud;
