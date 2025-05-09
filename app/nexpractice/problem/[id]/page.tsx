import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProblemClientPage from "./ProblemClientPage"

interface ProblemPageProps {
  params: { id: string }
}

export default async function CodeChallenge({ params }: ProblemPageProps) {
  // Ensure params is properly awaited by explicitly extracting the id
  const id = params.id;
  
  // Fetch coding question and related data by questionId (not id)
  const codingQuestion = await prisma.codingQuestion.findUnique({
    where: { questionId: id },
    include: {
      question: true,
      languageOptions: true,
      testCases: true,
      tags: true,
    },
  })
  if (!codingQuestion) return notFound()

  // You may want to select a default language and code from languageOptions
  const defaultLanguage = codingQuestion.defaultLanguage || codingQuestion.languageOptions[0]?.language || "JavaScript"
  // Ensure preloadCode is always a string
  const preloadCode = codingQuestion.languageOptions.find(l => l.language === defaultLanguage)?.preloadCode || ''

  // Fix type: convert all preloadCode nulls to '' in languageOptions
  const safeCodingQuestion = {
    ...codingQuestion,
    languageOptions: codingQuestion.languageOptions.map(l => ({ ...l, preloadCode: l.preloadCode || '' }))
  }

  return (
    <ProblemClientPage
      codingQuestion={safeCodingQuestion}
      defaultLanguage={defaultLanguage}
      preloadCode={preloadCode}
    />
  )
}
