'use client';

import { useState, useEffect } from 'react';
import { Package, Check, Lock, Sparkles } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  icon: string;
  courses: Course[];
  price: number;
  originalPrice: number;
  stripePriceId?: string;
  isPurchased?: boolean;
  hasAccess?: boolean;
}

interface BundleCardProps {
  bundle: Bundle;
  onPurchase?: (bundle: Bundle) => void;
}

export function BundleCard({ bundle, onPurchase }: BundleCardProps) {
  const [purchasing, setPurchasing] = useState(false);
  const discount = Math.round((1 - bundle.price / bundle.originalPrice) * 100);

  const handlePurchase = async () => {
    if (bundle.isPurchased || bundle.hasAccess) return;
    setPurchasing(true);
    try {
      onPurchase?.(bundle);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Badge */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Pack</span>
          </div>
          {discount > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{bundle.icon}</span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {bundle.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {bundle.description}
            </p>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Cursos incluidos ({bundle.courses.length})
          </div>
          {bundle.courses.slice(0, 4).map((course, i) => (
            <div key={course.id} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {course.title}
              </span>
            </div>
          ))}
          {bundle.courses.length > 4 && (
            <div className="text-xs text-gray-400 pl-6">
              +{bundle.courses.length - 4} más
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${(bundle.price / 100).toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ${(bundle.originalPrice / 100).toFixed(2)}
            </span>
          </div>
          
          {bundle.isPurchased || bundle.hasAccess ? (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <Check className="w-5 h-5" />
              <span>Adquirido</span>
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {purchasing ? 'Procesando...' : 'Comprar Pack'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BundlesGrid() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/bundles');
      const data = await res.json();
      if (data.status === 'success') {
        setBundles(data.data.bundles);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (bundle: Bundle) => {
    try {
      const res = await fetch('/api/bundles/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId: bundle.id }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to purchase bundle:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-100 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay packs disponibles actualmente</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} onPurchase={handlePurchase} />
      ))}
    </div>
  );
}