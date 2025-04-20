import React, { useState } from 'react';

const EditQuestionModal: React.FC<{
  question?: any;
  onSave: (question: any) => void;
  onClose: () => void;
  questionType: string;
  content: string;
  options: string[];
  correctAnswer: string;
  singleAnswer: boolean;
  shuffleAnswers: boolean;
  hidden: boolean;
  marks: number;
  selectedFolderId: string;
}> = ({
  question,
  onSave,
  onClose,
  questionType,
  content,
  options,
  correctAnswer,
  singleAnswer,
  shuffleAnswers,
  hidden,
  marks,
  selectedFolderId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const questionData = {
        type: questionType,
        folderId: selectedFolderId,
        question: content,
        options: questionType === 'MCQ' ? options : undefined,
        correctAnswer: questionType === 'MCQ' ? correctAnswer : undefined,
        status,
        singleAnswer: questionType === 'MCQ' ? singleAnswer : undefined,
        shuffleAnswers: questionType === 'MCQ' ? shuffleAnswers : undefined,
        hidden,
        marks: marks || 1,
      };

      let response;
      if (question) {
        // Update existing question
        response = await fetch(`/api/questions/${question.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
      } else {
        // Create new question
        response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save question');
      }

      const savedQuestion = await response.json();
      onSave(savedQuestion);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default EditQuestionModal; 