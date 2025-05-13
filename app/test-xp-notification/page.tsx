'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useXpNotifications } from '@/hooks/use-xp-notification';

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { showSubmissionXpNotification, showXpNotification } = useXpNotifications();

  // Function to test direct notification showing
  const testDirectNotification = (type: string) => {
    if (type === 'correct_submission') {
      showXpNotification(10, 'correct_submission', 'Correct Solution');
    } else if (type === 'level_up') {
      // First show XP notification
      showXpNotification(15, 'correct_submission', 'Correct Solution');
      
      // Then show level up notification after a delay
      setTimeout(() => {
        showXpNotification(0, 'level_up', 'Level 3 Reached!', true, 3);
      }, 1000);
    } else if (type === 'assessment') {
      showXpNotification(25, 'assessment_completion', 'Assessment Completed');
    }
    
    setResult(`Direct notification of type "${type}" triggered`);
  };

  // Function to test notification via API response
  const testApiNotification = async (type: string) => {
    try {
      setLoading(true);
      setResult(null);
      
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      const data = await response.json();
      
      setResult(`API Response: ${JSON.stringify(data)}`);
      
      // Show notification using the hook
      if (data.xp && data.xp.awarded) {
        showSubmissionXpNotification(data.xp);
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test XP Notifications</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Direct Notifications</h2>
          <p className="text-gray-600 mb-4">
            These buttons test notifications by directly calling the notification hook functions.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => testDirectNotification('correct_submission')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Show Correct Submission XP
            </Button>
            
            <Button 
              onClick={() => testDirectNotification('level_up')} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Show Level Up XP
            </Button>
            
            <Button 
              onClick={() => testDirectNotification('assessment')} 
              className="bg-amber-600 hover:bg-amber-700"
            >
              Show Assessment Completion XP
            </Button>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test API-Based Notifications</h2>
          <p className="text-gray-600 mb-4">
            These buttons test notifications by fetching XP data from the API.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => testApiNotification('correct_submission')} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Loading...' : 'API: Correct Submission'}
            </Button>
            
            <Button 
              onClick={() => testApiNotification('level_up')} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Loading...' : 'API: Level Up'}
            </Button>
            
            <Button 
              onClick={() => testApiNotification('assessment')} 
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Loading...' : 'API: Assessment Completion'}
            </Button>
            
            <Button 
              onClick={() => testApiNotification('default')} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Loading...' : 'API: No XP Data'}
            </Button>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg overflow-x-auto">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
} 