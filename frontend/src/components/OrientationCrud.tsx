
import React, { useEffect, useState, FormEvent } from 'react';
import api from '../lib/api';
import Button from './ui/Button';
import Table from './ui/Table';
import Modal from './ui/Modal';

interface Orientation {
  _id?: string;
  code: string;
  description: string;
}

const OrientationCrud: React.FC<{ programmeId: string }> = ({ programmeId }) => {
  const [orientations, setOrientations] = useState<Orientation[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Orientation>({ code: '', description: '' });
  const [editOrientation, setEditOrientation] = useState<Orientation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrientations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orientations?programme=${programmeId}`);
      setOrientations(res.data);
    } catch {
      setOrientations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrientations();
    // eslint-disable-next-line
  }, [programmeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const openCreate = () => {
    setEditOrientation(null);
    setForm({ code: '', description: '' });
    setModalOpen(true);
    setError(null);
  };

  const openEdit = (orientation: Orientation) => {
    setEditOrientation(orientation);
    setForm({ code: orientation.code, description: orientation.description });
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ code: '', description: '' });
    setEditOrientation(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editOrientation && editOrientation._id) {
        await api.put(`/orientations/${editOrientation._id}`, { ...form, programme: programmeId });
      } else {
        await api.post('/orientations', { ...form, programme: programmeId });
      }
      closeModal();
      fetchOrientations();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette orientation ?')) return;
    try {
      await api.delete(`/orientations/${id}`);
      fetchOrientations();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Orientations</h2>
        <Button onClick={openCreate}>Créer une Orientation</Button>
      </div>
      <Table
        columns={[
          { header: 'Code', accessor: 'code' },
          { header: 'Description', accessor: 'description' },
          {
            header: 'Actions', accessor: (o: Orientation) => (
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => openEdit(o)} variant="secondary">Modifier</Button>
                <Button size="sm" onClick={() => handleDelete(o._id!)} variant="danger">Supprimer</Button>
              </div>
            )
          }
        ]}
        data={orientations}
      />
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editOrientation ? 'Modifier Orientation' : 'Créer une Orientation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editOrientation ? 'Modifier' : 'Créer'}</Button>
            <Button type="button" onClick={closeModal} variant="secondary" className="flex-1">Annuler</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrientationCrud;
