import { useEffect, useState, FormEvent } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

export type DataProducer = {
  _id?: string;
  name: string;
  description: string;
  contactInfo?: {
    mail?: string;
    phone?: string;
  };
  url?: string;
};

const DataProducerCrud = () => {
  const [dataProducers, setDataProducers] = useState<DataProducer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDataProducer, setEditDataProducer] = useState<DataProducer | null>(null);
  const [form, setForm] = useState<DataProducer>({ 
    name: '', 
    description: '', 
    contactInfo: { mail: '', phone: '' },
    url: '' 
  });

  useEffect(() => {
    const fetchDataProducers = async () => {
      try {
        const res = await api.get('/data-producers');
        setDataProducers(res.data);
      } catch {
        setDataProducers([]);
      }
    };
    fetchDataProducers();
  }, []);

  const openCreate = () => {
    setEditDataProducer(null);
    setForm({ 
      name: '', 
      description: '', 
      contactInfo: { mail: '', phone: '' },
      url: '' 
    });
    setModalOpen(true);
  };

  const openEdit = (dataProducer: DataProducer) => {
    setEditDataProducer(dataProducer);
    setForm({ 
      name: dataProducer.name, 
      description: dataProducer.description, 
      contactInfo: {
        mail: dataProducer.contactInfo?.mail || '',
        phone: dataProducer.contactInfo?.phone || ''
      },
      url: dataProducer.url || '' 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Supprimer ce producteur de données ?')) {
      try {
        await api.delete(`/data-producers/${id}`);
        setDataProducers(dataProducers.filter(dp => dp._id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du producteur de données');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editDataProducer && editDataProducer._id) {
        const res = await api.put(`/data-producers/${editDataProducer._id}`, form);
        setDataProducers(dataProducers.map(dp => dp._id === editDataProducer._id ? res.data : dp));
      } else {
        const res = await api.post('/data-producers', form);
        setDataProducers([...dataProducers, res.data]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du producteur de données');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 px-2 md:px-6 mx-2 md:mx-8 mt-8 md:mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Producteurs de Données</h2>
        <Button onClick={openCreate}>Créer un Producteur</Button>
      </div>
      <Table
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Description', accessor: 'description' },
          { 
            header: 'Contact Mail', 
            accessor: (dp: DataProducer) => dp.contactInfo?.mail ? (
              <a href={`mailto:${dp.contactInfo.mail}`} className="text-blue-600 underline">
                {dp.contactInfo.mail}
              </a>
            ) : '-'
          },
          { header: 'Téléphone', accessor: (dp: DataProducer) => dp.contactInfo?.phone || '-' },
          { 
            header: 'URL', 
            accessor: (dp: DataProducer) => dp.url ? (
              <a href={dp.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {dp.url}
              </a>
            ) : '-' 
          },
          { 
            header: 'Actions', 
            accessor: (dp: DataProducer) => (
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => openEdit(dp)} variant="secondary">Modifier</Button>
                <Button size="sm" onClick={() => handleDelete(dp._id)} variant="danger">Supprimer</Button>
              </div>
            ) 
          },
        ]}
        data={dataProducers}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editDataProducer ? 'Modifier le Producteur' : 'Créer un Producteur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
              required 
              rows={3} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={form.contactInfo?.mail || ''} 
                onChange={e => setForm(f => ({ 
                  ...f, 
                  contactInfo: { ...f.contactInfo, mail: e.target.value }
                }))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input 
                type="tel" 
                value={form.contactInfo?.phone || ''} 
                onChange={e => setForm(f => ({ 
                  ...f, 
                  contactInfo: { ...f.contactInfo, phone: e.target.value }
                }))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL du site web</label>
            <input 
              type="url" 
              value={form.url || ''} 
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editDataProducer ? 'Modifier' : 'Créer'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              variant="secondary" 
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DataProducerCrud;
