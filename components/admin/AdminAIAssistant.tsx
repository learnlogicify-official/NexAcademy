"use client"
import { useState, useRef, useEffect } from 'react';
import { Bot, X, User as UserIcon, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AdminAIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setError('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/openai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          history: newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setMessages([...newMessages, { role: 'assistant' as const, content: data.result }]);
    } catch (e) {
      setError('Failed to contact AI assistant.');
    }
    setLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Bot Icon Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}
      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[90vw] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white font-bold">
              <Bot className="h-5 w-5" />
              Admin AI Assistant
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-slate-200 p-1 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-900" style={{ minHeight: 200, maxHeight: 350 }}>
            {messages.length === 0 && (
              <div className="text-xs text-slate-400 text-center mt-8">How can I help you today?</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`rounded-full bg-blue-600/90 text-white flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-400' : 'bg-blue-600'} w-7 h-7`}>
                    {msg.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-sm whitespace-pre-line shadow ${msg.role === 'user' ? 'bg-gray-200 dark:bg-slate-700 text-right' : 'bg-blue-100 dark:bg-blue-900 text-left'}`}>{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="rounded-full bg-blue-600 text-white flex items-center justify-center w-7 h-7">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="rounded-lg px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 shadow animate-pulse flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <textarea
              className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white min-h-[40px] resize-none"
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
            {error && <div className="text-red-500 mt-2 text-xs">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
} 