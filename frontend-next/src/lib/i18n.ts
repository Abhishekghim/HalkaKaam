import { Language } from '../types';

export const I18N: Record<Language, Record<string, string>> = {
  en: {
    lang_name: 'English', other_lang: 'नेपाली',
    app_tagline: 'No work is too small',
    back: 'Back', next: 'Next', cancel: 'Cancel', save: 'Save', done: 'Done',
    skip: 'Skip',

    // landing
    land_lead: 'Get everyday tasks done by trusted students nearby — or earn money helping others.',
    land_need_help: 'I need help',
    land_need_help_sub: 'Post a task. Students nearby help you.',
    land_want_work: 'I want to earn',
    land_want_work_sub: 'Find small jobs near you. Get paid.',
    land_open: 'Get started',
    choose_lang: 'Choose your language',

    // auth
    welcome: 'Welcome 🙏',
    auth_sub: 'Enter your mobile number to start. One account works for both.',
    full_name: 'Your name', name_ph: 'e.g. Aarav Bhattarai',
    mobile: 'Mobile number', mobile_ph: '98XXXXXXXX',
    area_opt: 'Your area (optional)', area_ph: 'e.g. Kirtipur',
    send_code: 'Send code',
    enter_code: 'Enter the code', code_sent_to: 'We sent a 6-digit code to',
    demo_otp: 'Demo: type any 6 digits (e.g. 123456)',
    otp_label: 'Code', verify: 'Verify',
    change_number: 'Change number',

    // location step
    where_title: 'Where are you?',
    where_sub: 'We show jobs near you. Choose how to set your location.',
    use_my_loc: 'Use my current location',
    use_my_loc_sub: 'Allow location to find jobs around you',
    pick_area: 'Choose an area instead',
    pick_area_sub: 'Pick a city or place on the map',
    locating: 'Finding your location…',
    loc_found: 'Location found',
    loc_denied: 'Could not get location — pick an area below',
    confirm_loc: 'Confirm this location',
    apply_loc: 'Apply this location',
    drag_hint: 'Drag the map to move the circle. Zoom or use the slider to change the distance.',
    your_location: 'Your location',
    showing_within: 'Showing jobs within',
    how_far: 'How far will you go?',
    how_far_sub: 'Show jobs within this distance',

    // modes / nav
    mode_work: 'Work', mode_host: 'Hire',
    nav_find: 'Find jobs', nav_pitches: 'My offers', nav_profile: 'Profile',
    nav_myjobs: 'My tasks', nav_post: 'Post',

    // feed
    near_you: 'Jobs near you', within: 'within', change: 'Change',
    no_jobs: 'No jobs here right now',
    no_jobs_sub: 'Try a bigger distance, or check again soon.',
    widen: 'Search wider',
    applied_count: 'people offered', applied_one: 'person offered',
    only_host_sees: 'Only the poster sees offers',
    you_offered: 'You offered',
    virtual: 'Online', flat: 'fixed price', hourly: 'per hour',
    away: 'away',

    // job detail + pitch
    about_poster: 'About the poster', reviews: 'reviews', tap_profile: 'tap to view',
    make_offer: 'Make an offer',
    your_offer: 'Your price', your_pitch: 'Why should they pick you?',
    pitch_ph: 'e.g. I live nearby and can come today. I have done this before.',
    send_offer: 'Send offer', offer_sent: 'Offer sent',
    offer_private: 'Your offer is private — only the poster can see it.',
    cannot_msg_first: 'You cannot message first. The poster will contact you if chosen.',

    // my pitches
    my_offers: 'My offers',
    waiting: 'Waiting for the poster',
    poster_replied: 'Poster replied — tap to chat',
    you_assigned: "You're chosen — tap to chat",
    not_chosen: 'Another person was chosen',
    completed: 'Completed',
    review_host: 'Review the poster',

    // post a job
    post_title: 'Post a task', step: 'Step',
    f_what: 'What do you need done?', f_what_ph: 'e.g. Help move tables upstairs',
    f_category: 'Type of task',
    f_where: 'Where?', f_inperson: 'At a place', f_online: 'Online',
    f_pin: 'Tap the map to place the pin',
    f_address: 'Address or landmark', f_address_ph: 'e.g. Naya Bazar, near temple',
    f_when: 'When?',
    f_desc: 'More details', f_desc_ph: 'Explain the task so helpers know what to expect',
    f_photos: 'Add photos (optional)',
    f_price: 'Your budget', f_price_type: 'Price type',
    f_amount_ph: 'Amount in NPR',
    publish: 'Post the task', free_phase: 'Free to post · no commission',
    need_title: 'Please write what you need', need_price: 'Please set a budget',
    posted_ok: 'Task posted! Students nearby can see it now 🎉',

    // host inbox
    offers_inbox: 'offers', offers_inbox_one: 'offer',
    only_you_see: 'Only you can see these offers.',
    private_bid: 'private offer', tasks_done: 'tasks done', new_helper: 'new',
    start_chat: 'Start chat', continue_chat: 'Continue chat', open_chat: 'Open chat',
    choose: 'Choose', chosen: 'Chosen',
    chat_locked: 'Chat locked — not chosen',
    feature_post: 'Feature this post for 24h',
    in_progress: 'In progress', mark_done: 'Mark done & review',
    report_issue: 'Report a problem',

    // chat
    you_started: 'You started this chat',
    poster_started: 'The poster started this chat — you can reply',
    type_msg: 'Type a message…', send: 'Send',

    // reviews
    review_worker: 'Review', rate_punctual: 'On time', rate_quality: 'Quality of work',
    rate_attitude: 'Politeness',
    rate_payment: 'Paid clearly', rate_comm: 'Communication', rate_safety: 'Safety & respect',
    public_comment: 'Public comment', comment_ph: 'Share how it went…',
    publish_review: 'Publish review', rate_all: 'Please rate all three',
    review_published: 'Review published ⭐',

    // profile
    joined: 'Joined', as_worker: 'as worker', as_host: 'as poster',
    no_reviews: 'No reviews yet',
    edit_profile: 'Edit profile', log_out: 'Log out', about_me: 'About me',
    both_ways: 'Reviews go both ways — posters rate helpers, helpers rate posters.',

    // misc
    poster: 'Poster', helper: 'Helper',

    // ---- new features ----
    all: 'All', loading: 'Loading…',
    search_ph: 'Search jobs, places…',
    sort_near: 'Closest', sort_pay: 'Highest pay', sort_new: 'Newest',
    sort_rating: 'Top rated', sort_price_low: 'Lowest price',
    jobs_found: 'jobs found',
    urgent: 'Urgent', urgent_sub: 'Needed within 2 hours',
    per_hr: '/hr',
    quick_add: 'Tap to add:',
    qp_near: 'I live nearby and can come quickly.',
    qp_exp: 'I have done this kind of work before.',
    qp_tools: 'I have my own tools / vehicle.',
    qp_free: 'I am free all evening today.',
    budget_hint: 'Poster’s budget',
    withdraw: 'Withdraw offer', withdrawn: 'Offer withdrawn',
    cancel_job: 'Close this task', job_closed: 'Task closed', closed: 'Closed',
    counter: 'Suggest a price', counter_ph: 'Your price (NPR)', send_counter: 'Send',
    counter_from_poster: 'Poster suggested a new price',
    counter_waiting: 'Waiting for helper to accept',
    accept_price: 'Accept this price', price_agreed: 'Price agreed',
    assign_this: 'Give job to this person', assign_confirm: 'Tap again to confirm',
    sys_assigned: 'Task assigned to this helper 🤝', sys_done: 'Task marked complete ✅',
    chat_wait: 'Only the poster can start this chat. You can reply as soon as they message you — this keeps inboxes free of spam.',
    chat_closed: 'This chat is closed.',
    agreed_price: 'Agreed price', offered_price: 'Offered price',
    when_today: 'Today', when_tomorrow: 'Tomorrow', when_weekend: 'This weekend', when_flex: 'Flexible',
    est_hours: 'About how many hours? (optional)', est_hours_ph: 'e.g. 2',
    new_count: 'new',
    report_sent: 'Report sent. We will look into it. 🙏',
    bio_ph: 'Share a few words about yourself…',
    stat_open: 'Open', stat_progress: 'In progress', stat_done: 'Done',
    stat_offers: 'Offers sent', stat_won: 'Chosen', stat_earned: 'Earned',
    install_app: 'Install app on this phone', language: 'Language',
    posted_by: 'Posted', ago: 'ago',
    photo: 'Photo', min_price: 'Minimum is रु 50',
    offer_more: 'Your price is higher than the budget — explain why in your pitch.',
    view_task: 'View task',
  },

  ne: {
    lang_name: 'नेपाली', other_lang: 'English',
    app_tagline: 'कुनै काम सानो हुँदैन',
    back: 'पछाडि', next: 'अर्को', cancel: 'रद्द', save: 'सुरक्षित', done: 'सम्पन्न',
    skip: 'छाड्नुहोस्',

    land_lead: 'नजिकैका भरपर्दा विद्यार्थीहरूबाट दैनिक काम गराउनुहोस् — वा अरूलाई सहयोग गरेर कमाउनुहोस्।',
    land_need_help: 'मलाई सहयोग चाहियो',
    land_need_help_sub: 'काम पोस्ट गर्नुहोस्। नजिकका विद्यार्थीले सहयोग गर्छन्।',
    land_want_work: 'म कमाउन चाहन्छु',
    land_want_work_sub: 'नजिकैको सानो काम खोज्नुहोस्। पैसा कमाउनुहोस्।',
    land_open: 'सुरु गर्नुहोस्',
    choose_lang: 'आफ्नो भाषा छान्नुहोस्',

    welcome: 'स्वागत छ 🙏',
    auth_sub: 'सुरु गर्न आफ्नो मोबाइल नम्बर हाल्नुहोस्। एउटै खाता दुवैका लागि काम गर्छ।',
    full_name: 'तपाईंको नाम', name_ph: 'जस्तै: आरव भट्टराई',
    mobile: 'मोबाइल नम्बर', mobile_ph: '98XXXXXXXX',
    area_opt: 'तपाईंको क्षेत्र (वैकल्पिक)', area_ph: 'जस्तै: कीर्तिपुर',
    send_code: 'कोड पठाउनुहोस्',
    enter_code: 'कोड हाल्नुहोस्', code_sent_to: '६ अंकको कोड पठाइयो',
    demo_otp: 'डेमो: कुनै पनि ६ अंक हाल्नुहोस् (जस्तै १२३४५६)',
    otp_label: 'कोड', verify: 'पुष्टि गर्नुहोस्',
    change_number: 'नम्बर बदल्नुहोस्',

    where_title: 'तपाईं कहाँ हुनुहुन्छ?',
    where_sub: 'हामी तपाईं नजिकका काम देखाउँछौं। स्थान कसरी राख्ने छान्नुहोस्।',
    use_my_loc: 'मेरो हालको स्थान प्रयोग गर्नुहोस्',
    use_my_loc_sub: 'नजिकका काम खोज्न स्थानको अनुमति दिनुहोस्',
    pick_area: 'क्षेत्र छान्नुहोस्',
    pick_area_sub: 'नक्सामा सहर वा ठाउँ छान्नुहोस्',
    locating: 'तपाईंको स्थान खोज्दै…',
    loc_found: 'स्थान भेटियो',
    loc_denied: 'स्थान पाइएन — तलबाट क्षेत्र छान्नुहोस्',
    confirm_loc: 'यो स्थान पुष्टि गर्नुहोस्',
    apply_loc: 'यो स्थान लागू गर्नुहोस्',
    drag_hint: 'घेरा सार्न नक्सा तान्नुहोस्। दूरी बदल्न जुम वा स्लाइडर प्रयोग गर्नुहोस्।',
    your_location: 'तपाईंको स्थान',
    showing_within: 'यति दूरीभित्रका काम',
    how_far: 'कति टाढासम्म जानुहुन्छ?',
    how_far_sub: 'यति दूरीभित्रका काम देखाउनुहोस्',

    mode_work: 'काम', mode_host: 'काम लगाउने',
    nav_find: 'काम खोज्नुहोस्', nav_pitches: 'मेरा प्रस्ताव', nav_profile: 'प्रोफाइल',
    nav_myjobs: 'मेरा काम', nav_post: 'पोस्ट',

    near_you: 'तपाईं नजिकका काम', within: 'भित्र', change: 'बदल्नुहोस्',
    no_jobs: 'अहिले यहाँ कुनै काम छैन',
    no_jobs_sub: 'ठूलो दूरी प्रयास गर्नुहोस्, वा फेरि हेर्नुहोस्।',
    widen: 'फराकिलो खोज्नुहोस्',
    applied_count: 'जनाले प्रस्ताव दिए', applied_one: 'जनाले प्रस्ताव दियो',
    only_host_sees: 'प्रस्ताव पोस्ट गर्नेले मात्र देख्छन्',
    you_offered: 'तपाईंले प्रस्ताव दिनुभयो',
    virtual: 'अनलाइन', flat: 'निश्चित मूल्य', hourly: 'प्रति घण्टा',
    away: 'टाढा',

    about_poster: 'पोस्ट गर्ने बारे', reviews: 'समीक्षा', tap_profile: 'हेर्न थिच्नुहोस्',
    make_offer: 'प्रस्ताव दिनुहोस्',
    your_offer: 'तपाईंको मूल्य', your_pitch: 'किन तपाईंलाई छान्ने?',
    pitch_ph: 'जस्तै: म नजिकै बस्छु, आज आउन सक्छु। मैले यो काम गरेको छु।',
    send_offer: 'प्रस्ताव पठाउनुहोस्', offer_sent: 'प्रस्ताव पठाइयो',
    offer_private: 'तपाईंको प्रस्ताव गोप्य छ — पोस्ट गर्नेले मात्र देख्छन्।',
    cannot_msg_first: 'तपाईंले पहिले सन्देश पठाउन सक्नुहुन्न। छानिएमा पोस्ट गर्नेले सम्पर्क गर्छन्।',

    my_offers: 'मेरा प्रस्ताव',
    waiting: 'पोस्ट गर्नेको पर्खाइमा',
    poster_replied: 'पोस्ट गर्नेले जवाफ दिए — कुराकानी गर्न थिच्नुहोस्',
    you_assigned: 'तपाईं छानिनुभयो — कुराकानी गर्न थिच्नुहोस्',
    not_chosen: 'अर्को व्यक्ति छानियो',
    completed: 'सम्पन्न भयो',
    review_host: 'पोस्ट गर्नेलाई समीक्षा',

    post_title: 'काम पोस्ट गर्नुहोस्', step: 'चरण',
    f_what: 'तपाईंलाई के गराउनु छ?', f_what_ph: 'जस्तै: माथि टेबल सार्न सहयोग',
    f_category: 'कामको प्रकार',
    f_where: 'कहाँ?', f_inperson: 'ठाउँमा', f_online: 'अनलाइन',
    f_pin: 'पिन राख्न नक्सा थिच्नुहोस्',
    f_address: 'ठेगाना वा चिनो', f_address_ph: 'जस्तै: नयाँ बजार, मन्दिर नजिक',
    f_when: 'कहिले?',
    f_desc: 'थप विवरण', f_desc_ph: 'सहयोगीलाई थाहा होस् भनेर काम बताउनुहोस्',
    f_photos: 'फोटो थप्नुहोस् (वैकल्पिक)',
    f_price: 'तपाईंको बजेट', f_price_type: 'मूल्य प्रकार',
    f_amount_ph: 'रकम (रु.)',
    publish: 'काम पोस्ट गर्नुहोस्', free_phase: 'पोस्ट निःशुल्क · कुनै कमिसन छैन',
    need_title: 'के चाहिन्छ लेख्नुहोस्', need_price: 'बजेट राख्नुहोस्',
    posted_ok: 'काम पोस्ट भयो! नजिकका विद्यार्थीले अब देख्न सक्छन् 🎉',

    offers_inbox: 'प्रस्ताव', offers_inbox_one: 'प्रस्ताव',
    only_you_see: 'यी प्रस्ताव तपाईंले मात्र देख्न सक्नुहुन्छ।',
    private_bid: 'गोप्य प्रस्ताव', tasks_done: 'काम सम्पन्न', new_helper: 'नयाँ',
    start_chat: 'कुराकानी सुरु', continue_chat: 'कुराकानी जारी', open_chat: 'कुराकानी खोल्नुहोस्',
    choose: 'छान्नुहोस्', chosen: 'छानियो',
    chat_locked: 'कुराकानी बन्द — छानिएन',
    feature_post: '२४ घण्टा फिचर गर्नुहोस्',
    in_progress: 'काम भइरहेको', mark_done: 'सम्पन्न र समीक्षा',
    report_issue: 'समस्या रिपोर्ट',

    you_started: 'तपाईंले यो कुराकानी सुरु गर्नुभयो',
    poster_started: 'पोस्ट गर्नेले कुराकानी सुरु गरे — तपाईं जवाफ दिन सक्नुहुन्छ',
    type_msg: 'सन्देश लेख्नुहोस्…', send: 'पठाउनुहोस्',

    review_worker: 'समीक्षा', rate_punctual: 'समयमा', rate_quality: 'कामको गुणस्तर',
    rate_attitude: 'शिष्टता',
    rate_payment: 'स्पष्ट भुक्तानी', rate_comm: 'सञ्चार', rate_safety: 'सुरक्षा र सम्मान',
    public_comment: 'सार्वजनिक टिप्पणी', comment_ph: 'कस्तो रह्यो लेख्नुहोस्…',
    publish_review: 'समीक्षा प्रकाशन', rate_all: 'तीनै कुरालाई मूल्याङ्कन गर्नुहोस्',
    review_published: 'समीक्षा प्रकाशित ⭐',

    joined: 'सामेल', as_worker: 'सहयोगीको रूपमा', as_host: 'पोस्ट गर्नेको रूपमा',
    no_reviews: 'अहिलेसम्म समीक्षा छैन',
    edit_profile: 'प्रोफाइल सम्पादन', log_out: 'लग आउट', about_me: 'मेरो बारे',
    both_ways: 'समीक्षा दुवैतर्फ हुन्छ — पोस्ट गर्नेले सहयोगीलाई, सहयोगीले पोस्ट गर्नेलाई।',

    poster: 'पोस्ट गर्ने', helper: 'सहयोगी',

    all: 'सबै', loading: 'लोड हुँदै…',
    search_ph: 'काम, ठाउँ खोज्नुहोस्…',
    sort_near: 'नजिकको', sort_pay: 'धेरै पैसा', sort_new: 'नयाँ',
    sort_rating: 'उच्च रेटिङ', sort_price_low: 'कम मूल्य',
    jobs_found: 'काम भेटिए',
    urgent: 'अत्यावश्यक', urgent_sub: '२ घण्टाभित्र चाहिन्छ',
    per_hr: '/घण्टा',
    quick_add: 'थप्न थिच्नुहोस्:',
    qp_near: 'म नजिकै बस्छु, छिटो आउन सक्छु।',
    qp_exp: 'मैले यस्तो काम पहिले गरेको छु।',
    qp_tools: 'मसँग आफ्नै औजार / सवारी छ।',
    qp_free: 'म आज साँझभरि खाली छु।',
    budget_hint: 'पोस्ट गर्नेको बजेट',
    withdraw: 'प्रस्ताव फिर्ता', withdrawn: 'प्रस्ताव फिर्ता लिइयो',
    cancel_job: 'यो काम बन्द गर्नुहोस्', job_closed: 'काम बन्द गरियो', closed: 'बन्द',
    counter: 'मूल्य प्रस्ताव गर्नुहोस्', counter_ph: 'तपाईंको मूल्य (रु.)', send_counter: 'पठाउनुहोस्',
    counter_from_poster: 'पोस्ट गर्नेले नयाँ मूल्य प्रस्ताव गरे',
    counter_waiting: 'सहयोगीको स्वीकृतिको पर्खाइमा',
    accept_price: 'यो मूल्य स्वीकार्नुहोस्', price_agreed: 'मूल्य सहमत',
    assign_this: 'यो व्यक्तिलाई काम दिनुहोस्', assign_confirm: 'पुष्टि गर्न फेरि थिच्नुहोस्',
    sys_assigned: 'काम यो सहयोगीलाई दिइयो 🤝', sys_done: 'काम सम्पन्न भयो ✅',
    chat_wait: 'पोस्ट गर्नेले मात्र कुराकानी सुरु गर्न सक्छन्। उनले सन्देश पठाउनेबित्तिकै तपाईं जवाफ दिन सक्नुहुन्छ — यसले स्प्याम रोक्छ।',
    chat_closed: 'यो कुराकानी बन्द छ।',
    agreed_price: 'सहमत मूल्य', offered_price: 'प्रस्तावित मूल्य',
    when_today: 'आज', when_tomorrow: 'भोलि', when_weekend: 'यो सप्ताहान्त', when_flex: 'जुनसुकै बेला',
    est_hours: 'करिब कति घण्टा? (वैकल्पिक)', est_hours_ph: 'जस्तै: २',
    new_count: 'नयाँ',
    report_sent: 'रिपोर्ट पठाइयो। हामी हेर्नेछौं। 🙏',
    bio_ph: 'आफ्नो बारेमा केही लेख्नुहोस्…',
    stat_open: 'खुला', stat_progress: 'भइरहेको', stat_done: 'सम्पन्न',
    stat_offers: 'प्रस्ताव पठाइएका', stat_won: 'छानिएका', stat_earned: 'कमाइ',
    install_app: 'यो फोनमा एप इन्स्टल गर्नुहोस्', language: 'भाषा',
    posted_by: 'पोस्ट', ago: 'अघि',
    photo: 'फोटो', min_price: 'न्यूनतम रु ५० हो',
    offer_more: 'तपाईंको मूल्य बजेटभन्दा बढी छ — किन भनेर प्रस्तावमा लेख्नुहोस्।',
    view_task: 'काम हेर्नुहोस्',
  }
};

