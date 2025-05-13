'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BoltIcon, StarIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/solid';

interface XpNotificationProps {
  xp: number;
  eventType: string;
  levelUp?: boolean;
  newLevel?: number | null;
  description?: string;
  streakInfo?: {
    currentStreak: number;
    streakUpdated: boolean;
    streakMaintained: boolean;
    freezeUsed: boolean;
  } | null;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

// Map event types to appropriate icons
const eventIcons: Record<string, React.ReactNode> = {
  correct_submission: <BoltIcon className="w-4 h-4 text-yellow-400" />,
  first_submission: <StarIcon className="w-4 h-4 text-yellow-400" />,
  streak_day: <FireIcon className="w-4 h-4 text-orange-500" />,
  assessment_completion: <TrophyIcon className="w-4 h-4 text-yellow-400" />,
  level_up: <StarIcon className="w-4 h-4 text-yellow-400" />,
};

// Map event types to descriptive text
const eventDescriptions: Record<string, string> = {
  correct_submission: 'Correct Solution',
  first_submission: 'First Correct Solution',
  streak_day: 'Daily Streak',
  assessment_completion: 'Assessment Completed',
  level_up: 'Level Up',
};

export function XpNotification({
  xp,
  eventType,
  levelUp = false,
  newLevel,
  description,
  streakInfo,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
}: XpNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  const showStreakNotification = streakInfo && streakInfo.streakUpdated && !streakInfo.streakMaintained;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2"
        >
          <motion.div 
            className="flex items-center gap-2 bg-zinc-800/95 backdrop-blur-sm shadow-lg border border-zinc-700 rounded-lg p-3 text-white"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              {eventIcons[eventType] || <BoltIcon className="w-4 h-4 text-yellow-400" />}
              <div className="text-sm font-medium">
                {description || eventDescriptions[eventType] || 'XP Earned'}
              </div>
            </div>
            
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 ml-2">
              +{xp} XP
            </Badge>
            
            <button
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
              }}
              className="ml-2 text-zinc-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
          
          {levelUp && newLevel && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-indigo-900/90 backdrop-blur-sm shadow-lg border border-indigo-700 rounded-lg p-3 text-white"
            >
              <TrophyIcon className="w-5 h-5 text-yellow-400" />
              <div className="text-sm font-medium">
                Leveled up to {newLevel}!
              </div>
            </motion.div>
          )}
          
          {showStreakNotification && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: levelUp ? 0.6 : 0.3 }}
              className="flex items-center gap-2 bg-orange-900/90 backdrop-blur-sm shadow-lg border border-orange-700 rounded-lg p-3 text-white"
            >
              <FireIcon className="w-5 h-5 text-orange-400" />
              <div className="text-sm font-medium">
                {streakInfo?.freezeUsed 
                  ? 'Streak freeze used! Streak continues!' 
                  : `${streakInfo?.currentStreak}-day streak! 🔥`}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 