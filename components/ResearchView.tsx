
import React, { useState, useRef, useEffect } from 'react';
import { Message, ResearchOptions, AppView } from '../types';
import ChatBubble from './ChatBubble';
import { chatStream } from '../services/geminiService';
import { storage } from '../services/storageService';

const ResearchView: React.FC = () => {
  const conversationId = useRef(Date.now().toString());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'res-welcome',
      role: 'assistant',
      content: 'Deep Research mode activated. I can perform web searches and provide detailed analysis without the fluff.',
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [options, setOptions] = useState<ResearchOptions>({
    depth: 'quick',
    useSearch: true,
    useMaps: false
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    
    // Auto-save research session
    if (messages.length > 1) {
      storage.saveConversation({
        id: conversationId.current,
        title: messages.find(m => m.role === 'user')?.content.substring(0, 40) || 'New Research Session',
        view: AppView.RESEARCH,
        messages,
        updatedAt: Date.now()
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseStream = await chatStream(input, history, options);
      
      let assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        type: 'text',
        groundingUrls: []
      };

      setMessages(prev => [...prev, assistantMsg]);

      let fullText = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        const metadata = chunk.candidates?.[0]?.groundingMetadata;
        
        if (text) {
          fullText += text;
          setMessages(prev => {
            const last = [...prev];
            const updatedMsg = { ...last[last.length - 1], content: fullText };
            
            // Extract grounding URLs if available
            if (metadata?.groundingChunks) {
              const urls = metadata.groundingChunks
                .map((c: any) => c.web?.uri || c.maps?.uri)
                .filter(Boolean);
              if (urls.length > 0) {
                updatedMsg.groundingUrls = Array.from(new Set([...(updatedMsg.groundingUrls || []), ...urls]));
              }
            }
            
            last[last.length - 1] = updatedMsg;
            return last;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: 'Research failed. This might require a Pro API key for deep mode.',
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Research Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center gap-6 shadow-sm z-10">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['fast', 'quick', 'deep'] as const).map(d => (
            <button
              key={d}
              onClick={() => setOptions(prev => ({ ...prev, depth: d }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${options.depth === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              {d}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={options.useSearch} 
              onChange={e => setOptions(prev => ({ ...prev, useSearch: e.target.checked }))}
              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">Web Search</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={options.useMaps} 
              onChange={e => setOptions(prev => ({ ...prev, useMaps: e.target.checked }))}
              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">Google Maps</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12" ref={scrollRef}>
        <div className="max-w-4xl mx-auto">
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-2 items-center text-indigo-500 animate-pulse ml-12 mb-8">
              <i className="fas fa-search animate-bounce"></i>
              <span className="text-sm font-medium">REBRIGHT is researching...</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="What should I research for you today?"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          ></textarea>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white w-14 h-14 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-300 shadow-lg flex items-center justify-center transition-all"
          >
            <i className="fas fa-arrow-up text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
