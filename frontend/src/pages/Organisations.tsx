
import { useEffect, useState, FormEvent } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import api from '../lib/api';

type Organisation = {
  _id?: string;
  name: string;
  shortName?: string;
  description?: string;
};

const Organisations = () => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organisation | null>(null);
  const [form, setForm] = useState<Organisation>({ name: '', shortName: '', description: '' });

  const fetchOrganisations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organisations');
      setOrganisations(res.data);
    } catch {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganisations();
  }, []);


  const openCreateModal = () => {
    setEditOrg(null);
    setForm({ name: '', shortName: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (org: Organisation) => {
    setEditOrg(org);
    setForm({ name: org.name, shortName: org.shortName || '', description: org.description || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm('Delete this organisation?')) return;
    await api.delete(`/organisations/${id}`);
    fetchOrganisations();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editOrg && editOrg._id) {
      await api.put(`/organisations/${editOrg._id}`, form);
    } else {
      await api.post('/organisations', form);
    }
    setModalOpen(false);
    fetchOrganisations();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Organisations</h1>
      <Button onClick={openCreateModal}>Create Organisation</Button>
      <Table
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Short Name', accessor: 'shortName' },
          { header: 'Description', accessor: 'description' },
          {
            header: 'Actions',
            render: (org: Organisation) => (
              <div className="flex gap-2">
                <Button onClick={() => openEditModal(org)}>Edit</Button>
                <Button onClick={() => handleDelete(org._id)} variant="danger">Delete</Button>
              </div>
            ),
          },
        ]}
        data={organisations}
        loading={loading}
      />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editOrg ? 'Update Organisation' : 'Create Organisation'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">{editOrg ? 'Update' : 'Create'} Organisation</h2>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border p-2"
          />
          <input
            type="text"
            placeholder="Short Name"
            value={form.shortName}
            onChange={e => setForm({ ...form, shortName: e.target.value })}
            className="w-full border p-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2"
          />
          <div className="flex gap-2">
            <Button type="submit">{editOrg ? 'Update' : 'Create'}</Button>
            <Button type="button" onClick={() => setModalOpen(false)} variant="secondary">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Organisations;
