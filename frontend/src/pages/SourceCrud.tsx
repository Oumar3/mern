import { useEffect, useState, FormEvent } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

export type DataProducer = {
  _id: string;
  name: string;
  description: string;
  contactInfo?: {
    mail?: string;
    phone?: string;
  };
  url?: string;
};

export type Source = {
  _id?: string;
  code: string;
  name: string;
  description: string;
  producer: (string | DataProducer)[];
  url?: string;
};

const SourceCrud = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [dataProducers, setDataProducers] = useState<DataProducer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);
  const [form, setForm] = useState<Source>({ code: '', name: '', description: '', producer: [], url: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sourcesRes, producersRes] = await Promise.all([
          api.get('/sources'),
          api.get('/data-producers')
        ]);
        setSources(sourcesRes.data);
        setDataProducers(producersRes.data);
      } catch {
        setSources([]);
        setDataProducers([]);
      }
    };
    fetchData();
  }, []);

  const openCreate = () => {
    setEditSource(null);
    setForm({ code: '', name: '', description: '', producer: [], url: '' });
    setModalOpen(true);
  };

  const openEdit = (source: Source) => {
    setEditSource(source);
    setForm({ 
      code: source.code, 
      name: source.name, 
      description: source.description, 
      producer: typeof source.producer[0] === 'object' ? source.producer.map((p) => typeof p === 'object' ? p._id : p) : source.producer,
      url: source.url || '' 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Supprimer cette source ?')) {
      await api.delete(`/sources/${id}`);
      setSources(sources.filter(s => s._id !== id));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 px-2 md:px-6 mx-2 md:mx-8 mt-8 md:mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Sources</h2>
        <Button onClick={openCreate}>Créer une Source</Button>
      </div>
      <Table
        columns={[
          { header: 'Code', accessor: 'code' },
          { header: 'Nom', accessor: 'name' },
          { header: 'Description', accessor: 'description' },
          { 
            header: 'Producteurs', 
            accessor: (s: Source) => {
              if (s.producer && s.producer.length > 0) {
                return (typeof s.producer[0] === 'object' 
                  ? s.producer.filter(p => typeof p === 'object').map((p: DataProducer) => p.name).join(', ')
                  : 'Producteurs sélectionnés'
                );
              }
              return '-';
            }
          },
          { header: 'URL', accessor: (s: Source) => s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{s.url}</a> : '-' },
          { header: 'Actions', accessor: (s: Source) => (
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => openEdit(s)} variant="secondary">Modifier</Button>
              <Button size="sm" onClick={() => handleDelete(s._id)} variant="danger">Supprimer</Button>
            </div>
          ) },
        ]}
        data={sources}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editSource ? 'Modifier la Source' : 'Créer une Source'}
      >
        <form onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          if (editSource && editSource._id) {
            const res = await api.put(`/sources/${editSource._id}`, form);
            setSources(sources.map(s => s._id === editSource._id ? res.data : s));
          } else {
            const res = await api.post('/sources', form);
            setSources([...sources, res.data]);
          }
          setModalOpen(false);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input 
              type="text" 
              value={form.code} 
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producteurs de données *</label>
            <select 
              multiple
              value={form.producer as string[]} 
              onChange={e => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setForm(f => ({ ...f, producer: selectedOptions }));
              }}
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
            >
              {dataProducers.map(producer => (
                <option key={producer._id} value={producer._id}>
                  {producer.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs producteurs</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editSource ? 'Modifier' : 'Créer'}</Button>
            <Button type="button" onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SourceCrud;
