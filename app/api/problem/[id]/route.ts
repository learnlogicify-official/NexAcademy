import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch coding question from database
    const question = await prisma.question.findUnique({
      where: {
        id: id,
      },
      include: {
        codingQuestion: {
          include: {
            tags: true,
            testCases: true,
            languageOptions: true
          }
        }
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Format response similar to the sample problem data structure
    const formattedProblem = {
      id: question.id,
      number: 1, // Default value, adjust as needed
      title: question.name,
      difficulty: question.codingQuestion?.difficulty || 'MEDIUM',
      tags: question.codingQuestion?.tags.map(tag => tag.name) || [],
      level: 1, // Default value, adjust as needed
      description: question.codingQuestion?.questionText || '',
      inputFormat: '', // Not directly available in db structure
      outputFormat: '', // Not directly available in db structure
      constraints: [], // Not directly available in db structure
      sampleTestCases: question.codingQuestion?.testCases
        .filter(test => test.isSample)
        .map(test => ({
          id: test.id,
          input: test.input,
          expectedOutput: test.output,
          status: 'pending'
        })) || [],
      hiddenTestCases: question.codingQuestion?.testCases
        .filter(test => test.isHidden)
        .map(test => ({
          id: test.id,
          input: test.input,
          expectedOutput: test.output,
          status: 'pending'
        })) || [],
      starterCode: question.codingQuestion?.languageOptions[0]?.preloadCode || '',
      solution: question.codingQuestion?.languageOptions[0]?.solution || '',
      explanation: '', // Not directly available in db structure
      xpReward: 10, // Default value, adjust as needed
    };

    return NextResponse.json(formattedProblem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    );
  }
} 