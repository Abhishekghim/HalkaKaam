'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppMode,
  AppTab,
  AppView,
  Bid,
  ChatMessage,
  Coordinates,
  FeedFilters,
  Job,
  Language,
  Role,
  SheetState,
  SheetType,
  SortKey,
  User,
} from '../types';
import { KIRTIPUR, makeSeed, uid } from '../lib/constants';
import { t as translate } from '../lib/i18n';

/* ---------- storage keys (same as the original vanilla app) ---------- */
const K_USERS = 'hk-users-v2';
const K_JOBS = 'hk-jobs-v2';
const K_SESS = 'hk-session-v2';

const save = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* quota / private mode — keep working in memory */
  }
};

export interface RatingSummary {
  avg: number;
  count: number;
}

export interface ReviewItem {
  from: string;
  role: Role;
  job: string;
  stars: number;
  txt: string;
  t: number;
}

export interface ChatContextType {
  jobId: string;
  bidId: string;
  role: Role;
}

export type NewJobInput = Pick<
  Job,
  | 'title' | 'cat' | 'type' | 'price' | 'ptype' | 'lat' | 'lng'
  | 'address' | 'when' | 'desc' | 'photos' | 'emoji' | 'urgent' | 'hours'
>;

/** Has the other side sent something since I last opened this chat? */
export function hasUnread(bid: Bid, role: Role, meId: string): boolean {
  const last = (role === 'host' ? bid.readHost : bid.readWorker) || 0;
  return bid.chat.some((m) => m.from !== meId && m.time > last);
}

/** Workers may only talk once the poster has started the conversation (anti-spam). */
export function hostStartedChat(bid: Bid, hostId: string): boolean {
  return bid.chat.some((m) => m.from === hostId);
}

const BOT_REPLIES = [
  'Namaste! Got it, thank you. 🙏',
  'Sure, I can do that. What time works best for you?',
  'Okay! I will bring everything needed.',
  'Thank you for the details — I am ready.',
  'No problem dai/didi, I will be on time.',
];
const BOT_HOST_OPENERS = [
  'Namaste! Thanks for your offer. Are you available at the time mentioned?',
  'Hi! Your pitch looks good. Have you done something similar before?',
];
const BOT_PITCHES = [
  'Namaste! I am a student nearby and free at that time. I can do this carefully.',
  'I have done similar work before and live close by. Happy to help!',
  'Available today. I am punctual and will finish properly. 🙏',
];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

interface AppContextType {
  ready: boolean;
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;

  view: AppView;
  setView: (v: AppView) => void;

  authStep: 1 | 2;
  setAuthStep: (s: 1 | 2) => void;
  authIntent: AppMode | null;
  authPhone: string;
  authName: string;
  authArea: string;
  goAuth: (intent?: AppMode | null) => void;
  sendOtp: (name: string, phone: string, area: string) => boolean;
  verifyOtp: (code: string) => boolean;
  logout: () => void;

  me: User | null;
  users: User[];
  jobs: Job[];
  pos: Coordinates;
  locName: string;
  locSet: boolean;
  radius: number;

