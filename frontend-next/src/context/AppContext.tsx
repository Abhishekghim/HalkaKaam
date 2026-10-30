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
import { flushSync } from 'react-dom';
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
  KycData,
} from '../types';
import { KIRTIPUR, TEST_VERIFIED_USER, makeSeed, uid } from '../lib/constants';
import { t as translate } from '../lib/i18n';

/* ---------- storage keys ---------- */
const K_USERS = 'hk-users-v2';
const K_JOBS = 'hk-jobs-v2';
const K_SESS = 'hk-session-v2';

const save = (key: string, val: unknown): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (err) {
    console.error(`[AppContext] Failed to persist key "${key}" to localStorage (quota or privacy mode):`, err);
    return false;
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
  | 'title'
  | 'cat'
  | 'type'
  | 'price'
  | 'ptype'
  | 'lat'
  | 'lng'
  | 'address'
  | 'when'
  | 'desc'
  | 'photos'
  | 'emoji'
  | 'urgent'
  | 'hours'
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

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export interface AppContextType {
  ready: boolean;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

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
  loginAsTestAccount: () => void;
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
  submitKyc: (data: KycData, autoApprove?: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [lang, setLangState] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setViewState] = useState<AppView>('langpick');

  /* ---------- Managed Timer Registry (Prevents Orphaned Session-Bleed Leaks) ---------- */
  const activeTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const scheduleSafeTimeout = useCallback((fn: () => void, delayMs: number) => {
    const timerId = setTimeout(() => {
      activeTimersRef.current.delete(timerId);
      fn();
    }, delayMs);
    activeTimersRef.current.add(timerId);
    return timerId;
  }, []);

  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((id) => clearTimeout(id));
    activeTimersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  /* ---------- Theme Management & Feathered View Transition ---------- */
  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    try {
      localStorage.setItem('hk-theme', t);
    } catch (err) {
      console.warn('[AppContext] Unable to persist theme preference:', err);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.classList.toggle('dark', t === 'dark');
    }
  }, []);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent | MouseEvent) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';

      if (typeof document === 'undefined') {
        setTheme(nextTheme);
        return;
      }

      const doc = document as unknown as {
        startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished?: Promise<void> };
        documentElement: HTMLElement;
      };

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!doc.startViewTransition || prefersReducedMotion) {
        doc.documentElement.classList.add('theme-transitioning');
        setTheme(nextTheme);
        scheduleSafeTimeout(() => {
          doc.documentElement.classList.remove('theme-transitioning');
        }, 340);
        return;
      }

      let x = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      let y = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

      if (event && 'clientX' in event && typeof event.clientX === 'number' && event.clientX > 0) {
        x = event.clientX;
        y = event.clientY;
      } else if (
        event &&
        'currentTarget' in event &&
        (event.currentTarget as HTMLElement)?.getBoundingClientRect
      ) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      doc.documentElement.style.setProperty('--mask-x', `${x}px`);
      doc.documentElement.style.setProperty('--mask-y', `${y}px`);
      doc.documentElement.style.setProperty('--mask-end-radius', `${endRadius + 110}px`);

      try {
        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            setTheme(nextTheme);
          });
        });

        transition.finished
          ?.catch((err) => {
            console.warn('[AppContext] View transition interrupted:', err);
          })
          .finally(() => {
            doc.documentElement.style.removeProperty('--mask-x');
            doc.documentElement.style.removeProperty('--mask-y');
            doc.documentElement.style.removeProperty('--mask-end-radius');
          });
      } catch (err) {
        console.error('[AppContext] startViewTransition failed, applying fallback:', err);
        setTheme(nextTheme);
      }
    },
    [theme, setTheme, scheduleSafeTimeout]
  );

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

  /* ---------- O(1) Hash Map Indices for Users, Jobs, and Ratings ---------- */
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      map.set(u.id, u);
    }
    return map;
  }, [users]);

  const jobMap = useMemo(() => {
    const map = new Map<string, Job>();
    for (const j of jobs) {
      map.set(j.id, j);
    }
    return map;
  }, [jobs]);

  const userById = useCallback(
    (id?: string): User | undefined => (id ? userMap.get(id) : undefined),
    [userMap]
  );

  const jobById = useCallback(
    (id?: string): Job | undefined => (id ? jobMap.get(id) : undefined),
    [jobMap]
  );

  const me = useMemo(() => (meId ? userMap.get(meId) ?? null : null), [userMap, meId]);
  const tr = useCallback((key: string) => translate(key, lang), [lang]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const celebrate = useCallback(() => setSuccessPop(Date.now()), []);

  /* ---------- Boot: Hydrate from localStorage or Seed ---------- */
  useEffect(() => {
    let u: User[] = [];
    let j: Job[] = [];
    let sess: { id?: string; lang?: Language } | null = null;

    try {
      u = JSON.parse(localStorage.getItem(K_USERS) || '[]');
      j = JSON.parse(localStorage.getItem(K_JOBS) || '[]');
      sess = JSON.parse(localStorage.getItem(K_SESS) || 'null');
    } catch (err) {
      console.error('[AppContext] Corrupted storage detected during hydration, reseeding:', err);
    }

    if (!Array.isArray(u) || !u.length || !Array.isArray(j)) {
      const s = makeSeed();
      u = s.users;
      j = s.jobs;
      save(K_USERS, u);
      save(K_JOBS, j);
    } else {
      const s = makeSeed();
      for (const su of s.users) {
        const idx = u.findIndex((x) => x.id === su.id || (su.phone && x.phone === su.phone));
        if (idx >= 0) {
          u[idx] = {
            ...u[idx],
            phone: su.phone || u[idx].phone,
            kycStatus: su.kycStatus || u[idx].kycStatus,
            kycData: su.kycData || u[idx].kycData,
          };
        } else {
          u.push(su);
        }
      }
      save(K_USERS, u);
    }

    queueMicrotask(() => {
      setUsers(u);
      setJobs(j);
      if (sess?.id && u.some((x) => x.id === sess!.id)) {
        setMeId(sess.id);
        if (sess.lang) setLangState(sess.lang);
        setViewState('locstep');
      }
      try {
        const savedTheme = localStorage.getItem('hk-theme') as 'light' | 'dark' | null;
        const prefersDark =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
      } catch (err) {
        console.warn('[AppContext] Could not read initial theme preference:', err);
      }
      setReady(true);
    });
  }, [setTheme]);

  /* ---------- Side Effects ---------- */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('mode-host', mode === 'host');
      document.body.classList.toggle('mode-worker', mode === 'worker');
    }
  }, [mode]);

  useEffect(() => {
    if (!ready) return;
    save(K_SESS, meId ? { id: meId, lang } : null);
  }, [meId, lang, ready]);

  /* ---------- Immutable Update Helpers ---------- */
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

  /* ---------- Pre-Indexed O(1) Ratings & Reviews Lookups ---------- */
  const ratingsIndex = useMemo(() => {
    const workerStats = new Map<string, { sum: number; count: number }>();
    const hostStats = new Map<string, { sum: number; count: number }>();
    const workerReviews = new Map<string, ReviewItem[]>();
    const hostReviews = new Map<string, ReviewItem[]>();

    for (const u of users) {
      const baseSum = (u.baseRating || 0) * (u.baseCount || 0);
      const baseCnt = u.baseCount || 0;
      workerStats.set(u.id, { sum: baseSum, count: baseCnt });
      hostStats.set(u.id, { sum: baseSum, count: baseCnt });
    }

    for (const j of jobs) {
      const assignedBid = j.assignedBidId
        ? j.bids.find((b) => b.id === j.assignedBidId)
        : undefined;

      if (j.reviews?.hostToWorker && assignedBid) {
        const wId = assignedBid.workerId;
        const prev = workerStats.get(wId) ?? { sum: 0, count: 0 };
        workerStats.set(wId, {
          sum: prev.sum + j.reviews.hostToWorker.stars,
          count: prev.count + 1,
        });

        const list = workerReviews.get(wId) ?? [];
        list.push({
          from: userMap.get(j.hostId)?.name || '',
          role: 'host',
          job: j.title,
          ...j.reviews.hostToWorker,
        });
        workerReviews.set(wId, list);
      }

      if (j.reviews?.workerToHost) {
        const hId = j.hostId;
        const prev = hostStats.get(hId) ?? { sum: 0, count: 0 };
        hostStats.set(hId, {
          sum: prev.sum + j.reviews.workerToHost.stars,
          count: prev.count + 1,
        });

        const list = hostReviews.get(hId) ?? [];
        list.push({
          from: (assignedBid ? userMap.get(assignedBid.workerId)?.name : '') || '',
          role: 'worker',
          job: j.title,
          ...j.reviews.workerToHost,
        });
        hostReviews.set(hId, list);
      }
    }

    workerReviews.forEach((arr) => arr.sort((a, b) => b.t - a.t));
    hostReviews.forEach((arr) => arr.sort((a, b) => b.t - a.t));

    return { workerStats, hostStats, workerReviews, hostReviews };
  }, [users, jobs, userMap]);

  const ratingOf = useCallback(
    (userId: string, role: Role): RatingSummary => {
      const map = role === 'worker' ? ratingsIndex.workerStats : ratingsIndex.hostStats;
      const entry = map.get(userId);
      if (!entry || entry.count === 0) return { avg: 0, count: 0 };
      return { avg: entry.sum / entry.count, count: entry.count };
    },
    [ratingsIndex]
  );

  const reviewsOf = useCallback(
    (userId: string, role: Role): ReviewItem[] => {
      const map = role === 'worker' ? ratingsIndex.workerReviews : ratingsIndex.hostReviews;
      return map.get(userId) ?? [];
    },
    [ratingsIndex]
  );

  /* ---------- Unread Notification Badges ---------- */
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

  /* ---------- Navigation & UI Actions ---------- */
  const setView = useCallback((v: AppView) => {
    setViewState(v);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const setLang = useCallback(
    (l: Language) => {
      setLangState(l);
      if (view === 'langpick') setView('landing');
    },
    [view, setView]
  );

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ne' : 'en');
  }, [lang, setLang]);

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    setTabState(m === 'worker' ? 'feed' : 'jobs');
    setChatCtx(null);
  }, []);

  const setTab = useCallback((next: AppTab) => {
    setTabState(next);
  }, []);

  const openSheet = useCallback((type: SheetType, opts: Omit<SheetState, 'type'> = {}) => {
    setSheet({ type, ...opts });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
  }, []);

  const openChat = useCallback(
    (jobId: string, bidId: string, role: Role) => {
      setSheet(null);
      setChatCtx({ jobId, bidId, role });
      if (mode !== role) setModeState(role);
      setTabState(role === 'host' ? 'hchat' : 'wchat');
    },
    [mode]
  );

  /* ---------- Authentication ---------- */
  const goAuth = useCallback(
    (intent?: AppMode | null) => {
      if (intent !== undefined) setAuthIntent(intent);
      setAuthStep(1);
      setView('auth');
    },
    [setView]
  );

  const sendOtp = useCallback(
    (name: string, phone: string, area: string): boolean => {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!/^9[78]\d{8}$/.test(cleanPhone)) {
        showToast(
          lang === 'ne'
            ? 'कृपया १० अंकको मान्य मोबाइल नम्बर (98/97XXXXXXXX) प्रविष्ट गर्नुहोस्'
            : 'Please enter a valid 10-digit mobile number (98/97XXXXXXXX)'
        );
        return false;
      }
      const existing = users.find((u) => u.phone === cleanPhone);
      const resolvedName =
        name.trim() ||
        existing?.name ||
        (cleanPhone === TEST_VERIFIED_USER.phone ? TEST_VERIFIED_USER.name : 'User');
      setAuthName(resolvedName);
      setAuthPhone(cleanPhone);
      setAuthArea(area.trim() || existing?.campus || 'Kathmandu');
      setAuthStep(2);
      return true;
    },
    [users, lang, showToast]
  );

  const verifyOtp = useCallback(
    (code: string): boolean => {
      if (!/^\d{6}$/.test(code.trim())) {
        showToast(tr('otp_label'));
        return false;
      }
      let existing = users.find((u) => u.phone === authPhone);
      if (!existing) {
        if (authPhone === TEST_VERIFIED_USER.phone) {
          existing = TEST_VERIFIED_USER;
        } else {
          existing = {
            id: uid(),
            name: authName || 'New User',
            phone: authPhone,
            campus: authArea,
            bio: '',
            baseRating: 0,
            baseCount: 0,
            isBot: false,
            created: Date.now(),
          };
        }
        const created = existing;
        updateUsers((us) => [...us, created]);
      }
      setMeId(existing.id);
      setView('locstep');
      return true;
    },
    [users, authPhone, authName, authArea, tr, showToast, updateUsers, setView]
  );

  const loginAsTestAccount = useCallback(() => {
    clearAllTimers();
    let testUser = users.find(
      (u) => u.phone === TEST_VERIFIED_USER.phone || u.id === TEST_VERIFIED_USER.id
    );
    if (!testUser) {
      testUser = TEST_VERIFIED_USER;
      updateUsers((us) => [
        ...us.filter((u) => u.id !== TEST_VERIFIED_USER.id),
        TEST_VERIFIED_USER,
      ]);
    } else if (testUser.kycStatus !== 'verified') {
      testUser = { ...testUser, ...TEST_VERIFIED_USER };
      updateUsers((us) => us.map((u) => (u.id === testUser!.id ? testUser! : u)));
    }
    setMeId(testUser.id);
    setPos(KIRTIPUR);
    setLocName('Kirtipur, Kathmandu');
    setRadius(5);
    setModeState('worker');
    setTabState('feed');
    setLocSet(true);
    setView('app');
    showToast(
      lang === 'ne'
        ? '✅ KYC प्रमाणित खाता (किरण विष्ट) मा लगइन भयो!'
        : '✅ Logged in as KYC Verified Tasker (Kiran Bista)!'
    );
    celebrate();
  }, [users, lang, clearAllTimers, updateUsers, setView, showToast, celebrate]);

  const logout = useCallback(() => {
    clearAllTimers();
    setMeId(null);
    setLocSet(false);
    setSheet(null);
    setChatCtx(null);
    setAuthStep(1);
    setAuthPhone('');
    setAuthName('');
    setAuthArea('');
    setView('langpick');
  }, [clearAllTimers, setView]);

  const confirmLocation = useCallback(
    (coords: Coordinates, name: string, rad: number) => {
      setPos(coords);
      setLocName(name || tr('your_location'));
      setRadius(rad);
      if (!locSet) {
        const m: AppMode = authIntent === 'host' ? 'host' : 'worker';
        setModeState(m);
        setTabState(m === 'host' ? 'jobs' : 'feed');
      }
      setLocSet(true);
      setView('app');
    },
    [locSet, authIntent, tr, setView]
  );

  /* ---------- Worker Actions ---------- */
  const submitOffer = useCallback(
    (jobId: string, amount: number, pitch: string) => {
      if (!me) return;
      if (me.kycStatus !== 'verified') {
        openSheet('kyc', { jobId });
        showToast(
          lang === 'ne'
            ? '⚠️ काममा Apply गर्न पहिले KYC प्रमाणीकरण आवश्यक छ'
            : '⚠️ KYC verification required before applying'
        );
        return;
      }
      const job = jobById(jobId);
      if (!job || job.status !== 'open') return;
      if (job.bids.some((b) => b.workerId === me.id)) return;
      const bidId = uid();
      const bid: Bid = {
        id: bidId,
        workerId: me.id,
        amount,
        pitch,
        status: 'pending',
        chat: [],
        createdAt: Date.now(),
      };
      updateJob(jobId, (j) => ({ ...j, bids: [bid, ...j.bids] }));
      setSheet(null);
      showToast(tr('offer_sent'));
      celebrate();

      const host = userById(job.hostId);
      if (host?.isBot) {
        scheduleSafeTimeout(() => {
          pushMsg(jobId, bidId, {
            from: host.id,
            text: pick(BOT_HOST_OPENERS),
            time: Date.now(),
            kind: 'text',
          });
          showToast(`💬 ${host.name}`);
        }, 6000);
      }
    },
    [me, lang, jobById, userById, openSheet, showToast, updateJob, tr, celebrate, scheduleSafeTimeout, pushMsg]
  );

  const withdrawOffer = useCallback(
    (jobId: string) => {
      if (!me) return;
      updateJob(jobId, (j) =>
        j.status === 'open' ? { ...j, bids: j.bids.filter((b) => b.workerId !== me.id) } : j
      );
      showToast(tr('withdrawn'));
    },
    [me, updateJob, showToast, tr]
  );

  /* ---------- Host Actions ---------- */
  const publishJob = useCallback(
    (input: NewJobInput) => {
      if (!me) return;
      const job: Job = {
        ...input,
        id: uid(),
        hostId: me.id,
        status: 'open',
        assignedBidId: null,
        featured: false,
        createdAt: Date.now(),
        reviews: {},
        bids: [],
      };
      updateJobs((js) => [job, ...js]);
      setTabState('jobs');
      showToast(tr('posted_ok'));
      celebrate();

      const bots = users
        .filter((u) => u.isBot)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      bots.forEach((bot, i) => {
        scheduleSafeTimeout(() => {
          const factor = 0.85 + Math.random() * 0.2;
          const bid: Bid = {
            id: uid(),
            workerId: bot.id,
            amount: Math.max(50, Math.round((job.price * factor) / 10) * 10),
            pitch: pick(BOT_PITCHES),
            status: 'pending',
            chat: [],
            createdAt: Date.now(),
          };
          updateJob(job.id, (j) => (j.status === 'open' ? { ...j, bids: [bid, ...j.bids] } : j));
          showToast(`📥 ${bot.name}`);
        }, 3500 + i * 4500);
      });
    },
    [me, users, updateJobs, updateJob, showToast, tr, celebrate, scheduleSafeTimeout]
  );

  const cancelJob = useCallback(
    (jobId: string) => {
      updateJob(jobId, (j) => (j.status === 'open' ? { ...j, status: 'closed' } : j));
      setSheet(null);
      showToast(tr('job_closed'));
    },
    [updateJob, showToast, tr]
  );

  const featureJob = useCallback(
    (jobId: string) => {
      updateJob(jobId, (j) => ({ ...j, featured: true }));
      showToast('★ ' + tr('feature_post'));
    },
    [updateJob, showToast, tr]
  );

  const otherPartyOf = useCallback(
    (jobId: string, bidId: string): User | undefined => {
      const j = jobById(jobId);
      const b = j?.bids.find((x) => x.id === bidId);
      if (!j || !b || !me) return undefined;
      return userById(me.id === j.hostId ? b.workerId : j.hostId);
    },
    [jobById, userById, me]
  );

  const sendChatMessage = useCallback(
    (jobId: string, bidId: string, text: string, image?: string) => {
      if (!me || (!text.trim() && !image)) return;
      pushMsg(jobId, bidId, {
        from: me.id,
        text: text.trim(),
        time: Date.now(),
        kind: image ? 'image' : 'text',
        image,
      });
      const other = otherPartyOf(jobId, bidId);
      if (other?.isBot) {
        scheduleSafeTimeout(() => {
          pushMsg(jobId, bidId, {
            from: other.id,
            text: pick(BOT_REPLIES),
            time: Date.now(),
            kind: 'text',
          });
        }, 1400);
      }
    },
    [me, pushMsg, otherPartyOf, scheduleSafeTimeout]
  );

  const acceptCounterAs = useCallback(
    (jobId: string, bidId: string, actorId: string) => {
      updateBid(jobId, bidId, (b) =>
        b.counterAmount
          ? {
              ...b,
              amount: b.counterAmount,
              counterAmount: undefined,
              chat: [
                ...b.chat,
                {
                  from: actorId,
                  kind: 'system',
                  text: 'price_agreed',
                  amount: b.counterAmount,
                  time: Date.now(),
                },
              ],
            }
          : b
      );
    },
    [updateBid]
  );

  const sendCounter = useCallback(
    (jobId: string, bidId: string, amount: number) => {
      if (!me || amount < 50) return;
      updateBid(jobId, bidId, (b) => ({
        ...b,
        counterAmount: amount,
        chat: [
          ...b.chat,
          { from: me.id, kind: 'counter', text: '', amount, time: Date.now() },
        ],
      }));
      const other = otherPartyOf(jobId, bidId);
      if (other?.isBot) {
        scheduleSafeTimeout(() => acceptCounterAs(jobId, bidId, other.id), 2200);
      }
    },
    [me, updateBid, otherPartyOf, scheduleSafeTimeout, acceptCounterAs]
  );

  const acceptCounter = useCallback(
    (jobId: string, bidId: string) => {
      if (!me) return;
      acceptCounterAs(jobId, bidId, me.id);
      showToast('🤝 ' + tr('price_agreed'));
    },
    [me, acceptCounterAs, showToast, tr]
  );

  const assignWorker = useCallback(
    (jobId: string, bidId: string) => {
      if (!me) return;
      const now = Date.now();
      updateJob(jobId, (j) => ({
        ...j,
        status: 'assigned',
        assignedBidId: bidId,
        bids: j.bids.map((b) =>
          b.id === bidId
            ? {
                ...b,
                status: 'accepted',
                chat: [
                  ...b.chat,
                  { from: me.id, kind: 'system', text: 'sys_assigned', time: now },
                ],
              }
            : { ...b, status: 'declined' }
        ),
      }));
      showToast('🤝 ' + tr('chosen'));
      celebrate();
      const other = otherPartyOf(jobId, bidId);
      if (other?.isBot) {
        scheduleSafeTimeout(() => {
          pushMsg(jobId, bidId, {
            from: other.id,
            text: 'Thank you for choosing me! I will be there on time. 🙏',
            time: Date.now(),
            kind: 'text',
          });
        }, 1600);
      }
    },
    [me, updateJob, showToast, tr, celebrate, otherPartyOf, scheduleSafeTimeout, pushMsg]
  );

  const buildReview = (a: number, b: number, c: number, text: string) => ({
    a,
    b,
    c,
    stars: Math.round((a + b + c) / 3),
    txt: text.trim(),
    t: Date.now(),
  });

  const submitWorkerReview = useCallback(
    (jobId: string, a: number, b: number, c: number, text: string) => {
      if (!me) return;
      const job = jobById(jobId);
      if (!job) return;
      updateJob(jobId, (j) => ({
        ...j,
        status: 'done',
        reviews: { ...j.reviews, hostToWorker: buildReview(a, b, c, text) },
        bids: j.bids.map((x) =>
          x.id === j.assignedBidId
            ? {
                ...x,
                chat: [
                  ...x.chat,
                  { from: me.id, kind: 'system', text: 'sys_done', time: Date.now() },
                ],
              }
            : x
        ),
      }));
      setSheet(null);
      showToast(tr('review_published'));
      celebrate();

      const worker = userById(job.bids.find((x) => x.id === job.assignedBidId)?.workerId);
      if (worker?.isBot) {
        scheduleSafeTimeout(() => {
          const s = 4 + Math.round(Math.random());
          updateJob(jobId, (j) => ({
            ...j,
            reviews: {
              ...j.reviews,
              workerToHost: buildReview(
                s,
                5,
                s,
                'Clear instructions and friendly. Paid as agreed. 🙏'
              ),
            },
          }));
          showToast(`⭐ ${worker.name}`);
        }, 3500);
      }
    },
    [me, jobById, userById, updateJob, showToast, tr, celebrate, scheduleSafeTimeout]
  );

  const submitHostReview = useCallback(
    (jobId: string, a: number, b: number, c: number, text: string) => {
      updateJob(jobId, (j) => ({
        ...j,
        reviews: { ...j.reviews, workerToHost: buildReview(a, b, c, text) },
      }));
      setSheet(null);
      showToast(tr('review_published'));
    },
    [updateJob, showToast, tr]
  );

  const submitReport = useCallback(
    (jobId: string, text: string) => {
      if (!me) return;
      updateJob(jobId, (j) => ({
        ...j,
        report: { txt: text.trim(), t: Date.now(), by: me.id },
      }));
      setSheet(null);
      showToast(tr('report_sent'));
    },
    [me, updateJob, showToast, tr]
  );

  const markChatRead = useCallback(
    (jobId: string, bidId: string, role: Role) =>
      updateBid(jobId, bidId, (b) => {
        const now = Date.now();
        if (role === 'host') {
          if (b.readHost && now - b.readHost < 500) return b;
          return { ...b, readHost: now };
        }
        if (b.readWorker && now - b.readWorker < 500) return b;
        return { ...b, readWorker: now };
      }),
    [updateBid]
  );

  const markInboxSeen = useCallback(
    (jobId: string) =>
      updateJobs((js) => {
        const j = js.find((x) => x.id === jobId);
        if (!j || j.bids.every((b) => b.seenByHost)) return js;
        return js.map((x) =>
          x.id === jobId ? { ...x, bids: x.bids.map((b) => ({ ...b, seenByHost: true })) } : x
        );
      }),
    [updateJobs]
  );

  const updateMyBio = useCallback(
    (bio: string) => {
      if (!me) return;
      updateUsers((us) => us.map((u) => (u.id === me.id ? { ...u, bio: bio.trim() } : u)));
      showToast(tr('save') + ' ✓');
    },
    [me, updateUsers, showToast, tr]
  );

  const updateUserBio = useCallback(
    (userId: string, bio: string) => {
      updateUsers((us) => us.map((u) => (u.id === userId ? { ...u, bio: bio.trim() } : u)));
      showToast(tr('save') + ' ✓');
    },
    [updateUsers, showToast, tr]
  );

  const submitKyc = useCallback(
    (data: KycData, autoApprove = true) => {
      if (!me) return;
      const status = autoApprove ? 'verified' : 'pending';
      updateUsers((us) =>
        us.map((u) =>
          u.id === me.id
            ? {
                ...u,
                kycStatus: status,
                kycData: {
                  ...data,
                  submittedAt: Date.now(),
                  verifiedAt: autoApprove ? Date.now() : undefined,
                },
              }
            : u
        )
      );
      if (autoApprove) {
        showToast(lang === 'ne' ? '✅ KYC प्रमाणीकरण सफल भयो!' : '✅ KYC verified successfully!');
        celebrate();
      } else {
        showToast(
          lang === 'ne' ? '⏳ KYC समीक्षाको लागि पेश गरियो' : '⏳ KYC submitted for review'
        );
      }
    },
    [me, lang, updateUsers, showToast, celebrate]
  );

  const value = useMemo<AppContextType>(
    () => ({
      ready,
      theme,
      setTheme,
      toggleTheme,
      lang,
      setLang,
      toggleLang,
      t: tr,
      searchQuery,
      setSearchQuery,
      view,
      setView,
      authStep,
      setAuthStep,
      authIntent,
      authPhone,
      authName,
      authArea,
      goAuth,
      sendOtp,
      verifyOtp,
      logout,
      loginAsTestAccount,
      me,
      users,
      jobs,
      pos,
      locName,
      locSet,
      radius,
      mode,
      setMode,
      tab,
      setTab,
      cat,
      setCat,
      sort,
      setSort,
      toast,
      showToast,
      successPop,
      celebrate,
      sheet,
      openSheet,
      closeSheet,
      chatCtx,
      setChatCtx,
      openChat,
      hostBadge,
      workerBadge,
      filters,
      setFilters,
      resetFilters,
      userById,
      jobById,
      ratingOf,
      reviewsOf,
      confirmLocation,
      submitOffer,
      withdrawOffer,
      publishJob,
      cancelJob,
      featureJob,
      sendChatMessage,
      sendCounter,
      acceptCounter,
      assignWorker,
      submitWorkerReview,
      submitHostReview,
      submitReport,
      markChatRead,
      markInboxSeen,
      updateMyBio,
      updateUserBio,
      submitKyc,
    }),
    [
      ready,
      theme,
      setTheme,
      toggleTheme,
      lang,
      setLang,
      toggleLang,
      tr,
      searchQuery,
      view,
      setView,
      authStep,
      authIntent,
      authPhone,
      authName,
      authArea,
      goAuth,
      sendOtp,
      verifyOtp,
      logout,
      loginAsTestAccount,
      me,
      users,
      jobs,
      pos,
      locName,
      locSet,
      radius,
      mode,
      setMode,
      tab,
      setTab,
      cat,
      sort,
      toast,
      showToast,
      successPop,
      celebrate,
      sheet,
      openSheet,
      closeSheet,
      chatCtx,
      openChat,
      hostBadge,
      workerBadge,
      filters,
      resetFilters,
      userById,
      jobById,
      ratingOf,
      reviewsOf,
      confirmLocation,
      submitOffer,
      withdrawOffer,
      publishJob,
      cancelJob,
      featureJob,
      sendChatMessage,
      sendCounter,
      acceptCounter,
      assignWorker,
      submitWorkerReview,
      submitHostReview,
      submitReport,
      markChatRead,
      markInboxSeen,
      updateMyBio,
      updateUserBio,
      submitKyc,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
