import { useState, useEffect } from 'react';
import { Map, MapPin, Building, Globe, } from 'lucide-react';
import api from '../lib/api';
import ProvinceTab from '../components/Decoupage/ProvinceTab';
import DepartementTab from '../components/Decoupage/DepartementTab';
//import SousPrefectureTab from '../components/Decoupage/SousPrefectureTab';
//import CantonTab from '../components/Decoupage/CantonTab';
import CommuneTab from '../components/Decoupage/CommuneTab';
//import VillageTab from '../components/Decoupage/VillageTab';

const Decoupage = () => {
  const [activeTab, setActiveTab] = useState('provinces');
  const [counts, setCounts] = useState({
    provinces: 0,
    departements: 0,
    'sous-prefectures': 0,
    cantons: 0,
    communes: 0,
    villages: 0,
  });

  useEffect(() => {
    fetchAllCounts();
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Refresh counts when switching tabs to ensure they're up to date
    fetchAllCounts();
  };

  const fetchAllCounts = async () => {
    try {
      // Fetch counts for all administrative levels
      const [
        provincesResponse,
        departementsResponse,
        sousPrefecturesResponse,
        cantonsResponse,
        communesResponse,
        villagesResponse,
      ] = await Promise.all([
        api.get('/decoupage/provinces'),
        api.get('/decoupage/departements'),
        api.get('/decoupage/sous-prefectures'),
        api.get('/decoupage/cantons'),
        api.get('/decoupage/communes'),
        api.get('/decoupage/villages'),
      ]);

      setCounts({
        provinces: provincesResponse.data.length,
        departements: departementsResponse.data.length,
        'sous-prefectures': sousPrefecturesResponse.data.length,
        cantons: cantonsResponse.data.length,
        communes: communesResponse.data.length,
        villages: villagesResponse.data.length,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const tabs = [
    {
      id: 'provinces',
      label: 'Provinces',
      icon: Globe,
      count: counts.provinces,
    },
    {
      id: 'departements',
      label: 'Départements',
      icon: Building,
      count: counts.departements,
    },
    {
      id: 'communes',
      label: 'Communes',
      icon: MapPin,
      count: counts.communes,
    },
    // {
    //   id: 'sous-prefectures',
    //   label: 'Sous-préfectures',
    //   icon: Building,
    //   count: counts['sous-prefectures'],
    // },
    // {
    //   id: 'cantons',
    //   label: 'Cantons',
    //   icon: Home,
    //   count: counts.cantons,
    // },
    // {
    //   id: 'villages',
    //   label: 'Villages',
    //   icon: Map,
    //   count: counts.villages,
    // },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'provinces':
        return <ProvinceTab />;
      case 'departements':
        return <DepartementTab />;
      case 'communes':
        return <CommuneTab />;
      // case 'sous-prefectures':
      //   return <SousPrefectureTab />;
      // case 'cantons':
      //   return <CantonTab />;
      // case 'villages':
      //   return <VillageTab />;
      default:
        return <ProvinceTab />;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              🗺️ Découpage Territorial
            </h1>
            <p className="text-gray-600 text-lg">
              Gestion des divisions administratives du Tchad
            </p>
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Map className="h-8 w-8" />
            Tchad
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg shadow-lg">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Decoupage;
