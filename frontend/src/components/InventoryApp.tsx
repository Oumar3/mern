import React from 'react'
import { Dashboard, Departements, Items, Demandes, Deliveries } from '../pages/inventory'

// Example usage of the inventory components
export default function InventoryApp() {
  const [currentView, setCurrentView] = React.useState<'dashboard' | 'departements' | 'items' | 'demandes' | 'deliveries'>('dashboard')

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'departements':
        return <Departements />
      case 'items':
        return <Items />
      case 'demandes':
        return <Demandes />
      case 'deliveries':
        return <Deliveries />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('departements')}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    currentView === 'departements'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setCurrentView('items')}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    currentView === 'items'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Items
                </button>
                <button
                  onClick={() => setCurrentView('demandes')}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    currentView === 'demandes'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setCurrentView('deliveries')}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    currentView === 'deliveries'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Deliveries
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  )
}