export const CAT_T: Record<Language, Record<string, string>> = {
  en: {
    'Pick-up / Delivery': 'Pick-up / Delivery',
    'Moving Help': 'Moving Help',
    'Tech Support': 'Tech Support',
    'Home Cleaning': 'Home Cleaning',
    'Quick Tutoring': 'Quick Tutoring',
    'Gardening': 'Gardening',
    'Errands / Other': 'Errands / Other'
  },
  ne: {
    'Pick-up / Delivery': 'पिकअप / डेलिभरी',
    'Moving Help': 'सर्ने सहयोग',
    'Tech Support': 'प्रविधि सहयोग',
    'Home Cleaning': 'घर सफाई',
    'Quick Tutoring': 'ट्युशन',
    'Gardening': 'बगैंचा',
    'Errands / Other': 'काजकाम / अन्य'
  }
};

export const CATS = [
  'Pick-up / Delivery',
  'Moving Help',
  'Tech Support',
  'Home Cleaning',
  'Quick Tutoring',
  'Gardening',
  'Errands / Other'
];

export const CATICON: Record<string, string> = {
  'Pick-up / Delivery': '📦',
  'Moving Help': '🛋️',
  'Tech Support': '💻',
  'Home Cleaning': '🧹',
  'Quick Tutoring': '📘',
  'Gardening': '🌿',
  'Errands / Other': '🛍️'
};

export function t(key: string, lang: Language = 'en'): string {
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

export function catName(cat: string, lang: Language = 'en'): string {
  return (CAT_T[lang] && CAT_T[lang][cat]) || cat;
}

