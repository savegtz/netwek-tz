import {
  LiveActivityEvent,
  AuditLogEntry,
  SecurityAlert,
  SupportTicket,
  CommissionConfig,
  AiManagementConfig,
  LiveSpaceDetail,
  AdminJobItem,
} from './types';

// Default Commissions
export const DEFAULT_COMMISSIONS: CommissionConfig = {
  marketplace: 2.5,
  promotedStatus: 10.0,
  liveShopping: 5.0,
  digitalServices: 3.0,
  lastUpdatedBy: 'amytzee@gmail.com',
  lastUpdatedAt: 'Sasa hivi',
};

// Default AI Management State
export const DEFAULT_AI_CONFIG: AiManagementConfig = {
  mode: 'active',
  model: 'gemini-2.5-flash',
  rateLimitPerMin: 60,
  dailyBudgetTzs: 150000,
  safetyThreshold: 'strict',
  requestsToday: 1842,
  requestsThisMonth: 42890,
  successRate: 99.4,
  avgLatencyMs: 410,
  estimatedCostTzs: 38500,
};

// Seed Live Activity Events
export const INITIAL_ACTIVITY_FEED: LiveActivityEvent[] = [
  {
    id: 'act_1',
    type: 'user_registered',
    title: 'Mtumiaji Mpya Amesajiliwa',
    description: 'Neema Mwajuma amejiunga na Zenia Network kutoka Mwanza.',
    actor: 'Neema Mwajuma',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 2 zilizopita',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'act_2',
    type: 'product_listed',
    title: 'Bidhaa Mpya Imewekwa Sokoni',
    description: 'Fresh kk ameweka "iPhone 15 Pro Max 256GB - Mpya" kwa TZS 2,850,000.',
    actor: 'Fresh kk',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 5 zilizopita',
    badgeColor: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'act_3',
    type: 'status_promoted',
    title: 'Status ya Biashara Imelipwa (Komfemu)',
    description: 'Al-Hushoom Trucking amelipia TZS 15,000 kutangaza huduma ya usafirishaji.',
    actor: 'Al-Hushoom Trucking',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 11 zilizopita',
    badgeColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'act_4',
    type: 'payout_requested',
    title: 'Ombi Jipya la Kutoa Pesa (Payout)',
    description: 'Sarah Mwangi ameomba kutoa TZS 240,000 kwenda M-Pesa (0754***219).',
    actor: 'Sarah Mwangi',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 18 zilizopita',
    badgeColor: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'act_5',
    type: 'space_started',
    title: 'Live Space Imeanzishwa Hewani',
    description: 'Chumba cha sauti "Fursa za Biashara Kariakoo 2026" kimeanza na wasikilizaji 84.',
    actor: 'Fresh kk',
    timestamp: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 26 zilizopita',
    badgeColor: 'bg-rose-500/20 text-rose-400',
  },
  {
    id: 'act_6',
    type: 'report_submitted',
    title: 'Malalamiko Mapya Yamepokelewa',
    description: 'Mtumiaji ameripoti tangazo la viatu linalodaiwa kuwa la bei ya udanganyifu.',
    actor: 'Juma Selemani',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 40 zilizopita',
    badgeColor: 'bg-rose-500/20 text-rose-400',
  },
  {
    id: 'act_7',
    type: 'wallet_transfer',
    title: 'Muamala wa Pochi Umekamilika',
    description: 'Savegamour Mteja ametuma TZS 85,000 kwa Fresh kk kwa ununuzi wa headphone.',
    actor: 'Savegamour Mteja',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    timeAgo: 'Dakika 55 zilizopita',
    badgeColor: 'bg-blue-500/20 text-blue-400',
  },
];

