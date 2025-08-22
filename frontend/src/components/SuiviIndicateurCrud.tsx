import { useEffect, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import api from '../lib/api';

interface SuiviIndicateur {
  _id?: string;
  code: string;
  anne: number;
  valeur: number;
  indicateur: string;
  source: string;
  sourceDetail?: string;
}

interface SourceOption {
  _id: string;
  name: string;
}

interface SuiviIndicateurCrudProps {
  indicateurId: string;
  uniteDeMesure?: string;
}

const SuiviIndicateurCrud = ({ indicateurId, uniteDeMesure }: SuiviIndicateurCrudProps) => {
  const [suivis, setSuivis] = useState<SuiviIndicateur[]>([]);
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSuivi, setEditSuivi] = useState<SuiviIndicateur | null>(null);
  const [form, setForm] = useState<Omit<SuiviIndicateur, '_id' | 'indicateur'>>({
    code: '',
    anne: new Date().getFullYear(),
    valeur: 0,
    source: '',
    sourceDetail: '',
  });

  useEffect(() => {
    fetchSuivis();
    fetchSources();
    // eslint-disable-next-line
  }, [indicateurId]);

  const fetchSuivis = async () => {
    try {
      const res = await api.get(`/suivi-indicateurs?indicateur=${indicateurId}`);
      setSuivis(res.data.filter((s: SuiviIndicateur) => {
        if (typeof s.indicateur === 'string') return s.indicateur === indicateurId;
        if (
          typeof s.indicateur === 'object' &&
          s.indicateur &&
          '_id' in s.indicateur &&
          typeof (s.indicateur as { _id: string })._id === 'string'
        ) {
          return (s.indicateur as { _id: string })._id === indicateurId;
        }
        return false;
      }));
    } catch {
      setSuivis([]);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await api.get('/sources');
      setSources(res.data);
    } catch {
      setSources([]);
    }
  };

  const openCreate = () => {
    setEditSuivi(null);
    setForm({ code: '', anne: new Date().getFullYear(), valeur: 0, source: '', sourceDetail: '' });
    setModalOpen(true);
  };

  const openEdit = (suivi: SuiviIndicateur) => {
    setEditSuivi(suivi);
    setForm({
      code: suivi.code,
      anne: suivi.anne,
      valeur: suivi.valeur,
      source: suivi.source,
      sourceDetail: suivi.sourceDetail || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce suivi ?')) {
      await api.delete(`/suivi-indicateurs/${id}`);
      fetchSuivis();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, indicateur: indicateurId };
    if (editSuivi && editSuivi._id) {
      await api.put(`/suivi-indicateurs/${editSuivi._id}`, payload);
    } else {
      await api.post('/suivi-indicateurs', payload);
    }
    setModalOpen(false);
    fetchSuivis();
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Suivi des Valeurs</h3>
        <Button onClick={openCreate}>Ajouter un suivi</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Année</th>
              <th className="px-4 py-2">Valeur</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Détail Source</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suivis.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-2">{s.code}</td>
                <td className="px-4 py-2">{s.anne}</td>
                <td className="px-4 py-2">{s.valeur} {uniteDeMesure || ''}</td>
                <td className="px-4 py-2">{
                  typeof s.source === 'string'
                    ? (sources.find(src => src._id === s.source)?.name || '-')
                    : (s.source && typeof s.source === 'object' && 'name' in s.source
                        ? (s.source as { name: string }).name
                        : '-')
                }</td>
                <td className="px-4 py-2">{s.sourceDetail}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>Modifier</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s._id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
            {suivis.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-4">Aucun suivi trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSuivi ? 'Modifier Suivi' : 'Ajouter un Suivi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
              <input type="number" value={form.anne} onChange={e => setForm(f => ({ ...f, anne: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
              <input type="number" value={form.valeur} onChange={e => setForm(f => ({ ...f, valeur: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Sélectionner une source</option>
              {sources.map(src => (
                <option key={src._id} value={src._id}>{src.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Détail Source</label>
            <input type="text" value={form.sourceDetail} onChange={e => setForm(f => ({ ...f, sourceDetail: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editSuivi ? 'Modifier' : 'Ajouter'}</Button>
            <Button type="button" onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuiviIndicateurCrud;
