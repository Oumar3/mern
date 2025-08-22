import React from 'react';
import { Edit, Plus, Trash2, Package } from 'lucide-react';
import { Demande, Item } from '../../types/database';

interface RequestsTabProps {
  userDemandes: Demande[];
  items: Item[];
  getStatusIcon: (status: string) => any;
  getStatusColor: (status: string) => string;
  setSelectedDemande: (demande: Demande | null) => void;
  setIsDemandeModalOpen: (open: boolean) => void;
  handleDeleteDemande: (demandeId: string) => void;
}

const RequestsTab: React.FC<RequestsTabProps> = ({
  userDemandes,
  items,
  getStatusIcon,
  getStatusColor,
  setSelectedDemande,
  setIsDemandeModalOpen,
  handleDeleteDemande,
}) => (
  <div className="bg-white shadow rounded-lg p-6 mt-6">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-semibold">Mes Demandes</h3>
        {userDemandes.length > 0 && (
          <div className="flex space-x-4 mt-2 text-sm text-gray-600">
            <span>Total: {userDemandes.length}</span>
            <span>En cours: {userDemandes.filter(d => d.status === 'En cours').length}</span>
            <span>Approuvées: {userDemandes.filter(d => d.status === 'Approuvée').length}</span>
            <span>Servies: {userDemandes.filter(d => d.status === 'Servie').length}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setSelectedDemande(null);
          setIsDemandeModalOpen(true);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Plus size={18} />
        Nouvelle Demande
      </button>
    </div>
    {userDemandes.length === 0 ? (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
        <p className="text-gray-500 mb-4">Créez votre première demande pour commencer !</p>
        <button
          onClick={() => {
            setSelectedDemande(null);
            setIsDemandeModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Créer la Première Demande
        </button>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantités</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userDemandes.map((demande) => {
              const StatusIcon = getStatusIcon(demande.status);
              return (
                <tr key={demande._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          {typeof demande.item === 'object' && demande.item ? demande.item.name : 'Unknown Item'}
                        </div>
                        {typeof demande.item === 'object' && demande.item && (
                          <div className="text-xs text-gray-500">
                            Disponible: {demande.item.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(demande.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {demande.status}
                      </span>
                      {demande.status === 'Servie' && demande.servedQty > 0 && (
                        <div className="flex items-center text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          Terminé
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Demandé:</span>
                        <span className="font-medium">{demande.requestQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approuvé:</span>
                        <span className={`font-medium ${demande.approvedQty > 0 ? 'text-green-600' : 'text-gray-400'}`}>{demande.approvedQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servi:</span>
                        <span className={`font-medium ${demande.servedQty > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{demande.servedQty}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(demande.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">
                      {demande.comment ? (
                        <div className="group relative">
                          <div className="truncate" title={demande.comment}>{demande.comment}</div>
                          {demande.comment.length > 30 && (
                            <div className="invisible group-hover:visible absolute bottom-6 left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-normal w-48">{demande.comment}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Aucun commentaire</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {demande.status === 'En cours' && (
                        <button
                          onClick={() => {
                            setSelectedDemande(demande);
                            setIsDemandeModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDemande(demande._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default RequestsTab;