// Seed Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_1',
    adminEmail: 'amytzee@gmail.com',
    action: 'BADILI_COMMISSION',
    target: 'Promoted Status',
    details: 'Imesasishwa kutoka 8.0% hadi 10.0%',
    timestamp: 'Leo saa 11:42 AM',
    ipAddress: '197.250.18.42 (Vodacom TZ)',
    status: 'success',
  },
  {
    id: 'log_2',
    adminEmail: 'amytzee@gmail.com',
    action: 'IDHINISHA_PAYOUT',
    target: 'Sarah Mwangi (TZS 180,000)',
    details: 'Malipo yameidhinishwa kupitia Tigo Pesa Gateway',
    timestamp: 'Leo saa 10:15 AM',
    ipAddress: '197.250.18.42',
    status: 'success',
  },
  {
    id: 'log_3',
    adminEmail: 'amytzee@gmail.com',
    action: 'FUTA_BIDHAA_BATILI',
    target: 'Bidhaa #8491 (Dawa za kuongeza nguvu)',
    details: 'Imeondolewa kwa kukiuka miongozo ya afya na TFDA',
    timestamp: 'Jana saa 04:30 PM',
    ipAddress: '197.250.18.42',
    status: 'warning',
  },
  {
    id: 'log_4',
    adminEmail: 'savegamour@gmail.com',
    action: 'THIBITISHA_AKAUNTI_KYC',
    target: 'Al-Hushoom Trucking (@alhushoom_trucking)',
    details: 'Akaunti imepewa Blue Badge na hadhi ya Verified Business',
    timestamp: 'Juzi saa 02:10 PM',
    ipAddress: '102.214.64.12',
    status: 'success',
  },
];

// Seed Security Alerts
export const INITIAL_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'sec_1',
    severity: 'high',
    title: 'Majaribio 5 ya Kuingia Kimakosa Mfululizo (Brute-Force Alert)',
    description: 'Anwani ya IP 41.59.84.112 imejaribu kuingia kwenye akaunti 3 tofauti ndani ya dakika 2.',
    timestamp: 'Dakika 14 zilizopita',
    ipAddress: '41.59.84.112 (Dar es Salaam)',
    affectedUser: 'user_fresh_kk, amytzee@gmail.com',
    status: 'active',
    suggestedAction: 'Zuia IP kwa saa 24 na lazimisha uthibitisho wa nambari ya simu (2FA).',
  },
  {
    id: 'sec_2',
    severity: 'medium',
    title: 'Muamala Mkubwa Usio wa Kawaida Kwenye Pochi',
    description: 'Uhamisho wa TZS 1,850,000 ulifanywa kutoka akaunti iliyoundwa chini ya saa 24 zilizopita.',
    timestamp: 'Saa 1 lililopita',
    affectedUser: 'mteja_mpya_99',
    status: 'investigating',
    suggestedAction: 'Sitisha kutoa pesa hadi muuzaji athibitishe risiti.',
  },
  {
    id: 'sec_3',
    severity: 'low',
    title: 'Vifaa 4 Tofauti Vimeingia Kwenye Akaunti Moja Ndani ya Siku 1',
    description: 'Akaunti ya @savegamour_mteja ilionekana kuingia kupitia Chrome Windows, Safari iOS na Android.',
    timestamp: 'Masaa 4 yaliyopita',
    affectedUser: 'savegamourmteja@gmail.com',
    status: 'resolved',
    suggestedAction: 'Futa vikao vya zamani vya vifaa visivyotumika.',
  },
];

