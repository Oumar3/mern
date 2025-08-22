import React, { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface DashboardItem {
  code: string;
  name: string;
  description?: string;
  nature?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface ModernCircularDashboardProps {
  items: DashboardItem[];
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

const ModernCircularDashboard: React.FC<ModernCircularDashboardProps> = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[700px] bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      {/* Main Container */}
      <div className="relative">
        
        {/* Central Logo/Heart */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-48 h-48 bg-white rounded-full shadow-2xl border-4 border-blue-100 flex flex-col items-center justify-center">
            {/* PND Logo Space - you can replace this with an img tag */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 mb-2">PND</div>
              <div className="text-sm text-blue-600 font-medium">PLAN NATIONAL</div>
              <div className="text-sm text-blue-600 font-medium">DE DÉVELOPPEMENT</div>
              <div className="text-xs text-blue-400 mt-2">2026 - 2030</div>
            </div>
          </div>
        </div>

        {/* Circular Items */}
        <div className="relative w-[600px] h-[600px]">
          {items.map((item, index) => {
            const angle = (index * 360) / items.length;
            const radius = 250;
            const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
            const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
            
            return (
              <div
                key={index}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  selectedItem === index ? 'scale-110 z-10' : 'z-5'
                }`}
                style={{
                  left: 300 + x,
                  top: 300 + y,
                }}
              >
                {/* Item Card */}
                <div
                  className={`bg-white rounded-2xl shadow-lg border-2 p-4 w-52 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedItem === index ? 'border-blue-400 shadow-2xl' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedItem(selectedItem === index ? null : index)}
                >
                  {/* Code Circle */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 mx-auto"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {item.code}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">
                      {item.name}
                    </h3>
                    <div className="text-xs text-gray-500 mb-3">
                      {item.nature}
                    </div>
                    
                    {/* Expandable Description */}
                    {selectedItem === index && item.description && (
                      <div className="text-xs text-gray-600 mb-4 leading-relaxed animate-fadeIn">
                        {item.description}
                      </div>
                    )}
                    
                    {/* Action Buttons - only show when selected */}
                    {selectedItem === index && (
                      <div className="flex justify-center gap-2 animate-fadeIn">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onView();
                          }}
                          className="p-2 hover:bg-blue-50 rounded-full transition-colors group"
                          title="Voir"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onEdit();
                          }}
                          className="p-2 hover:bg-yellow-50 rounded-full transition-colors group"
                          title="Modifier"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-yellow-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onDelete();
                          }}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Cliquez sur un axe stratégique pour voir les détails et actions
      </div>
    </div>
  );
};

export default ModernCircularDashboard;
