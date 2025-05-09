import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CodeRunnerWithSubscription from './CodeRunnerWithSubscription';

// Import CodeEditor with dynamic loading to avoid SSR issues
const CodeEditor = dynamic(
  () => import('./CodeEditor'),
  { ssr: false }
);

interface CodeSubmitterProps {
  problemId: string;
  defaultLanguage?: number;
  preloadCode?: string;
  sampleTestcases?: { input: string; output: string }[];
}

export default function CodeSubmitter({
  problemId,
  defaultLanguage = 71, // Python by default
  preloadCode = '',
  sampleTestcases = []
}: CodeSubmitterProps) {
  const [code, setCode] = useState(preloadCode);
  const [language, setLanguage] = useState(defaultLanguage);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Simple language mapping (can be expanded)
  const languages = [
    { id: 71, name: 'Python', extension: 'py' },
    { id: 63, name: 'JavaScript', extension: 'js' },
    { id: 54, name: 'C++', extension: 'cpp' },
    { id: 62, name: 'Java', extension: 'java' },
    { id: 50, name: 'C', extension: 'c' },
  ];
  
  // Get language name from ID
  const getLanguageName = (id: number) => {
    const lang = languages.find(lang => lang.id === id);
    return lang ? lang.name : 'Unknown';
  };

  // Handle code changes from the editor
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  // Handle language selection
  const handleLanguageChange = (newLanguage: number) => {
    setLanguage(newLanguage);
  };
  
  return (
    <Card className="shadow-sm">
      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b px-6 py-2">
          <TabsList>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(Number(e.target.value))}
              className="p-2 border rounded text-sm"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <CardContent className="p-0">
          <TabsContent value="editor" className="m-0">
            <div className="h-[500px]">
              <CodeEditor 
                code={code} 
                language={getLanguageName(language).toLowerCase()} 
                onChange={handleCodeChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="m-0 p-6">
            <CodeRunnerWithSubscription
              sourceCode={code}
              languageId={language}
              problemId={problemId}
              onSuccess={() => {}}
              onError={(err) => console.error(err)}
            />
            
            {sampleTestcases.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Sample Test Cases</h3>
                <div className="space-y-4">
                  {sampleTestcases.map((tc, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="mb-2"><strong>Input:</strong></div>
                      <pre className="bg-gray-100 p-2 rounded">{tc.input}</pre>
                      <div className="mb-2 mt-4"><strong>Expected Output:</strong></div>
                      <pre className="bg-gray-100 p-2 rounded">{tc.output}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <div className="border-t p-4">
        <div className="flex justify-end">
          <Button 
            onClick={() => setActiveTab('results')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Run &amp; Submit
          </Button>
        </div>
      </div>
    </Card>
  );
} 