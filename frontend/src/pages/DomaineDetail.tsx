
import { useEffect, useState, } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ProgrammeCrud from '../components/ProgrammeCrud';
import api from '../lib/api';
import { Package } from 'lucide-react';

type Domaine = {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  nature: 'Specifique' | 'Transversale';
  strategy: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};


const DomaineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [domaine, setDomaine] = useState<Domaine | null>(null);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchDomaine = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/domaines/${id}`);
        setDomaine(res.data);
      } catch (error) {
        // handle error
      }
      setLoading(false);
    };
   
    fetchDomaine();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  if (!domaine) {
    return <div className="p-6 text-red-500">Domaine not found.</div>;
  }

  return (
    <div className="w-full py-8 px-2 md:px-6">
      <Button onClick={() => navigate(-1)} className="mb-6">Retour</Button>

      {/* Domaine Detail Card with HR separators */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100">
            <Package size={40} className="text-indigo-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{domaine.name}</h1>
          </div>
        </div>
        <hr className="my-4" />
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="text-sm text-gray-600"><span className="font-semibold">Code:</span> {domaine.code}</div>
          <div className="text-sm text-gray-600"><span className="font-semibold">Nature:</span> {domaine.nature}</div>
          <div className="text-sm text-gray-600"><span className="font-semibold">Créé le:</span> {domaine.createdAt ? new Date(domaine.createdAt).toLocaleString() : '-'}</div>
        </div>
        <hr className="my-4" />
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-indigo-700">Description</h3>
          <div className="text-gray-700 whitespace-pre-line min-h-[10px]">{domaine.description || <span className="text-gray-400">Aucune description</span>}</div>
        </div>
        <hr className="my-4" />
        <div>
          <h3 className="text-lg font-medium mb-2 text-indigo-700">Stratégie</h3>
          <div className="text-gray-700 whitespace-pre-line min-h-[80px]">{domaine.strategy || <span className="text-gray-400">Aucune stratégie</span>}</div>
        </div>
      </div>

      {/* Programme Table & Modal */}
      {domaine?._id && <ProgrammeCrud domaineId={domaine._id} />}
    </div>
  );
};

export default DomaineDetail;
