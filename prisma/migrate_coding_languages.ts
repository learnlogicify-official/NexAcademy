import fetch from 'node-fetch';
import { prisma } from '../lib/prisma';

const JUDGE0_API_URL = 'http://128.199.24.150:2358/languages';

async function main() {
  // 1. Fetch Judge0 languages
  const res = await fetch(JUDGE0_API_URL);
  const data = await res.json();
  const judge0Languages = Array.isArray(data) ? data : data.languages || data.data || [];
  if (!Array.isArray(judge0Languages) || judge0Languages.length === 0) {
    throw new Error('Failed to fetch Judge0 languages');
  }

  // 2. Get all CodingQuestions
  const codingQuestions = await prisma.codingQuestion.findMany({
    include: { languageOptions: true }
  });

  let updatedCount = 0;

  for (const cq of codingQuestions) {
    // Build new languageOptions array
    const newLangOptions = judge0Languages.map(lang => {
      const existing = cq.languageOptions.find((opt: any) => String(opt.language) === String(lang.id));
      return {
        id: existing?.id || undefined, // Let Prisma create new if not present
        language: String(lang.id),
        solution: existing?.solution || '',
        preloadCode: existing?.preloadCode || '',
        name: lang.name,
        languageId: lang.id
      };
    });

    // Remove old options and add new
    await prisma.languageOption.deleteMany({ where: { codingQuestionId: cq.id } });
    for (const opt of newLangOptions) {
      await prisma.languageOption.create({
        data: {
          codingQuestionId: cq.id,
          language: opt.language,
          solution: opt.solution,
          preloadCode: opt.preloadCode,
        }
      });
    }
    updatedCount++;
  }

}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 