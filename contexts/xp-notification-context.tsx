'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { XpNotification } from '@/components/xp-notification';
import { nanoid } from 'nanoid';
import { StreakInfo } from '@/hooks/use-xp-notification';

// Define the notification payload structure
interface XpNotificationPayload {
  id: string;
  xp: number;
  eventType: string;
  levelUp?: boolean;
  newLevel?: number | null;
  description?: string;
  streakInfo?: StreakInfo | null;
}

// Define the context type
interface XpNotificationContextType {
  notifications: XpNotificationPayload[];
  showNotification: (payload: Omit<XpNotificationPayload, 'id'>) => void;
  removeNotification: (id: string) => void;
}

// Create the context with a default value
const XpNotificationContext = createContext<XpNotificationContextType>({
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {},
});

// Create a hook to use the XP notification context
export const useXpNotification = () => useContext(XpNotificationContext);

// Create the provider component
export function XpNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<XpNotificationPayload[]>([]);

  // Function to add a new notification
  const showNotification = (payload: Omit<XpNotificationPayload, 'id'>) => {
    console.log('XP Notification Context: showing notification', payload);
    const id = nanoid();
    setNotifications(prev => {
      console.log('XP Notification Context: current notifications', prev);
      const newNotifications = [...prev, { ...payload, id }];
      console.log('XP Notification Context: updated notifications', newNotifications);
      return newNotifications;
    });
  };

  // Function to remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <XpNotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
      }}
    >
      {children}
      
      {/* Render all active notifications */}
      {notifications.map((notification) => (
        <XpNotification
          key={notification.id}
          xp={notification.xp}
          eventType={notification.eventType}
          levelUp={notification.levelUp}
          newLevel={notification.newLevel}
          description={notification.description}
          streakInfo={notification.streakInfo}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </XpNotificationContext.Provider>
  );
} 