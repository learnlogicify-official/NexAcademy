"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { use, useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Check, Flag, Save, LayoutGrid, AlertTriangle, Code } from "lucide-react";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Custom styles for animations
import styles from "@/styles/test-page.module.css";

interface Section {
  id: string;
  title: string;
  questions: any[];
}

export default function AssessmentTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const router = useRouter();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attempt, setAttempt] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showQuestionNav, setShowQuestionNav] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mock function to track if a question is answered
  const isAnswered = (questionId: string) => {
    return !!answers[questionId];
  };

  // Mock function to set an answer
  const setAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  useEffect(() => {
    async function fetchAssessment() {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments/${id}?includeOrder=true`);
        if (!res.ok) throw new Error("Failed to fetch assessment");
        const data = await res.json();
        setAssessment(data);
      } catch (e) {
        setError("Could not load assessment");
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [id]);

  // Fetch attempt on mount (and restore answers/flags)
  useEffect(() => {
    if (!attemptId) return;
    fetch(`/api/attempts/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        setAttempt(data);
        if (data.answers) {
          if (data.answers.answers) setAnswers(data.answers.answers);
          if (data.answers.flags) setFlaggedQuestions(data.answers.flags);
        }
      })
      .catch(() => setAttempt(null));
  }, [attemptId]);

  // Persistent timer logic
  useEffect(() => {
    if (!attempt || !assessment) return;
    const durationSeconds = assessment.duration * 60;
    const startedAt = new Date(attempt.startedAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startedAt) / 1000);
    const initialRemaining = Math.max(durationSeconds - elapsed, 0);
    setRemainingTime(initialRemaining);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      const left = Math.max(durationSeconds - elapsed, 0);
      setRemainingTime(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, assessment]);

  // Use remainingTime for timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateToNextQuestion = () => {
    if (activeQuestionIdx < questions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
    } else if (activeSectionIdx < sections.length - 1) {
      setActiveSectionIdx(activeSectionIdx + 1);
      setActiveQuestionIdx(0);
    }
  };

  const navigateToPrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
    } else if (activeSectionIdx > 0) {
      setActiveSectionIdx(activeSectionIdx - 1);
      setActiveQuestionIdx(sections[activeSectionIdx - 1].questions.length - 1);
    }
  };

  // Debounced backend sync for answers and flaggedQuestions
  useEffect(() => {
    if (!attemptId) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, flags: flaggedQuestions })
      });
    }, 1500); // 1.5s debounce
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [answers, flaggedQuestions, attemptId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300">Loading assessment...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (!assessment) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-700 dark:text-gray-300">Assessment not found.</p>
      </div>
    </div>
  );

  const sections: Section[] = assessment.sections || [];
  const activeSection = sections[activeSectionIdx];
  const questions = activeSection?.questions || [];
  const activeQuestion = questions[activeQuestionIdx];
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
  const allQuestions = sections.flatMap(section => section.questions);
  const progressPercentage = Math.round((allQuestions.filter(q => isAnswered(q.id)).length / totalQuestions) * 100);
  const totalFlagged = Object.values(flaggedQuestions).filter(Boolean).length;
  const totalAnswered = allQuestions.filter(q => isAnswered(q.id)).length;
  const totalUnanswered = allQuestions.length - totalAnswered;

  // For MCQ, get options from question data (mock for now)
  const mcqOptions = activeQuestion?.type === "MCQ"
    ? [
        { id: "1", text: "Option 1" },
        { id: "2", text: "Option 2" },
        { id: "3", text: "Option 3" },
        { id: "4", text: "Option 4" },
      ]
    : [];

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    if (!attemptId) return;
    await fetch(`/api/attempts/${attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, flags: flaggedQuestions, finish: true })
    });
    const moduleId = assessment?.modules?.[0]?.id;
    setSubmitting(false);
    setShowSubmitModal(false);
    if (moduleId) {
      router.replace(`/modules/${moduleId}?tab=practice`);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Orbs background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-20 left-10 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-40 ${styles.animatePulseSlow}`}></div>
        <div className={`absolute bottom-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-40 ${styles.animatePulseSlow} ${styles.animationDelay2000}`}></div>
        <div className={`absolute top-1/3 right-1/4 w-80 h-80 bg-amber-200 dark:bg-amber-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-40 ${styles.animatePulseSlow} ${styles.animationDelay4000}`}></div>
      </div>
    
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-x-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">LIVE</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{assessment.name || assessment.title}</h1>
            </div>
            <div className="hidden md:flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                {activeSection?.title || 'Section'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Overall Progress */}
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 dark:bg-green-400 h-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{progressPercentage}%</span>
            </div>
            
            {/* Timer */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 scale-110 blur-sm ${styles.animatePulseSlow} opacity-70`}></div>
              <div className="relative flex items-center justify-center px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-red-500 dark:text-red-400 mr-1" />
                <span className={`font-mono text-sm font-semibold text-red-600 dark:text-red-400 ${styles.shadowGlow}`}>{formatTime(remainingTime ?? 0)}</span>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              className={`relative overflow-hidden px-4 py-1.5 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm transition-all duration-200 ease-out transform hover:scale-105 group ${styles.shine}`}
              onClick={handleSubmit}
            >
              <span className="relative z-10 flex items-center">
                <Save className="w-3.5 h-3.5 mr-1" />
                Submit
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left Sidebar */}
        {showQuestionNav && (
          <div className="fixed inset-y-0 right-0 z-20 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg transition-transform duration-300 ease-in-out transform md:translate-x-0 border-l border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col h-full pt-16">
              <div className="px-3 py-2 flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50">
                <button 
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowQuestionNav(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Question Navigator</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                {/* Sections Accordion */}
                <div className="px-3 space-y-2">
                  {sections.map((section, sectionIdx) => {
                    // Calculate section progress
                    const sectionQuestions = section.questions || [];
                    const answeredInSection = sectionQuestions.filter(q => isAnswered(q.id)).length;
                    const sectionProgress = sectionQuestions.length > 0 
                      ? Math.round((answeredInSection / sectionQuestions.length) * 100) 
                      : 0;
                    
                    const isActive = activeSectionIdx === sectionIdx;
                    
                    // Determine progress circle styles
                    let progressCircleStyles = "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ";
                    if (isActive) {
                      progressCircleStyles += "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400";
                    } else if (sectionProgress === 100) {
                      progressCircleStyles += "border-green-500 text-green-500 dark:border-green-400 dark:text-green-400";
                    } else {
                      progressCircleStyles += "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400";
                    }
                    
                    // Determine section button styles
                    let sectionButtonStyles = "w-full flex items-center justify-between p-2.5 text-left text-sm font-medium rounded-lg transition-colors ";
                    if (isActive) {
                      sectionButtonStyles += "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200";
                    } else {
                      sectionButtonStyles += "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                    }
                    
                    return (
                      <div key={section.id} className="rounded-lg overflow-hidden">
                        <button
                          className={sectionButtonStyles}
                          onClick={() => {
                            setActiveSectionIdx(sectionIdx);
                            setActiveQuestionIdx(0);
                          }}
                        >
                          <div className="flex flex-col">
                            <span>{section.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {answeredInSection}/{sectionQuestions.length} questions answered
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={progressCircleStyles}>
                              {sectionProgress}%
                            </div>
                          </div>
                        </button>
                        
                        {/* Questions Grid for Active Section */}
                        {isActive && (
                          <div className="mt-2 mb-3 pl-2 pr-1">
                            <div className="grid grid-cols-5 gap-1.5">
                              {sectionQuestions.map((q, qIdx) => {
                                let questionButtonStyles = "aspect-square rounded-md flex items-center justify-center text-xs font-medium relative ";
                                if (activeQuestionIdx === qIdx && activeSectionIdx === sectionIdx) {
                                  questionButtonStyles += "bg-blue-600 dark:bg-blue-700 text-white shadow-sm";
                                } else if (isAnswered(q.id)) {
                                  questionButtonStyles += "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/50";
                                } else {
                                  questionButtonStyles += "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50";
                                }
                                
                                return (
                                  <button
                                    key={q.id}
                                    className={questionButtonStyles}
                                    onClick={() => {
                                      setActiveSectionIdx(sectionIdx);
                                      setActiveQuestionIdx(qIdx);
                                    }}
                                  >
                                    {isAnswered(q.id) && <Check className="absolute top-0.5 right-0.5 h-2 w-2" />}
                                    {flaggedQuestions[q.id] && <Flag className="absolute bottom-0.5 right-0.5 h-2 w-2 text-amber-500" />}
                                    {qIdx + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 px-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall Progress</h3>
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 dark:bg-green-400 h-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{totalAnswered} answered</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{totalQuestions} questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showQuestionNav && (
          <button
            className="fixed top-20 right-4 z-20 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowQuestionNav(true)}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        )}

        {/* Main Content Area with Resizable Panels */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${showQuestionNav ? 'md:mr-64' : 'mr-0'}`}>
          <PanelGroup direction="horizontal" className="h-full">
            {/* Left Panel: Question Content */}
            <Panel minSize={30} defaultSize={50} className="overflow-hidden">
              <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm overflow-y-auto">
                <div className="p-4 md:p-6 max-w-3xl mx-auto">
                  <div className="mb-4 flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Question {activeQuestionIdx + 1}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {activeQuestion?.type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50">
                            {activeQuestion.type}
                          </span>
                        )}
                        {typeof activeQuestion?.marks !== 'undefined' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/50">
                            {activeQuestion.marks} mark{activeQuestion.marks !== 1 ? 's' : ''}
                          </span>
                        )}
                        {activeQuestion?.difficulty && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700/50">
                            {activeQuestion.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className={`flex items-center text-xs ${flaggedQuestions[activeQuestion?.id] ? 'text-amber-900 dark:text-amber-200 font-bold' : 'text-amber-600 dark:text-amber-400'} hover:text-amber-700 dark:hover:text-amber-300`}
                      onClick={() => toggleFlag(activeQuestion?.id)}
                    >
                      <Flag className={`h-3 w-3 mr-1 ${flaggedQuestions[activeQuestion?.id] ? 'fill-amber-400 text-amber-600 dark:fill-amber-300 dark:text-amber-200' : ''}`} />
                      {flaggedQuestions[activeQuestion?.id] ? 'Unflag' : 'Flag for review'}
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-5 text-gray-700 dark:text-gray-200 break-words whitespace-pre-line shadow-sm border border-gray-100 dark:border-gray-700">
                    <p>
                      {activeQuestion?.text}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
            
            {/* Resize Handle */}
            <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500/50 dark:hover:bg-blue-600/50 transition-colors cursor-col-resize flex items-center justify-center">
              <div className="h-10 flex flex-col justify-center items-center space-y-1">
                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
              </div>
            </PanelResizeHandle>
            
            {/* Right Panel: Answer Interface */}
            <Panel minSize={30} defaultSize={50} className="overflow-hidden">
              <div className="h-full bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
                <div className="p-4 md:p-6 max-w-3xl mx-auto">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    {activeQuestion?.type === "MCQ" ? (
                      <>
                        <span className="inline-block w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2 text-xs">
                          <Check className="w-3 h-3" />
                        </span>
                        Select the Correct Answer
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 flex items-center justify-center mr-2 text-xs">
                          <Code className="w-3 h-3" />
                        </span>
                        Your Solution
                      </>
                    )}
                  </h3>
                  
                  {activeQuestion?.type === "MCQ" ? (
                    <div className="space-y-2">
                      {(activeQuestion.options || []).map((opt: any, idx: number) => (
                        <label
                          key={opt.id || idx}
                          className={`group block relative rounded-lg transition-all duration-200 cursor-pointer overflow-hidden
                            ${answers[activeQuestion?.id] === opt.id 
                              ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900' 
                              : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="mcq-answer"
                            value={opt.id}
                            checked={answers[activeQuestion?.id] === opt.id}
                            onChange={() => setAnswer(activeQuestion?.id, opt.id)}
                            className="peer sr-only"
                          />
                          
                          <div className="p-4 flex items-start gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors
                              ${answers[activeQuestion?.id] === opt.id 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                              }
                            `}>
                              {answers[activeQuestion?.id] === opt.id && <Check className="w-3 h-3" />}
                            </div>
                            
                            <div className="flex-1">
                              <span className="text-sm text-gray-900 dark:text-white font-medium break-words whitespace-pre-line">
                                {opt.text}
                              </span>
                            </div>
                          </div>
                          
                          {/* Visual selection indicator */}
                          {answers[activeQuestion?.id] === opt.id && (
                            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 dark:bg-blue-400"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-xs border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          </div>
                          <div className="text-[10px] uppercase tracking-wider opacity-50">code.js</div>
                        </div>
                        <pre className="text-gray-900 dark:text-gray-200">function solution() {
  // Your code here
}</pre>
                      </div>
                      
                      <textarea 
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[12rem] resize-y"
                        placeholder="Type your solution here..."
                        value={answers[activeQuestion?.id] || ""}
                        onChange={(e) => setAnswer(activeQuestion?.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1.5 transition-colors"
            onClick={navigateToPrevQuestion}
            disabled={activeSectionIdx === 0 && activeQuestionIdx === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          
          {/* Progress indicator instead of numbered buttons */}
          <div className="hidden md:block w-1/3 max-w-xs">
            <div className="relative h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(((activeSectionIdx * questions.length) + activeQuestionIdx + 1) / totalQuestions) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{Math.round((((activeSectionIdx * questions.length) + activeQuestionIdx + 1) / totalQuestions) * 100)}%</span>
              <span>Question {(activeSectionIdx * questions.length) + activeQuestionIdx + 1} of {totalQuestions}</span>
            </div>
          </div>
          
          <button
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm flex items-center gap-1.5 transition-colors"
            onClick={navigateToNextQuestion}
            disabled={activeSectionIdx === sections.length - 1 && activeQuestionIdx === questions.length - 1}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review & Submit Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="font-medium text-lg">Answered</div>
                <div className="text-green-600 font-bold text-2xl">{totalAnswered}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg">Unanswered</div>
                <div className="text-red-600 font-bold text-2xl">{totalUnanswered}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-lg">Flagged for Review</div>
                <div className="text-amber-500 font-bold text-2xl">{totalFlagged}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">You can still go back and review your answers before final submission.</div>
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium mr-2"
              onClick={() => setShowSubmitModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={handleConfirmSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm Submit"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 