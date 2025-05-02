export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, history } = body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not set in environment variables.' }), { status: 500 });
  }

  // If history is provided and is an array, use it; otherwise, fallback to single prompt
  const messages = Array.isArray(history) && history.length > 0
    ? history.map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content }))
    : [{ role: 'user', content: prompt }];

  // Helper to call OpenAI
  async function callOpenAI(model: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
      }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  // Try gpt-4, fallback to gpt-3.5-turbo if needed
  let result = await callOpenAI('gpt-4');
  if (!result.ok && result.status === 404) {
    result = await callOpenAI('gpt-3.5-turbo');
  }

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.data.error?.message || 'OpenAI API error', details: result.data }), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (result.data.error) {
    return new Response(JSON.stringify({ error: result.data.error.message, details: result.data }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ result: result.data.choices?.[0]?.message?.content || 'No response' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 