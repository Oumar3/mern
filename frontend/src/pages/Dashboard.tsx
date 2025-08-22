import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import logo from '../assets/images/Tchad-connexion-2030.png';
import PNDChart from '../components/PNDChart';
import ModernLanguageSwitcher from '../components/ModernLanguageSwitcher';
import ModernUserProfile from '../components/ModernUserProfile';
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  Bell,
  FolderTree,
  Package,
  Building2,
  LucideIcon,
  Target,
  TrendingUp,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Globe,
  BarChart3,
} from 'lucide-react';
import UserProfile from './UserProfile';
import Institutions from './Institutions';
import InstitutionDetail from './InstitutionDetail';


import { UserManagement } from './Users/Users';
import Organisations from './Organisations';
import Domaines from './Domaines';
import ModernAxes from './ModernAxes';
import DomaineDetail from './DomaineDetail';
import ProgrammeDetail from './ProgrammeDetail';

import SourceCrud from './SourceCrud';
import DataProducerCrud from './DataProducerCrud';
import EnhancedIndicatorCrud from '../components/EnhancedIndicatorCrud';
import IndicatorFollowupCrud from '../components/IndicatorFollowupCrud';
import IndicatorMasterDetailCrud from '../components/IndicatorMasterDetailCrud';
import MetaDataCrud from '../components/MetaDataCrud';
import MetaDataDetail from './MetaDataDetail';
import IndicateurDetail from './IndicateurDetail';
import IndicatorDetail from './IndicatorDetail';
import ProjectDetail from './ProjectDetail';
import Programmes from './Programmes';
import Projects from './Projects';
import Indicateurs from './Indicateurs';
import Decoupage from './Decoupage';
import UniteDeMesureCrud from '../components/UniteDeMesureCrud';

interface DashboardCounts {
  totalDomaines: number
  totalProgrammes: number
  totalProjects: number
  totalIndicateurs: number
  totalOrganisations: number
  totalSources: number
  averageProgress: number
  budgetUtilization: number
  onTrackProjects: number
  delayedProjects: number
}

interface ProjectStatus {
  status?: string
  budget?: number
}

