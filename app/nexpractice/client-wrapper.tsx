"use client";

import dynamic from "next/dynamic";

// Use dynamic import with SSR disabled in a client component
const NexPracticeClient = dynamic(() => import('./nexpractice-client'), {
  ssr: false
});

// Client component wrapper
export default function ClientWrapper({ totalSolved, streak }: { totalSolved: number; streak: number }) {
  return <NexPracticeClient totalSolved={totalSolved} streak={streak} />;
} 