// Seed Support Tickets
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-2026-001',
    userEmail: 'juma@zenia.social',
    userName: 'Juma Selemani',
    subject: 'Pesa ilikatwa lakini bidhaa haijaandikwa nimelipa',
    category: 'malipo',
    priority: 'urgent',
    status: 'open',
    createdAt: 'Dakika 35 zilizopita',
    lastUpdate: 'Sasa hivi',
    messages: [
      {
        sender: 'user',
        senderName: 'Juma Selemani',
        text: 'Habari Admin, nilituma TZS 45,000 kupitia M-Pesa kwa ajili ya saa lakini muuzaji anasema hajaona muamala. Kumbukumbu namba ni MP849201.',
        timestamp: '11:45 AM',
      },
    ],
  },
  {
    id: 'TCK-2026-002',
    userEmail: 'sarah@soundwave.tz',
    userName: 'Sarah Mwangi',
    subject: 'Ombi la kupata Blue Badge (Uthibitisho wa Mbunifu)',
    category: 'akaunti',
    priority: 'normal',
    status: 'in_progress',
    createdAt: 'Masaa 3 yaliyopita',
    lastUpdate: 'Saa 1 lililopita',
    messages: [
      {
        sender: 'user',
        senderName: 'Sarah Mwangi',
        text: 'Nimefikisha wafuasi 8,900 na machapisho 300+, naomba kuunganishwa kwenye verified creator badge tafadhali.',
        timestamp: '09:20 AM',
      },
      {
        sender: 'admin',
        senderName: 'Amytzee Admin',
        text: 'Habari Sarah, maombi yako yanakaguliwa na timu yetu ya utawala. Utapokea jibu ndani ya saa 24.',
        timestamp: '10:05 AM',
      },
    ],
  },
  {
    id: 'TCK-2026-003',
    userEmail: 'alhushoom@trucks.tz',
    userName: 'Al-Hushoom Trucking',
    subject: 'Kuongeza njia mpya ya malipo ya Benki (NMB/CRDB)',
    category: 'ufundi',
    priority: 'normal',
    status: 'resolved',
    createdAt: 'Jana saa 02:00 PM',
    lastUpdate: 'Jana saa 04:30 PM',
    messages: [
      {
        sender: 'user',
        senderName: 'Al-Hushoom',
        text: 'Je, inawezekana kutoa pesa moja kwa moja kwenda akaunti yetu ya NMB badala ya M-Pesa?',
        timestamp: 'Jana 02:00 PM',
      },
      {
        sender: 'admin',
        senderName: 'Amytzee Admin',
        text: 'Ndiyo! Kwenye Pochi ya Zenia chagua "Benki", weka Namba ya Akaunti ya NMB na malipo yatatumwa moja kwa moja.',
        timestamp: 'Jana 04:30 PM',
      },
    ],
  },
];

// Seed Live Spaces Detail
export const INITIAL_LIVE_SPACES: LiveSpaceDetail[] = [
  {
    id: 'space_kariakoo',
    title: 'Fursa za Biashara Kariakoo & Usafirishaji 2026 🚛📱',
    hostName: 'Fresh kk',
    hostId: 'user_fresh_kk',
    listenersCount: 142,
    speakersCount: 4,
    durationMinutes: 48,
    reportedCount: 0,
    isRecording: true,
    topic: 'Biashara & Uchumi',
    status: 'active',
  },
  {
    id: 'space_muziki',
    title: 'Midundo ya Bongo Flava & Ubunifu wa Muziki 🎶',
    hostName: 'Amytzee Main',
    hostId: '7w6ldhpczBOVpimURqrpQ3C',
    listenersCount: 96,
    speakersCount: 6,
    durationMinutes: 24,
    reportedCount: 0,
    isRecording: false,
    topic: 'Burudani & Sanaa',
    status: 'active',
  },
  {
    id: 'space_cryptotech',
    title: 'Crypto, Pochi za Kidijitali na Usalama wa Mtandao 🔐',
    hostName: 'Tech Explorer TZ',
    hostId: 'user_tech_tz',
    listenersCount: 68,
    speakersCount: 3,
    durationMinutes: 110,
    reportedCount: 1,
    isRecording: true,
    topic: 'Teknolojia',
    status: 'flagged',
  },
];