  mode: AppMode;
  setMode: (m: AppMode) => void;
  tab: AppTab;
  setTab: (t: AppTab) => void;
  cat: string;
  setCat: (c: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;

  toast: string | null;
  showToast: (msg: string) => void;
  successPop: number;
  celebrate: () => void;

  sheet: SheetState | null;
  openSheet: (type: SheetType, opts?: Omit<SheetState, 'type'>) => void;
  closeSheet: () => void;

  chatCtx: ChatContextType | null;
  setChatCtx: (ctx: ChatContextType | null) => void;
  openChat: (jobId: string, bidId: string, role: Role) => void;

  hostBadge: number;
  workerBadge: number;

  filters: FeedFilters;
  setFilters: React.Dispatch<React.SetStateAction<FeedFilters>>;
  resetFilters: () => void;

  userById: (id?: string) => User | undefined;
  jobById: (id?: string) => Job | undefined;
  ratingOf: (userId: string, role: Role) => RatingSummary;
  reviewsOf: (userId: string, role: Role) => ReviewItem[];

  confirmLocation: (coords: Coordinates, name: string, rad: number) => void;
  submitOffer: (jobId: string, amount: number, pitch: string) => void;
  withdrawOffer: (jobId: string) => void;
  publishJob: (job: NewJobInput) => void;
  cancelJob: (jobId: string) => void;
  featureJob: (jobId: string) => void;
  sendChatMessage: (jobId: string, bidId: string, text: string, image?: string) => void;
  sendCounter: (jobId: string, bidId: string, amount: number) => void;
  acceptCounter: (jobId: string, bidId: string) => void;
  assignWorker: (jobId: string, bidId: string) => void;
  submitWorkerReview: (jobId: string, a: number, b: number, c: number, text: string) => void;
  submitHostReview: (jobId: string, a: number, b: number, c: number, text: string) => void;
  submitReport: (jobId: string, text: string) => void;
  markChatRead: (jobId: string, bidId: string, role: Role) => void;
  markInboxSeen: (jobId: string) => void;
  updateMyBio: (bio: string) => void;
  updateUserBio: (userId: string, bio: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState<Language>('en');
  const [view, setViewState] = useState<AppView>('langpick');

  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [authIntent, setAuthIntent] = useState<AppMode | null>(null);
  const [authPhone, setAuthPhone] = useState('');
  const [authName, setAuthName] = useState('');
  const [authArea, setAuthArea] = useState('');

  const [meId, setMeId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [pos, setPos] = useState<Coordinates>(KIRTIPUR);
  const [locName, setLocName] = useState('');
  const [locSet, setLocSet] = useState(false);
  const [radius, setRadius] = useState(4);

  const [mode, setModeState] = useState<AppMode>('worker');
  const [tab, setTabState] = useState<AppTab>('feed');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState<SortKey>('near');

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [chatCtx, setChatCtx] = useState<ChatContextType | null>(null);
  const [filters, setFilters] = useState<FeedFilters>({
    cat: 'All',
    type: 'All',
    urgentOnly: false,
    priceRange: 'All',
    sortBy: 'distance',
  });
  const resetFilters = useCallback(() => {
    setFilters({
      cat: 'All',
      type: 'All',
      urgentOnly: false,
      priceRange: 'All',
      sortBy: 'distance',
    });
  }, []);
  const [toast, setToast] = useState<string | null>(null);
  const [successPop, setSuccessPop] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `me` is derived, so profile edits are reflected everywhere instantly
  const me = useMemo(() => users.find((u) => u.id === meId) || null, [users, meId]);
  const tr = useCallback((key: string) => translate(key, lang), [lang]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const celebrate = useCallback(() => setSuccessPop(Date.now()), []);

  /* ---------- boot: load from localStorage or seed ---------- */
  useEffect(() => {
    let u: User[] = [];
    let j: Job[] = [];
    let sess: { id?: string; lang?: Language } | null = null;
    try {
      u = JSON.parse(localStorage.getItem(K_USERS) || '[]');
      j = JSON.parse(localStorage.getItem(K_JOBS) || '[]');
      sess = JSON.parse(localStorage.getItem(K_SESS) || 'null');
    } catch {
      /* corrupted storage → reseed */
    }
    if (!Array.isArray(u) || !u.length || !Array.isArray(j)) {
      const s = makeSeed();
      u = s.users;
      j = s.jobs;
      save(K_USERS, u);
      save(K_JOBS, j);
    }
    setUsers(u);
    setJobs(j);
    if (sess?.id && u.some((x) => x.id === sess!.id)) {
      setMeId(sess.id);
      if (sess.lang) setLangState(sess.lang);
      setViewState('locstep');
    }
    setReady(true);
  }, []);

  /* ---------- side effects ---------- */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle('mode-host', mode === 'host');
    document.body.classList.toggle('mode-worker', mode === 'worker');
  }, [mode]);

  useEffect(() => {
    if (!ready) return;
    save(K_SESS, meId ? { id: meId, lang } : null);
  }, [meId, lang, ready]);

  /* ---------- immutable update helpers (always use latest state) ---------- */
  const updateJobs = useCallback((fn: (js: Job[]) => Job[]) => {
    setJobs((prev) => {
      const next = fn(prev);
      if (next !== prev) save(K_JOBS, next);
      return next;
    });
  }, []);

  const updateJob = useCallback(
    (jobId: string, fn: (j: Job) => Job) =>
      updateJobs((js) => js.map((j) => (j.id === jobId ? fn(j) : j))),
    [updateJobs]
  );

  const updateBid = useCallback(
    (jobId: string, bidId: string, fn: (b: Bid) => Bid) =>
      updateJob(jobId, (j) => ({ ...j, bids: j.bids.map((b) => (b.id === bidId ? fn(b) : b)) })),
    [updateJob]
  );

  const pushMsg = useCallback(
    (jobId: string, bidId: string, msg: ChatMessage) =>
      updateBid(jobId, bidId, (b) => ({ ...b, chat: [...b.chat, msg] })),
    [updateBid]
  );

  const updateUsers = useCallback((fn: (us: User[]) => User[]) => {
    setUsers((prev) => {
      const next = fn(prev);
      save(K_USERS, next);
      return next;
    });
  }, []);

  /* ---------- lookups ---------- */
  const userById = useCallback(
    (id?: string) => (id ? users.find((u) => u.id === id) : undefined),
    [users]
  );
  const jobById = useCallback(
    (id?: string) => (id ? jobs.find((j) => j.id === id) : undefined),
    [jobs]
  );

  const ratingOf = useCallback(
    (userId: string, role: Role): RatingSummary => {
      const u = userById(userId);
      let sum = (u?.baseRating || 0) * (u?.baseCount || 0);
      let n = u?.baseCount || 0;
      for (const j of jobs) {
        if (role === 'worker') {
          const r = j.reviews?.hostToWorker;
          const w = j.bids.find((b) => b.id === j.assignedBidId);
          if (r && w?.workerId === userId) { sum += r.stars; n++; }
        } else {
          const r = j.reviews?.workerToHost;
          if (r && j.hostId === userId) { sum += r.stars; n++; }
        }
      }
      return { avg: n ? sum / n : 0, count: n };
    },
    [jobs, userById]
  );

  const reviewsOf = useCallback(
    (userId: string, role: Role): ReviewItem[] => {
      const out: ReviewItem[] = [];
      for (const j of jobs) {
        const w = j.bids.find((b) => b.id === j.assignedBidId);
        if (role === 'worker' && j.reviews?.hostToWorker && w?.workerId === userId) {
          out.push({ from: userById(j.hostId)?.name || '', role: 'host', job: j.title, ...j.reviews.hostToWorker });
        }
        if (role === 'host' && j.reviews?.workerToHost && j.hostId === userId) {
          out.push({ from: userById(w?.workerId)?.name || '', role: 'worker', job: j.title, ...j.reviews.workerToHost });
        }
      }
      return out.sort((a, b) => b.t - a.t);
    },
    [jobs, userById]
  );

  /* ---------- badges ---------- */
  const { hostBadge, workerBadge } = useMemo(() => {
    let h = 0;
    let w = 0;
    if (!meId) return { hostBadge: 0, workerBadge: 0 };
    for (const j of jobs) {
      if (j.hostId === meId) {
        for (const b of j.bids) {
          if (j.status === 'open' && !b.seenByHost) h++;
          else if (hasUnread(b, 'host', meId)) h++;
        }
      } else {
        const mine = j.bids.find((b) => b.workerId === meId);
        if (mine && hasUnread(mine, 'worker', meId)) w++;
      }
    }
    return { hostBadge: h, workerBadge: w };
  }, [jobs, meId]);

  /* ---------- navigation ---------- */
  const setView = useCallback((v: AppView) => {
    setViewState(v);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    if (view === 'langpick') setView('landing');
  };
  const toggleLang = () => setLang(lang === 'en' ? 'ne' : 'en');

  const setMode = (m: AppMode) => {
    setModeState(m);
    setTabState(m === 'worker' ? 'feed' : 'jobs');
    setChatCtx(null);
  };
  const setTab = (next: AppTab) => setTabState(next);

  const openSheet = (type: SheetType, opts: Omit<SheetState, 'type'> = {}) => setSheet({ type, ...opts });
  const closeSheet = () => setSheet(null);

  const openChat = (jobId: string, bidId: string, role: Role) => {
    setSheet(null);
    setChatCtx({ jobId, bidId, role });
    if (mode !== role) setModeState(role);
    setTabState(role === 'host' ? 'hchat' : 'wchat');
  };

  /* ---------- auth ---------- */
  const goAuth = (intent?: AppMode | null) => {
    if (intent !== undefined) setAuthIntent(intent);
    setAuthStep(1);
    setView('auth');
  };

  const sendOtp = (name: string, phone: string, area: string) => {
    if (name.trim().length < 3) { showToast(tr('full_name')); return false; }
    if (!/^9[78]\d{8}$/.test(phone.trim())) { showToast('98XXXXXXXX'); return false; }
    setAuthName(name.trim());
    setAuthPhone(phone.trim());
    setAuthArea(area.trim());
    setAuthStep(2);
    return true;
  };

  const verifyOtp = (code: string) => {
    if (!/^\d{6}$/.test(code.trim())) { showToast(tr('otp_label')); return false; }
    let existing = users.find((u) => u.phone === authPhone);
    if (!existing) {
      existing = {
        id: uid(), name: authName, phone: authPhone, campus: authArea, bio: '',
        baseRating: 0, baseCount: 0, isBot: false, created: Date.now(),
      };
      const created = existing;
      updateUsers((us) => [...us, created]);
    }
    setMeId(existing.id);
    setView('locstep');
    return true;
  };

  const logout = () => {
    setMeId(null);
    setLocSet(false);
    setSheet(null);
    setChatCtx(null);
    setAuthStep(1);
    setAuthPhone('');
    setAuthName('');
    setAuthArea('');
    setView('langpick');
  };

  const confirmLocation = (coords: Coordinates, name: string, rad: number) => {
    setPos(coords);
    setLocName(name || tr('your_location'));
    setRadius(rad);
    // only pick the starting mode on first entry — changing location later keeps your place
    if (!locSet) {
      const m: AppMode = authIntent === 'host' ? 'host' : 'worker';
      setModeState(m);
      setTabState(m === 'host' ? 'jobs' : 'feed');
    }
    setLocSet(true);
    setView('app');
  };

  /* ---------- worker actions ---------- */
  const submitOffer = (jobId: string, amount: number, pitch: string) => {
    if (!me) return;
    const job = jobById(jobId);
    if (!job || job.status !== 'open') return;
    if (job.bids.some((b) => b.workerId === me.id)) return;
    const bidId = uid();
    const bid: Bid = { id: bidId, workerId: me.id, amount, pitch, status: 'pending', chat: [], createdAt: Date.now() };
    updateJob(jobId, (j) => ({ ...j, bids: [bid, ...j.bids] }));
    setSheet(null);
    showToast(tr('offer_sent'));
    celebrate();

    // demo: bot posters reply to show the worker side of the chat
    const host = userById(job.hostId);
    if (host?.isBot) {
      setTimeout(() => {
        pushMsg(jobId, bidId, { from: host.id, text: pick(BOT_HOST_OPENERS), time: Date.now(), kind: 'text' });
        showToast(`💬 ${host.name}`);
      }, 6000);
    }
  };

  const withdrawOffer = (jobId: string) => {
    if (!me) return;
    updateJob(jobId, (j) =>
      j.status === 'open' ? { ...j, bids: j.bids.filter((b) => b.workerId !== me.id) } : j
    );
    showToast(tr('withdrawn'));
  };

  /* ---------- host actions ---------- */
  const publishJob = (input: NewJobInput) => {
    if (!me) return;
    const job: Job = {
      ...input,
      id: uid(), hostId: me.id, status: 'open', assignedBidId: null, featured: false,
      createdAt: Date.now(), reviews: {}, bids: [],
    };
    updateJobs((js) => [job, ...js]);
    setTabState('jobs');
    showToast(tr('posted_ok'));
    celebrate();

    // demo: two different student bots pitch within a few seconds
    const bots = users.filter((u) => u.isBot).sort(() => Math.random() - 0.5).slice(0, 2);
    bots.forEach((bot, i) => {
      setTimeout(() => {
        const factor = 0.85 + Math.random() * 0.2;
        const bid: Bid = {
          id: uid(), workerId: bot.id, amount: Math.max(50, Math.round((job.price * factor) / 10) * 10),
          pitch: pick(BOT_PITCHES), status: 'pending', chat: [], createdAt: Date.now(),
        };
        updateJob(job.id, (j) => (j.status === 'open' ? { ...j, bids: [bid, ...j.bids] } : j));
        showToast(`📥 ${bot.name}`);
      }, 3500 + i * 4500);
    });
  };

  const cancelJob = (jobId: string) => {
    updateJob(jobId, (j) => (j.status === 'open' ? { ...j, status: 'closed' } : j));
    setSheet(null);
    showToast(tr('job_closed'));
  };

  const featureJob = (jobId: string) => {
    updateJob(jobId, (j) => ({ ...j, featured: true }));
    showToast('★ ' + tr('feature_post'));
  };

  const otherPartyOf = (jobId: string, bidId: string) => {
    const j = jobById(jobId);
    const b = j?.bids.find((x) => x.id === bidId);
    if (!j || !b || !me) return undefined;
    return userById(me.id === j.hostId ? b.workerId : j.hostId);
  };

  const sendChatMessage = (jobId: string, bidId: string, text: string, image?: string) => {
    if (!me || (!text.trim() && !image)) return;
    pushMsg(jobId, bidId, {
      from: me.id, text: text.trim(), time: Date.now(),
      kind: image ? 'image' : 'text', image,
    });
    const other = otherPartyOf(jobId, bidId);
    if (other?.isBot) {
      setTimeout(() => {
        pushMsg(jobId, bidId, { from: other.id, text: pick(BOT_REPLIES), time: Date.now(), kind: 'text' });
      }, 1400);
    }
  };

  const acceptCounterAs = (jobId: string, bidId: string, actorId: string) => {
    updateBid(jobId, bidId, (b) =>
      b.counterAmount
        ? {
            ...b,
            amount: b.counterAmount,
            counterAmount: undefined,
            chat: [...b.chat, { from: actorId, kind: 'system', text: 'price_agreed', amount: b.counterAmount, time: Date.now() }],
          }
        : b
    );
  };

  const sendCounter = (jobId: string, bidId: string, amount: number) => {
    if (!me || amount < 50) return;
    updateBid(jobId, bidId, (b) => ({
      ...b,
      counterAmount: amount,
      chat: [...b.chat, { from: me.id, kind: 'counter', text: '', amount, time: Date.now() }],
    }));
    const other = otherPartyOf(jobId, bidId);
    if (other?.isBot) setTimeout(() => acceptCounterAs(jobId, bidId, other.id), 2200);
  };

  const acceptCounter = (jobId: string, bidId: string) => {
    if (!me) return;
    acceptCounterAs(jobId, bidId, me.id);
    showToast('🤝 ' + tr('price_agreed'));
  };

  const assignWorker = (jobId: string, bidId: string) => {
    if (!me) return;
    const now = Date.now();
    updateJob(jobId, (j) => ({
      ...j,
      status: 'assigned',
      assignedBidId: bidId,
      bids: j.bids.map((b) =>
        b.id === bidId
          ? { ...b, status: 'accepted', chat: [...b.chat, { from: me.id, kind: 'system', text: 'sys_assigned', time: now }] }
          : { ...b, status: 'declined' }
      ),
    }));
    showToast('🤝 ' + tr('chosen'));
    celebrate();
    const other = otherPartyOf(jobId, bidId);
    if (other?.isBot) {
      setTimeout(() => {
        pushMsg(jobId, bidId, { from: other.id, text: 'Thank you for choosing me! I will be there on time. 🙏', time: Date.now(), kind: 'text' });
      }, 1600);
    }
  };

  const review = (a: number, b: number, c: number, text: string) => ({
    a, b, c, stars: Math.round((a + b + c) / 3), txt: text.trim(), t: Date.now(),
  });

  const submitWorkerReview = (jobId: string, a: number, b: number, c: number, text: string) => {
    if (!me) return;
    const job = jobById(jobId);
    if (!job) return;
    updateJob(jobId, (j) => ({
      ...j,
      status: 'done',
      reviews: { ...j.reviews, hostToWorker: review(a, b, c, text) },
      bids: j.bids.map((x) =>
        x.id === j.assignedBidId ? { ...x, chat: [...x.chat, { from: me.id, kind: 'system', text: 'sys_done', time: Date.now() }] } : x
      ),
    }));
    setSheet(null);
    showToast(tr('review_published'));
    celebrate();

    const worker = userById(job.bids.find((x) => x.id === job.assignedBidId)?.workerId);
    if (worker?.isBot) {
      setTimeout(() => {
        const s = 4 + Math.round(Math.random());
        updateJob(jobId, (j) => ({
          ...j,
          reviews: { ...j.reviews, workerToHost: review(s, 5, s, 'Clear instructions and friendly. Paid as agreed. 🙏') },
        }));
        showToast(`⭐ ${worker.name}`);
      }, 3500);
    }
  };

  const submitHostReview = (jobId: string, a: number, b: number, c: number, text: string) => {
    updateJob(jobId, (j) => ({ ...j, reviews: { ...j.reviews, workerToHost: review(a, b, c, text) } }));
    setSheet(null);
    showToast(tr('review_published'));
  };

  const submitReport = (jobId: string, text: string) => {
    if (!me) return;
    updateJob(jobId, (j) => ({ ...j, report: { txt: text.trim(), t: Date.now(), by: me.id } }));
    setSheet(null);
    showToast(tr('report_sent'));
  };

  const markChatRead = useCallback(
    (jobId: string, bidId: string, role: Role) =>
      updateBid(jobId, bidId, (b) => (role === 'host' ? { ...b, readHost: Date.now() } : { ...b, readWorker: Date.now() })),
    [updateBid]
  );

  const markInboxSeen = useCallback(
    (jobId: string) =>
      updateJobs((js) => {
        const j = js.find((x) => x.id === jobId);
        if (!j || j.bids.every((b) => b.seenByHost)) return js; // no-op → no re-render loop
        return js.map((x) => (x.id === jobId ? { ...x, bids: x.bids.map((b) => ({ ...b, seenByHost: true })) } : x));
      }),
    [updateJobs]
  );

  const updateMyBio = (bio: string) => {
    if (!me) return;
    updateUsers((us) => us.map((u) => (u.id === me.id ? { ...u, bio: bio.trim() } : u)));
    showToast(tr('save') + ' ✓');
  };

  const updateUserBio = (userId: string, bio: string) => {
    updateUsers((us) => us.map((u) => (u.id === userId ? { ...u, bio: bio.trim() } : u)));
    showToast(tr('save') + ' ✓');
  };

  const value: AppContextType = {
    ready, lang, setLang, toggleLang, t: tr,
    view, setView,
    authStep, setAuthStep, authIntent, authPhone, authName, authArea, goAuth, sendOtp, verifyOtp, logout,
    me, users, jobs, pos, locName, locSet, radius,
    mode, setMode, tab, setTab, cat, setCat, sort, setSort,
    toast, showToast, successPop, celebrate,
    sheet, openSheet, closeSheet,
    chatCtx, setChatCtx, openChat,
    hostBadge, workerBadge,
    filters, setFilters, resetFilters,
    userById, jobById, ratingOf, reviewsOf,
    confirmLocation, submitOffer, withdrawOffer, publishJob, cancelJob, featureJob,
    sendChatMessage, sendCounter, acceptCounter, assignWorker,
    submitWorkerReview, submitHostReview, submitReport,
    markChatRead, markInboxSeen, updateMyBio, updateUserBio,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
