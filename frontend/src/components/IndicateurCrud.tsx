interface IndicateurForm {
  code: string;
  name: string;
  description: string;
  anne_deReference: number;
  valeur_deReference: number;
  anne_cible: number;
  valeur_cible: number;
  impact: string;
  uniteDeMesure: string;
  programme?: string;
  sourceDescription: string;
  source?: string[];
}
import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

type Source = {
  _id: string;
  name: string;
};

export type Indicateur = {
  _id?: string;
  code: string;
  name: string;
  description: string;
  anne_deReference: number;
  valeur_deReference: number;
  anne_cible: number;
  valeur_cible: number;
  impact: string;
  uniteDeMesure: string;
  source?: string[];
  sourceDescription?: string;
  programme?: string;
};

interface IndicateurCrudProps {
  programmeId: string;
  domaineId?: string;
}

const IndicateurCrud = ({ programmeId, domaineId }: IndicateurCrudProps) => {
  const navigate = useNavigate();
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndicateur, setEditIndicateur] = useState<Indicateur | null>(null);
  const [form, setForm] = useState<IndicateurForm>({
    code: '',
    name: '',
    description: '',
    anne_deReference: 2020,
    valeur_deReference: 0,
    anne_cible: 2025,
    valeur_cible: 0,
    impact: '',
    uniteDeMesure: '',
    programme: programmeId,
    source: [],
    sourceDescription: '',
  });

  useEffect(() => {
    const fetchIndicateurs = async () => {
      try {
        const res = await api.get(`/indicateurs?programme=${programmeId}`);
        setIndicateurs(res.data);
      } catch {
        setIndicateurs([]);
      }
    };
    fetchIndicateurs();
  }, [programmeId]);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await api.get('/sources');
        setSources(res.data);
      } catch {
        setSources([]);
      }
    };
    fetchSources();
  }, []);

  const openCreate = () => {
    setEditIndicateur(null);
    setForm({
      code: '',
      name: '',
      description: '',
      anne_deReference: 2020,
      valeur_deReference: 0,
      anne_cible: 2025,
      valeur_cible: 0,
      impact: '',
      uniteDeMesure: '',
      programme: programmeId,
      source: [],
      sourceDescription: '',
    });
    setModalOpen(true);
  };

  const openEdit = (ind: Indicateur) => {
    setEditIndicateur(ind);
    setForm({
      code: ind.code,
      name: ind.name,
      description: ind.description,
      anne_deReference: ind.anne_deReference,
      valeur_deReference: ind.valeur_deReference,
      anne_cible: ind.anne_cible,
      valeur_cible: ind.valeur_cible,
      impact: ind.impact,
      uniteDeMesure: ind.uniteDeMesure,
      programme: programmeId,
      source: Array.isArray(ind.source) ? ind.source.map((s: string | { _id: string }) => typeof s === 'string' ? s : s._id) : [],
      sourceDescription: ind.sourceDescription || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Supprimer cet indicateur ?')) {
      await api.delete(`/indicateurs/${id}`);
      setIndicateurs(indicateurs.filter(i => i._id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Indicateurs</h2>
        <Button onClick={openCreate}>Créer un Indicateur</Button>
      </div>
      <Table
        columns={[ 
          { header: 'Code', accessor: 'code' },
          { header: 'Nom', accessor: 'name' },
          { header: 'Année Réf.', accessor: 'anne_deReference' },
          { 
            header: 'Valeur Réf.', 
            accessor: (i: Indicateur) => `${i.valeur_deReference} ${i.uniteDeMesure || ''}`.trim() 
          },
          { header: 'Année Cible', accessor: 'anne_cible' },
          { 
            header: 'Valeur Cible', 
            accessor: (i: Indicateur) => `${i.valeur_cible} ${i.uniteDeMesure || ''}`.trim() 
          },
          // { header: 'Impact', accessor: 'impact' },
          // { header: 'Sources', accessor: (i: Indicateur) => Array.isArray(i.source) && i.source.length > 0 ? i.source.map((s: {_id?: string; name?: string}) => s.name || s).join(', ') : '-' },
          // { header: 'Desc. Source', accessor: (i: Indicateur) => Array.isArray(i.source) && i.source.length > 0 ? i.source.map((s: {_id?: string; description?: string}) => s.description).filter(Boolean).join(' | ') : '-' },
          { header: 'Actions', accessor: (i: Indicateur) => (
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => navigate(`/dashboard/domaines/${domaineId}/programmes/${programmeId}/indicateurs/${i._id}`)} variant="secondary" aria-label="Voir le détail">
                <FiEye className="inline" />
              </Button>
              <Button size="sm" onClick={() => openEdit(i)} variant="secondary" aria-label="Modifier">
                <FiEdit2 className="inline" />
              </Button>
              <Button size="sm" onClick={() => handleDelete(i._id)} variant="danger" aria-label="Supprimer">
                <FiTrash2 className="inline" />
              </Button>
            </div>
          ) },
        ]}
        data={indicateurs}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIndicateur ? 'Modifier Indicateur' : 'Créer un Indicateur'}
      >
        <form onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          // Attach source descriptions to each source for backend
          const payload = {
            code: form.code,
            name: form.name,
            description: form.description,
            anne_deReference: form.anne_deReference,
            valeur_deReference: form.valeur_deReference,
            anne_cible: form.anne_cible,
            valeur_cible: form.valeur_cible,
            impact: form.impact,
            uniteDeMesure: form.uniteDeMesure,
            programme: form.programme,
            source: form.source,
            sourceDescription: form.sourceDescription,
          };
          if (editIndicateur && editIndicateur._id) {
            const res = await api.put(`/indicateurs/${editIndicateur._id}`, payload);
            setIndicateurs(indicateurs.map(i => i._id === editIndicateur._id ? res.data : i));
          } else {
            const res = await api.post('/indicateurs', payload);
            setIndicateurs([...indicateurs, res.data]);
          }
          setModalOpen(false);
        }} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={form.name} onChange={e => setForm((f: IndicateurForm) => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input type="text" value={form.code} onChange={e => setForm((f: IndicateurForm) => ({ ...f, code: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unité de Mesure *</label>
                <input type="text" value={form.uniteDeMesure} onChange={e => setForm((f: IndicateurForm) => ({ ...f, uniteDeMesure: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année Référence *</label>
                <input type="number" value={form.anne_deReference} onChange={e => setForm((f: IndicateurForm) => ({ ...f, anne_deReference: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur Référence *</label>
                <input type="number" value={form.valeur_deReference} onChange={e => setForm((f: IndicateurForm) => ({ ...f, valeur_deReference: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année Cible *</label>
                <input type="number" value={form.anne_cible} onChange={e => setForm((f: IndicateurForm) => ({ ...f, anne_cible: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur Cible *</label>
                <input type="number" value={form.valeur_cible} onChange={e => setForm((f: IndicateurForm) => ({ ...f, valeur_cible: Number(e.target.value) }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact *</label>
              <textarea value={form.impact} onChange={e => setForm((f: IndicateurForm) => ({ ...f, impact: e.target.value }))} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sources</label>
              <div className="flex flex-wrap gap-3">
                {sources.map(s => (
                  <label key={s._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={s._id}
                      checked={form.source?.includes(s._id) || false}
                      onChange={e => {
                        const checked = e.target.checked;
                        setForm((f: IndicateurForm) => ({
                          ...f,
                          source: checked
                            ? [...(f.source || []), s._id]
                            : (f.source || []).filter(id => id !== s._id)
                        }));
                      }}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description des sources</label>
                <textarea
                  placeholder="Description pour toutes les sources sélectionnées"
                  value={form.sourceDescription}
                  onChange={e => setForm((f: IndicateurForm) => ({ ...f, sourceDescription: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editIndicateur ? 'Modifier' : 'Créer'}</Button>
            <Button type="button" onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IndicateurCrud;
