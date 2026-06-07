'use client';

import React from 'react';

interface ModuleIconProps {
  className?: string;
  size?: number;
}

/** Module 1: Herramientas Básicas - Hammer & screwdriver */
export function HerramientasIcon({ className = '', size = 48 }: ModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Hammer head */}
      <rect x="8" y="10" width="16" height="8" rx="2" fill="#94a3b8" />
      <rect x="6" y="10" width="4" height="8" rx="1" fill="#64748b" />
      {/* Hammer handle */}
      <rect x="16" y="16" width="4" height="22" rx="1" fill="#a16207" />
      <rect x="17" y="16" width="2" height="22" rx="0.5" fill="#ca8a04" opacity="0.5" />
      {/* Screwdriver */}
      <rect x="30" y="8" width="3" height="18" rx="1.5" fill="#e2e8f0" />
      <rect x="30.5" y="8" width="2" height="14" rx="1" fill="#cbd5e1" />
      <rect x="29" y="24" width="5" height="12" rx="2" fill="#b45309" />
      <rect x="29.5" y="24" width="4" height="10" rx="1.5" fill="#d97706" opacity="0.6" />
      {/* Screws */}
      <circle cx="38" cy="38" r="2.5" fill="#94a3b8" />
      <line x1="36.5" y1="38" x2="39.5" y2="38" stroke="#64748b" strokeWidth="0.8" />
      <line x1="38" y1="36.5" x2="38" y2="39.5" stroke="#64748b" strokeWidth="0.8" />
    </svg>
  );
}

/** Module 2: Materiales de Madera - Wood logs & grain */
export function MaterialesIcon({ className = '', size = 48 }: ModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Log 1 */}
      <ellipse cx="18" cy="28" rx="12" ry="8" fill="#a16207" />
      <ellipse cx="18" cy="28" rx="10" ry="6.5" fill="#ca8a04" />
      <ellipse cx="18" cy="28" rx="7" ry="4.5" fill="#d4a017" />
      <ellipse cx="18" cy="28" rx="3.5" ry="2.5" fill="#eab308" />
      {/* Log end rings */}
      <circle cx="18" cy="28" r="1.5" fill="#92400e" />
      {/* Log 2 (behind) */}
      <ellipse cx="32" cy="22" rx="10" ry="7" fill="#92400e" />
      <ellipse cx="32" cy="22" rx="8.5" ry="5.5" fill="#a16207" />
      <ellipse cx="32" cy="22" rx="6" ry="4" fill="#b45309" />
      <ellipse cx="32" cy="22" rx="3" ry="2" fill="#d4a017" />
      <circle cx="32" cy="22" r="1" fill="#78350f" />
      {/* Wood grain lines */}
      <path d="M8 14 Q18 12 28 14" stroke="#92400e" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M6 18 Q18 16 30 18" stroke="#92400e" strokeWidth="0.6" fill="none" opacity="0.4" />
      {/* Small wood chip */}
      <rect x="4" y="36" width="8" height="4" rx="1" fill="#ca8a04" transform="rotate(-15 8 38)" />
      <rect x="4.5" y="36.5" width="7" height="3" rx="0.5" fill="#d4a017" transform="rotate(-15 8 38)" />
    </svg>
  );
}

