
import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
          isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
        }`}>
          <i className={`fas ${isUser ? 'fa-user' : 'fa-robot'} text-xs`}></i>
        </div>
        
        <div className={`rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
        }`}>
          {message.type === 'text' && (
            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {message.content}
            </div>
          )}

          {message.type === 'image' && message.mediaUrl && (
            <div className="space-y-3">
              <img src={message.mediaUrl} className="rounded-lg max-w-full shadow-md" alt="AI Generated" />
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {message.type === 'video' && message.mediaUrl && (
            <div className="space-y-3">
              <video src={message.mediaUrl} controls className="rounded-lg max-w-full shadow-md" />
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {message.groundingUrls && message.groundingUrls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider opacity-60">Sources</p>
              <div className="flex flex-wrap gap-2">
                {message.groundingUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs bg-gray-50 hover:bg-gray-100 text-indigo-600 px-2 py-1 rounded transition-colors truncate max-w-[200px] border border-transparent hover:border-indigo-100">
                    {new URL(url).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
