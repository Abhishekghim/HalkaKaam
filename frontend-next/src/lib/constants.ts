import { Area, Coordinates, Job, User, KycStatus } from '../types';

export const KIRTIPUR: Coordinates = { lat: 27.6789, lng: 85.2774 };

export const AREAS: Area[] = [
  { name: 'Kathmandu', ne: 'काठमाडौं', lat: 27.7172, lng: 85.3240 },
  { name: 'Kirtipur', ne: 'कीर्तिपुर', lat: 27.6789, lng: 85.2774 },
  { name: 'Patan', ne: 'पाटन', lat: 27.6731, lng: 85.3250 },
  { name: 'Bhaktapur', ne: 'भक्तपुर', lat: 27.6710, lng: 85.4298 },
  { name: 'Pokhara', ne: 'पोखरा', lat: 28.2096, lng: 83.9856 },
  { name: 'Butwal', ne: 'बुटवल', lat: 27.7006, lng: 83.4484 },
];

export const uid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
};

export const npr = (n: number | string): string =>
  'रु ' + Number(n).toLocaleString('en-IN');

export const starsHtml = (r: number): string => {
  const f = Math.round(r);
  return '★'.repeat(f) + '☆'.repeat(5 - f);
};

export const COLORS = [
  '#DC143C',
  '#003893',
  '#1F8A5F',
  '#A36A00',
  '#6B4ABF',
  '#0E7490',
  '#B0307A',
];

export const avColor = (n?: string): string =>
  COLORS[(n || '?').charCodeAt(0) % COLORS.length];

export const initials = (n?: string): string =>
  (n || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const timeAgo = (ts: number): string => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const d = Math.PI / 180;
  const dLat = (b.lat - a.lat) * d;
  const dLng = (b.lng - a.lng) * d;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * d) * Math.cos(b.lat * d) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export const kmDist = haversineKm;

export const TEST_VERIFIED_USER: User = {
  id: 'seed-kiranbista',
  name: 'Kiran Bista',
  phone: '9801234567',
  campus: 'Pulchowk Campus',
  bio: 'Engineering student · moving & assembly. 34 gigs done! (Nepal KYC Verified)',
  baseRating: 4.9,
  baseCount: 34,
  isBot: false,
  kycStatus: 'verified',
  kycData: {
    docType: 'citizenship',
    docNumber: '27-01-78-04921',
    fullName: 'Kiran Bista',
    district: 'Kathmandu (काठमाडौँ)',
    dob: '2056-08-15',
    submittedAt: 1718000000000,
    verifiedAt: 1718000000000,
  },
  created: Date.now() - 90 * 864e5,
};

