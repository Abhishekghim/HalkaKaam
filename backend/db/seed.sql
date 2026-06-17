-- ============================================================
-- HALKA KAAM — seed data for local development
--   psql $DATABASE_URL -f backend/db/seed.sql
-- Fixed UUIDs (00000000-...) so the bot service can find them.
-- ============================================================

-- ---------- demo users (is_bot = TRUE → the bot service animates them) ----------
INSERT INTO users (id, phone, full_name, campus, bio, is_bot, created_at) VALUES
 ('00000000-0000-0000-0000-000000000001','9801000001','Sunita Gurung','Kirtipur','Homemaker & part-time tailor. I post small household tasks weekly.',TRUE, now()-interval '90 days'),
 ('00000000-0000-0000-0000-000000000002','9801000002','Ramesh Karki','Balkhu','Shop owner near Balkhu chowk.',TRUE, now()-interval '80 days'),
 ('00000000-0000-0000-0000-000000000003','9801000003','Anita Shrestha','New Baneshwor','Working professional, frequent delivery tasks.',TRUE, now()-interval '70 days'),
 ('00000000-0000-0000-0000-000000000004','9801000004','Bikash Thapa','TU Gate','Father of two, looking for student tutors.',TRUE, now()-interval '85 days'),
 ('00000000-0000-0000-0000-000000000005','9801000005','Prakriti Maharjan','Patan','I host cleaning and gardening gigs around Patan.',TRUE, now()-interval '60 days'),
 ('00000000-0000-0000-0000-000000000011','9801000011','Kiran Bista','Pulchowk Campus','Civil engineering student · moving & assembly specialist.',TRUE, now()-interval '75 days'),
 ('00000000-0000-0000-0000-000000000012','9801000012','Dipesh Maharjan','Kirtipur','BBS student, part-time at a hardware shop. Strong & punctual.',TRUE, now()-interval '65 days'),
 ('00000000-0000-0000-0000-000000000013','9801000013','Sarita KC','Tribhuvan University','Sociology student. My brother and I take moving jobs together.',TRUE, now()-interval '55 days'),
 ('00000000-0000-0000-0000-000000000014','9801000014','Roshan Tamang','TU Gate','New to HK — building my rating one honest gig at a time.',TRUE, now()-interval '20 days'),
 ('00000000-0000-0000-0000-000000000015','9801000015','Pratiksha Sharma','Patan Multiple Campus','CSIT student · laptop repair, formatting, tutoring.',TRUE, now()-interval '50 days'),
 ('00000000-0000-0000-0000-000000000016','9801000016','Anish Gautam','Kirtipur','BSc student, free most afternoons. Deliveries on my scooter.',TRUE, now()-interval '45 days');

