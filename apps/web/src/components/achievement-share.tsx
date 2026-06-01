'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, Link2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

interface AchievementShareProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementShare({ achievement, isOpen, onClose }: AchievementShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 ¡Desbloqueé el logro "${achievement.title}" en Duobijac! +${achievement.xpReward} XP 🚀`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://freebuffgame.onrender.com')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://freebuffgame.onrender.com')}&quote=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://freebuffgame.onrender.com')}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://freebuffgame.onrender.com/achievements');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
              {achievement.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                ¡Compartir Logro!
              </h3>
              <p className="text-sm text-gray-500">{achievement.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share Text Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Texto para compartir:</p>
          <p className="text-gray-900 dark:text-white font-medium">{shareText}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => window.open(shareUrls.twitter, '_blank')}
            className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          <Button
            onClick={() => window.open(shareUrls.facebook, '_blank')}
            className="bg-[#4267B2] hover:bg-[#4267B2]/90 text-white"
          >
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
          <Button
            onClick={() => window.open(shareUrls.linkedin, '_blank')}
            className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className={cn(copied && 'bg-green-50 border-green-500 text-green-600')}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>
        </div>

        {/* Alternative: Download achievement card */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              // Create a canvas with the achievement and download it
              const canvas = document.createElement('canvas');
              canvas.width = 600;
              canvas.height = 400;
              const ctx = canvas.getContext('2d');

              if (ctx) {
                // Background gradient
                const gradient = ctx.createLinearGradient(0, 0, 600, 400);
                gradient.addColorStop(0, '#6366F1');
                gradient.addColorStop(1, '#8B5CF6');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 600, 400);

                // Achievement icon
                ctx.font = '80px serif';
                ctx.fillText(achievement.icon, 260, 150);

                // Title
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 36px sans-serif';
                ctx.fillText(achievement.title, 60, 220);

                // XP
                ctx.font = '24px sans-serif';
                ctx.fillText(`+${achievement.xpReward} XP`, 60, 270);

                // Branding
                ctx.font = '18px sans-serif';
                ctx.fillText('Duobijac - freebuffgame.onrender.com', 60, 350);

                // Download
                const link = document.createElement('a');
                link.download = `achievement-${achievement.key}.png`;
                link.href = canvas.toDataURL();
                link.click();
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Descargar Tarjeta del Logro
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Share button component for inline use
export function ShareButton({ achievement }: { achievement: Achievement }) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowShare(true)}
        className="text-gray-500 hover:text-primary"
      >
        <Share2 className="w-4 h-4" />
      </Button>
      <AchievementShare
        achievement={achievement}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </>
  );
}