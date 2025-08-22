import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'; // Using lucide-react for icons

// --- Type Definitions ---
interface UserProfile {
  firstName?: string;
  lastName?: string;
  contact?: string;
  address?: string;
  role?: 'supervisor' | 'IT' | 'executive' | 'agent' | 'Chef Logistique' | 'Chef de Departement' | 'user';
  team?: string;
}

interface User {
  _id: string;
  username: string;
  email?: string;
  isActive: boolean;
  grade: 'superadmin' | 'admin' | 'no-grade';
  profile: UserProfile;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  grade: 'superadmin' | 'admin' | 'no-grade';
  isActive: boolean;
  firstName: string;
  lastName: string;
  contact: string;
  address: string;
  role: 'supervisor' | 'IT' | 'executive' | 'agent' | 'Chef Logistique' | 'Chef de Departement' | 'user';
}

// --- Reusable UI Components (placeholders) ---
const Button = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) => (
  <button onClick={onClick} className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}>
    {children}
  </button>
);

const Table = ({ columns, data }: { columns: Array<{ Header: string; accessor: string; Cell?: (props: { row: { original: User } }) => React.ReactNode }>; data: User[] }) => (
  <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th key={col.accessor} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {col.Header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {col.Cell ? col.Cell({ row: { original: row } }) : getNestedValue(row, col.accessor)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Helper function to get nested values safely
const getNestedValue = (obj: User, path: string): string => {
  if (path === 'username') return obj.username;
  if (path === 'email') return obj.email || 'N/A';
  if (path === 'grade') return obj.grade;
  if (path === 'isActive') return obj.isActive ? 'Active' : 'Inactive';
  if (path === 'profile.role') return obj.profile?.role || 'N/A';
  return 'N/A';
};

// --- Main Page Component ---
export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users'); // GET /users to fetch all users
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Échec du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete._id}`); // DELETE /users/:userId
      toast.success('Utilisateur supprimé avec succès.');
      fetchUsers();
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Échec de la suppression de l\'utilisateur.');
    }
  };

  const columns = useMemo(() => [
    { Header: 'Nom d\'utilisateur', accessor: 'username' },
    { Header: 'Email', accessor: 'email', Cell: ({ row }: { row: { original: User } }) => row.original.email || 'N/A' },
    { Header: 'Rôle', accessor: 'profile.role', Cell: ({ row }: { row: { original: User } }) => row.original.profile?.role || 'N/A' },
    { Header: 'Grade', accessor: 'grade' },
    { Header: 'Statut', accessor: 'isActive', Cell: ({ row }: { row: { original: User } }) => (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {row.original.isActive ? 'Actif' : 'Inactif'}
      </span>
    )},
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }: { row: { original: User } }) => (
      <div className="flex items-center space-x-4">
        <button onClick={() => { setSelectedUser(row.original); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">
          <Edit className="h-5 w-5" />
        </button>
        <button onClick={() => { setUserToDelete(row.original); setIsDeleteConfirmOpen(true); }} className="text-red-600 hover:text-red-900">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    )},
  ], []);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Utilisateurs</h2>
        <Button onClick={() => { setIsModalOpen(true); setSelectedUser(null); }}>
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un Utilisateur
        </Button>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <Table columns={columns} data={users} />
      )}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onSuccess={() => {
          fetchUsers();
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />
      {isDeleteConfirmOpen && userToDelete && (
        <DeleteConfirmationModal
          userName={userToDelete.username}
          onConfirm={handleUserDelete}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};

// --- Modal for Add/Edit User ---
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const UserModal = ({ isOpen, onClose, user, onSuccess }: UserModalProps) => {
  const isEditMode = Boolean(user);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    grade: 'no-grade',
    isActive: true,
    firstName: '',
    lastName: '',
    contact: '',
    address: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const initialData: FormData = {
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      grade: user?.grade || 'no-grade',
      isActive: user?.isActive ?? true,
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      contact: user?.profile?.contact || '',
      address: user?.profile?.address || '',
      role: user?.profile?.role || 'user',
    };
    setFormData(initialData);
    setShowPassword(false); // Reset password visibility on open
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { password, firstName, lastName, contact, address, role, ...restData } = formData;
    
    interface UpdatePayload {
      username?: string;
      email?: string;
      password?: string;
      grade: string;
      isActive: boolean;
      profile: {
        firstName: string;
        lastName: string;
        contact: string;
        address: string;
        role: string;
      };
    }
    
    let payload: UpdatePayload;
    
    if (isEditMode && user) {
      // For updates, only send changed fields and profile data
      payload = {
        // Only include username and email if they're different from current user
        ...(restData.username !== user.username && { username: restData.username }),
        ...(restData.email !== user.email && { email: restData.email }),
        ...(password && password.trim() !== '' && { password }),
        grade: restData.grade,
        isActive: restData.isActive,
        profile: {
          firstName,
          lastName,
          contact,
          address,
          role,
        },
      };
    } else {
      // For creation, send all required fields
      payload = {
        username: restData.username,
        email: restData.email,
        password,
        grade: restData.grade,
        isActive: restData.isActive,
        profile: {
          firstName,
          lastName,
          contact,
          address,
          role,
        },
      };
    }

    try {
      if (isEditMode && user) {
        await api.put(`/users/${user._id}`, payload);
        toast.success('Utilisateur mis à jour avec succès!');
      } else {
        await api.post('/users/admin/create-user', payload);
        toast.success('Utilisateur créé avec succès!');
      }
      onSuccess();
    } catch (err: unknown) {
      console.error('User operation error:', err);
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Une erreur s\'est produite.';
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isEditMode ? 'Modifier l\'Utilisateur' : 'Ajouter un Nouvel Utilisateur'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>  
                  
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {isEditMode ? 'Nouveau Mot de Passe (Optionnel)' : 'Mot de Passe'}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? 'Laisser vide pour conserver le mot de passe actuel' : ''}
                required={!isEditMode}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="no-grade">Aucun Grade</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="user">Utilisateur</option>
              <option value="agent">Agent</option>
              <option value="supervisor">Superviseur</option>
              <option value="IT">IT</option>
              <option value="executive">Exécutif</option>
              <option value="Chef Logistique">Chef Logistique</option>
              <option value="Chef de Departement">Chef de Département</option>
            </select>
          </div>

          <div className="flex items-center pt-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              L'utilisateur est actif
            </label>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Delete Confirmation Modal ---
interface DeleteConfirmationModalProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal = ({ userName, onConfirm, onCancel }: DeleteConfirmationModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold text-gray-900">Confirmer la Suppression</h2>
      <p className="mt-2 text-sm text-gray-600">
        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userName}</strong>? Cette action ne peut pas être annulée.
      </p>
      <div className="flex justify-end mt-6 space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
);