// Seed Jobs Management
export const INITIAL_ADMIN_JOBS: AdminJobItem[] = [
  {
    id: 'job_1',
    title: 'Mbunifu wa Michoro & Video (Graphic & Reels Designer)',
    company: 'SoundWave Tanzania',
    employerId: 'user_sarah_m',
    employerEmail: 'sarah@soundwave.tz',
    location: 'Dar es Salaam (Kinondoni / Remote)',
    salary: 'TZS 850,000 - 1,200,000 / mwezi',
    type: 'Mkataba Kamili (Full-time)',
    postedAt: 'Siku 2 zilizopita',
    applicationsCount: 18,
    isVerifiedEmployer: true,
    isFlaggedFake: false,
    status: 'active',
  },
  {
    id: 'job_2',
    title: 'Dereva wa Malori ya Masafa Marefu (Trailer Driver)',
    company: 'Al-Hushoom Trucking Logistics',
    employerId: '3eysSI6sDmNNCfvkoZAuN7C',
    employerEmail: 'truckingalhushoom@gmail.com',
    location: 'Dar es Salaam -> Kigali / Lubumbashi',
    salary: 'TZS 1,500,000 / mwezi + Posho',
    type: 'Kazi ya Safari',
    postedAt: 'Siku 4 zilizopita',
    applicationsCount: 34,
    isVerifiedEmployer: true,
    isFlaggedFake: false,
    status: 'active',
  },
  {
    id: 'job_3',
    title: 'Kazi ya Kupiga Chapa Nyumbani (Typing Job - TZS 200,000 kwa siku)',
    company: 'Online Money Quick Inc',
    employerId: 'user_unknown_441',
    employerEmail: 'quickmoney@gmail.com',
    location: 'Mtandaoni',
    salary: 'TZS 200,000 / siku',
    type: 'Part-time',
    postedAt: 'Masaa 5 yaliyopita',
    applicationsCount: 42,
    isVerifiedEmployer: false,
    isFlaggedFake: true,
    status: 'under_review',
  },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  COMMISSIONS: 'zenia_admin_commissions',
  AI_CONFIG: 'zenia_admin_ai_config',
  AUDIT_LOGS: 'zenia_admin_audit_logs',
  SECURITY_ALERTS: 'zenia_admin_security_alerts',
  SUPPORT_TICKETS: 'zenia_admin_support_tickets',
  LIVE_SPACES: 'zenia_admin_live_spaces',
  ADMIN_JOBS: 'zenia_admin_jobs',
  ACTIVITY_FEED: 'zenia_admin_activity_feed',
};

export class AdminStoreService {
  public static getCommissions(): CommissionConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMISSIONS);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_COMMISSIONS;
  }

  public static saveCommissions(config: CommissionConfig, adminEmail: string): void {
    const updated = {
      ...config,
      lastUpdatedBy: adminEmail,
      lastUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(updated));
    } catch {}
    this.addAuditLog({
      adminEmail,
      action: 'UPDATE_COMMISSIONS',
      target: 'Ada za Mfumo',
      details: `Soko: ${config.marketplace}%, Status: ${config.promotedStatus}%, Live: ${config.liveShopping}%, Huduma: ${config.digitalServices}%`,
      status: 'success',
    });
  }

  public static getAiConfig(): AiManagementConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      if (data) return JSON.parse(data);
    } catch {}
    return DEFAULT_AI_CONFIG;
  }

  public static saveAiConfig(config: AiManagementConfig, adminEmail: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
    } catch {}
    this.addAuditLog({
      adminEmail,
      action: 'UPDATE_AI_CONFIG',
      target: 'Gemini AI Engine',
      details: `Hali: ${config.mode.toUpperCase()}, Mfano: ${config.model}, Kikomo: ${config.rateLimitPerMin}/dakika`,
      status: 'success',
    });
  }

  public static getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  }

  public static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const current = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: 'log_' + Date.now(),
      timestamp: 'Sasa hivi (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {}
  }

  public static getSecurityAlerts(): SecurityAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECURITY_ALERTS);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_SECURITY_ALERTS;
  }

  public static saveSecurityAlerts(alerts: SecurityAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY_ALERTS, JSON.stringify(alerts));
    } catch {}
  }

  public static getSupportTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_SUPPORT_TICKETS;
  }

  public static saveSupportTickets(tickets: SupportTicket[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
    } catch {}
  }

  public static getLiveSpaces(): LiveSpaceDetail[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIVE_SPACES);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_LIVE_SPACES;
  }

  public static saveLiveSpaces(spaces: LiveSpaceDetail[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_SPACES, JSON.stringify(spaces));
    } catch {}
  }

  public static getAdminJobs(): AdminJobItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_JOBS);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_ADMIN_JOBS;
  }

  public static saveAdminJobs(jobs: AdminJobItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_JOBS, JSON.stringify(jobs));
    } catch {}
  }

  public static getActivityFeed(): LiveActivityEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_ACTIVITY_FEED;
  }

  public static addActivity(event: Omit<LiveActivityEvent, 'id' | 'timestamp' | 'timeAgo'>): void {
    const current = this.getActivityFeed();
    const newEvent: LiveActivityEvent = {
      ...event,
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeAgo: 'Sasa hivi',
    };
    const updated = [newEvent, ...current].slice(0, 40);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(updated));
    } catch {}
  }
}
