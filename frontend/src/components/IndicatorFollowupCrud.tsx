import React, { useEffect, useState } from "react";
import axios from "axios";

const IndicatorFollowupCrud = () => {
  const [followups, setFollowups] = useState([]);
  const [form, setForm] = useState({ data: "", year: "", value: "" });
  const [editingId, setEditingId] = useState(null);
  const [dataOptions, setDataOptions] = useState([]);

  useEffect(() => {
    // Fetch all indicator data options for selection
    axios.get("/api/indicators").then(res => {
      // Flatten all data entries with indicator info
      const options = res.data.flatMap(ind =>
        (ind.data || []).map((d, idx) => ({
          label: `${ind.code} - ${ind.name} [${d.geoLocation || ''}]`,
          value: d._id || `${ind._id}:${idx}` // fallback if no _id
        }))
      );
      setDataOptions(options);
    });
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    const res = await axios.get("/api/indicator-followups");
    setFollowups(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/api/indicator-followups/${editingId}`, form);
    } else {
      await axios.post("/api/indicator-followups", form);
    }
    setForm({ data: "", year: "", value: "" });
    setEditingId(null);
    fetchFollowups();
  };

  const handleEdit = (followup) => {
    setForm({ data: followup.data, year: followup.year, value: followup.value });
    setEditingId(followup._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/indicator-followups/${id}`);
    fetchFollowups();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Indicator Followup CRUD</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <select name="data" value={form.data} onChange={handleChange} className="border p-2" required>
          <option value="">Select Indicator Data</option>
          {dataOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input name="year" value={form.year} onChange={handleChange} placeholder="Year" className="border p-2" required type="number" />
        <input name="value" value={form.value} onChange={handleChange} placeholder="Value" className="border p-2" required type="number" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Indicator Data</th>
            <th className="border px-2">Year</th>
            <th className="border px-2">Value</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {followups.map((f) => (
            <tr key={f._id}>
              <td className="border px-2">{f.data}</td>
              <td className="border px-2">{f.year}</td>
              <td className="border px-2">{f.value}</td>
              <td className="border px-2">
                <button onClick={() => handleEdit(f)} className="mr-2 text-blue-600">Edit</button>
                <button onClick={() => handleDelete(f._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IndicatorFollowupCrud;
