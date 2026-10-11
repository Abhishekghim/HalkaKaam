'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { timeAgo, avColor, initials } from '../lib/constants';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    t,
    lang,
    me,
    jobs,
    chatCtx,
    userById,
    sendChatMessage,
    setTab,
  } = useApp();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatCtx]);

  if (!chatCtx) return null;

  const job = jobs.find((j) => j.id === chatCtx.jobId);
  const bid = job?.bids.find((b) => b.id === chatCtx.bidId);

  if (!job || !bid || !me) return null;

  const otherId = me.id === job.hostId ? bid.workerId : job.hostId;
  const otherUser = userById(otherId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(job.id, bid.id, input);
    setInput('');
  };

  const quickReplies = [
    lang === 'ne' ? 'नमस्ते! कहिले सुरु गर्ने?' : 'Namaste! When can we start?',
    lang === 'ne' ? 'म तोकिएको ठेगानामा पुग्न तयार छु।' : 'I am ready to reach the location.',
    lang === 'ne' ? 'केही थप सामान आवश्यक पर्छ?' : 'Are any extra tools required?',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] max-h-[750px] bg-[var(--surface)] rounded-2xl border border-[var(--line)] overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex items-center gap-3 p-3.5 border-b border-[var(--line)] bg-[var(--surface)] flex-none">
        <button
          type="button"
          onClick={() => setTab(chatCtx.role === 'host' ? 'jobs' : 'bids')}
          aria-label="Back to tasks"
          className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-none shadow-2xs"
          style={{ background: avColor(otherUser?.name) }}
        >
          {initials(otherUser?.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-sm text-[var(--fg)] truncate">
              {otherUser?.name || 'User'}
            </h3>
            {otherUser?.kycStatus === 'verified' && (
              <ShieldCheck className="w-4 h-4 text-[var(--primary)] flex-none" />
            )}
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] truncate mt-0.5">
            {job.title}
          </p>
        </div>

        {/* Quick Contact Buttons (if phone available) */}
        {otherUser?.phone && (
          <a
            href={`tel:${otherUser.phone}`}
            className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Safety Banner */}
      <div className="px-4 py-2 bg-[var(--primary-soft)] border-b border-[var(--primary)]/10 text-[11px] text-[var(--primary)] flex items-center justify-between flex-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-none" />
          <span>{chatCtx.role === 'host' ? t('you_started') : t('poster_started')}</span>
        </div>
        <span className="font-bold hidden sm:inline">Halka Kaam Secure Chat</span>
      </div>

      {/* Message Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg)]">
        {bid.chat.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--fg-muted)] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--primary)] flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-[var(--fg)]">
              {lang === 'ne' ? 'कुराकानी सुरु गर्नुहोस्' : 'Start the conversation'}
            </p>
            <p className="max-w-xs mx-auto text-[11px]">
              {lang === 'ne'
                ? 'समय, स्थान र कामको विवरण स्पष्ट गर्न यहाँ सन्देश पठाउन सक्नुहुन्छ।'
                : 'Clarify timing, exact location, and task requirements securely.'}
            </p>
          </div>
        ) : (
          bid.chat.map((msg, i) => {
            const isMe = msg.from === me.id;
            return (
              <div
                key={i}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[var(--primary)] text-white rounded-br-xs'
                      : 'bg-[var(--surface)] text-[var(--fg)] border border-[var(--line)] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[var(--fg-muted)]">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{timeAgo(msg.time)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-3 pt-2 pb-1 bg-[var(--surface)] border-t border-[var(--line)] flex gap-1.5 overflow-x-auto no-scrollbar flex-none">
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInput(reply)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors whitespace-nowrap cursor-pointer flex-none border border-[var(--line)]"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[var(--surface)] flex items-center gap-2 flex-none"
      >
        <input
          type="text"
          placeholder={t('type_msg')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer flex-none shadow-[var(--shadow-cta)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
