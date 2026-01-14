
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppView } from '../types';
import ChatBubble from './ChatBubble';
import { chatStream } from '../services/geminiService';
import { storage } from '../services/storageService';

const ChatView: React.FC = () => {
  const conversationId = useRef(Date.now().toString());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hey! 👋 I\'m REBRIGHT.ai. How can I help you today?',
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    
    // Auto-save conversation to history
    if (messages.length > 1) {
      storage.saveConversation({
        id: conversationId.current,
        title: messages.find(m => m.role === 'user')?.content.substring(0, 40) || 'New Conversation',
        view: AppView.CHAT,
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
      const responseStream = await chatStream(input, history);
      
      let assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMsg]);

      let fullText = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const last = [...prev];
            last[last.length - 1] = { ...assistantMsg, content: fullText };
            return last;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: 'I hit a snag. Please check your connection or API key.',
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12" ref={scrollRef}>
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-2 items-center text-gray-400 animate-pulse ml-12">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
            <button 
              onClick={startVoiceRecognition}
              className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-200 text-gray-500'}`}
              title="Voice Input"
            >
              <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-alt'} text-lg`}></i>
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything... (Hinglish supported)"
              className="flex-1 bg-transparent border-none outline-none py-3 px-1 text-gray-700 resize-none max-h-48 scrollbar-hide"
            ></textarea>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
            >
              <i className="fas fa-paper-plane text-lg"></i>
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-3 font-medium tracking-wide">
            REBRIGHT.ai may provide info about people and events. Verify if it's critical.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
