"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/nexpractice/theme-provider";
import { NotistackProvider } from "@/components/providers/snackbar-provider";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { NexPracticeLoader } from '@/app/explore-nex/ExploreNexContent';
import { XpNotificationProvider } from '@/contexts/xp-notification-context';
import { UserStatsProvider } from "@/components/UserStatsContext";

function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (
      session?.user &&
      !session.user.hasOnboarded &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
    }
  }, [status, session, pathname, router]);

  return null;
}

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <OnboardingRedirect />
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NotistackProvider>
            <ApolloProvider client={apolloClient}>
              <XpNotificationProvider>
                <UserStatsProvider>
                  <NexPracticeLoader />
                  {children}
                </UserStatsProvider>
              </XpNotificationProvider>
            </ApolloProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </NotistackProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 