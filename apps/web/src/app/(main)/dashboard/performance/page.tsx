'use client';

import { SplinePerformanceDashboard } from '@/components/visual/SplinePerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <SplinePerformanceDashboard />
      </div>
    </div>
  );
}
