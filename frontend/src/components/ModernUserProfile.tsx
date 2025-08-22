import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  LogOut, 
  ChevronDown, 
  UserCircle,
  Shield,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const ModernUserProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  const getUserDisplayName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user?.profile?.firstName) {
      return user.profile.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getUserRole = () => {
    if (user?.isAdmin) return t('user.admin');
    if (user?.profile?.role) {
      const roleTranslations: Record<string, string> = {
        supervisor: t('user.supervisor'),
        IT: t('user.it'),
        executive: t('user.executive'),
        agent: t('user.agent'),
        user: t('user.user'),
        'Chef Logistique': t('user.logisticsChief'),
        'Chef de Departement': t('user.departmentHead')
      };
      return roleTranslations[user.profile.role] || user.profile.role;
    }
    return t('user.user');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: t('navigation.viewProfile'),
      action: () => navigate('/dashboard/profile'),
      description: t('user.manageAccount')
    },
    {
      icon: Settings,
      label: t('navigation.settings'),
      action: () => navigate('/dashboard/settings'),
      description: t('user.preferences')
    },
    {
      icon: LogOut,
      label: t('navigation.disconnect'),
      action: handleLogout,
      description: t('user.signOut'),
      danger: true
    }
  ];

  return (
    <div className="relative">
      {/* User Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center space-x-3 px-3 py-2 rounded-lg
          bg-white border border-gray-200 shadow-sm
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200
          ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}
        `}
      >
        {/* Avatar */}
        <div className="relative">
          {user?.profile?.profilePicture ? (
            <img
              src={user.profile.profilePicture}
              alt={getUserDisplayName()}
              className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
              {getUserInitials()}
            </div>
          )}
          
          {/* Online Status */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info - Hidden on mobile */}
        <div className={`hidden sm:block ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="text-sm font-medium text-gray-900 leading-tight">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            {getUserRole()}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={`
            absolute z-20 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200
            transform transition-all duration-200 origin-top
            ${isRTL ? 'left-0' : 'right-0'}
          `}>
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-100">
              <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {user?.profile?.profilePicture ? (
                  <img
                    src={user.profile.profilePicture}
                    alt={getUserDisplayName()}
                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold border-2 border-gray-200">
                    {getUserInitials()}
                  </div>
                )}
                
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-base font-semibold text-gray-900">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>{getUserRole()}</span>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-2 space-y-1">
                    {user?.email && (
                      <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user?.profile?.contact && (
                      <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Phone className="h-3 w-3" />
                        <span>{user.profile.contact}</span>
                      </div>
                    )}
                    {user?.profile?.address && (
                      <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{user.profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                    text-left transition-all duration-150
                    ${item.danger
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isRTL ? 'flex-row-reverse space-x-reverse text-right' : ''}
                  `}
                >
                  <item.icon className={`h-5 w-5 ${item.danger ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernUserProfile;
