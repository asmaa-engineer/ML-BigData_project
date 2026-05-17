import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, CornerDownLeft, Sparkles, Cpu } from 'lucide-react';
import { useAppStore } from '@/store';
import { copilotChat } from '@/services/aiService';
import type { AISource } from '@/lib/contracts';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  source?: AISource;
};

const quickPrompts = [
  'لخص المشروع',
  'أكثر المنتجات مبيعًا',
  'أعلى المنتجات في العيوب',
  'ترتيب خطوط الإنتاج',
  'وضع الـ ML',
  'وضع الـ Big Data',
  '3 توصيات تشغيلية',
];

export default function AICopilotView() {
  const { sales, quality } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `أهلًا، أنا مساعد العرض والمناقشة. عندي سياق عن ${sales.length} سجل مبيعات و${quality.length} فحص جودة. أقدر أساعدك في التحليل أو أجهز لك إجابات المناقشة الجاهزة مثل: لخص المشروع، وضع الـ ML، وضع الـ Big Data، أو أهم النتائج.`,
      source: 'fallback',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendPrompt = async (userMsg: string) => {
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await copilotChat(userMsg, {
        salesCount: sales.length,
        qualityCount: quality.length,
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text || "لم أتمكن من معالجة الطلب.",
        source: response.source,
      }]);
    } catch (error: any) {
       console.error("AI Error:", error);
       const message = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
         ? "تم تجاوز حد استخدام خدمة الذكاء الاصطناعي الحالية. حاول مرة أخرى لاحقًا."
         : "تعذر الوصول لخدمة الذكاء الاصطناعي أو الشبكة الآن. يمكنك إعادة المحاولة، أو متابعة التحليل من الصفحات الأخرى.";
       setMessages(prev => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    await sendPrompt(userMsg);
  };
  
  const generateRecommendations = async () => {
    await sendPrompt('3 توصيات تشغيلية');
  };

  return (
    <div className="h-full flex flex-col gap-3 md:grid md:grid-cols-12 md:grid-rows-6">

      <Card className="col-span-12 md:col-span-12 row-span-6 flex flex-col relative overflow-hidden bg-slate-900/80 border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 relative z-10 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-indigo-400" />
              <CardTitle className="text-indigo-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                AI Copilot
              </CardTitle>
            </div>
            <p className="text-[10px] text-slate-500">اسأل عن بيانات المبيعات وجودة الإنتاج</p>
          </div>
          <Button onClick={generateRecommendations} variant="outline" size="sm" className="gap-2 shrink-0">
            <Sparkles className="size-3 text-emerald-400" />
            توصيات سريعة
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col relative z-10 min-h-0">
          <div className="px-4 pt-4 flex flex-wrap gap-2 border-b border-slate-800/40">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => void sendPrompt(prompt)}
                disabled={loading}
                className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`size-8 rounded-full flex shrink-0 items-center justify-center ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                  {m.role === 'user' ? <User className="size-4 text-white" /> : <Bot className="size-4 text-indigo-300" />}
                </div>
                <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-800 border border-slate-700 rounded-tl-none shadow-sm'}`}>
                   {m.role === 'assistant' && m.source && (
                     <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                        {m.source === 'gemini' ? <Sparkles className="size-3 text-indigo-300" /> : <Cpu className="size-3 text-amber-300" />}
                        <span>{m.source === 'gemini' ? 'AI mode' : 'Fallback mode'}</span>
                     </div>
                   )}
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                 <div className="size-8 rounded-full flex shrink-0 items-center justify-center bg-slate-800 border border-slate-700">
                    <Bot className="size-4 text-indigo-300 animate-pulse" />
                 </div>
                 <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-1">
                    <div className="size-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="size-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="size-1.5 bg-slate-500 rounded-full animate-bounce" />
                 </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل المساعد الذكي..." 
                  className="w-full flex h-12 rounded-full border border-slate-700 bg-slate-800 pr-12 pl-5 text-sm shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100 placeholder:text-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                   className="absolute right-1 top-1 bottom-1 w-10 flex flex-col justify-center items-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-50 transition-colors shrink-0"
                >
                   <CornerDownLeft className="size-4" />
                </button>
             </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
