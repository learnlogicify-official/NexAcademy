import React, { useState } from 'react';
import { useJudge0Languages } from '../hooks/useJudge0Languages';
import { useProblemData } from '../hooks/useProblemData';

export function ProblemDataExample({ problemId }: { problemId: string }) {
  // Get all Judge0 languages - these have accurate names/versions
  const { languages: judge0Languages } = useJudge0Languages();
  
  // Get problem data and allowed languages for this problem
  const { problem, languages: allowedLanguages, isLoading, error } = useProblemData(problemId);
  
  // State for selected language
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');
  
  // Effect to set initial language when data loads
  React.useEffect(() => {
    if (allowedLanguages.length > 0 && !selectedLanguageId) {
      setSelectedLanguageId(allowedLanguages[0].language);
    }
  }, [allowedLanguages, selectedLanguageId]);
  
  if (isLoading) {
    return <div>Loading problem data...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!problem) {
    return <div>No problem data available</div>;
  }
  
  return (
    <div>
      <h1>{problem.title}</h1>
      <div className="flex gap-2">
        <span className="badge">{problem.difficulty}</span>
        {problem.tags?.map(tag => (
          <span key={tag.id} className="badge">{tag.name}</span>
        ))}
      </div>
      
      {/* Language Dropdown */}
      <div className="mt-4">
        <label className="block mb-2">Select Language:</label>
        <select 
          value={selectedLanguageId} 
          onChange={(e) => setSelectedLanguageId(e.target.value)}
          className="p-2 border rounded"
        >
          {allowedLanguages.map(lang => (
            <option key={lang.id} value={lang.language}>
              {/* Use the name from Judge0 if available, otherwise use the language ID */}
              {lang.name || `Language ${lang.language}`}
            </option>
          ))}
        </select>
      </div>
      
      {/* Show selected language details */}
      {selectedLanguageId && (
        <div className="mt-4 p-4 border rounded">
          <h3>Selected Language Details:</h3>
          <p>Language ID: {selectedLanguageId}</p>
          <p>Language Name: {
            judge0Languages?.find(l => String(l.id) === String(selectedLanguageId))?.name || 
            allowedLanguages.find(l => l.language === selectedLanguageId)?.name || 
            `Language ${selectedLanguageId}`
          }</p>
        </div>
      )}
      
      {/* Sample Test Cases */}
      <div className="mt-4">
        <h3>Sample Test Cases</h3>
        <div className="grid gap-4">
          {problem.sampleTestCases.map((testCase, index) => (
            <div key={testCase.id || index} className="p-4 border rounded">
              <div>
                <strong>Input:</strong> 
                <pre className="bg-gray-100 p-2 rounded">{testCase.input}</pre>
              </div>
              <div>
                <strong>Expected Output:</strong> 
                <pre className="bg-gray-100 p-2 rounded">{testCase.output}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 