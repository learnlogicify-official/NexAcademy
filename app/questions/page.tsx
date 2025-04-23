'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/types';
import QuestionRow from '@/components/QuestionRow';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import QuestionsTable from '@/components/QuestionsTable';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [allExpanded, setAllExpanded] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questions?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data.questions);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, limit]);

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedQuestions(new Set());
      setExpandedSubcategories(new Set());
    } else {
      setExpandedQuestions(new Set(questions.map(q => q.id)));
      setExpandedSubcategories(new Set(questions.map(q => q.subCategoryId).filter(Boolean)));
    }
    setAllExpanded(!allExpanded);
  };

  const handleQuestionToggle = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
    setAllExpanded(newExpanded.size === questions.length);
  };

  const handleSubcategoryToggle = (subcategoryId: string, subcategoryQuestions: Question[]) => {
    const newExpanded = new Set(expandedSubcategories);
    const newQuestionExpanded = new Set(expandedQuestions);

    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
      subcategoryQuestions.forEach(q => newQuestionExpanded.delete(q.id));
    } else {
      newExpanded.add(subcategoryId);
      subcategoryQuestions.forEach(q => newQuestionExpanded.add(q.id));
    }

    setExpandedSubcategories(newExpanded);
    setExpandedQuestions(newQuestionExpanded);
    setAllExpanded(newQuestionExpanded.size === questions.length);
  };

  const questionsBySubcategory = questions.reduce((acc, question) => {
    const subcategoryId = question.subCategoryId || 'uncategorized';
    if (!acc[subcategoryId]) {
      acc[subcategoryId] = [];
    }
    acc[subcategoryId].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Question
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <QuestionsTable 
            questions={questions} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            page={page}
            limit={limit}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
      <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-4 bg-muted/30">
              <span className="font-medium">
                {totalItems} Questions
              </span>
            </div>
        {Object.entries(questionsBySubcategory).map(([subcategoryId, subcategoryQuestions]) => (
          <div key={subcategoryId} className="border-b last:border-b-0">
            {subcategoryId !== 'uncategorized' && (
              <div className="flex items-center gap-2 p-4 bg-muted/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSubcategoryToggle(subcategoryId, subcategoryQuestions)}
                  className="h-8 w-8"
                >
                  {expandedSubcategories.has(subcategoryId) ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </Button>
                <span className="font-medium">
                  {subcategoryQuestions[0].subCategory?.name || 'Uncategorized'}
                </span>
              </div>
            )}
            {subcategoryQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                isExpanded={expandedQuestions.has(question.id)}
                onToggle={() => handleQuestionToggle(question.id)}
              />
            ))}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
} 