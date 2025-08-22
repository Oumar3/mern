import React, { useState } from 'react';
import { Activity } from './ActivityTab';
import activityService from '../../services/activityService';
import { User } from '../../types/database';

interface ActivityDetailViewProps {
  activity: Activity;
  onBack: () => void;
}

const ActivityDetailView: React.FC<ActivityDetailViewProps> = ({ activity, onBack }) => {
  // Helper functions for color classes
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'planifié': return 'bg-blue-100 text-blue-800';
      case 'en cours': return 'bg-yellow-100 text-yellow-800';
      case 'terminé': return 'bg-green-100 text-green-800';
      case 'annulé': return 'bg-red-100 text-red-800';
      case 'reporté': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'élevée': return 'bg-orange-100 text-orange-800';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'faible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatLocation = (location: Activity['location']) => {
    if (!location) return 'Lieu non spécifié';
    if (typeof location === 'string') return location;
    if (location.type === 'INSEED') {
      if (location.meetingRoom) {
        if (typeof location.meetingRoom === 'object' && location.meetingRoom.name) {
          return `INSEED - ${location.meetingRoom.name}`;
        }
        return `INSEED - Salle de réunion`;
      }
      return 'INSEED';
    } else if (location.type === "Dehors de l'INSEED") {
      return location.customLocation || 'Lieu extérieur';
    }
    return 'Lieu non spécifié';
  };
  // Participants
  const participantCount = Array.isArray(activity.participants) ? activity.participants.length : 0;

  // Get current user from localStorage or context (simple fallback)
  const currentUser: User | null = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localActivity, setLocalActivity] = useState<Activity>(activity);

  // Find current user's participant object
  let myParticipant = Array.isArray(localActivity.participants)
    ? localActivity.participants.find(p => {
        if (!currentUser) return false;
        if (typeof p.user === 'string') return p.user === currentUser._id;
        return p.user._id === currentUser._id;
      })
    : undefined;
  const isOrganizer = currentUser && ((typeof localActivity.organizer === 'string' && localActivity.organizer === currentUser._id) || (typeof localActivity.organizer === 'object' && localActivity.organizer._id === currentUser._id));

  // Check if user's department matches any activity department
  let userDepartmentId = '';
  if (currentUser && currentUser.profile && currentUser.profile.team) {
    if (typeof currentUser.profile.team === 'string') {
      userDepartmentId = currentUser.profile.team;
    } else if (typeof currentUser.profile.team === 'object' && currentUser.profile.team._id) {
      userDepartmentId = currentUser.profile.team._id;
    }
  }
  const activityDepartmentIds = Array.isArray(localActivity.departments)
    ? localActivity.departments.map(dep => typeof dep === 'string' ? dep : dep._id)
    : [];
  const departmentMatch = userDepartmentId && activityDepartmentIds.includes(userDepartmentId);

  // If not a participant but department matches, create a virtual participant object
  if (!myParticipant && departmentMatch) {
    myParticipant = { user: currentUser._id, status: 'invité' };
  }

  // Handler for status change
  const handleStatusChange = async (status: 'accepté' | 'refusé' | 'peut-être' | 'invité') => {
    if (!localActivity._id) return;
    setStatusLoading(status);
    setError(null);
    try {
      let resp;
      if (status === 'accepté') resp = await activityService.acceptActivity(localActivity._id);
      else if (status === 'refusé') resp = await activityService.refuseActivity(localActivity._id);
      else if (status === 'peut-être') resp = await activityService.maybeActivity(localActivity._id);
      else if (status === 'invité') resp = await activityService.inviteActivity(localActivity._id);
      if (resp && resp.activity) setLocalActivity(resp.activity);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de statut');
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <span className="mr-2">&larr;</span>
            Retour aux activités
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {activity.title || activity.name}
              </h1>
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(activity.priority)}`}>
                  {activity.priority}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {activity.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {localActivity.description || localActivity.details || ''}
            </p>
          </div>

          {/* Participant status action switcher (now also for department match) */}
          {currentUser && myParticipant && !isOrganizer && (
            <div className="flex flex-col gap-2 mb-2">
              <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-200">
                {[
                  { label: 'Accepter', value: 'accepté', color: 'green' },
                  { label: 'Peut-être', value: 'peut-être', color: 'yellow' },
                  { label: 'Refuser', value: 'refusé', color: 'red' },
                  { label: 'Inviter', value: 'invité', color: 'gray' }
                ].map(({ label, value, color }) => (
                  <button
                    key={value}
                    className={`px-4 py-1 text-sm font-medium focus:outline-none transition-colors
                      ${myParticipant.status === value
                        ? `bg-${color}-100 text-${color}-800`
                        : 'bg-white text-gray-700 hover:bg-gray-50'}
                      ${statusLoading === value ? 'opacity-50' : ''}
                      ${value !== 'accepté' ? 'border-l border-gray-200' : ''}
                    `}
                    style={{ minWidth: 90 }}
                    disabled={statusLoading !== null || myParticipant.status === value}
                    onClick={async () => {
                      setStatusLoading(value);
                      setError(null);
                      try {
                        let resp;
                        if (value === 'accepté') resp = await activityService.acceptActivity(localActivity._id);
                        else if (value === 'refusé') resp = await activityService.refuseActivity(localActivity._id);
                        else if (value === 'peut-être') resp = await activityService.maybeActivity(localActivity._id);
                        else if (value === 'invité') resp = await activityService.inviteActivity(localActivity._id);
                        if (resp && resp.activity) setLocalActivity(resp.activity);
                      } catch (err: any) {
                        setError(err.message || 'Erreur lors du changement de statut');
                      } finally {
                        setStatusLoading(null);
                      }
                    }}
                  >
                    {statusLoading === value ? '...' : label}
                  </button>
                ))}
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {activity.notes}
              </p>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Participants</h2>
            <div className="flex items-center text-gray-600 mb-4">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeWidth="1.5" stroke="currentColor" fill="none"/><circle cx="9" cy="7" r="4" strokeWidth="1.5" stroke="currentColor"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="1.5" stroke="currentColor" fill="none"/><circle cx="17" cy="7" r="4" strokeWidth="1.5" stroke="currentColor"/></svg>
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </div>
            {participantCount > 0 ? (
              <div className="space-y-3">
                {activity.participants.map((participant: NonNullable<typeof activity.participants>[number], index: number) => {
                  let name = '';
                  let username = '';
                  let email = '';
                  let department = '';
                  let contact = '';
                  if (participant.user && typeof participant.user === 'object') {
                    const user = participant.user;
                    if ('profile' in user && user.profile) {
                      const { firstName, lastName, contact: c, team } = user.profile;
                      name = `${firstName || ''} ${lastName || ''}`.trim();
                      contact = c || '';
                      if (team) {
                        if (typeof team === 'string') {
                          department = team;
                        } else if ('name' in team && team.name) {
                          department = team.name;
                        }
                      }
                    }
                    if ('username' in user && user.username) username = user.username;
                    if ('email' in user && user.email) email = user.email;
                  }
                  return (
                    <div key={index} className="flex flex-col md:flex-row md:justify-between md:items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-gray-900">{name || username || email || (typeof participant.user === 'string' ? participant.user : 'Inconnu')}</span>
                        {email && <span className="block text-gray-500 text-xs">{email}</span>}
                        {department && <span className="block text-gray-500 text-xs">Département : {department}</span>}
                        {contact && <span className="block text-gray-500 text-xs">Contact : {contact}</span>}
                      </div>
                      <span className={`px-2 py-1 rounded text-sm mt-2 md:mt-0 ${
                        participant.status === 'accepté' ? 'bg-green-100 text-green-800' :
                        participant.status === 'refusé' ? 'bg-red-100 text-red-800' :
                        participant.status === 'peut-être' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Aucun participant pour le moment</p>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(activity.tags) && activity.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Planning</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.5" stroke="currentColor" fill="none"/><path d="M16 3v4M8 3v4M3 9h18" strokeWidth="1.5" stroke="currentColor"/></svg>
                <div>
                  <p className="font-medium text-gray-900">Début</p>
                  <p className="text-gray-600">{formatDate(activity.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.5" stroke="currentColor" fill="none"/><path d="M16 3v4M8 3v4M3 9h18" strokeWidth="1.5" stroke="currentColor"/></svg>
                <div>
                  <p className="font-medium text-gray-900">Fin</p>
                  <p className="text-gray-600">{formatDate(activity.endDate)}</p>
                </div>
              </div>
              {activity.isRecurring && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth="1.5" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="10" strokeWidth="1.5" stroke="currentColor"/></svg>
                  <span className="text-blue-600 font-medium">Activité récurrente</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {activity.location && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lieu</h2>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 21s-6-5.686-6-10A6 6 0 1 1 18 11c0 4.314-6 10-6 10Z" strokeWidth="1.5" stroke="currentColor" fill="none"/><circle cx="12" cy="11" r="2.5" strokeWidth="1.5" stroke="currentColor"/></svg>
                <div>
                  <p className="text-gray-700">{formatLocation(activity.location)}</p>
                  {activity.location.type && (
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {activity.location.type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reminder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rappel</h2>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth="1.5" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="10" strokeWidth="1.5" stroke="currentColor"/></svg>
              <div>
                <p className="text-gray-700">
                  {activity.reminderTime} minutes avant l'activité
                </p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Organisateur</h2>
            {(() => {
              const organizer = (activity.createdBy || activity.organizer);
              if (!organizer) return <p className="text-gray-700">Inconnu</p>;
              if (typeof organizer === 'string') return <p className="text-gray-700">{organizer}</p>;
              // Extract all possible info
              let name = '';
              let username = '';
              let email = '';
              let department = '';
              let contact = '';
              if ('profile' in organizer && organizer.profile) {
                const { firstName, lastName, contact: c, team } = organizer.profile;
                name = `${firstName || ''} ${lastName || ''}`.trim();
                contact = c || '';
                // Department/team
                if (team) {
                  if (typeof team === 'string') {
                    department = team;
                  } else if ('name' in team && team.name) {
                    department = team.name;
                  }
                }
              }
              if ('username' in organizer && organizer.username) username = organizer.username;
              if ('email' in organizer && organizer.email) email = organizer.email;
              return (
                <div className="space-y-1">
                  <p className="text-gray-700 font-medium">{name || username || 'Inconnu'}</p>
                  {email && <p className="text-gray-500 text-sm">{email}</p>}
                  {department && <p className="text-gray-500 text-sm">Département : {department}</p>}
                  {contact && <p className="text-gray-500 text-sm">Contact : {contact}</p>}
                </div>
              );
            })()}
          </div>

          {/* Activity Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priorité :</span>
                <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(activity.priority)}`}>
                  {activity.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active :</span>
                <span className={`px-2 py-1 rounded text-sm ${activity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {activity.isActive ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailView;