/** Module 3: Técnicas de Corte y Unión - Saw blade & joint */
export function TecnicasIcon({ className = '', size = 48 }: ModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Hand saw blade */}
      <path d="M6 18 L36 12 L36 22 L6 18Z" fill="#cbd5e1" />
      <path d="M6 18 L36 12 L36 17 L6 18Z" fill="#e2e8f0" />
      {/* Saw teeth */}
      <path d="M8 18 L10 20 L12 18 L14 20 L16 18 L18 20 L20 18 L22 20 L24 18 L26 20 L28 18 L30 20 L32 18 L34 20 L36 18" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
      {/* Saw handle */}
      <rect x="34" y="10" width="10" height="14" rx="2" fill="#92400e" />
      <rect x="35" y="11" width="8" height="12" rx="1.5" fill="#a16207" />
      <circle cx="39" cy="16" r="2" fill="#78350f" />
      {/* Joint illustration - mortise & tenon */}
      <rect x="8" y="32" width="14" height="10" rx="1" fill="#ca8a04" />
      <rect x="10" y="34" width="4" height="6" rx="0.5" fill="#92400e" />
      <rect x="18" y="35" width="12" height="4" rx="1" fill="#d4a017" />
      <rect x="14" y="35.5" width="6" height="3" rx="0.5" fill="#b45309" />
    </svg>
  );
}

/** Module 4: Proyectos Prácticos - Workbench & project */
export function ProyectosIcon({ className = '', size = 48 }: ModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Workbench top */}
      <rect x="4" y="18" width="40" height="5" rx="1.5" fill="#a16207" />
      <rect x="4" y="18" width="40" height="2.5" rx="1" fill="#ca8a04" />
      {/* Bench legs */}
      <rect x="7" y="23" width="3" height="18" rx="1" fill="#92400e" />
      <rect x="38" y="23" width="3" height="18" rx="1" fill="#92400e" />
      {/* Cross support */}
      <rect x="10" y="32" width="28" height="2" rx="0.5" fill="#a16207" />
      {/* Wood piece on bench */}
      <rect x="14" y="12" width="16" height="6" rx="1" fill="#d4a017" />
      <rect x="14" y="12" width="16" height="3" rx="1" fill="#eab308" opacity="0.6" />
      {/* Wood grain */}
      <line x1="16" y1="14" x2="28" y2="14" stroke="#a16207" strokeWidth="0.6" opacity="0.5" />
      <line x1="15" y1="16" x2="29" y2="16" stroke="#a16207" strokeWidth="0.5" opacity="0.4" />
      {/* Clamp */}
      <rect x="26" y="10" width="4" height="8" rx="0.5" fill="#64748b" />
      <rect x="25" y="10" width="6" height="2" rx="0.5" fill="#94a3b8" />
    </svg>
  );
}

/** Module 5: Técnicas Avanzadas - Star/advanced craft symbol */
export function AvanzadasIcon({ className = '', size = 48 }: ModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Dovetail joint shape */}
      <path d="M10 34 L18 26 L18 34 L26 26 L26 34 L34 26 L38 30 L38 38 L6 38Z" fill="#ca8a04" />
      <path d="M10 34 L18 26 L18 34 L26 26 L26 34 L34 26 L38 30 L38 36 L6 36Z" fill="#d4a017" opacity="0.7" />
      {/* Lathe/turning symbol - circle with center */}
      <circle cx="24" cy="14" r="10" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="24" cy="14" r="7" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="24" cy="14" r="3" fill="#64748b" />
      <circle cx="24" cy="14" r="1.5" fill="#475569" />
      {/* Turning lines */}
      <path d="M14 14 Q24 10 34 14" stroke="#94a3b8" strokeWidth="0.8" fill="none" />
      <path d="M14 14 Q24 18 34 14" stroke="#94a3b8" strokeWidth="0.8" fill="none" />
      {/* Advanced sparkle */}
      <circle cx="38" cy="6" r="1.5" fill="#eab308" />
      <circle cx="42" cy="10" r="1" fill="#f59e0b" />
      <circle cx="6" cy="8" r="1" fill="#eab308" />
    </svg>
  );
}

/** Get module icon by order (1-indexed) */
export function getModuleIcon(order: number): React.FC<ModuleIconProps> {
  const icons: Record<number, React.FC<ModuleIconProps>> = {
    1: HerramientasIcon,
    2: MaterialesIcon,
    3: TecnicasIcon,
    4: ProyectosIcon,
    5: AvanzadasIcon,
  };
  return icons[order] || HerramientasIcon;
}
