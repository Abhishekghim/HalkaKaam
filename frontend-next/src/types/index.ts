export type Language = 'en' | 'ne';

export type AppView = 'langpick' | 'landing' | 'auth' | 'locstep' | 'app';

export type AppMode = 'worker' | 'host';
export type Role = AppMode;

export type AppTab = 'feed' | 'bids' | 'profile' | 'wchat' | 'jobs' | 'post' | 'hchat';

export type JobType = 'In-person' | 'Virtual';
export type PriceType = 'Flat' | 'Hourly';
export type JobStatus = 'open' | 'assigned' | 'done' | 'closed';

export type SortKey = 'near' | 'pay' | 'new';
export type SortPreference = 'distance' | 'price_high' | 'price_low' | 'newest';
export type PriceFilter = 'All' | 'under500' | '500to1500' | 'over1500';

export interface FeedFilters {
  cat: string;
  type: 'All' | 'In-person' | 'Virtual';
  urgentOnly: boolean;
  priceRange: PriceFilter;
  sortBy: SortPreference;
}

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type NepalDocType = 'citizenship' | 'nid' | 'driving_license' | 'passport';

export interface KycData {
  docType: NepalDocType;
  docNumber: string;
  fullName: string;
  dob?: string;
  district: string;
  frontPhoto?: string;
  backPhoto?: string;
  submittedAt: number;
  verifiedAt?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  campus?: string;
  bio?: string;
  baseRating: number;
  baseCount: number;
  isBot?: boolean;
  created?: number;
  kycStatus?: KycStatus;
  kycData?: KycData;
}

/** text = normal message, system = milestone (text holds an i18n key), counter = price counter-offer, image = photo */
export type MsgKind = 'text' | 'system' | 'counter' | 'image';

export interface ChatMessage {
  from: string;
  text: string;
  time: number;
  kind?: MsgKind;
  amount?: number;
  image?: string;
}

export interface Bid {
  id: string;
  workerId: string;
  amount: number;
  pitch: string;
  status: 'pending' | 'accepted' | 'declined';
  chat: ChatMessage[];
  createdAt: number;
  /** pending price proposed by the poster, waiting for the helper to accept */
  counterAmount?: number;
  /** last time each side opened this chat (for unread badges) */
  readHost?: number;
  readWorker?: number;
  /** poster has seen this offer in the inbox */
  seenByHost?: boolean;
}

export interface ReviewCriteria {
  a: number;
  b: number;
  c: number;
  stars: number;
  txt: string;
  t: number;
}

export interface JobReviews {
  hostToWorker?: ReviewCriteria;
  workerToHost?: ReviewCriteria;
}

export interface Job {
  id: string;
  hostId: string;
  title: string;
  cat: string;
  type: JobType;
  price: number;
  ptype: PriceType;
  lat: number;
  lng: number;
  address?: string;
  when: string;
  desc: string;
  photos: string[];
  emoji: string[];
  status: JobStatus;
  assignedBidId: string | null;
  featured: boolean;
  urgent?: boolean;
  /** estimated hours (optional) — used to show an "≈ per hour" hint to helpers */
  hours?: number;
  createdAt: number;
  reviews: JobReviews;
  bids: Bid[];
  report?: { txt: string; t: number; by: string };
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Area {
  name: string;
  ne: string;
  lat: number;
  lng: number;
}

export type SheetType =
  | 'jobDetail'
  | 'offerForm'
  | 'inbox'
  | 'workerReview'
  | 'hostReview'
  | 'report'
  | 'profile'
  | 'filters'
  | 'kyc';

/** Sheets store IDs (not object snapshots) so they always show live data. */
export interface SheetState {
  type: SheetType;
  jobId?: string;
  userId?: string;
  role?: Role;
}
