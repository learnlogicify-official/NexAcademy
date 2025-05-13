'use client';

import { useXpNotification } from '@/contexts/xp-notification-context';

export interface StreakInfo {
  currentStreak: number;
  streakUpdated: boolean;
  streakMaintained: boolean;
  freezeUsed: boolean;
}

export interface XPData {
  awarded: boolean;
  amount: number;
  newTotal: number;
  levelUp: boolean;
  newLevel: number | null;
  streakInfo?: StreakInfo | null;
}

/**
 * Hook to easily display XP notifications
 */
export function useXpNotifications() {
  const { showNotification } = useXpNotification();

  /**
   * Show an XP notification for code submission
   */
  const showSubmissionXpNotification = (xpData: XPData | null | undefined) => {
    if (!xpData || !xpData.awarded || !xpData.amount) return;

    // First show the XP notification
    showNotification({
      xp: xpData.amount,
      eventType: 'correct_submission',
      description: 'Correct Solution',
      streakInfo: xpData.streakInfo
    });

    // If there was a level up, show that notification after a delay
    if (xpData.levelUp && xpData.newLevel) {
      setTimeout(() => {
        showNotification({
          xp: 0,
          eventType: 'level_up',
          levelUp: true,
          newLevel: xpData.newLevel,
          description: `Level ${xpData.newLevel} Reached!`
        });
      }, 1000); // Show level up notification 1 second after XP notification
    }
  };

  /**
   * Show a generic XP notification
   */
  const showXpNotification = (
    xp: number,
    eventType: string,
    description?: string,
    levelUp?: boolean,
    newLevel?: number | null,
    streakInfo?: StreakInfo | null
  ) => {
    showNotification({
      xp,
      eventType,
      description,
      levelUp: !!levelUp,
      newLevel: newLevel,
      streakInfo: streakInfo
    });
  };

  return {
    showSubmissionXpNotification,
    showXpNotification
  };
} 