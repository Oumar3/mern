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
  const radius = 80;
  const centerX = 400;
  const centerY = 350; // Move center down to give more room
  const segmentAngle = 360 / items.length; // Full circle divided by number of items
  
  return (
    <div className="relative w-full py-8 flex justify-center">
      <div className="relative" style={{ width: 1000, height: 800 }}>
        {/* Circular pie segments and extended labels */}
        {items.map((item, idx) => {
          const startAngle = idx * segmentAngle;
          const endAngle = (idx + 1) * segmentAngle;
          const midAngle = (startAngle + endAngle) / 2;
          
          // Calculate positions with more distance
          const segmentX = centerX + Math.cos((midAngle - 90) * Math.PI / 180) * radius;
          const segmentY = centerY + Math.sin((midAngle - 90) * Math.PI / 180) * radius;
          
          // Determine if this item should be on left or right side
          const isRightSide = idx % 2 === 0; // Alternate sides
          const sideIndex = Math.floor(idx / 2); // Position within the side
          
          // Calculate vertical positions - stack items with much more spacing
          const itemsPerSide = Math.ceil(items.length / 2);
          const verticalSpacing = 120; // Increased from 80px to 120px
          const startY = centerY - ((itemsPerSide - 1) * verticalSpacing) / 2;
          const menuY = startY + (sideIndex * verticalSpacing);
          
          // Calculate horizontal positions with more distance
          const safeDistance = 160; // Increased from 140px
          const safeX = isRightSide ? centerX + safeDistance : centerX - safeDistance;
          const menuX = isRightSide ? centerX + 350 : centerX - 350; // Increased from 300px
          
          return (
            <div key={item.code}>
              {/* Pie segment */}
              <svg 
                className="absolute top-0 left-0" 
                width="1000" 
                height="800"
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
                      A ${radius} ${radius} 0 ${segmentAngle > 180 ? 1 : 0} 1 ${centerX + Math.cos((endAngle - 90) * Math.PI / 180) * radius} ${centerY + Math.sin((endAngle - 90) * Math.PI / 180) * radius}
                      Z`}
                  fill={`url(#gradient-${idx})`}
                  stroke="white"
                  strokeWidth="3"
                />
                {/* Code text around the heart in a circle */}
                <text
                  x={centerX + Math.cos((midAngle - 90) * Math.PI / 180) * (radius + 30)} // Place codes outside the pie segments
                  y={centerY + Math.sin((midAngle - 90) * Math.PI / 180) * (radius + 30)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={COLORS[idx % COLORS.length].from}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {item.code}
                </text>
                {/* Line from segment to safe point */}
                <line
                  x1={segmentX}
                  y1={segmentY}
                  x2={safeX}
                  y2={segmentY}
                  stroke={COLORS[idx % COLORS.length].from}
                  strokeWidth="2"
                />
                {/* Vertical line to menu level */}
                <line
                  x1={safeX}
                  y1={segmentY}
                  x2={safeX}
                  y2={menuY}
                  stroke={COLORS[idx % COLORS.length].from}
                  strokeWidth="2"
                />
                {/* Horizontal line to menu */}
                <line
                  x1={safeX}
                  y1={menuY}
                  x2={menuX}
                  y2={menuY}
                  stroke={COLORS[idx % COLORS.length].from}
                  strokeWidth="2"
                />
              </svg>
              
              {/* Text label with actions - organized by sides */}
              <div
                className="absolute transform -translate-y-1/2"
                style={{ 
                  left: isRightSide ? menuX + 10 : menuX - 290, // Adjusted for smaller cards
                  top: menuY,
                  textAlign: isRightSide ? 'left' : 'right',
                  zIndex: 10
                }}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-4 min-w-[240px] max-w-[280px] cursor-pointer hover:shadow-xl transition-shadow"
                     onClick={item.onView}>
                  <div className={`${isRightSide ? 'text-left' : 'text-right'}`}>
                    <div className="font-bold text-gray-800 text-base mb-2 leading-tight">{item.name}</div>
                    {item.nature && <div className="text-sm text-gray-500 italic">{item.nature}</div>}
                    {item.description && <div className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Center circle - clearly visible and above everything */}
        <div 
          className="absolute bg-white rounded-full shadow-2xl border-4 border-gray-300 flex flex-col items-center justify-center"
          style={{ 
            left: centerX - 100, 
            top: centerY - 100, 
            width: 200, 
            height: 200,
            zIndex: 20
          }}
        >
          <div className="text-lg text-gray-500 mb-2 font-medium">AXES</div>
          <div className="text-xl font-bold text-gray-800 text-center leading-tight">STRATÉGIQUES</div>
          <div className="text-lg text-gray-400 mt-2 font-medium">PND</div>
        </div>
      </div>
    </div>
  );
};

export default VerticalInfographicMenu;
