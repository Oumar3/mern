import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface InfographicMenuProps {
  code: string;
  name: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper to create circular text SVG path
interface CircularTextProps {
  text: string;
  radius?: number;
}
function CircularText({ text, radius = 105 }: CircularTextProps) {
  // Tighter curve, more spacing, larger radius
  const chars = text.split('');
  const charDegrees = 360 / chars.length;
  return (
    <svg width={radius * 2 + 40} height={radius * 2 + 40} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <g transform={`translate(${radius + 20},${radius + 20})`}>
        {chars.map((char: string, i: number) => {
          const angle = i * charDegrees - 90;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fill="#22223b"
              transform={`rotate(${angle + 90},${x},${y})`}
              style={{ fontWeight: 700, letterSpacing: 2 }}
            >
              {char}
            </text>
          );
        })}
      </g>
    </svg>
  );
}


type MenuAction = 'view' | 'edit' | 'delete';
const menuItems: { icon: React.ElementType; label: string; action: MenuAction }[] = [
  { icon: EyeIcon, label: 'Voir', action: 'view' },
  { icon: PencilIcon, label: 'Modifier', action: 'edit' },
  { icon: TrashIcon, label: 'Supprimer', action: 'delete' },
];

const InfographicMenu: React.FC<InfographicMenuProps> = ({ code, name, onView, onEdit, onDelete }) => {
  const actions: Record<MenuAction, () => void> = { view: onView, edit: onEdit, delete: onDelete };
  const iconRadius = 120; // distance from center to icon
  const center = 140;
  const iconSize = 72;
  const codeCircle = 100;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Circular name text */}
      <CircularText text={name} radius={115} />
      {/* Center code */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center z-10 border-4 border-gray-200 shadow-xl"
        style={{ width: codeCircle, height: codeCircle, boxShadow: '0 8px 32px 0 rgba(60,60,100,0.10)' }}
      >
        <span className="text-2xl font-bold text-gray-800 select-none drop-shadow-sm">{code}</span>
      </div>
      {/* Menu items around - 3 icons at 120deg intervals */}
      {menuItems.map((item, i) => {
        // 3 icons: 0deg (top), 120deg, 240deg
        const angle = (i / menuItems.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + Math.cos(angle) * iconRadius - iconSize / 2;
        const y = center + Math.sin(angle) * iconRadius - iconSize / 2;
        const Icon = item.icon;
        return (
          <button
            key={item.action}
            onClick={actions[item.action]}
            className="absolute group bg-white shadow-xl rounded-full flex flex-col items-center justify-center transition-transform hover:scale-110 hover:bg-blue-50 border-2 border-gray-200"
            style={{ left: x, top: y, width: iconSize, height: iconSize, boxShadow: '0 8px 32px 0 rgba(60,60,100,0.13)' }}
            title={item.label}
          >
            <Icon className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm mt-1 text-gray-500 group-hover:text-blue-700 font-semibold tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default InfographicMenu;
