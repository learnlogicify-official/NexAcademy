import TimeExceededTest from '@/components/nexpractice/test-time-limit';

export default function VerdictTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Verdict Display Test Page</h1>
      <p className="mb-4 text-gray-600">
        This page tests the rendering of different verdict types in the result panel.
      </p>
      <TimeExceededTest />
    </div>
  );
} 