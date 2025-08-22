import { useEffect, useState, FormEvent } from 'react';
import Table from './ui/Table';
import Button from './ui/Button';
import Modal from './ui/Modal';
import api from '../lib/api';
import { Pencil, Trash2, Eye } from 'lucide-react';

export type Programme = {
  _id?: string;
  code: string;
  name: string;
  objectif: string;
  domaine: string;
  cost?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
};

interface ProgrammeCrudProps {
  domaineId: string;
}

const ProgrammeCrud = ({ domaineId }: ProgrammeCrudProps) => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [editProgramme, setEditProgramme] = useState<Programme | null>(null);
  const [progForm, setProgForm] = useState<Programme>({
    code: '',
    name: '',
    objectif: '',
    domaine: domaineId,
    cost: undefined,
    currency: undefined,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await api.get(`/programmes?domaine=${domaineId}`);
        setProgrammes(res.data);
      } catch {
        setProgrammes([]);
      }
    };
    fetchProgrammes();
  }, [domaineId]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Programmes</h2>
        <Button onClick={() => {
          setEditProgramme(null);
          setProgForm({
            code: '',
            name: '',
            objectif: '',
            domaine: domaineId,
            cost: 0,
            currency: 'XAF',
            startDate: '',
            endDate: '',
          });
          setProgModalOpen(true);
        }}>
          Créer un Programme
        </Button>
      </div>
      <Table
        columns={[
          { header: 'Code', accessor: 'code' },
          { header: 'Nom du Programme', accessor: 'name' },
          // Objectif removed from table, will be shown in detail page
          {
            header: 'Coût du Programme',
            accessor: (p: Programme) => (
              <span
                className="font-mono font-bold text-right block cursor-help"
                title={p.cost !== undefined ? `${new Intl.NumberFormat('fr-FR').format(p.cost)} ${p.currency ?? ''}` : '-'}
              >
                {p.cost !== undefined ? `${new Intl.NumberFormat('fr-FR').format(p.cost)} ${p.currency ?? ''}` : '-'}
              </span>
            ),
            className: 'text-right',
          },
          // Removed start and end date columns
          { header: 'Actions', accessor: (p: Programme) => (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setEditProgramme(p);
                  setProgForm({
                    code: p.code,
                    name: p.name,
                    objectif: p.objectif,
                    domaine: domaineId,
                    cost: p.cost,
                    currency: p.currency,
                    startDate: p.startDate?.slice(0,10) || '',
                    endDate: p.endDate?.slice(0,10) || '',
                  });
                  setProgModalOpen(true);
                }}
                className="p-2 rounded hover:bg-blue-50 text-blue-600"
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Supprimer ce programme ?')) {
                    await api.delete(`/programmes/${p._id}`);
                    setProgrammes(programmes.filter(pr => pr._id !== p._id));
                  }
                }}
                className="p-2 rounded hover:bg-red-50 text-red-600"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => window.location.href = `/dashboard/domaines/${domaineId}/programmes/${p._id}`}
                className="p-2 rounded hover:bg-gray-50 text-gray-600"
                title="Voir"
              >
                <Eye size={18} />
              </button>
            </div>
          ) },
        ]}
        data={programmes}
      />
      <Modal
        isOpen={progModalOpen}
        onClose={() => setProgModalOpen(false)}
        title={editProgramme ? 'Modifier le Programme' : 'Créer un Programme'}
      >
        <form onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          const payload = { ...progForm, domaine: domaineId };
          if (editProgramme && editProgramme._id) {
            await api.put(`/programmes/${editProgramme._id}`, payload);
            setProgrammes(programmes.map(pr => pr._id === editProgramme._id ? { ...editProgramme, ...progForm } : pr));
          } else {
            const res = await api.post('/programmes', payload);
            setProgrammes([...programmes, res.data]);
          }
          setProgModalOpen(false);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input type="text" value={progForm.code} onChange={e => setProgForm(f => ({ ...f, code: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
            <textarea value={progForm.objectif} onChange={e => setProgForm(f => ({ ...f, objectif: e.target.value }))} required rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût</label>
              <input type="number" value={progForm.cost ?? ''} onChange={e => setProgForm(f => ({ ...f, cost: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select value={progForm.currency ?? ''} onChange={e => setProgForm(f => ({ ...f, currency: e.target.value || undefined }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">--</option>
                <option value="XAF">XAF</option>
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          {/* Removed start and end date fields from modal form */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editProgramme ? 'Modifier' : 'Créer'}</Button>
            <Button type="button" onClick={() => setProgModalOpen(false)} variant="secondary" className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgrammeCrud;
