'use client';

import { SplinePerformanceDashboard } from '@/components/visual/SplinePerformanceDashboard';
import { Hexagons } from '@/components/neonblade-ui/hexagons';

export default function PerformancePage() {
  return (
    <div className="relative min-h-screen bg-gray-950 p-6 overflow-hidden">
      <Hexagons
        hexBorderColor="rgba(34,197,94,0.15)"
        hexSize={45}
        borderWidth={1}
        hoverEffect
        hoverColor="rgba(34,197,94,0.08)"
        hoverBorderColor="#22c55e"
        borderGlowEffect
        borderGlowColor="#22c55e"
        borderGlowRadius={8}
        beamEffect
        beamColor="#22c55e"
        beamGlowColor="#22c55e"
        maxBeams={15}
        beamSpeed={1.5}
        beamLength={60}
        beamSpawnProbability={0.05}
      />
      <div className="relative z-10 max-w-5xl mx-auto">
        <SplinePerformanceDashboard />
      </div>
    </div>
  );
}