-- ---------- open jobs around Kathmandu Valley ----------
INSERT INTO jobs (id, host_id, title, description, category, task_type, price_type, price_npr, address, scheduled_txt, geom, created_at) VALUES
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-000000000001',
  'Need help moving study tables to 3rd floor',
  'Two wooden study tables and one bookshelf need to go from the ground floor to the 3rd floor (no lift). Under an hour with one helper. Water and chiya provided!',
  'Moving Help','in_person','flat',800,'Naya Bazar, Kirtipur','Today · 4–6 PM',
  ST_SetSRID(ST_MakePoint(85.2810,27.6801),4326)::geography, now()-interval '3 hours'),
 ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-000000000002',
  'Fix slow laptop before exam week',
  'Old Dell laptop takes 10 minutes to boot. Probably needs a cleanup, maybe an SSD suggestion. Looking for a CSIT/engineering student who knows Windows inside out.',
  'Tech Support','in_person','hourly',300,'Balkhu Chowk','Tomorrow morning',
  ST_SetSRID(ST_MakePoint(85.2980,27.6855),4326)::geography, now()-interval '6 hours'),
 ('00000000-0000-0000-0000-00000000a003','00000000-0000-0000-0000-000000000003',
  'Pick up parcel from Baneshwor & drop in Kirtipur',
  'Small box (~3 kg) waiting at a shop in New Baneshwor. Needs to reach Naya Bazar, Kirtipur today. Must have your own scooter or cycle.',
  'Pick-up / Delivery','in_person','flat',450,'New Baneshwor','Today · before 7 PM',
  ST_SetSRID(ST_MakePoint(85.3420,27.6915),4326)::geography, now()-interval '2 hours'),
 ('00000000-0000-0000-0000-00000000a004','00000000-0000-0000-0000-000000000004',
  'Grade 8 maths tutoring, 2 sessions/week',
  'My daughter needs help with algebra and geometry. Prefer a patient student tutor who can come to our place near TU gate twice a week, 1 hour each.',
  'Quick Tutoring','in_person','hourly',600,'Near TU Gate','Flexible evenings',
  ST_SetSRID(ST_MakePoint(85.2865,27.6822),4326)::geography, now()-interval '10 hours'),
 ('00000000-0000-0000-0000-00000000a005','00000000-0000-0000-0000-000000000005',
  'Deep-clean 2BHK flat before house-warming',
  'Full sweep + mop, windows, kitchen surfaces. Cleaning supplies provided. Two people welcome to bid together — mention it in your pitch.',
  'Home Cleaning','in_person','flat',1500,'Patan, Mangal Bazar','Saturday · full morning',
  ST_SetSRID(ST_MakePoint(85.3250,27.6730),4326)::geography, now()-interval '20 hours'),
 ('00000000-0000-0000-0000-00000000a006','00000000-0000-0000-0000-000000000005',
  'Trim hedge & clear leaves, small garden',
  'Small front garden in Chobhar. Hedge trimmer available, just bring energy. Around 2–3 hours of work.',
  'Gardening','in_person','flat',700,'Chobhar','This weekend',
  ST_SetSRID(ST_MakePoint(85.2890,27.6620),4326)::geography, now()-interval '26 hours'),
 ('00000000-0000-0000-0000-00000000a007','00000000-0000-0000-0000-000000000002',
  'Format & proofread BBA assignment (virtual)',
  'A 12-page Word document needs APA formatting, references fixed and a grammar pass. Remote work — files shared after assignment.',
  'Tech Support','virtual','flat',350,'Remote','Within 2 days',
  NULL, now()-interval '8 hours'),
 ('00000000-0000-0000-0000-00000000a008','00000000-0000-0000-0000-000000000004',
  'Carry cement bags to rooftop (15 bags)',
  '15 bags of cement (50 kg each) from the gate to the rooftop, 2 floors. Two strong helpers ideal — bid per person.',
  'Moving Help','in_person','flat',1200,'Panga Road, Kirtipur','Sunday morning',
  ST_SetSRID(ST_MakePoint(85.2840,27.6840),4326)::geography, now()-interval '5 hours');

-- ---------- private bids on the open jobs ----------
INSERT INTO bids (id, job_id, worker_id, amount_npr, pitch) VALUES
 ('00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-000000000011',750,'Namaste! Engineering student at Pulchowk, I live 10 minutes away. I have done 6 moving gigs on HK — happy to bring a friend if you want it done in one hour.'),
 ('00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-000000000014',700,'New to the app but strong and punctual. Willing to do it for a bit less to build my rating. I stay near TU gate.'),
 ('00000000-0000-0000-0000-00000000b003','00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-000000000015',300,'CSIT student — I do laptop tune-ups every week. I will bring a bootable USB and can advise on an SSD within your budget.'),
 ('00000000-0000-0000-0000-00000000b004','00000000-0000-0000-0000-00000000a003','00000000-0000-0000-0000-000000000016',450,'I commute that exact route daily on my scooter. Can pick it up within the hour — see my delivery reviews.'),
 ('00000000-0000-0000-0000-00000000b005','00000000-0000-0000-0000-00000000a003','00000000-0000-0000-0000-000000000012',430,'Reliable, careful with packages, and I know both areas well.'),
 ('00000000-0000-0000-0000-00000000b006','00000000-0000-0000-0000-00000000a004','00000000-0000-0000-0000-000000000013',600,'I tutor two other Grade 8 students currently. Patient, structured, and I share weekly progress notes with parents.'),
 ('00000000-0000-0000-0000-00000000b007','00000000-0000-0000-0000-00000000a005','00000000-0000-0000-0000-000000000013',1400,'My brother and I do cleaning gigs as a pair — we can finish a 2BHK in 3 hours. This bid covers both of us.'),
 ('00000000-0000-0000-0000-00000000b008','00000000-0000-0000-0000-00000000a005','00000000-0000-0000-0000-000000000014',1300,'Hardworking and thorough. I deep-cleaned my hostel common room last week, happy to share photos.'),
 ('00000000-0000-0000-0000-00000000b009','00000000-0000-0000-0000-00000000a007','00000000-0000-0000-0000-000000000015',350,'APA is my comfort zone — I format papers for my whole class. Quick turnaround, tracked changes so you see every fix.'),
 ('00000000-0000-0000-0000-00000000b010','00000000-0000-0000-0000-00000000a008','00000000-0000-0000-0000-000000000011',1100,'I have done 6 cement-carrying gigs. Happy to bring a friend so it is done in one hour.'),
 ('00000000-0000-0000-0000-00000000b011','00000000-0000-0000-0000-00000000a008','00000000-0000-0000-0000-000000000012',1200,'I work part-time at a hardware shop so I am used to cement bags. Free all Sunday morning, can start 7 AM before it gets hot.'),
 ('00000000-0000-0000-0000-00000000b012','00000000-0000-0000-0000-00000000a008','00000000-0000-0000-0000-000000000013',1000,'My brother and I take heavy-lifting jobs together — this covers both of us. Check my 5-star reviews.'),
 ('00000000-0000-0000-0000-00000000b013','00000000-0000-0000-0000-00000000a008','00000000-0000-0000-0000-000000000014',950,'New on HK but strong and punctual. Bidding lower to earn my first reviews here.');