function Overview() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState<DashboardCounts>({
    totalDomaines: 0,
    totalProgrammes: 0,
    totalProjects: 0,
    totalIndicateurs: 0,
    totalOrganisations: 0,
    totalSources: 0,
    averageProgress: 0,
    budgetUtilization: 0,
    onTrackProjects: 0,
    delayedProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [
          domainesResponse,
          programmesResponse,
          projectsResponse,
          indicateursResponse,
          organisationsResponse,
          sourcesResponse,
        ] = await Promise.all([
          api.get('/domaines'),
          api.get('/programmes'),
          api.get('/projects'),
          api.get('/indicateurs'),
          api.get('/organisations'),
          api.get('/sources'),
        ])

        // Calculate progress metrics
        const totalProjects = projectsResponse.data.length || 0;
        const onTrack = projectsResponse.data.filter((p: ProjectStatus) => p.status === 'En cours').length || 0;
        const delayed = projectsResponse.data.filter((p: ProjectStatus) => p.status === 'En pause' || p.status === 'Suspendus').length || 0;
        
        // Calculate average progress (mock calculation)
        const avgProgress = totalProjects > 0 ? Math.round((onTrack / totalProjects) * 100) : 0;
        
        // Calculate budget utilization (mock calculation)
        const totalBudget = projectsResponse.data.reduce((sum: number, p: ProjectStatus) => sum + (p.budget || 0), 0);
        const budgetUtil = totalBudget > 0 ? Math.round(Math.random() * 30 + 60) : 0; // Mock 60-90%

        setCounts({
          totalDomaines: domainesResponse.data.length || 0,
          totalProgrammes: programmesResponse.data.length || 0,
          totalProjects: totalProjects,
          totalIndicateurs: indicateursResponse.data.length || 0,
          totalOrganisations: organisationsResponse.data.length || 0,
          totalSources: sourcesResponse.data.length || 0,
          averageProgress: avgProgress,
          budgetUtilization: budgetUtil,
          onTrackProjects: onTrack,
          delayedProjects: delayed,
        })
      } catch (error) {
        console.error(t('messages.errorFetchingData'), error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [t])

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Progress indicator component
  const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }: { progress: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-600 transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{progress}%</span>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue", href }: {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: number;
    color?: string;
    href?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
      purple: "from-purple-500 to-purple-600",
      indigo: "from-indigo-500 to-indigo-600"
    };

    const CardContent = (
      <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:shadow-xl cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
        </div>
        {href && (
          <div className="mt-3 text-xs text-blue-600 font-medium opacity-75">
            {t('common.clickToSeeAll')}
          </div>
        )}
      </div>
    );

    return href ? (
      <Link to={href}>
        {CardContent}
      </Link>
    ) : (
      CardContent
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 text-lg">{t('dashboard.subtitle')}</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title={t('dashboard.strategicDomains')} value={counts.totalDomaines} icon={Globe} color="blue" trend={5} href="/dashboard/domaines" />
        <MetricCard title={t('dashboard.activePrograms')} value={counts.totalProgrammes} icon={FolderTree} color="green" trend={8} href="/dashboard/programmes" />
        <MetricCard title={t('dashboard.ongoingProjects')} value={counts.totalProjects} icon={Activity} color="purple" trend={-2} href="/dashboard/projects" />
        <MetricCard title={t('dashboard.trackedIndicators')} value={counts.totalIndicateurs} icon={Target} color="indigo" trend={12} href="/dashboard/indicateurs" />
      </div>

      {/* Quick Access Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.quickAccess')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/dashboard/programmes" className="group">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                  <FolderTree className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600">{counts.totalProgrammes}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('quickAccess.allPrograms')}</h3>
              <p className="text-gray-600 mb-4">{t('quickAccess.allProgramsDesc')}</p>
              <div className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                {t('quickAccess.explorePrograms')}
              </div>
            </div>
          </Link>

          <Link to="/dashboard/projects" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600">{counts.totalProjects}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('quickAccess.allProjects')}</h3>
              <p className="text-gray-600 mb-4">{t('quickAccess.allProjectsDesc')}</p>
              <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                {t('quickAccess.exploreProjects')}
              </div>
            </div>
          </Link>

          <Link to="/dashboard/indicateurs" className="group">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-indigo-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-indigo-600">{counts.totalIndicateurs}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('quickAccess.allIndicators')}</h3>
              <p className="text-gray-600 mb-4">{t('quickAccess.allIndicatorsDesc')}</p>
              <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                {t('quickAccess.exploreIndicators')}
              </div>
            </div>
          </Link>

          <Link to="/dashboard/indicator-management" className="group">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">{t('quickAccess.new')}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('quickAccess.indicatorManagement')}</h3>
              <p className="text-gray-600 mb-4">{t('quickAccess.indicatorManagementDesc')}</p>
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                {t('quickAccess.manageIndicators')}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Progress & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* National Progress Ring */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="mr-2 text-yellow-500" />
            {t('dashboard.nationalProgress')}
          </h3>
          <div className="flex justify-center mb-4">
            <ProgressRing progress={counts.averageProgress} />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('dashboard.developmentGoals')}</p>
            <p className="text-lg font-semibold text-gray-900">{t('dashboard.vision2030')}</p>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2 text-green-500" />
            {t('dashboard.budgetExecution')}
          </h3>
          <div className="flex justify-center mb-4">
            <ProgressRing progress={counts.budgetUtilization} />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('dashboard.allocatedBudget')}</p>
            <p className="text-lg font-semibold text-green-600">852.4 Milliards FCFA</p>
          </div>
        </div>

        {/* Project Status */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-blue-500" />
            {t('dashboard.projectStatus')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">{t('dashboard.inProgress')}</span>
              </div>
              <span className="font-bold text-green-600">{counts.onTrackProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">{t('dashboard.delayed')}</span>
              </div>
              <span className="font-bold text-yellow-600">{counts.delayedProjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">{t('dashboard.total')}</span>
              </div>
              <span className="font-bold text-blue-600">{counts.totalProjects}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.systemResources')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Building2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{counts.totalOrganisations}</p>
              <p className="text-sm text-gray-600">{t('dashboard.organizations')}</p>
            </div>
            <div className="text-center">
              <Package className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{counts.totalSources}</p>
              <p className="text-sm text-gray-600">{t('dashboard.dataSources')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.alertsNotifications')}</h3>
          <div className="space-y-3">
            {counts.delayedProjects > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{t('dashboard.delayedProjects')}</p>
                  <p className="text-xs text-yellow-600">{counts.delayedProjects} {t('dashboard.projectsNeedAttention')}</p>
                </div>
              </div>
            )}
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">{t('dashboard.operationalSystem')}</p>
                <p className="text-xs text-green-600">{t('dashboard.allDataUpToDate')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.dataOverview')}</h3>
        <PNDChart 
          labels={[t('navigation.domains'), t('navigation.programmes'), t('navigation.projects'), t('navigation.indicators'), t('dashboard.organizations'), t('navigation.sources')]} 
          data={[
            counts.totalDomaines,
            counts.totalProgrammes,
            counts.totalProjects,
            counts.totalIndicateurs,
            counts.totalOrganisations,
            counts.totalSources,
          ]} 
          title={t('dashboard.statistics')} 
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isRTL = i18n.language === 'ar'

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [isRTL, i18n.language])

  const navigation = [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { name: t('navigation.institutions'), icon: Building2, href: '/dashboard/institutions' },
    { name: t('navigation.sources'), icon: Package, href: '/dashboard/sources' },
    { name: t('navigation.dataProducers'), icon: Building2, href: '/dashboard/data-producers' },
    //{ name: t('navigation.domains'), icon: FolderTree, href: '/dashboard/domaines' },
    { name: t('navigation.strategicAxes'), icon: BarChart3, href: '/dashboard/modern-axes' },
    { name: t('navigation.allPrograms'), icon: Package, href: '/dashboard/programmes' },
    { name: t('navigation.allProjects'), icon: Activity, href: '/dashboard/projects' },
    { name: t('navigation.allIndicators'), icon: Target, href: '/dashboard/indicateurs' },
    { name: t('navigation.territorialDivision'), icon: Globe, href: '/dashboard/decoupage' },
    { name: t('navigation.unitsOfMeasure'), icon: Award, href: '/dashboard/unites-de-mesure' },
    //{ name: t('navigation.indicatorManagement'), icon: Target, href: '/dashboard/indicator-management' },
    //{ name: t('navigation.indicatorCrud'), icon: Target, href: '/dashboard/indicator-crud' },
    //{ name: t('navigation.followupCrud'), icon: TrendingUp, href: '/dashboard/indicator-followup-crud' },
    { name: t('navigation.metadataManagement'), icon: Award, href: '/dashboard/meta-data' },
    // System
    { name: t('navigation.userManagement'), icon: Users, href: '/dashboard/userManagement' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
          } ${isRTL ? 'mr-0 ml-auto' : ''}`}
        >
          <div className={`absolute top-0 ${isRTL ? 'left-0 -ml-12' : 'right-0 -mr-12'} pt-2`}>
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className={`flex-shrink-0 flex items-center px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 gap-2 text-base font-medium rounded-md transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#003366] font-bold shadow ring-2 ring-[#003366]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#003366]'
                    } ${isRTL ? 'text-right' : ''}`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
                        isActive ? 'text-[#003366]' : 'text-gray-400 group-hover:text-[#003366]'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className={`flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-white space-y-1">
                {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 gap-2 text-sm font-medium rounded-md transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#003366] font-bold shadow ring-2 ring-[#003366]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#003366]'
                    } ${isRTL ? 'text-right' : ''}`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
                        isActive ? 'text-[#003366]' : 'text-gray-400 group-hover:text-[#003366]'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className={`relative z-10 flex-shrink-0 flex h-16 bg-white shadow`}>
          <button
            type="button"
            className={`px-4 border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden ${
              isRTL ? 'border-l order-last' : 'border-r order-first'
            }`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              {/* Search bar or other header content could go here */}
            </div>
            
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              {/* Modern Language Switcher */}
              <ModernLanguageSwitcher />
              
              {/* Notifications */}
              <button className={`
                bg-white p-2 rounded-lg text-gray-400 hover:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                border border-gray-200 hover:border-gray-300 hover:shadow-md
                transition-all duration-200
              `}>
                <Bell className="h-5 w-5" />
              </button>

              {/* Modern User Profile */}
              <ModernUserProfile />
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/institutions/:id" element={<InstitutionDetail />} />
            <Route path="/sources" element={<SourceCrud />} />
            <Route path="/data-producers" element={<DataProducerCrud />} />
            <Route path="/domaines" element={<Domaines />} />
            <Route path="/modern-axes" element={<ModernAxes />} />
            <Route path="/programmes" element={<Programmes />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/indicateurs" element={<Indicateurs />} />
            <Route path="/decoupage" element={<Decoupage />} />
            <Route path="/domaines/:id" element={<DomaineDetail />} />
            <Route path="/domaines/:domaineId/programmes/:id" element={<ProgrammeDetail />} />
            <Route path='/domaines/:domaineId/programmes/:programmeId/indicateurs/:id' element={<IndicateurDetail />} />
            <Route path='/domaines/:domaineId/programmes/:programmeId/indicators/:id' element={<IndicatorDetail />} />
            <Route path='/userManagement' element={<UserManagement />} />
            <Route path="/programmes/:programmeId/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/indicator-management" element={<IndicatorMasterDetailCrud />} />
            <Route path="/indicator-crud" element={<EnhancedIndicatorCrud />} />
            <Route path="/indicator-followup-crud" element={<IndicatorFollowupCrud />} />
            <Route path="/unites-de-mesure" element={<UniteDeMesureCrud />} />
            <Route path="/meta-data" element={<MetaDataCrud />} />
            <Route path="/meta-data/:id" element={<MetaDataDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
