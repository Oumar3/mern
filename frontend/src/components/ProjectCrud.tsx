import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Table from './ui/Table';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  _id?: string;
  code: string;
  name: string;
  slug?: string;
  description: string;
  type: string;
  typology: string;
  zone?: string;
  programme: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  status: string;
}

interface ProjectCrudProps {
  programmeId: string;
}

const ProjectCrud = ({ programmeId }: ProjectCrudProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmeId]);

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects?programme=${programmeId}`);
      setProjects(res.data);
    } catch {
      setProjects([]);
    }
  };

  const handleCreate = () => {
    setEditProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce projet ?')) {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    }
  };

  const handleSubmit = async (data: Project) => {
    const payload = {
      ...data,
      programme: programmeId,
      createdBy: user?._id,
    };
    if (editProject && editProject._id) {
      await api.put(`/projects/${editProject._id}`, payload);
    } else {
      await api.post('/projects', payload);
    }
    setModalOpen(false);
    fetchProjects();
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-indigo-700">Projets</h2>
        <Button onClick={handleCreate}>Ajouter un projet</Button>
      </div>
      <Table
        columns={[
          { header: 'Code', accessor: 'code' },
          { header: 'Nom', accessor: 'name' },
          { header: 'Budget', accessor: 'budget' },
          { header: 'Devise', accessor: 'currency' },
          { header: 'Statut', accessor: 'status' },
          {
            header: 'Actions',
            accessor: (row: Project) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate(`/dashboard/programmes/${programmeId}/projects/${row._id}`)} variant="secondary" aria-label="Voir le détail">
                  <FiEye className="inline" />
                </Button>
                <Button size="sm" onClick={() => handleEdit(row)} variant="secondary" aria-label="Modifier">
                  <FiEdit2 className="inline" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(row._id!)} aria-label="Supprimer">
                  <FiTrash2 className="inline" />
                </Button>
              </div>
            ),
          },
        ]}
        data={projects}
      />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Modifier le projet' : 'Ajouter un projet'}>
        <ProjectForm
          initialValues={editProject || { code: '', name: '', description: '', type: 'Projet', typology: 'Gouvernance', zone: '', startDate: '', endDate: '', budget: 0, currency: 'XAF', status: 'En cours', programme: programmeId }}
          onSubmit={(formData) => handleSubmit(formData as Project)}
        />
      </Modal>
    </div>
  );
};

// Dummy ProjectForm for now, you can replace with your own form implementation
const ProjectForm = ({ initialValues, onSubmit }: { initialValues: Omit<Project, 'createdBy'>; onSubmit: (data: Omit<Project, 'createdBy'>) => void }) => {
  const [form, setForm] = useState<Omit<Project, 'createdBy'>>(initialValues);
  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <input className="w-full border p-2 rounded" placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <select className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
        <option value="Projet">Projet</option>
        <option value="Reforme">Reforme</option>
      </select>
      <select className="w-full border p-2 rounded" value={form.typology} onChange={e => setForm({ ...form, typology: e.target.value })}>
        <option value="Gouvernance">Gouvernance</option>
        <option value="Structurant">Structurant</option>
      </select>
      <input className="w-full border p-2 rounded" placeholder="Zone" value={form.zone || ''} onChange={e => setForm({ ...form, zone: e.target.value })} />
      <input className="w-full border p-2 rounded" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
      <input className="w-full border p-2 rounded" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
      <input className="w-full border p-2 rounded" type="number" placeholder="Budget" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} />
      <select className="w-full border p-2 rounded" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
        <option value="XAF">XAF</option>
        <option value="XOF">XOF</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <select className="w-full border p-2 rounded" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
        <option value="En cours">En cours</option>
        <option value="Terminé">Terminé</option>
        <option value="Annulé">Annulé</option>
        <option value="En attente">En attente</option>
        <option value="Suspendus">Suspendus</option>
      </select>
      <Button type="submit">Enregistrer</Button>
    </form>
  );
};

export default ProjectCrud;
