"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileLevelCard } from "@/components/profile-level-card";
import { useMobile } from "@/hooks/use-mobile";
import { LearningAnalyticsGraph } from "./learning-analytics-graph";
import { DailyTasks } from "./daily-tasks";

// Import components
import { WelcomeSection } from "./welcome-section";
import { CoursesSection } from "./courses-section";
import { ActivityFeed } from "./activity-feed";
import { AchievementsList } from "./achievements-list";
import { DailyStreakCard } from "./daily-streak-card";
import { DailyQuestsCard } from "./daily-quests-card";
import { PlayerStatsCard } from "./player-stats-card";
import { UpcomingEventsCard } from "./upcoming-events-card";

// Import data
import {
  coursesData,
  questsData,
  activityFeedData,
  achievementsData,
  weeklyStreakData,
  upcomingEventsData,
  playerStatsData,
} from "./dashboard-data";

// Add import for type User from next-auth
import type { User as AuthUser } from "next-auth";

// Create a context to track sidebar state
export const SidebarContext = {
  Consumer: ({
    children,
  }: {
    children: (collapsed: boolean) => React.ReactNode;
  }) => {
    // Get the sidebar collapsed state from localStorage on client side
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
      // Check localStorage for sidebar state
      const storedState = localStorage.getItem("sidebarCollapsed");
      if (storedState !== null) {
        setSidebarCollapsed(storedState === "true");
      }

      // Set up event listener for sidebar state changes
      const handleStorageChange = () => {
        const currentState = localStorage.getItem("sidebarCollapsed");
        setSidebarCollapsed(currentState === "true");
      };

      // Listen for custom event for sidebar toggle
      window.addEventListener("sidebarStateChange", handleStorageChange);

      return () => {
        window.removeEventListener("sidebarStateChange", handleStorageChange);
      };
    }, []);

    return children(sidebarCollapsed);
  },
};

// Main Dashboard component
export function Dashboard({ user }: { user: AuthUser }) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMobile();

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Map session user to WelcomeSection's expected props (fallbacks for missing fields)
  const welcomeUserData = {
    name: user?.name || "User",
    avatar: user?.image || "/placeholder.svg",
    level: 1, // fallback/default
    levelTitle: "Learner",
    tier: "Bronze Tier",
    tierEmoji: "🥉",
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    achievements: 0,
    daysActive: 0,
  };

  return (
    <div className="space-y-8">
      {/* Hero welcome section */}
      <WelcomeSection userData={welcomeUserData} />

      {/* Main dashboard layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - responsive, with maximum width constraint */}
        <div className="flex-1 space-y-6 md:max-w-[calc(100%-350px-1.5rem)]">
          {/* Course progress section */}
          <SidebarContext.Consumer>
            {(sidebarCollapsed: boolean) => (
              <CoursesSection
                courses={coursesData}
                sidebarCollapsed={sidebarCollapsed}
              />
            )}
          </SidebarContext.Consumer>

          {/* Activity/Achievements and Daily Tasks - responsive layout based on sidebar state */}
          <SidebarContext.Consumer>
            {(sidebarCollapsed: boolean) => (
              <div
                className={`grid grid-cols-1 ${
                  sidebarCollapsed
                    ? "lg:grid-cols-2"
                    : "lg:grid-cols-1 xl:grid-cols-2"
                } gap-6`}
              >
                {/* Tabs for activity and achievements - with equal height */}
                <Card className="flex flex-col h-full">
                  <Tabs
                    defaultValue="activity"
                    className="w-full flex flex-col flex-1"
                  >
                    <CardHeader className="pb-0 pt-4 px-4">
                      <TabsList className="w-full justify-start bg-transparent p-0">
                        <TabsTrigger
                          value="activity"
                          className="rounded-t-lg rounded-b-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2"
                        >
                          Activity
                        </TabsTrigger>
                        <TabsTrigger
                          value="achievements"
                          className="rounded-t-lg rounded-b-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-2"
                        >
                          Achievements
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>

                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <TabsContent
                        value="activity"
                        className="space-y-4 m-0 flex-1 flex flex-col"
                      >
                        <ActivityFeed activities={activityFeedData} />
                      </TabsContent>

                      <TabsContent
                        value="achievements"
                        className="m-0 flex-1 flex flex-col"
                      >
                        <AchievementsList achievements={achievementsData} />
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>

                {/* Daily To-Do List - with equal height */}
                <div className="h-full">
                  <DailyTasks />
                </div>
              </div>
            )}
          </SidebarContext.Consumer>

          {/* Learning Analytics Graph */}
          <LearningAnalyticsGraph />
        </div>

        {/* Right column - fixed width on desktop, full width on mobile */}
        <div className="w-full md:w-[350px] flex-shrink-0 space-y-6">
          {/* Profile Level Card */}
          <ProfileLevelCard userData={require("./dashboard-data").userData} className="w-full" />

          {/* Daily Streak Card */}
          <DailyStreakCard
            currentStreak={require("./dashboard-data").userData.streak}
            highestStreak={7}
            weeklyStreak={weeklyStreakData}
          />

          {/* Daily Quests Card */}
          <DailyQuestsCard quests={questsData} />

          {/* About the player section */}
          <PlayerStatsCard stats={playerStatsData} />

          {/* Upcoming Events */}
          <UpcomingEventsCard events={upcomingEventsData} />
        </div>
      </div>
    </div>
  );
}