-- ---------- completed history so seeded users carry real public ratings ----------
-- (done jobs + double-loop reviews; geom points around the valley)
INSERT INTO jobs (id, host_id, title, description, category, task_type, price_type, price_npr, address, scheduled_txt, status, geom, created_at) VALUES
 ('00000000-0000-0000-0000-00000000c001','00000000-0000-0000-0000-000000000001','Assemble two bookshelves','Flat-pack assembly, tools provided.','Moving Help','in_person','flat',500,'Kirtipur','Done', 'done', ST_SetSRID(ST_MakePoint(85.2800,27.6790),4326)::geography, now()-interval '30 days'),
 ('00000000-0000-0000-0000-00000000c002','00000000-0000-0000-0000-000000000004','Laptop OS reinstall','Clean Windows install with drivers.','Tech Support','in_person','flat',600,'TU Gate','Done', 'done', ST_SetSRID(ST_MakePoint(85.2860,27.6825),4326)::geography, now()-interval '25 days'),
 ('00000000-0000-0000-0000-00000000c003','00000000-0000-0000-0000-000000000005','Garden weeding, half day','Weeding and clearing a small backyard.','Gardening','in_person','flat',800,'Patan','Done', 'done', ST_SetSRID(ST_MakePoint(85.3240,27.6735),4326)::geography, now()-interval '15 days');

INSERT INTO bids (id, job_id, worker_id, amount_npr, pitch, chat_open) VALUES
 ('00000000-0000-0000-0000-00000000d001','00000000-0000-0000-0000-00000000c001','00000000-0000-0000-0000-000000000011',500,'Assembly is my specialty — done in two hours.',TRUE),
 ('00000000-0000-0000-0000-00000000d002','00000000-0000-0000-0000-00000000c002','00000000-0000-0000-0000-000000000015',600,'Clean install with all drivers, data backed up first.',TRUE),
 ('00000000-0000-0000-0000-00000000d003','00000000-0000-0000-0000-00000000c003','00000000-0000-0000-0000-000000000013',800,'Half-day weeding, no problem — my brother joins free.',TRUE);

UPDATE jobs SET assigned_bid='00000000-0000-0000-0000-00000000d001' WHERE id='00000000-0000-0000-0000-00000000c001';
UPDATE jobs SET assigned_bid='00000000-0000-0000-0000-00000000d002' WHERE id='00000000-0000-0000-0000-00000000c002';
UPDATE jobs SET assigned_bid='00000000-0000-0000-0000-00000000d003' WHERE id='00000000-0000-0000-0000-00000000c003';

INSERT INTO reviews (job_id, direction, reviewer_id, reviewee_id, score_a, score_b, score_c, comment) VALUES
 ('00000000-0000-0000-0000-00000000c001','host_to_worker','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011',5,5,5,'Carried everything carefully and even helped rearrange the room. Very respectful — would hire again.'),
 ('00000000-0000-0000-0000-00000000c001','worker_to_host','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001',5,5,5,'Clear instructions, paid immediately, offered chiya. One of the best hosts I have worked for.'),
 ('00000000-0000-0000-0000-00000000c002','host_to_worker','00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000015',5,5,4,'Fixed my laptop in 40 minutes. Arrived 10 min late but messaged ahead — honest and skilled.'),
 ('00000000-0000-0000-0000-00000000c002','worker_to_host','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000004',5,4,5,'Friendly and fair. The task took longer than described but the host adjusted the pay without being asked.'),
 ('00000000-0000-0000-0000-00000000c003','host_to_worker','00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000013',5,5,5,'Two people, half the time, garden looks brand new. 100% recommended.'),
 ('00000000-0000-0000-0000-00000000c003','worker_to_host','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000005',5,5,5,'Lovely host, everything ready when we arrived, paid on the spot.');
