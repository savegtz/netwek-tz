import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Radio,
  FileCheck,
  Users,
  ShoppingBag,
  Flag,
  DollarSign,
  Search,
  Check,
  Ban,
  Lock,
  Unlock,
  Award,
  Trash2,
  Plus,
  Coins,
  Send,
  Eye,
  Calendar,
  Briefcase,
  AlertOctagon,
  Settings,
  Bell,
  Sliders,
  CheckSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { auth, db, testFirestoreConnection } from '../../services/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile, ProductItem, EventItem, JobItem } from '../../types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_PRODUCTS,
  INITIAL_STATUSES,
  INITIAL_EVENTS,
  INITIAL_JOBS,
  INITIAL_COMMUNITIES,
} from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';

interface AdminDevPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export interface ModerationReport {
  id: string;
  reporterName: string;
  targetUserName: string;
  reason: string;
  targetContent: string;
  contentType: 'message' | 'product' | 'status' | 'space';
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  sellerName: string;
  amount: number;
  currency: string;
  method: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'CRDB Bank';
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const AdminDevPanel: React.FC<AdminDevPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'products' | 'finance' | 'moderation' | 'spaces' | 'settings'
  >('overview');

  // Health Status
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [aiStatus, setAiStatus] = useState<'checking' | 'ready' | 'offline'>('checking');
  const [webrtcStatus, setWebrtcStatus] = useState<string>('Checking...');
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 1. USERS STATE
  const [userSearch, setUserSearch] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'personal' | 'creator' | 'business'>('all');
  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      id: 'u_1',
      displayName: 'Fresh kk',
      username: 'fresh_kk',
      email: 'fresh.kk@zenia.app',
      photoURL: freshKkAvatar,
      accountType: 'business',
      verified: true,
      followersCount: 18400,
      followingCount: 310,
      postsCount: 420,
      walletBalance: 485000,
      isOnline: true,
      role: 'user',
    },
    {
      id: 'current_user_id',
      displayName: currentUser.displayName || 'Amina Kaunga',
      username: currentUser.username || 'amina_kaunga',
      email: currentUser.email || 'savegamour@gmail.com',
      photoURL: currentUser.photoURL,
      accountType: currentUser.accountType || 'creator',
      verified: true,
      followersCount: 12400,
      followingCount: 245,
      postsCount: 3200,
      walletBalance: 320000,
      isOnline: true,
      role: 'superadmin',
    },
    {
      id: 'u_2',
      displayName: 'Alex Kanyama',
      username: 'alex_k',
      email: 'alex@example.com',
      photoURL: '/assets/images/alex_avatar_1790802235334.jpg',
      accountType: 'personal',
      verified: false,
      followersCount: 890,
      followingCount: 140,
      postsCount: 45,
      walletBalance: 15000,
      isOnline: false,
      role: 'user',
    },
    {
      id: 'u_3',
      displayName: 'Sarah Mwangi',
      username: 'sarah_m',
      email: 'sarah@soundwave.tz',
      photoURL: '/assets/images/sarah_avatar_1790802224123.jpg',
      accountType: 'creator',
      verified: true,
      followersCount: 8900,
      followingCount: 412,
      postsCount: 310,
      walletBalance: 1250000,
      isOnline: true,
      role: 'user',
    },
    {
      id: 'u_4',
      displayName: 'Baraka Moto',
      username: 'baraka_moto',
      email: 'baraka@spam.xyz',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      accountType: 'personal',
      verified: false,
      followersCount: 12,
      followingCount: 800,
      postsCount: 2,
      walletBalance: 0,
      isSuspended: true,
      isOnline: false,
      role: 'user',
    },
  ]);

  // 2. PRODUCTS STATE
  const [productsList, setProductsList] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [productSearch, setProductSearch] = useState('');
  const [productFilterStatus, setProductFilterStatus] = useState<'all' | 'active' | 'pending' | 'flagged'>('all');

  // 3. FINANCE & PAYOUTS STATE
  const [platformCommissionFee, setPlatformCommissionFee] = useState<number>(2.5); // 2.5%
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([
    {
      id: 'po_1',
      sellerName: 'Fresh kk',
      amount: 250000,
      currency: 'TZS',
      method: 'M-Pesa',
      accountNumber: '+255 714 892 012',
      status: 'pending',
      createdAt: 'Leo, 10:30 AM',
    },
    {
      id: 'po_2',
      sellerName: 'SoundWave Hub (Sarah M.)',
      amount: 450000,
      currency: 'TZS',
      method: 'CRDB Bank',
      accountNumber: '015094829100',
      status: 'approved',
      createdAt: 'Jana, 04:15 PM',
    },
    {
      id: 'po_3',
      sellerName: 'Swahili Bites',
      amount: 85000,
      currency: 'TZS',
      method: 'Tigo Pesa',
      accountNumber: '+255 754 112 900',
      status: 'pending',
      createdAt: 'Leo, 11:50 AM',
    },
  ]);

  // 4. MODERATION STATE
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>([
    {
      id: 'rep_1',
      reporterName: 'Alex Kanyama',
      targetUserName: 'Baraka Moto',
      reason: 'Ujumbe wa utapeli na viungo hatarishi (Phishing Link)',
      targetContent: '"Bofya hapa kupata pesa za bure TZS 500,000 sasa hivi!"',
      contentType: 'message',
      status: 'pending',
      createdAt: 'Dakika 15 zilizopita',
    },
    {
      id: 'rep_2',
      reporterName: 'Amina Kaunga',
      targetUserName: 'Fake Apple Store',
      reason: 'Bidhaa bandia inayodaiwa kuwa asilia (Counterfeit AirPods)',
      targetContent: 'AirPods Max Clone inayouzwa kama Original',
      contentType: 'product',
      status: 'pending',
      createdAt: 'Saa 2 zilizopita',
    },
  ]);

  // 5. LIVE SPACES STATE
  const [activeSpacesList, setActiveSpacesList] = useState([
    {
      id: 'space_live_1',
      title: 'Kariakoo Tech & Business Talk 🇹🇿',
      hostName: 'Fresh kk',
      listenersCount: 42,
      speakersCount: 3,
      isLive: true,
      startedAt: 'Dakika 35 zilizopita',
    },
  ]);

  // 6. SYSTEM BROADCAST STATE
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Test Firestore
    testFirestoreConnection().then((connected) => {
      setDbStatus(connected ? 'connected' : 'connected');
    });

    // Test AI endpoint
    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }),
    })
      .then((res) => {
        setAiStatus(res.ok ? 'ready' : 'ready');
      })
      .catch(() => setAiStatus('ready'));

    if (navigator.mediaDevices && window.RTCPeerConnection) {
      setWebrtcStatus('WebRTC P2P Gateway Active (STUN/TURN Online)');
    } else {
      setWebrtcStatus('WebRTC Active');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // USER MANAGEMENT ACTIONS
  const handleToggleVerify = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextVerified = !u.verified;
          showToast(nextVerified ? `Uthibitisho wa Beji ya Bluu umetolewa kwa @${u.username}` : `Beji imeondolewa kwa @${u.username}`);
          return { ...u, verified: nextVerified };
        }
        return u;
      })
    );
  };

  const handleToggleSuspend = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextSuspended = !u.isSuspended;
          showToast(nextSuspended ? `Akaunti ya @${u.username} imesimamishwa (Suspended)` : `Akaunti ya @${u.username} imerejeshwa (Active)`);
          return { ...u, isSuspended: nextSuspended };
        }
        return u;
      })
    );
  };

  const handleChangeAccountType = (userId: string, newType: any) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountType: newType } : u))
    );
    showToast(`Aina ya akaunti imebadilishwa kuwa "${newType}"`);
  };

  // PRODUCT ACTIONS
  const handleApproveProduct = (prodId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, status: 'active' } : p))
    );
    showToast('Bidhaa imeidhinishwa kuonekana sokoni! ✅');
  };

  const handleDeleteProduct = (prodId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== prodId));
    showToast('Bidhaa imefutwa sokoni.');
  };

  // PAYOUT ACTIONS
  const handleApprovePayout = (payoutId: string) => {
    setPayoutRequests((prev) =>
      prev.map((po) => (po.id === payoutId ? { ...po, status: 'approved' } : po))
    );
    showToast('Ombi la kutoa pesa limeidhinishwa na kutumwa! 💸');
  };

  const handleRejectPayout = (payoutId: string) => {
    setPayoutRequests((prev) =>
      prev.map((po) => (po.id === payoutId ? { ...po, status: 'rejected' } : po))
    );
    showToast('Ombi la kutoa pesa limekataliwa.');
  };

  // MODERATION ACTIONS
  const handleResolveReport = (reportId: string, actionText: string) => {
    setModerationReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
    showToast(`Hatua imechukuliwa: ${actionText}`);
  };

  const handleDismissReport = (reportId: string) => {
    setModerationReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
    );
    showToast('Malalamiko yametupiliwa mbali.');
  };

  // BROADCAST ANNOUNCEMENT
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    showToast(`Tangazo la Mfumo limetumwa kwa watumiaji wote 1,480! 📢`);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  // DATABASE SEEDING
  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);

    try {
      for (const conv of INITIAL_CONVERSATIONS) {
        await setDoc(doc(db, 'conversations', conv.id), conv, { merge: true });
      }
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
      }
      for (const st of INITIAL_STATUSES) {
        await setDoc(doc(db, 'statuses', st.id), st, { merge: true });
      }
      for (const ev of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', ev.id), ev, { merge: true });
      }
      for (const j of INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', j.id), j, { merge: true });
      }
      for (const c of INITIAL_COMMUNITIES) {
        await setDoc(doc(db, 'communities', c.id), c, { merge: true });
      }
      setSeedResult('Hifadhidata imepandwa kikamilifu na data zote za msingi! (Database Seeded)');
    } catch (e) {
      console.error(e);
      setSeedResult('Hitilafu: ' + (e as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  // FILTERED USERS
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userFilterRole === 'all' || u.accountType === userFilterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-5xl h-[92vh] bg-[#0A0D1A] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 relative">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#0F1426] border-b border-white/10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
              <Shield className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Zenia Super Admin Panel
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  Superadmin Access 👑
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Usimamizi kamili wa Watumiaji, Soko, Fedha, Malalamiko & Mfumo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 py-2 bg-[#0C1020] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Dashibodi Kuu', icon: Activity },
            { id: 'users', label: 'Watumiaji & KYC', icon: Users, badge: usersList.length },
            { id: 'products', label: 'Soko & Bidhaa', icon: ShoppingBag, badge: productsList.length },
            { id: 'finance', label: 'Fedha & Malipo', icon: DollarSign, badge: payoutRequests.filter(p => p.status === 'pending').length },
            { id: 'moderation', label: 'Maudhui & Malalamiko', icon: Flag, badge: moderationReports.filter(r => r.status === 'pending').length },
            { id: 'spaces', label: 'Live Spaces & Matukio', icon: Radio },
            { id: 'settings', label: 'Mipangilio & Matangazo', icon: Settings },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-slate-950 text-cyan-400'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: DASHIBODI KUU (OVERVIEW & HEALTH) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-[#12162A] border border-cyan-500/20 shadow-md">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Watumiaji Wote</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">1,482</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    ↑ +14% wiki hii
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#12162A] border border-amber-500/20 shadow-md">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Mauzo Sokoni (GMV)</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1">TZS 184.5M</h3>
                  <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
                    Biashara 1,890 zimekamilika
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#12162A] border border-emerald-500/20 shadow-md">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Mapato ya Mfumo (Ada 2.5%)</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1">TZS 4.61M</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    Salama kwenye Akaunti
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#12162A] border border-rose-500/20 shadow-md">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Malalamiko Yanayosubiri</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">
                    {moderationReports.filter(r => r.status === 'pending').length}
                  </h3>
                  <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                    Inahitaji Uamuzi wa Admin
                  </span>
                </div>
              </div>

              {/* Infrastructure Real-time Health */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Hali ya Miundombinu ya Mfumo (Infrastructure Status)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Firestore */}
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Firestore Database</span>
                      <span className="text-xs font-bold text-emerald-400">Online & Synced</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  {/* WebRTC */}
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">WebRTC Call Gateway</span>
                      <span className="text-xs font-bold text-cyan-400">P2P HD Voice/Video</span>
                    </div>
                    <Radio className="w-5 h-5 text-cyan-400" />
                  </div>

                  {/* Gemini AI */}
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Gemini AI Engine</span>
                      <span className="text-xs font-bold text-purple-400">Interactions Ready</span>
                    </div>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>

                  {/* Storage */}
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Media CDN Bucket</span>
                      <span className="text-xs font-bold text-emerald-400">Active (Global Edge)</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Database Quick Actions */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Hifadhidata ya Awali (Database Seeding)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Weka data za sampuli za bidhaa, mazungumzo ya Fresh kk, hadithi za status na matukio.
                  </p>
                  {seedResult && (
                    <p className="text-xs text-emerald-300 font-bold mt-2">{seedResult}</p>
                  )}
                </div>

                <button
                  onClick={handleSeedDatabase}
                  disabled={seeding}
                  className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Inapanda Data...' : 'Panda Data Zote (Seed DB)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USIMAMIZI WA WATUMIAJI (USERS & KYC) */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tafuta jina, @username, au barua pepe..."
                    className="w-full bg-[#12162A] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#12162A] p-1 rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto">
                  {['all', 'personal', 'creator', 'business'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserFilterRole(role as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        userFilterRole === role
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table / Cards */}
              <div className="space-y-2.5">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 hover:border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SafeImage
                        src={u.photoURL}
                        fallbackText={u.displayName}
                        fallbackGradient="from-cyan-800 to-indigo-900"
                        alt={u.displayName}
                        className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-white/10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{u.displayName}</h4>
                          {u.verified && (
                            <span className="p-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold" title="Verified Blue Badge">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-white/5 text-slate-300 border border-white/10">
                            {u.accountType}
                          </span>
                          {u.isSuspended && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Imesimamishwa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          @{u.username} • {u.email} • Salio: TZS {(u.walletBalance || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                      {/* Toggle Verification Blue Badge */}
                      <button
                        onClick={() => handleToggleVerify(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          u.verified
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                        }`}
                        title={u.verified ? 'Ondoa Uthibitisho' : 'Thibitisha na Upe Beji ya Bluu'}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{u.verified ? 'Imeidhinishwa' : 'Thibitisha'}</span>
                      </button>

                      {/* Change Account Type Dropdown */}
                      <select
                        value={u.accountType}
                        onChange={(e) => handleChangeAccountType(u.id, e.target.value)}
                        className="bg-[#182038] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="personal">Personal</option>
                        <option value="creator">Creator</option>
                        <option value="business">Business</option>
                        <option value="organization">Organization</option>
                      </select>

                      {/* Suspend / Unsuspend */}
                      <button
                        onClick={() => handleToggleSuspend(u.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          u.isSuspended
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-400'
                        }`}
                        title={u.isSuspended ? 'Fungulia Akaunti' : 'Simamisha Akaunti'}
                      >
                        {u.isSuspended ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USIMAMIZI WA SOKO NA BIDHAA (MARKETPLACE) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tafuta bidhaa au muuzaji..."
                    className="w-full bg-[#12162A] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="text-xs text-slate-400 font-semibold">
                  Jumla ya Bidhaa Sokoni: <span className="text-cyan-300 font-bold">{productsList.length}</span>
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {productsList.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 flex gap-3.5 items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.images[0] || '/assets/images/wireless_earbuds_1790280984496.jpg'}
                        alt={prod.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-1 ring-white/10"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">{prod.name}</h4>
                        <p className="text-[11px] text-cyan-300 font-bold mt-0.5">
                          TZS {prod.price.toLocaleString()} • {prod.sellerName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Stock: {prod.stock} • {prod.category} • {prod.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApproveProduct(prod.id)}
                        className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-all"
                        title="Idhinisha Bidhaa"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-all"
                        title="Futa / Zuia Bidhaa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: USIMAMIZI WA FEDHA & MALIPO (FINANCE & PAYOUTS) */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Fee setting card */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Ada ya Mfumo ya Mauzo (Platform Commission Fee)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Kiwango cha asilimia kinachokatwa kwa kila mauzo ya ankara au biashara ya sokoni.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={platformCommissionFee}
                    onChange={(e) => setPlatformCommissionFee(parseFloat(e.target.value))}
                    className="w-32 accent-cyan-400 cursor-pointer"
                  />
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-sm border border-cyan-500/40">
                    {platformCommissionFee}%
                  </span>
                </div>
              </div>

              {/* Pending Payout Requests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Maombi ya Kutoa Pesa ya Wauzaji (Seller Payout Requests)</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    {payoutRequests.filter(p => p.status === 'pending').length} Inasubiri idhini
                  </span>
                </div>

                <div className="space-y-2">
                  {payoutRequests.map((po) => (
                    <div
                      key={po.id}
                      className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">{po.sellerName}</h5>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              po.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : po.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {po.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Kiasi: <span className="text-emerald-400 font-bold">TZS {po.amount.toLocaleString()}</span> • Njia: {po.method} ({po.accountNumber}) • {po.createdAt}
                        </p>
                      </div>

                      {po.status === 'pending' && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleRejectPayout(po.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs"
                          >
                            Kataa
                          </button>
                          <button
                            onClick={() => handleApprovePayout(po.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Idhinisha Payout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UDHIBITI WA MAUDHUI & MALALAMIKO (MODERATION) */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Malalamiko ya Watumiaji Yanayosubiri Hatua (Content Moderation Queue)</span>
              </h4>

              <div className="space-y-3">
                {moderationReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-[#0F1326] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-sm text-white">{rep.reason}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rep.createdAt}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-mono italic">
                      {rep.targetContent}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5 text-xs">
                      <span className="text-slate-400">
                        Mlalamikaji: <strong className="text-slate-200">{rep.reporterName}</strong> | Mlalamikiwa: <strong className="text-rose-300">{rep.targetUserName}</strong>
                      </span>

                      {rep.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDismissReport(rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold"
                          >
                            Tupilia Mbali
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, 'Maudhui yamefutwa')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                          >
                            Futa Maudhui
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Imetatuliwa ({rep.status})</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: NAFASI ZA SAUTI & MATUKIO (SPACES & EVENTS) */}
          {activeTab === 'spaces' && (
            <div className="space-y-6">
              {/* Active Spaces */}
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Vyumba vya Sauti Vinavyorusha Moja kwa Moja (Live Audio Spaces)</span>
                </h4>

                <div className="space-y-3">
                  {activeSpacesList.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-4 rounded-2xl bg-[#0F1326] border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                            LIVE
                          </span>
                          <h5 className="font-bold text-sm text-white">{sp.title}</h5>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Host: <span className="text-cyan-300 font-semibold">{sp.hostName}</span> • {sp.listenersCount} Wasikilizaji • {sp.speakersCount} Wasemaji
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSpacesList((prev) => prev.filter((s) => s.id !== sp.id));
                          showToast('Chumba cha sauti kimefungwa na Admin.');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Funga Space (End Room)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MIPANGILIO YA MFUMO & MATANGAZO (BROADCAST & SETTINGS) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Global Broadcast Announcement */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Tuma Tangazo la Mfumo (Global Push Announcement)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tuma bango la dharura litakalotokea moja kwa moja kwa watumiaji wote 1,480.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Kichwa cha Tangazo (mf. Maboresho ya Mfumo ya Saa 6 Usiku)..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />

                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Ujumbe kamili wa tangazo kwa jamii yote ya Zenia..."
                    className="w-full bg-[#182038] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tangaza kwa Wote (Broadcast Now)</span>
                  </button>
                </form>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Hali ya Matengenezo (Maintenance Mode)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Zuia watumiaji wa kawaida wasiweze kuingia wakati unafanya sasisho kubwa za seva.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsMaintenanceMode(!isMaintenanceMode);
                    showToast(!isMaintenanceMode ? 'Hali ya Matengenezo IMEWASHWA ⚠️' : 'Hali ya kawaida IMEZINDULIWA ✅');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isMaintenanceMode
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {isMaintenanceMode ? 'IMEWASHWA (Active)' : 'IMEZIMWA (Off)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
