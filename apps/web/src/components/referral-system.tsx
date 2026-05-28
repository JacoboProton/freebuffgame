'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, Zap } from 'lucide-react';

interface ReferralStats {
  code: string;
  totalReferrals: number;
  referralCredits: number;
  pendingCredits: number;
  totalXpEarned: number;
}

export function ReferralSystem() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referrals/stats');
      const data = await res.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.code) return;
    
    const link = `${window.location.origin}/register?ref=${stats.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateNewCode = async () => {
    try {
      const res = await fetch('/api/referrals/code/regenerate', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setStats({ ...stats!, code: data.data.code });
      }
    } catch (error) {
      console.error('Failed to regenerate code:', error);
    }
  };

  const claimReferral = async () => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (!refCode) return;
    
    setClaiming(true);
    try {
      const res = await fetch(`/api/referrals/claim?code=${refCode}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        alert('¡Código de referido reclamado! Ambos ganan XP.');
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        alert(data.message || 'No se pudo reclamar el código');
      }
    } catch (error) {
      console.error('Failed to claim referral:', error);
      alert('Error al reclamar el código');
    } finally {
      setClaiming(false);
    }
  };

  // Check if user arrived via referral link
  const checkReferralLink = () => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    return refCode;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const referralLink = stats ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${stats.code}` : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <h3 className="font-bold text-lg">Sistema de Referidos</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Your Code */}
        {stats && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Tu código de referido
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-lg font-bold text-center">
                  {stats.code}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalReferrals}
                </div>
                <div className="text-xs text-gray-500">Referidos</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <Gift className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.referralCredits}
                </div>
                <div className="text-xs text-gray-500">Créditos ganados</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalXpEarned}
                </div>
                <div className="text-xs text-gray-500">XP acumulado</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.pendingCredits}
                </div>
                <div className="text-xs text-gray-500">Pendiente</div>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Compartir enlace
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=¡Únete%20a%20FreeBuffGame%20y%20gana%20XP%20gratis!%20Usa%20mi%20código%3A%20${stats.code}&url=${encodeURIComponent(referralLink)}`, '_blank')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Twitter / X
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=¡Únete%20a%20FreeBuffGame!%20Usa%20mi%20código%20de%20referido%3A%20${stats.code}%20${encodeURIComponent(referralLink)}`, '_blank')}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=¡Únete%20a%20FreeBuffGame!%20Usa%20mi%20código%3A%20${stats.code}`, '_blank')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Telegram
                </button>
              </div>
            </div>

            {/* Regenerate Code */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={generateNewCode}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Generar nuevo código
              </button>
            </div>
          </>
        )}

        {/* Claim Referral (for new users) */}
        {checkReferralLink() && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  ¡Tienes un código de referido!
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Al registrarte, ambos ganan XP bonus
                </p>
              </div>
              <button
                onClick={claimReferral}
                disabled={claiming}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {claiming ? 'Reclamando...' : 'Reclamar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}