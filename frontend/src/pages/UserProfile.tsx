import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Edit, X, Save, Upload, CheckCircle, XCircle, Clock, Package, MessageSquare, User, Send, Inbox, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Institution {
  _id: string;
  name: string;
}

// Define tab types
type ProfileTab = 'requests' | 'activity' | 'messages';

type UserProfileType = {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
};
type UserType = {
  _id: string;
  email: string;
  profile?: UserProfileType;
};


export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('requests');
  const [isEditing, setIsEditing] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    contact: user?.profile?.contact || '',
    address: user?.profile?.address || '',
    profilePicture: user?.profile?.profilePicture || '',
    institution: user?.profile?.institution || '',
  });
  
  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

 
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setIsUploading(true);
    setError('');
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file); // Changed from 'image' to 'file'
    
    const uploadResponse = await api.post('/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    setFormData(prev => ({
      ...prev,
      profilePicture: uploadResponse.data.url, // Changed from imageUrl to url
    }));
    toast.success('Image téléchargée avec succès');
    } catch (error) {
        console.error('Error uploading image:', error);
        setError('Échec du téléchargement de l\'image. Seuls les fichiers JPG, PNG, GIF de moins de 10MB sont autorisés.');
        toast.error('Échec du téléchargement de l\'image. Seuls les fichiers JPG, PNG, GIF de moins de 10MB sont autorisés.');
    } finally {
        setIsUploading(false);
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?._id) {
        setError('User session expired');
        return;
      }

      await api.put(`/users/${user._id}/profile`, {
        profile: formData
      });
      
      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...formData
        }
      });
      setIsEditing(false);
      setError('');
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Échec de la mise à jour du profil');
      toast.error('Échec de la mise à jour du profil');
    }
  };


  return (
    <div className="max-w-8xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Edit size={18} />
          Modifier le Profil
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          {user.profile?.profilePicture ? (
            <img 
              src={`http://localhost:5001${user.profile.profilePicture}`} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xl">
                {user.profile?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {user.profile?.firstName} {user.profile?.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
              {user.profile?.role || 'user'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Informations de Contact</h3>
            <p className="text-gray-600">{user.profile?.contact || 'Non renseigné'}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Adresse</h3>
            <p className="text-gray-600">{user.profile?.address || 'Non renseigné'}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Équipe</h3>
            <p className="text-gray-600">
              {institutions.find(t => t._id === user.profile?.institution)?.name || 'Non assigné'}
            </p>
          </div>
        </div>

        {user.isAdmin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">Accès Administrateur</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`${activeTab === 'requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Package size={16} />
            Mes Demandes
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            {/* You can use a different icon if you prefer */}
            <Clock size={16} />
            Activité
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`${activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <MessageSquare size={16} />
            Messages
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}


    
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold">Modifier le Profil</h2>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4" id="profile-form">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipe
                  </label>
                  <select
                    name="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      institution: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionner une institution</option>
                    {institutions.map((institution) => (
                      <option key={institution._id} value={institution._id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo de Profil
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    {formData.profilePicture ? (
                      <img 
                        src={formData.profilePicture} 
                        alt="Aperçu" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Aucune image</span>
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                      <Upload size={16} />
                      {isUploading ? 'Téléchargement...' : 'Télécharger Image'}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleInputChange}
                    placeholder="Ou entrer l'URL de l'image"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Form buttons moved inside form */}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save size={18} />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
}


