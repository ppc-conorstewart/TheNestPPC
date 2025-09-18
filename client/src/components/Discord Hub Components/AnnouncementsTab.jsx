// ==============================
// FILE: client/src/components/Discord Hub Components/AnnouncementsTab.jsx
// Sections: Imports • Constants • Component (fetch channels) • Layout
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveApiUrl, resolveBotUrl } from '../../api';

const EMOJI_SET = ['🔥','✅','⚠️','📌','🛠️','🗓️','⏰','🏁','📣','🤝','✨','🔁'];

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const messageRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState('');
  const [schedule, setSchedule] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const [templates, setTemplates] = useState([
    { id: 'shift-change', name: 'Shift Change', title: 'Shift Handover', message: 'Please review the handover notes and acknowledge with ✅.' },
    { id: 'safety-tip', name: 'Daily Safety Tip', title: 'Safety Tip', message: 'Wear appropriate PPE and perform a pre-job hazard assessment.' }
  ]);
  const [templateSearch, setTemplateSearch] = useState('');

  const getBotKey = () => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage?.getItem('bot_key');
      if (stored) return stored;
    }
    return process.env.REACT_APP_BOT_KEY || 'Paloma2025*';
  };

  useEffect(() => {
    let cancelled = false;
    const loadChannels = async () => {
      const resolvedDirect = resolveBotUrl('/channels');
      const directUrl = resolvedDirect && /^https?:\/\//i.test(resolvedDirect) ? resolvedDirect : '';
      const fallbackUrl = resolveApiUrl('/api/discord/channels');
      const botKey = getBotKey();

      const attempt = async (url, options) => {
        if (!url) return null;
        try {
          const res = await fetch(url, options);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return Array.isArray(data) ? data : null;
        } catch (err) {
          console.warn('Failed to load Discord channels from', url, err);
          return null;
        }
      };

      const headers = botKey ? { 'x-bot-key': botKey } : undefined;
      let list = await attempt(directUrl, directUrl ? { headers } : undefined);
      if (!list) list = await attempt(fallbackUrl);
      if (!cancelled && Array.isArray(list)) setChannels(list);
    };

    loadChannels();
    return () => { cancelled = true; };
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(t => (t.name + ' ' + t.title + ' ' + t.message).toLowerCase().includes(q));
  }, [templateSearch, templates]);

  const handleFileUpload = e => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files.map(f => f.name)]);
  };

  const handleAddAnnouncement = () => {
    if (!title || !message || !channelId) return;
    const ch = channels.find(c => c.id === channelId);
    const newItem = {
      id: Date.now(),
      title,
      message,
      channel: ch ? `#${ch.name}` : '',
      schedule,
      recurrence,
      attachments
    };
    setAnnouncements([newItem, ...announcements]);
    setTitle('');
    setMessage('');
    setChannelId('');
    setSchedule('');
    setRecurrence('none');
    setAttachments([]);
  };

  const handleSaveTemplate = () => {
    const name = title || 'Untitled Template';
    const id = `tpl-${Date.now()}`;
    setTemplates([...templates, { id, name, title: title || '', message: message || '' }]);
  };

  const applyTemplate = tpl => {
    setTitle(tpl.title);
    setMessage(tpl.message);
  };

  const applyMarkdown = (syntaxBefore, syntaxAfter = '') => {
    const el = messageRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const val = el.value || '';
    const selected = val.slice(start, end);
    const before = val.slice(0, start);
    const after = val.slice(end);
    const insert = `${syntaxBefore}${selected}${syntaxAfter}`;
    const next = `${before}${insert}${after}`;
    setMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + syntaxBefore.length, start + insert.length - syntaxAfter.length);
    });
  };

  const insertEmoji = emo => {
    const el = messageRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = message.slice(0, start);
    const after = message.slice(end);
    const next = `${before}${emo}${after}`;
    setMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emo.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSendNow = async () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    const contentParts = [];
    if (trimmedTitle) contentParts.push(`**${trimmedTitle}**`);
    if (trimmedMessage) contentParts.push(trimmedMessage);
    const content = contentParts.join('\n');

    if (!channelId || !content) {
      setSendStatus({ type: 'error', note: 'Select a channel and add a title or message before sending.' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    const channel = channels.find(ch => ch.id === channelId);
    const apiUrl = resolveApiUrl('/api/discord/announce');
    const resolvedDirect = resolveBotUrl('/announce');
    const directUrl = resolvedDirect && /^https?:\/\//i.test(resolvedDirect) ? resolvedDirect : '';
    const botKey = getBotKey();

    const errors = [];

    const attemptServer = async () => {
      if (!apiUrl) throw new Error('Missing API endpoint');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelIds: [channelId], content })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`API ${res.status} ${detail}`.trim());
      }
      return res.json().catch(() => ({}));
    };

    const attemptDirect = async () => {
      if (!directUrl) throw new Error('Missing direct bot service URL');
      const headers = { 'Content-Type': 'application/json' };
      if (botKey) headers['x-bot-key'] = botKey;
      const res = await fetch(directUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ channelId, message: content })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Bot ${res.status} ${detail}`.trim());
      }
      return res.json().catch(() => ({}));
    };

    try {
      await attemptServer();
      setSendStatus({ type: 'success', note: `Message sent to #${channel?.name || 'channel'}.` });
    } catch (firstErr) {
      errors.push(firstErr);
      try {
        await attemptDirect();
        setSendStatus({ type: 'success', note: `Message sent via bot to #${channel?.name || 'channel'}.` });
      } catch (directErr) {
        errors.push(directErr);
        const last = errors[errors.length - 1];
        setSendStatus({ type: 'error', note: last?.message || 'Failed to send message.' });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className='grid grid-cols-3 gap-6'>
      {/* ================= Left: Queue ================= */}
      <div className='col-span-1 bg-black/50 backdrop-blur-md border border-[#6a7257]/60 rounded-xl shadow-lg p-5'>
        <h2 className='text-lg font-bold uppercase mb-4 text-white tracking-wide border-b border-[#6a7257]/40 pb-2'>
          Scheduled Queue
        </h2>
        <div className='space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar'>
          {announcements.length === 0 && (
            <div className='text-sm text-white/50 italic'>No announcements scheduled yet.</div>
          )}
          {announcements.map(item => (
            <div
              key={item.id}
              className='bg-gradient-to-br from-black/70 to-[#6a7257]/10 border border-[#6a7257]/40 rounded-lg p-4 hover:border-[#6a7257] transition transform hover:scale-[1.02]'
            >
              <div className='text-white font-bold text-sm mb-1'>{item.title}</div>
              <div className='text-xs text-white/70 mb-1'>{item.channel || 'No Channel Selected'}</div>
              <div className='text-xs text-white/60'>
                {item.schedule ? new Date(item.schedule).toLocaleString() : 'No schedule set'}
                {item.recurrence !== 'none' ? ` • ${item.recurrence.toUpperCase()}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Middle: Composer ================= */}
      <div className='col-span-1 bg-black/50 backdrop-blur-md border border-[#6a7257]/60 rounded-xl shadow-lg p-5'>
        <h2 className='text-lg font-bold uppercase mb-4 text-white tracking-wide border-b border-[#6a7257]/40 pb-2'>
          Compose Announcement
        </h2>

        {/* ===== Templates Row ===== */}
        <div className='mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <input
              type='text'
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
              placeholder='Search templates...'
              className='flex-1 bg-black/70 border border-[#6a7257]/40 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:border-[#b0b79f] outline-none'
            />
            <button
              onClick={handleSaveTemplate}
              className='bg-[#6a7257] text-black font-bold uppercase text-xs px-3 py-2 rounded-lg hover:opacity-90 transition'
            >
              Save as Template
            </button>
          </div>
          <div className='flex gap-2 overflow-x-auto'>
            {filteredTemplates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className='shrink-0 bg-black/70 border border-[#6a7257]/40 hover:border-[#6a7257] text-white text-xs px-3 py-2 rounded-lg transition'
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Title ===== */}
        <input
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='Title'
          className='bg-black/70 border border-[#6a7257]/40 rounded-lg px-4 py-2 text-white text-sm focus:border-[#b0b79f] outline-none placeholder-white/30 transition mb-4'
        />

        {/* ===== Markdown Toolbar + Emoji ===== */}
        <div className='flex items-center gap-2 mb-2'>
          <button onClick={() => applyMarkdown('**','**')} className='bg-black/70 border border-[#6a7257]/40 rounded px-2 py-1 text-xs text-white hover:border-[#6a7257] transition'>Bold</button>
          <button onClick={() => applyMarkdown('*','*')} className='bg-black/70 border border-[#6a7257]/40 rounded px-2 py-1 text-xs text-white hover:border-[#6a7257] transition'>Italic</button>
          <button onClick={() => applyMarkdown('`','`')} className='bg-black/70 border border-[#6a7257]/40 rounded px-2 py-1 text-xs text-white hover:border-[#6a7257] transition'>Code</button>
          <button onClick={() => applyMarkdown('- ')} className='bg-black/70 border border-[#6a7257]/40 rounded px-2 py-1 text-xs text-white hover:border-[#6a7257] transition'>Bullet</button>
          <div className='ml-auto flex gap-1'>
            {EMOJI_SET.map(e => (
              <button key={e} onClick={() => insertEmoji(e)} className='bg-black/70 border border-[#6a7257]/40 rounded px-2 py-1 text-xs hover:border-[#6a7257] transition'>{e}</button>
            ))}
          </div>
        </div>

        {/* ===== Message ===== */}
        <textarea
          ref={messageRef}
          rows={6}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder='Message content...'
          className='bg-black/70 border border-[#6a7257]/40 rounded-lg px-4 py-2 text-white text-sm focus:border-[#b0b79f] outline-none resize-none placeholder-white/30 transition mb-4'
        />

        {/* ===== Dropdown (Live Channels) ===== */}
        <div className='mb-4'>
          <div className='text-xs uppercase text-white/60 mb-2'>Select Channel</div>
          <select
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            className='w-full bg-black/70 border border-[#6a7257]/40 rounded-lg px-3 py-2 text-white text-sm focus:border-[#b0b79f] outline-none transition'
          >
            <option value=''>Select a channel…</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>#{ch.name}</option>
            ))}
          </select>
        </div>

        {/* ===== Schedule + Recurrence ===== */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div>
            <div className='text-xs uppercase text-white/60 mb-2'>Schedule</div>
            <input
              type='datetime-local'
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              className='w-full bg-black/70 border border-[#6a7257]/40 rounded-lg px-3 py-2 text-white text-sm focus:border-[#b0b79f] outline-none transition'
            />
          </div>
          <div>
            <div className='text-xs uppercase text-white/60 mb-2'>Recurrence</div>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value)}
              className='w-full bg-black/70 border border-[#6a7257]/40 rounded-lg px-3 py-2 text-white text-sm focus:border-[#b0b79f] outline-none transition'
            >
              <option value='none'>None</option>
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
            </select>
          </div>
        </div>

        {/* ===== Attachments ===== */}
        <label className='text-xs uppercase font-bold text-[#b0b79f]'>
          Attach Files
          <input type='file' multiple onChange={handleFileUpload} className='mt-1 block text-white/70 text-xs' />
        </label>
        {attachments.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {attachments.map((file, i) => (
              <span key={i} className='bg-[#6a7257]/30 text-white/80 text-xs px-2 py-1 rounded shadow-inner'>📎 {file}</span>
            ))}
          </div>
        )}

        {/* ===== Actions ===== */}
        {sendStatus && (
          <div
            className={`mt-4 text-xs font-semibold px-3 py-2 rounded-lg border ${sendStatus.type === 'success' ? 'text-[#b6ffb6] border-[#3f5d3f] bg-black/60' : 'text-[#ffb6b6] border-[#5d3f3f] bg-black/60'}`}
          >
            {sendStatus.note}
          </div>
        )}
        <button
          onClick={handleSendNow}
          disabled={isSending}
          className='mt-4 w-full bg-gradient-to-r from-[#ffe066] to-[#b0b79f] text-black font-bold uppercase text-sm px-5 py-2 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition disabled:opacity-60 disabled:hover:scale-100'
        >
          {isSending ? 'Sending…' : 'Send Message Now'}
        </button>
        <button
          onClick={handleAddAnnouncement}
          className='mt-3 w-full bg-gradient-to-r from-[#6a7257] to-[#b0b79f] text-black font-bold uppercase text-sm px-5 py-2 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition'
        >
          Add to Queue
        </button>
      </div>

      {/* ================= Right: Live Preview ================= */}
      <div className='col-span-1 bg-black/50 backdrop-blur-md border border-[#6a7257]/60 rounded-xl shadow-lg p-5'>
        <h2 className='text-lg font-bold uppercase mb-4 text-white tracking-wide border-b border-[#6a7257]/40 pb-2'>
          Live Preview
        </h2>
        <div className='bg-black/70 border border-[#6a7257]/30 rounded-xl p-5 shadow-inner'>
          {title ? <div className='mb-2 text-white font-bold text-lg'>{title}</div> : <div className='mb-2 text-white/40 italic'>Title will appear here</div>}
          {message ? <div className='mb-3 text-white text-sm whitespace-pre-line'>{message}</div> : <div className='mb-3 text-white/40 italic'>Message will appear here</div>}
          {attachments.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {attachments.map((file, i) => (
                <div key={i} className='bg-[#6a7257]/30 border border-[#6a7257]/40 rounded px-3 py-1 text-xs text-white shadow-sm'>📎 {file}</div>
              ))}
            </div>
          )}
          <div className='mt-3 text-xs text-white/60'>
            {channelId ? (
              <span>
                Channel: #{channels.find(c => c.id === channelId)?.name || 'unknown'}
              </span>
            ) : <span className='italic'>No channel selected</span>}
            {schedule ? (
              <div className='italic mt-1'>
                Scheduled: {new Date(schedule).toLocaleString()}
                {recurrence !== 'none' ? ` • ${recurrence.toUpperCase()}` : ''}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
