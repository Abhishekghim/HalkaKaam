'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { timeAgo } from '../lib/constants';

export const ChatView: React.FC = () => {
  const {
    t,
    me,
    jobs,
    chatCtx,
    userById,
    sendChatMessage,
    setTab,
  } = useApp();

  const [input, setInput] = useState('');

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

  return (
    <div className="chatwrap">
      <div className="backrow">
        <button
          className="backbtn"
          onClick={() => setTab(chatCtx.role === 'host' ? 'jobs' : 'bids')}
        >
          ‹
        </button>
        <div>
          <h2>{otherUser?.name || 'Chat'}</h2>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--slate)' }}>
            {job.title}
          </div>
        </div>
      </div>

      <div className="chatnote">
        {chatCtx.role === 'host' ? t('you_started') : t('poster_started')}
      </div>

      <div className="chatlog">
        {bid.chat.map((msg, i) => {
          const isMe = msg.from === me.id;
          return (
            <div key={i} className={`bubble ${isMe ? 'me' : 'them'}`}>
              <div>{msg.text}</div>
              <span className="tm">{timeAgo(msg.time)}</span>
            </div>
          );
        })}
      </div>

      <form className="chatbar" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={t('type_msg')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
};