export function makeSeed(): { users: User[]; jobs: Job[] } {
  const mk = (
    name: string,
    campus: string,
    br: number,
    bc: number,
    bio: string,
    phone = '',
    kycStatus: KycStatus = 'verified'
  ): User => ({
    id: 'seed-' + name.toLowerCase().replace(/[^a-z]/g, ''),
    name,
    phone,
    campus,
    bio,
    baseRating: br,
    baseCount: bc,
    isBot: phone ? false : true,
    kycStatus,
    created: Date.now() - 90 * 864e5,
  });

  const users: User[] = [
    mk('Sunita Gurung', 'Kirtipur', 4.8, 23, 'Homemaker. I post small household tasks weekly.', '9801111111'),
    mk('Ramesh Karki', 'Balkhu', 4.5, 11, 'Shop owner near Balkhu chowk.', '9802222222'),
    mk('Anita Shrestha', 'New Baneshwor', 5.0, 8, 'Frequent delivery tasks.', '9803333333'),
    mk('Bikash Thapa', 'TU Gate', 4.7, 15, 'Looking for student tutors.'),
    mk('Prakriti Maharjan', 'Patan', 4.9, 31, 'Cleaning and gardening gigs around Patan.'),
    TEST_VERIFIED_USER,
    mk('Dipesh Maharjan', 'Kirtipur', 4.6, 12, 'BBS student, part-time at a hardware shop.'),
    mk('Sarita KC', 'Tribhuvan University', 5.0, 8, 'My brother and I take moving jobs together.'),
    mk('Roshan Tamang', 'TU Gate', 4.2, 5, 'New to HK — unverified test profile.', '9805555555', 'unverified'),
    mk('Pratiksha Sharma', 'Patan Campus', 4.9, 21, 'CSIT student · laptop repair, tutoring.', '9804444444'),
    mk('Anish Gautam', 'Kirtipur', 4.7, 9, 'BSc student, free most afternoons.'),
  ];

  const J = (
    host: string,
    title: string,
    cat: string,
    type: 'In-person' | 'Virtual',
    price: number,
    pt: 'Flat' | 'Hourly',
    lat: number,
    lng: number,
    addr: string,
    when: string,
    desc: string,
    emo: string[],
    hrs: number,
    bidsRaw: [string, number, string][] = []
  ): Job => {
    const id = uid();
    return {
      id,
      hostId: 'seed-' + host.toLowerCase().replace(/[^a-z]/g, ''),
      title,
      cat,
      type,
      price,
      ptype: pt,
      lat,
      lng,
      address: addr,
      when,
      desc,
      photos: [],
      emoji: emo,
      status: 'open',
      assignedBidId: null,
      featured: false,
      createdAt: Date.now() - hrs * 36e5,
      reviews: {},
      bids: bidsRaw.map((b) => ({
        id: uid(),
        workerId: 'seed-' + b[0].toLowerCase().replace(/[^a-z]/g, ''),
        amount: b[1],
        pitch: b[2],
        status: 'pending',
        chat: [],
        createdAt: Date.now() - hrs * 30e5,
      })),
    };
  };

  const jobs: Job[] = [
    J(
      'Sunita Gurung',
      'Need help moving study tables to 3rd floor',
      'Moving Help',
      'In-person',
      800,
      'Flat',
      27.6801,
      85.281,
      'Naya Bazar, Kirtipur',
      'Today, 4–6 PM',
      'Two study tables and a bookshelf from ground floor to 3rd floor (no lift). Under an hour. Water and chiya provided!',
      ['🪑', '🪜'],
      3,
      [
        [
          'Kiran Bista',
          750,
          'Namaste! Engineering student at Pulchowk, I live 10 min away. Done 6 moving gigs — can bring a friend.',
        ],
        [
          'Roshan Tamang',
          700,
          'New but strong and punctual. Willing to do it for a bit less to build my rating.',
        ],
      ]
    ),
    J(
      'Ramesh Karki',
      'Fix slow laptop before exam week',
      'Tech Support',
      'In-person',
      300,
      'Hourly',
      27.6855,
      85.298,
      'Balkhu Chowk',
      'Tomorrow morning',
      'Old laptop takes 10 min to boot. Needs cleanup, maybe an SSD. Looking for a CSIT student.',
      ['💻'],
      6,
      [
        [
          'Pratiksha Sharma',
          300,
          'CSIT student — I do laptop tune-ups weekly. Will bring a bootable USB.',
        ],
      ]
    ),
    J(
      'Anita Shrestha',
      'Pick up parcel from Baneshwor & drop in Kirtipur',
      'Pick-up / Delivery',
      'In-person',
      450,
      'Flat',
      27.6915,
      85.342,
      'New Baneshwor',
      'Today, before 7 PM',
      'Small box (~3 kg) at a shop in New Baneshwor → Naya Bazar, Kirtipur. Need your own scooter/cycle.',
      ['📦', '🛵'],
      2,
      [
        ['Anish Gautam', 450, 'I ride that route daily. Can pick up within the hour.'],
        ['Dipesh Maharjan', 430, 'Careful with packages, know both areas well.'],
      ]
    ),
    J(
      'Bikash Thapa',
      'Grade 8 maths tutoring, 2 sessions/week',
      'Quick Tutoring',
      'In-person',
      600,
      'Hourly',
      27.6822,
      85.2865,
      'Near TU Gate',
      'Flexible evenings',
      'Daughter needs algebra and geometry help. Patient student tutor, twice a week near TU gate.',
      ['📘', '✏️'],
      10,
      [
        ['Sarita KC', 600, 'I tutor two other Grade 8 students. Patient, with weekly progress notes.'],
      ]
    ),
    J(
      'Prakriti Maharjan',
      'Deep-clean 2BHK flat before house-warming',
      'Home Cleaning',
      'In-person',
      1500,
      'Flat',
      27.673,
      85.325,
      'Patan, Mangal Bazar',
      'Saturday morning',
      'Sweep + mop, windows, kitchen. Supplies provided. Two people may bid together.',
      ['🧹', '🪟'],
      20,
      [
        ['Sarita KC', 1400, 'My brother and I clean as a pair — 2BHK in 3 hours. Covers both.'],
        ['Roshan Tamang', 1300, 'Thorough. Cleaned my hostel common room last week.'],
      ]
    ),
    J(
      'Prakriti Maharjan',
      'Trim hedge & clear leaves, small garden',
      'Gardening',
      'In-person',
      700,
      'Flat',
      27.662,
      85.289,
      'Chobhar',
      'This weekend',
      'Small front garden. Trimmer available, bring energy. 2–3 hours.',
      ['🌿', '🍂'],
      26,
      []
    ),
    J(
      'Ramesh Karki',
      'Format & proofread BBA assignment',
      'Tech Support',
      'Virtual',
      350,
      'Flat',
      27.6855,
      85.298,
      'Online',
      'Within 2 days',
      '12-page Word doc needs APA formatting, references, grammar pass. Remote.',
      ['📄', '✅'],
      8,
      [['Pratiksha Sharma', 350, 'APA is my comfort zone. Quick turnaround with tracked changes.']]
    ),
    J(
      'Bikash Thapa',
      'Carry cement bags to rooftop (15 bags)',
      'Moving Help',
      'In-person',
      1200,
      'Flat',
      27.684,
      85.284,
      'Panga Road, Kirtipur',
      'Sunday morning',
      '15 bags (50 kg) from gate to rooftop, 2 floors. Two helpers ideal — bid per person.',
      ['🧱', '🏠'],
      5,
      [
        ['Kiran Bista', 1100, 'Done 6 cement gigs. Can bring a friend to finish in an hour.'],
        ['Dipesh Maharjan', 1200, 'I work at a hardware shop, used to cement. Free Sunday, start 7 AM.'],
        ['Sarita KC', 1000, 'My brother and I take heavy jobs together — covers both.'],
        ['Roshan Tamang', 950, 'Strong and punctual. Bidding lower to earn first reviews.'],
      ]
    ),
    J(
      'Sunita Gurung',
      'Fix kitchen sink leak & replace water tap',
      'Repairs / Handyman',
      'In-person',
      650,
      'Flat',
      27.6795,
      85.2815,
      'Naya Bazar, Kirtipur',
      'Today, anytime after 3 PM',
      'Kitchen sink pipe is leaking underneath and the main tap needs replacement. Spare washer and new tap already purchased.',
      ['🔧', '🚰'],
      4,
      [
        ['Dipesh Maharjan', 600, 'I work at hardware shop in Kirtipur and have plumbing tools. Can come at 4 PM.'],
      ]
    ),
  ];

  return { users, jobs };
}

