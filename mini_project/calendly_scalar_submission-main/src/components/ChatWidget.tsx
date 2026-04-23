import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  ChevronDown,
  MoreHorizontal,
  Paperclip,
  Smile,
  Mic,
  ArrowUp,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
  error?: boolean;
}

// ── Gemini client — single module-level instances, never recreated ────────────
// gemini-2.5-flash: 15 RPM, 1500 RPD on free tier (best available free quota)
// Module scope = one client + one session for the whole page lifetime,
// immune to React re-renders and StrictMode double-invocations.
let _ai: GoogleGenAI | null = null;
let _chat: ReturnType<InstanceType<typeof GoogleGenAI>['chats']['create']> | null = null;
// Timestamp of the last completed request — enforces minimum gap between calls
let _lastCallAt = 0;
const MIN_CALL_GAP_MS = 4500; // ~13 RPM to stay safely under the 15 RPM free limit

function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('GEMINI_API_KEY is not set. Add your key to the .env file.');
    }
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

function getChat() {
  if (!_chat) {
    _chat = getAI().chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are Calendly's helpful AI assistant.
You help users with scheduling, managing meetings, setting availability,
understanding event types, and using Calendly features.
Be concise, friendly, and practical.
If asked something unrelated to scheduling or Calendly, politely redirect.`,
      },
    });
  }
  return _chat;
}

async function sendToGemini(text: string): Promise<string> {
  // Throttle: wait if we sent a request too recently
  const now = Date.now();
  const gap = now - _lastCallAt;
  if (gap < MIN_CALL_GAP_MS) {
    await new Promise((r) => setTimeout(r, MIN_CALL_GAP_MS - gap));
  }
  _lastCallAt = Date.now();
  const response = await getChat().sendMessage({ message: text });
  return response.text ?? '';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'bot',
  text: "Hi! I'm Calendly's AI chatbot. How can I help?",
  timestamp: new Date(),
};

const GifIcon = () => (
  <span className="text-[10px] font-black border border-current rounded px-0.5 leading-none select-none">
    GIF
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Synchronous in-flight guard — prevents double-sends from rapid keypresses
  // or React StrictMode double-invocations
  const inFlightRef = useRef(false);

  // Auto-scroll on new messages / typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const sendMessage = async () => {
    const text = input.trim();
    // inFlightRef is synchronous — blocks double-sends before state updates flush
    if (!text || inFlightRef.current) return;
    inFlightRef.current = true;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const reply = await sendToGemini(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      // Only reset the chat session on non-quota errors (quota errors are transient)
      const isQuota = err instanceof Error && (
        err.message.includes('429') ||
        err.message.includes('RESOURCE_EXHAUSTED') ||
        err.message.includes('quota')
      );
      if (!isQuota) _chat = null;

      let errMsg = 'Something went wrong. Please try again.';
      if (err instanceof Error) {
        if (isQuota) {
          const retryMatch = err.message.match(/retry in (\d+)/i);
          const retrySec = retryMatch ? parseInt(retryMatch[1]) : null;
          const retryHint = retrySec ? ` Try again in ~${retrySec}s.` : ' Try again shortly.';
          errMsg = `Free tier rate limit hit.${retryHint} Consider adding billing at aistudio.google.com.`;
          // Enforce the retry delay so the next message doesn't immediately 429 again
          if (retrySec) _lastCallAt = Date.now() + retrySec * 1000 - MIN_CALL_GAP_MS;
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errMsg = 'Model not available. Please check your API key and try again.';
        } else if (err.message.includes('API key') || err.message.includes('not set')) {
          errMsg = err.message;
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: errMsg,
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      inFlightRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasUnread = !isOpen && messages.length > 1;

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed bottom-[144px] md:bottom-[88px] right-4 md:right-6 z-50
                       w-[calc(100vw-2rem)] max-w-[380px]
                       bg-white rounded-2xl shadow-2xl border border-gray-200
                       flex flex-col overflow-hidden"
            style={{ height: 'min(580px, calc(100vh - 160px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100 shrink-0 bg-white">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Logo */}
              <div className="w-8 h-8 rounded-full bg-[#006BFF] flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M21.3333 10.6667C21.3333 10.6667 18.6667 8 14.6667 8C10.6667 8 8 10.6667 8 16C8 21.3333 10.6667 24 14.6667 24C18.6667 24 21.3333 21.3333 21.3333 21.3333" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M14.6667 13.3333C14.6667 13.3333 13.3333 12 12 12C10.6667 12 9.33333 13.3333 9.33333 16C9.33333 18.6667 10.6667 20 12 20C13.3333 20 14.6667 18.6667 14.6667 18.6667" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              <p className="flex-1 text-[15px] font-bold text-[#1a1a1a] truncate">
                Calendly Chatbot
              </p>

              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-[82%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words',
                      msg.role === 'user'
                        ? 'bg-[#006BFF] text-white rounded-br-sm'
                        : msg.error
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm flex items-start gap-2'
                        : 'bg-gray-100 text-[#1a1a1a] rounded-bl-sm'
                    )}
                  >
                    {msg.error && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    {msg.text}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 px-1">
                    {msg.role === 'bot'
                      ? `Calendly Chatbot • AI Agent • ${formatTime(msg.timestamp)}`
                      : formatTime(msg.timestamp)}
                  </p>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 px-1">
                    Calendly Chatbot • AI Agent
                  </p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-100 bg-white">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-[#006BFF] focus-within:ring-1 focus-within:ring-[#006BFF] transition-all">
                <textarea
                  ref={(el) => {
                    (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                    (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                  }}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  rows={1}
                  className="w-full px-4 pt-3 pb-1 bg-transparent text-[14px] text-[#1a1a1a] placeholder-gray-400 outline-none resize-none leading-relaxed"
                  style={{ maxHeight: '120px' }}
                />
                <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                  <div className="flex items-center gap-3 text-gray-400">
                    <button className="hover:text-gray-600 transition-colors" title="Attach file">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="hover:text-gray-600 transition-colors" title="Emoji">
                      <Smile className="w-4 h-4" />
                    </button>
                    <button className="hover:text-gray-600 transition-colors" title="GIF">
                      <GifIcon />
                    </button>
                    <button className="hover:text-gray-600 transition-colors" title="Voice message">
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      input.trim() && !isTyping
                        ? 'bg-[#006BFF] text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-tour="chat-fab"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-[#006BFF] text-white rounded-full shadow-lg flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="down"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasUnread && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </motion.button>
    </>
  );
};
