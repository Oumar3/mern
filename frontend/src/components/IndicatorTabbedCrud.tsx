import React, { useEffect, useState } from "react";
import axios from "axios";

interface IndicatorData {
  _id?: string;
  geoLocation?: string;
  ageRange?: string;
  gender?: string;
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
  data: IndicatorData[];
}

interface Followup {
  _id: string;
  data: string;
  year: number;
  value: number;
}

const IndicatorTabbedCrud = () => {
  const [activeTab, setActiveTab] = useState("indicators");
  
  // Indicators state
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorForm, setIndicatorForm] = useState({ code: "", name: "" });
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  
  // Followups state
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupForm, setFollowupForm] = useState({ data: "", year: "", value: "" });
  const [editingFollowupId, setEditingFollowupId] = useState<string | null>(null);
  const [dataOptions, setDataOptions] = useState<Array<{label: string, value: string}>>([]);

  const fetchIndicators = async () => {
    try {
      const res = await axios.get("/api/indicators");
      setIndicators(res.data);
      
      // Update data options for followups
      const options = res.data.flatMap((ind: Indicator) =>
        (ind.data || []).map((d: IndicatorData, idx: number) => ({
          label: `${ind.code} - ${ind.name} [${d.geoLocation || 'No location'}, ${d.ageRange || 'No age'}]`,
          value: d._id || `${ind._id}:${idx}`
        }))
      );
      setDataOptions(options);
    } catch (error) {
      console.error("Error fetching indicators:", error);
    }
  };

  const fetchFollowups = async () => {
    try {
      const res = await axios.get("/api/indicator-followups");
      setFollowups(res.data);
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  };

  useEffect(() => {
    fetchIndicators();
    fetchFollowups();
  }, []);

  // Indicator CRUD handlers
  const handleIndicatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndicatorForm({ ...indicatorForm, [e.target.name]: e.target.value });
  };

  const handleIndicatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIndicatorId) {
        await axios.put(`/api/indicators/${editingIndicatorId}`, indicatorForm);
      } else {
        await axios.post("/api/indicators", indicatorForm);
      }
      setIndicatorForm({ code: "", name: "" });
      setEditingIndicatorId(null);
      fetchIndicators();
    } catch (error) {
      console.error("Error saving indicator:", error);
    }
  };

  const handleIndicatorEdit = (indicator: Indicator) => {
    setIndicatorForm({ code: indicator.code, name: indicator.name });
    setEditingIndicatorId(indicator._id);
  };

  const handleIndicatorDelete = async (id: string) => {
    if (confirm("Are you sure? This will also delete all related followups.")) {
      try {
        await axios.delete(`/api/indicators/${id}`);
        fetchIndicators();
        fetchFollowups();
      } catch (error) {
        console.error("Error deleting indicator:", error);
      }
    }
  };

  // Followup CRUD handlers
  const handleFollowupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFollowupForm({ ...followupForm, [e.target.name]: e.target.value });
  };

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFollowupId) {
        await axios.put(`/api/indicator-followups/${editingFollowupId}`, followupForm);
      } else {
        await axios.post("/api/indicator-followups", followupForm);
      }
      setFollowupForm({ data: "", year: "", value: "" });
      setEditingFollowupId(null);
      fetchFollowups();
    } catch (error) {
      console.error("Error saving followup:", error);
    }
  };

  const handleFollowupEdit = (followup: Followup) => {
    setFollowupForm({ 
      data: followup.data, 
      year: followup.year.toString(), 
      value: followup.value.toString() 
    });
    setEditingFollowupId(followup._id);
  };

  const handleFollowupDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await axios.delete(`/api/indicator-followups/${id}`);
        fetchFollowups();
      } catch (error) {
        console.error("Error deleting followup:", error);
      }
    }
  };

  const getDataLabel = (dataId: string) => {
    const option = dataOptions.find(opt => opt.value === dataId);
    return option ? option.label : dataId;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Indicator & Followup Management</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("indicators")}
          className={`px-4 py-2 mr-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === "indicators"
              ? "bg-blue-500 text-white border-b-2 border-blue-500"
              : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          }`}
        >
          Indicators ({indicators.length})
        </button>
        <button
          onClick={() => setActiveTab("followups")}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === "followups"
              ? "bg-blue-500 text-white border-b-2 border-blue-500"
              : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          }`}
        >
          Followups ({followups.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "indicators" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Indicators Management</h2>
          
          {/* Add/Edit Indicator Form */}
          <form onSubmit={handleIndicatorSubmit} className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Code</label>
              <input 
                name="code" 
                value={indicatorForm.code} 
                onChange={handleIndicatorChange} 
                placeholder="Enter indicator code" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Name</label>
              <input 
                name="name" 
                value={indicatorForm.name} 
                onChange={handleIndicatorChange} 
                placeholder="Enter indicator name" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-medium"
              >
                {editingIndicatorId ? "Update" : "Add"} Indicator
              </button>
              {editingIndicatorId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingIndicatorId(null);
                    setIndicatorForm({ code: "", name: "" });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Indicators Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Entries
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indicators.map((indicator) => (
                  <tr key={indicator._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {indicator.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indicator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {indicator.data?.length || 0} entries
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleIndicatorEdit(indicator)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleIndicatorDelete(indicator._id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {indicators.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No indicators found. Add your first indicator above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "followups" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Followups Management</h2>
          
          {dataOptions.length === 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">No indicator data available!</p>
              <p className="text-sm mt-1">
                You need to create indicators with data entries first before adding followups. 
                Switch to the Indicators tab and add some indicator data.
              </p>
            </div>
          )}

          {/* Add/Edit Followup Form */}
          <form onSubmit={handleFollowupSubmit} className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Data</label>
              <select 
                name="data" 
                value={followupForm.data} 
                onChange={handleFollowupChange} 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                disabled={dataOptions.length === 0}
              >
                <option value="">Select Indicator Data</option>
                {dataOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input 
                name="year" 
                value={followupForm.year} 
                onChange={handleFollowupChange} 
                placeholder="2024" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required 
                type="number" 
                min="1900"
                max="2100"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input 
                name="value" 
                value={followupForm.value} 
                onChange={handleFollowupChange} 
                placeholder="0.00" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required 
                type="number" 
                step="any"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={dataOptions.length === 0}
              >
                {editingFollowupId ? "Update" : "Add"} Followup
              </button>
              {editingFollowupId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingFollowupId(null);
                    setFollowupForm({ data: "", year: "", value: "" });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Followups Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicator Reference
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {followups.map((followup) => (
                  <tr key={followup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getDataLabel(followup.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {followup.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {followup.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleFollowupEdit(followup)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleFollowupDelete(followup._id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {followups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No followups found. Add your first followup above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorTabbedCrud;
