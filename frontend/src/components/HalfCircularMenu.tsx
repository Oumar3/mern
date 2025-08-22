import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface VerticalInfographicMenuProps {
  items: {
    code: string;
    name: string;
    description?: string;
    nature?: string;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    color?: string;
  }[];
}

const COLORS = [
  { from: '#60a5fa', to: '#2563eb' }, // blue
  { from: '#4ade80', to: '#16a34a' }, // green
  { from: '#facc15', to: '#eab308' }, // yellow
  { from: '#f472b6', to: '#db2777' }, // pink
  { from: '#fb923c', to: '#ea580c' }, // orange
  { from: '#a78bfa', to: '#7c3aed' }, // purple
];

const icons = [EyeIcon, PencilIcon, TrashIcon];
const actions = ['Voir', 'Modifier', 'Supprimer'];

const VerticalInfographicMenu: React.FC<VerticalInfographicMenuProps> = ({ items }) => {
  const radius = 120;
  const centerX = 300;
  const centerY = 250;
  const segmentAngle = 180 / items.length; // Semi-circle divided by number of items
  
  return (
    <div className="relative w-full py-8 flex justify-center">
      <div className="relative" style={{ width: 600, height: 500 }}>
        {/* Semi-circular pie segments and bubbles */}
        {items.map((item, idx) => {
          const startAngle = idx * segmentAngle;
          const endAngle = (idx + 1) * segmentAngle;
          const midAngle = (startAngle + endAngle) / 2;
          
          // Calculate bubble position (extending outward from segment)
          const bubbleDistance = radius + 120;
          const bubbleX = centerX + Math.cos((midAngle - 90) * Math.PI / 180) * bubbleDistance;
          const bubbleY = centerY + Math.sin((midAngle - 90) * Math.PI / 180) * bubbleDistance;
          
          // Calculate connector line positions
          const innerX = centerX + Math.cos((midAngle - 90) * Math.PI / 180) * radius;
          const innerY = centerY + Math.sin((midAngle - 90) * Math.PI / 180) * radius;
          const outerX = centerX + Math.cos((midAngle - 90) * Math.PI / 180) * (radius + 60);
          const outerY = centerY + Math.sin((midAngle - 90) * Math.PI / 180) * (radius + 60);
          
          return (
            <div key={item.code}>
              {/* Pie segment */}
              <svg 
                className="absolute top-0 left-0" 
                width="600" 
                height="500"
                style={{ pointerEvents: 'none' }}
              >
                <defs>
                  <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={COLORS[idx % COLORS.length].from} />
                    <stop offset="100%" stopColor={COLORS[idx % COLORS.length].to} />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${centerX} ${centerY} 
                      L ${centerX + Math.cos((startAngle - 90) * Math.PI / 180) * radius} ${centerY + Math.sin((startAngle - 90) * Math.PI / 180) * radius}
                      A ${radius} ${radius} 0 0 1 ${centerX + Math.cos((endAngle - 90) * Math.PI / 180) * radius} ${centerY + Math.sin((endAngle - 90) * Math.PI / 180) * radius}
                      Z`}
                  fill={`url(#gradient-${idx})`}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Number on segment */}
                <text
                  x={centerX + Math.cos((midAngle - 90) * Math.PI / 180) * (radius * 0.7)}
                  y={centerY + Math.sin((midAngle - 90) * Math.PI / 180) * (radius * 0.7)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="28"
                  fontWeight="700"
                  fill="white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {idx + 1}
                </text>
                {/* Connector line */}
                <line
                  x1={innerX}
                  y1={innerY}
                  x2={outerX}
                  y2={outerY}
                  stroke="#d1d5db"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Menu bubble */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: bubbleX, top: bubbleY }}
              >
                {/* Icon circle */}
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-full shadow-xl border-2 border-gray-200 p-4 mb-2">
                    <EyeIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  {/* Content bubble */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-xs">
                    <div className="text-center">
                      <div className="font-bold text-gray-800 mb-1 text-lg">{item.code}</div>
                      <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                      {item.nature && <div className="text-xs text-gray-400 mb-2">{item.nature}</div>}
                      <div className="flex justify-center gap-2">
                        <button onClick={item.onView} className="p-1 hover:bg-blue-50 rounded">
                          <EyeIcon className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                        </button>
                        <button onClick={item.onEdit} className="p-1 hover:bg-yellow-50 rounded">
                          <PencilIcon className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                        </button>
                        <button onClick={item.onDelete} className="p-1 hover:bg-pink-50 rounded">
                          <TrashIcon className="w-4 h-4 text-gray-400 hover:text-pink-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Center circle */}
        <div 
          className="absolute bg-white rounded-full shadow-2xl border-4 border-gray-200 flex flex-col items-center justify-center"
          style={{ 
            left: centerX - 60, 
            top: centerY - 60, 
            width: 120, 
            height: 120 
          }}
        >
          <div className="text-xs text-gray-500 mb-1">AXES</div>
          <div className="text-lg font-bold text-gray-800">STRATÉGIQUES</div>
          <div className="text-xs text-gray-400 mt-1">PND</div>
        </div>
      </div>
    </div>
  );
};

export default VerticalInfographicMenu;
