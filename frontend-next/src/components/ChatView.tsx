'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp, hostStartedChat } from '../context/AppContext';
import { timeAgo, avColor, initials, npr } from '../lib/constants';
import { compressImageFile } from '../lib/image-compress';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  Lock,
  CheckCircle2,
  Coins,
  ImagePlus,
  Handshake,
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
    sendCounter,
    acceptCounter,
    assignWorker,
    markChatRead,
    openSheet,
    setTab,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterInput, setCounterInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const job = chatCtx ? jobs.find((j) => j.id === chatCtx.jobId) : undefined;
  const bid = job && chatCtx ? job.bids.find((b) => b.id === chatCtx.bidId) : undefined;

  useEffect(() => {
    if (!chatCtx || !job || !bid) return;
    markChatRead(chatCtx.jobId, chatCtx.bidId, chatCtx.role);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatCtx, job, bid, bid?.chat.length, markChatRead]);

  if (!chatCtx || !job || !bid || !me) return null;

  const isHost = me.id === job.hostId;
  const otherId = isHost ? bid.workerId : job.hostId;
  const otherUser = userById(otherId);

  const isChatUnlocked =
    isHost ||
    hostStartedChat(bid, job.hostId) ||
    job.status === 'assigned' ||
    job.status === 'done';

  const isAssignedToThisBid = job.assignedBidId === bid.id;
  const isDeclined = bid.status === 'declined' || (job.status !== 'open' && !isAssignedToThisBid);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChatUnlocked || isDeclined) return;
    if (!input.trim()) return;
    sendChatMessage(job.id, bid.id, input);
    setInput('');
  };

  const handleCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(counterInput);
    if (!Number.isFinite(parsed) || parsed < 50) {
      showToast(t('min_price'));
      return;
    }
    sendCounter(job.id, bid.id, Math.round(parsed));
    setCounterInput('');
    setCounterOpen(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.75,
      });
      sendChatMessage(job.id, bid.id, '', compressedDataUrl);
    } catch (err) {
      console.error('[ChatView] Image attachment compression failed:', err);
      showToast(lang === 'ne' ? 'फोटो अपलोड गर्न सकिएन।' : 'Could not attach photo.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const translateSystemMessage = (rawKey: string, amount?: number): string => {
    const translated = t(rawKey);
    if (rawKey === 'price_agreed' && amount) {
      return `${translated}: ${npr(amount)}`;
    }
    return translated;
  };

  const quickReplies = [
    lang === 'ne' ? 'नमस्ते! कहिले सुरु गर्ने?' : 'Namaste! When can we start?',
    lang === 'ne' ? 'म तोकिएको ठेगानामा पुग्न तयार छु।' : 'I am ready to reach the location.',
    lang === 'ne' ? 'केही थप सामान आवश्यक पर्छ?' : 'Are any extra tools required?',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] md:h-[calc(100dvh-120px)] max-h-[760px] bg-[var(--surface)] rounded-2xl border border-[var(--line)] overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="flex items-center gap-3 p-3.5 border-b border-[var(--line)] bg-[var(--surface)] flex-none">
        <button
          type="button"
          onClick={() => setTab(chatCtx.role === 'host' ? 'jobs' : 'bids')}
          aria-label={t('back')}
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
          <p className="text-xs text-[var(--fg-muted)] truncate mt-0.5">{job.title}</p>
        </div>

        {/* Direct Phone Call Action (Only visible once task is assigned) */}
        {isAssignedToThisBid && otherUser?.phone && (
          <a
            href={`tel:${otherUser.phone}`}
            className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
            title={t('contact_call')}
            aria-label={t('contact_call')}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Task Price, Counter-Offer & Host Action Bar */}
      <div className="px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 flex-none">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[var(--fg-muted)]">
            {isAssignedToThisBid ? t('agreed_price') : t('offered_price')}:
          </span>
          <span className="font-mukta text-base font-black text-[var(--primary)]">
            {npr(bid.amount)}
          </span>
          {bid.counterAmount && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] font-bold text-xs border border-[var(--warning)]/30">
              {t('counter')}: {npr(bid.counterAmount)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'open' && !isDeclined && (
            <button
              type="button"
              onClick={() => {
                setCounterInput(String(bid.counterAmount || bid.amount));
                setCounterOpen((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)] text-xs font-bold text-[var(--fg)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('counter')}</span>
            </button>
          )}

          {isHost && job.status === 'open' && (
            <button
              type="button"
              onClick={() => assignWorker(job.id, bid.id)}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>{t('choose')}</span>
            </button>
          )}

          {isHost && job.status === 'assigned' && isAssignedToThisBid && (
            <button
              type="button"
              onClick={() => openSheet('workerReview', { jobId: job.id })}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--success)] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-opacity hover:opacity-90 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('mark_done')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Counter-Offer Form */}
      {counterOpen && job.status === 'open' && (
        <form
          onSubmit={handleCounterSubmit}
          className="px-4 py-2.5 bg-[var(--primary-soft)] border-b border-[var(--primary-border)] flex items-center gap-2 flex-none"
        >
          <input
            type="number"
            min={50}
            step={10}
            value={counterInput}
            onChange={(e) => setCounterInput(e.target.value)}
            placeholder={t('counter_ph')}
            className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--primary-border)] bg-[var(--surface)] text-sm font-bold text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold cursor-pointer"
          >
            {t('send_counter')}
          </button>
          <button
            type="button"
            onClick={() => setCounterOpen(false)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            {t('cancel')}
          </button>
        </form>
      )}

      {/* Safety Banner */}
      <div className="px-4 py-2 bg-[var(--primary-soft)] border-b border-[var(--primary)]/10 text-xs text-[var(--primary)] flex items-center justify-between flex-none">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-none" />
          <span>{isHost ? t('you_started') : t('poster_started')}</span>
        </div>
        <span className="font-bold hidden sm:inline">Halka Kaam Secure Chat</span>
      </div>

      {/* Message Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg)]">
        {/* Initial Pitch Card at Top of Thread */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-[var(--fg-muted)] font-bold mb-1">
            <span>{isHost ? otherUser?.name : t('your_pitch')}</span>
            <span className="font-mukta text-sm font-black text-[var(--primary)]">
              {npr(bid.amount)}
            </span>
          </div>
          <p className="text-[var(--fg)] leading-relaxed whitespace-pre-wrap break-words">
            {bid.pitch}
          </p>
        </div>

        {bid.chat.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--fg-muted)] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--primary)] flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-[var(--fg)]">
              {lang === 'ne' ? 'कुराकानी सुरु गर्नुहोस्' : 'Start the conversation'}
            </p>
            <p className="max-w-xs mx-auto text-xs">
              {lang === 'ne'
                ? 'समय, स्थान र कामको विवरण स्पष्ट गर्न यहाँ सन्देश पठाउन सक्नुहुन्छ।'
                : 'Clarify timing, exact location, and task requirements securely.'}
            </p>
          </div>
        ) : (
          bid.chat.map((msg, i) => {
            const isMe = msg.from === me.id;

            if (msg.kind === 'system') {
              return (
                <div key={i} className="flex justify-center my-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--success-soft)] border border-[var(--success-border)] text-[var(--success)] text-xs font-extrabold shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-none" />
                    <span>{translateSystemMessage(msg.text, msg.amount)}</span>
                  </div>
                </div>
              );
            }

            if (msg.kind === 'counter') {
              const isPendingCounter =
                job.status === 'open' && bid.counterAmount === msg.amount;
              const canAcceptCounter = isPendingCounter && !isMe;

              return (
                <div key={i} className="flex justify-center my-2.5">
                  <div className="w-full max-w-xs rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning)]/40 p-4 text-center shadow-xs">
                    <span className="text-xs font-bold text-[var(--warning)] uppercase tracking-wider block">
                      {isMe ? t('counter_waiting') : t('counter_from_poster')}
                    </span>
                    <strong className="font-mukta text-2xl font-black text-[var(--fg)] block my-1">
                      {npr(msg.amount || 0)}
                    </strong>
                    {canAcceptCounter && (
                      <button
                        type="button"
                        onClick={() => acceptCounter(job.id, bid.id)}
                        className="mt-2 w-full py-2 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                      >
                        {t('accept_price')}
                      </button>
                    )}
                    <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-[var(--fg-muted)]">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(msg.time)}</span>
                    </div>
                  </div>
                </div>
              );
            }

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
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt={t('photo')}
                      className="rounded-xl max-w-[220px] max-h-[260px] object-cover mb-1.5 border border-black/10"
                    />
                  )}
                  {msg.text && (
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-xs text-[var(--fg-muted)]">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo(msg.time)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Anti-Spam Gate or Closed Notice vs. Active Input Bar */}
      {isDeclined ? (
        <div className="p-3.5 bg-[var(--surface-2)] border-t border-[var(--line)] text-xs text-[var(--fg-muted)] flex items-center justify-center gap-2 flex-none font-semibold">
          <Lock className="w-4 h-4 text-[var(--fg-subtle)] flex-none" />
          <span>{t('chat_closed')}</span>
        </div>
      ) : !isChatUnlocked ? (
        <div className="p-3.5 bg-[var(--surface-2)] border-t border-[var(--line)] text-xs text-[var(--fg-muted)] flex items-start gap-2.5 flex-none leading-relaxed">
          <Lock className="w-4 h-4 text-[var(--primary)] flex-none mt-0.5" />
          <span>{t('chat_wait')}</span>
        </div>
      ) : (
        <>
          {/* Quick Replies */}
          <div className="px-3 pt-2 pb-1 bg-[var(--surface)] border-t border-[var(--line)] flex gap-1.5 overflow-x-auto no-scrollbar flex-none">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInput(reply)}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors whitespace-nowrap cursor-pointer flex-none border border-[var(--line)]"
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              title={t('photo')}
              aria-label={t('photo')}
              className="w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] flex items-center justify-center transition-colors cursor-pointer flex-none disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder={t('type_msg')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={t('send')}
              className="w-10 h-10 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer flex-none shadow-[var(--shadow-cta)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
