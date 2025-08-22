import { useEffect, useState } from "react";
import axios from "axios";

interface Indicator {
  _id: string;
  code: string;
  name: string;
}

const IndicatorCrud = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [form, setForm] = useState({ code: "", name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchIndicators = async () => {
    const res = await axios.get("/api/indicators");
    setIndicators(res.data);
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/api/indicators/${editingId}`, form);
    } else {
      await axios.post("/api/indicators", form);
    }
    setForm({ code: "", name: "" });
    setEditingId(null);
    fetchIndicators();
  };

  const handleEdit = (indicator: Indicator) => {
    setForm({ code: indicator.code, name: indicator.name });
    setEditingId(indicator._id);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/indicators/${id}`);
    fetchIndicators();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Indicators CRUD</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input name="code" value={form.code} onChange={handleChange} placeholder="Code" className="border p-2" required />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Code</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator) => (
            <tr key={indicator._id}>
              <td className="border px-2">{indicator.code}</td>
              <td className="border px-2">{indicator.name}</td>
              <td className="border px-2">
                <button onClick={() => handleEdit(indicator)} className="mr-2 text-blue-600">Edit</button>
                <button onClick={() => handleDelete(indicator._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IndicatorCrud;
