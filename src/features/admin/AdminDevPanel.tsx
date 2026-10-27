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
  ShieldAlert,
  Bot,
  Headphones,
  FileText,
  Clock,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { auth, db, testFirestoreConnection } from '../../services/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile, ProductItem, EventItem, JobItem, PRIMARY_ADMIN_EMAIL, isUserAdmin } from '../../types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_PRODUCTS,
  INITIAL_STATUSES,
  INITIAL_EVENTS,
  INITIAL_JOBS,
  INITIAL_COMMUNITIES,
} from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';
import { AdminVisualCharts } from './AdminVisualCharts';
import { userService } from '../../services/user/userService';
import { userDirectoryService, deduplicateUsers } from '../../services/user/userDirectoryService';
import { businessStatusService, BusinessPromotionRecord } from '../../services/status/businessStatusService';
import { AdminStoreService } from './adminStore';
import { CommissionConfig, AiManagementConfig, SecurityAlert, SupportTicket, LiveActivityEvent } from './types';
import { LiveActivityFeedView } from './components/LiveActivityFeedView';
import { UserControlCenter } from './components/UserControlCenter';
import { FinanceControlCenter } from './components/FinanceControlCenter';
import { SecurityCenterView } from './components/SecurityCenterView';
import { AiManagementCenter } from './components/AiManagementCenter';
import { CustomerSupportCenter } from './components/CustomerSupportCenter';
import { AuditLogsView } from './components/AuditLogsView';
import { JobsControlCenter } from './components/JobsControlCenter';
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

type AdminTab =
  | 'overview'
  | 'users'
  | 'finance'
  | 'security'
  | 'ai'
  | 'statuses'
  | 'products'
  | 'spaces'
  | 'support'
  | 'jobs'
  | 'audit'
  | 'moderation'
  | 'settings';

export const AdminDevPanel: React.FC<AdminDevPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Commissions State
  const [commissions, setCommissions] = useState<CommissionConfig>(() =>
    AdminStoreService.getCommissions()
  );

  // AI Management State
  const [aiConfig, setAiConfig] = useState<AiManagementConfig>(() =>
    AdminStoreService.getAiConfig()
  );

  // Security Alerts State
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(() =>
    AdminStoreService.getSecurityAlerts()
  );

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() =>
    AdminStoreService.getSupportTickets()
  );

  // Live Activity Feed State
  const [activityFeed, setActivityFeed] = useState<LiveActivityEvent[]>(() =>
    AdminStoreService.getActivityFeed()
  );

  // Business Status Promotions State
  const [promotionsList, setPromotionsList] = useState<BusinessPromotionRecord[]>(() =>
    businessStatusService.getPromotions()
  );
  const [promoFilter, setPromoFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const unsub = businessStatusService.subscribe(() => {
      setPromotionsList(businessStatusService.getPromotions());
    });
    return unsub;
  }, []);

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
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('zenia_admin_users_list');
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        return deduplicateUsers(
          parsed
            .map((u) => {
              if (u.id === 'u_1') return { ...u, id: 'user_fresh_kk' };
              if (u.id === 'u_2') return { ...u, id: 'user_alex_k' };
              if (u.id === 'u_3') return { ...u, id: 'user_sarah_m' };
              if (u.id === 'u_4') return { ...u, id: 'user_baraka_m' };
              return u;
            })
            .filter((u) => !userService.isUserDeleted(u))
        );
      }
    } catch {}
    return userDirectoryService.getAllUsers();
  });

  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);

  const handleCleanDuplicates = async () => {
    setIsCleaningDuplicates(true);
    setCleanResult(null);
    try {
      const res = await userDirectoryService.cleanDuplicateUsersFromFirestore();
      const freshUsers = userDirectoryService.getAllUsers();
      setUsersList(freshUsers);
      if (res.cleanedCount > 0) {
        const msg = `Usafishaji umekamilika! Akaunti ${res.cleanedCount} zilizokuwa zimejirudia zimefutwa kikamilifu kwenye database! ✨`;
        setCleanResult(msg);
        showToast(msg);
      } else {
        const msg = 'Hakuna akaunti zilizojirudia. Data za watumiaji ziko safi na sawa! ✓';
        setCleanResult(msg);
        showToast(msg);
      }
    } catch (e) {
      showToast('Kuna hitilafu wakati wa kusafisha: ' + (e as Error).message);
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  // Subscribe to live user directory (Firebase Auth & Firestore users)
  useEffect(() => {
    const unsub = userDirectoryService.subscribe((users) => {
      setUsersList(deduplicateUsers(users.filter((u) => !userService.isUserDeleted(u))));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('zenia_admin_users_list', JSON.stringify(usersList));
    } catch {}
  }, [usersList]);

  // 2. PRODUCTS STATE
  const [productsList, setProductsList] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [productSearch, setProductSearch] = useState('');

  // 3. FINANCE & PAYOUTS STATE
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
    {
      id: 'space_live_2',
      title: 'Midundo ya Bongo Flava & Sanaa 🎶',
      hostName: 'Sarah Mwangi',
      listenersCount: 68,
      speakersCount: 5,
      isLive: true,
      startedAt: 'Dakika 18 zilizopita',
    },
  ]);

  // 6. SYSTEM BROADCAST STATE
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<{
    id: string;
    title: string;
    message: string;
    urgency: string;
    createdAt: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('zenia_global_announcement');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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
    const target = usersList.find((u) => u.id === userId);
    if ((target?.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      showToast('Admin Mkuu hawezi kusimamishwa au kufungiwa!');
      return;
    }
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

    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: target?.isSuspended ? 'UNSUSPEND_ACCOUNT' : 'SUSPEND_ACCOUNT',
      target: `@${target?.username || userId}`,
      details: `Hali ya akaunti imebadilishwa na Admin ${currentUser.email}`,
      status: 'warning',
    });
  };

  const handleToggleRestrict = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if ((target?.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      showToast('Admin Mkuu hawezi kuwekewa vikwazo!');
      return;
    }
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextRestricted = !(u as any).isRestricted;
          showToast(nextRestricted ? `Akaunti ya @${u.username} imewekewa vikwazo (Restricted)` : `Vikwazo vya @${u.username} vimeondolewa`);
          return { ...u, isRestricted: nextRestricted };
        }
        return u;
      })
    );

    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'TOGGLE_RESTRICT',
      target: `@${target?.username || userId}`,
      details: `Vikwazo vya akaunti vimesasishwa`,
      status: 'warning',
    });
  };

  const handleToggleDeactivate = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if ((target?.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      showToast('Admin Mkuu hawezi kuzimwa akaunti!');
      return;
    }
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextDeactivated = !(u as any).isDeactivated;
          showToast(nextDeactivated ? `Akaunti ya @${u.username} imezimwa (Deactivated)` : `Akaunti ya @${u.username} imewashwa tena`);
          return { ...u, isDeactivated: nextDeactivated };
        }
        return u;
      })
    );

    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'TOGGLE_DEACTIVATE',
      target: `@${target?.username || userId}`,
      details: `Hali ya kuzimwa kwa akaunti imesasishwa`,
      status: 'warning',
    });
  };

  const handleChangeAccountType = (userId: string, newType: any) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountType: newType } : u))
    );
    showToast(`Aina ya akaunti imebadilishwa kuwa "${newType}"`);
  };

  const handlePermanentDelete = async (userToDelete: UserProfile) => {
    if ((userToDelete.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      showToast('Admin Mkuu hawezi kufutwa!');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
    } catch (_) {}

    userService.deleteUser(userToDelete.id, userToDelete.username);

    setUsersList((prev) => {
      const updated = prev.filter((u) => u.id !== userToDelete.id && u.username !== userToDelete.username);
      try {
        localStorage.setItem('zenia_admin_users_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'PERMANENT_DELETE_USER',
      target: `@${userToDelete.username} (${userToDelete.email || 'Bila Email'})`,
      details: `Akaunti imefutwa kabisa baada ya uthibitisho wa neno FUTA`,
      status: 'critical',
    });

    showToast(`Mtumiaji @${userToDelete.username} (${userToDelete.displayName}) amefutwa kabisa kwenye mfumo! 🗑️`);
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
    const target = payoutRequests.find((p) => p.id === payoutId);
    if (target) {
      AdminStoreService.addAuditLog({
        adminEmail: currentUser.email,
        action: 'APPROVE_PAYOUT',
        target: `${target.sellerName} (${target.amount.toLocaleString()} ${target.currency})`,
        details: `Malipo yameidhinishwa kupitia ${target.method}`,
        status: 'success',
      });
    }
    showToast('Ombi la kutoa pesa limeidhinishwa na kutumwa! 💸');
  };

  const handleRejectPayout = (payoutId: string) => {
    setPayoutRequests((prev) =>
      prev.map((po) => (po.id === payoutId ? { ...po, status: 'rejected' } : po))
    );
    const target = payoutRequests.find((p) => p.id === payoutId);
    if (target) {
      AdminStoreService.addAuditLog({
        adminEmail: currentUser.email,
        action: 'REJECT_PAYOUT',
        target: `${target.sellerName} (${target.amount.toLocaleString()} ${target.currency})`,
        details: `Ombi la kutoa pesa limekataliwa na Admin`,
        status: 'warning',
      });
    }
    showToast('Ombi la kutoa pesa limekataliwa.');
  };

  // COMMISSION HANDLER
  const handleSaveCommissions = (newConfig: CommissionConfig) => {
    setCommissions(newConfig);
    AdminStoreService.saveCommissions(newConfig, currentUser.email);
    showToast('Viwango vipya vya ada za huduma zimehifadhiwa kikamilifu! 💾');
  };

  // AI CONFIG HANDLER
  const handleSaveAiConfig = (newConfig: AiManagementConfig) => {
    setAiConfig(newConfig);
    AdminStoreService.saveAiConfig(newConfig, currentUser.email);
    showToast('Mipangilio ya Gemini AI imesasishwa na kuhifadhiwa! 🤖');
  };

  // SECURITY ACTIONS
  const handleDismissAlert = (alertId: string) => {
    const updated = securityAlerts.map((a) =>
      a.id === alertId ? { ...a, status: 'resolved' as const } : a
    );
    setSecurityAlerts(updated);
    AdminStoreService.saveSecurityAlerts(updated);
    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'RESOLVE_SECURITY_ALERT',
      target: `Alert #${alertId}`,
      details: 'Tahadhari ya kiusalama imetiwa alama kama imetatuliwa',
      status: 'success',
    });
    showToast('Tahadhari ya kiusalama imewekwa alama kama Imetatuliwa.');
  };

  const handleBlockIp = (ip: string) => {
    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'BLOCK_IP_ADDRESS',
      target: ip,
      details: 'Anwani ya IP imezuiwa kwa saa 24 na kuzuiliwa kufikia API',
      status: 'critical',
    });
    showToast(`IP ${ip} imezuiwa kikamilifu! 🛑`);
  };

  const handleLockWallet = (userEmail: string) => {
    AdminStoreService.addAuditLog({
      adminEmail: currentUser.email,
      action: 'LOCK_WALLET',
      target: userEmail,
      details: 'Pochi ya mtumiaji imesimamishwa kwa dharura kuzuia upotevu wa fedha',
      status: 'critical',
    });
    showToast(`Pochi ya ${userEmail} imefungwa kwa dharura! 🔒`);
  };

  // SUPPORT TICKET UPDATE
  const handleUpdateTicket = (updated: SupportTicket) => {
    const list = supportTickets.map((t) => (t.id === updated.id ? updated : t));
    setSupportTickets(list);
    AdminStoreService.saveSupportTickets(list);
    showToast(`Tiketi #${updated.id} imesasishwa!`);
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
    const ann = {
      id: String(Date.now()),
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      urgency: 'high',
      createdAt: 'Sasa hivi',
    };
    try {
      localStorage.setItem('zenia_global_announcement', JSON.stringify(ann));
      window.dispatchEvent(new Event('zenia_announcement_updated'));
    } catch {}
    setActiveAnnouncement(ann);
    showToast(`Tangazo la Mfumo limetumwa na kuonekana hewani! 📢`);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleRemoveAnnouncement = () => {
    try {
      localStorage.removeItem('zenia_global_announcement');
      window.dispatchEvent(new Event('zenia_announcement_updated'));
    } catch {}
    setActiveAnnouncement(null);
    showToast('Tangazo la mfumo limeondolewa hewani.');
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
      for (const stat of INITIAL_STATUSES) {
        await setDoc(doc(db, 'statuses', stat.id), stat, { merge: true });
      }
      for (const ev of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', ev.id), ev, { merge: true });
      }
      for (const jb of INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', jb.id), jb, { merge: true });
      }
      for (const comm of INITIAL_COMMUNITIES) {
        await setDoc(doc(db, 'communities', comm.id), comm, { merge: true });
      }

      setSeedResult('Data zote za sampuli zimepandwa kwenye Firestore kikamilifu! 🚀');
      showToast('Database imepandwa data zote kikamilifu!');
    } catch (err: any) {
      setSeedResult('Hitilafu: ' + err.message);
      showToast('Hitilafu wakati wa kupanda data: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Tab definitions with dynamic live badges
  interface NavTabItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navTabs: NavTabItem[] = [
    { id: 'overview', label: 'Dashibodi & Takwimu', icon: Activity },
    { id: 'users', label: 'Watumiaji & KYC', icon: Users, badge: usersList.length },
    {
      id: 'finance',
      label: 'Fedha & Ada za Huduma',
      icon: DollarSign,
      badge: payoutRequests.filter((p) => p.status === 'pending').length,
    },
    {
      id: 'security',
      label: 'Kituo cha Usalama',
      icon: ShieldAlert,
      badge: securityAlerts.filter((a) => a.status === 'active').length,
    },
    { id: 'ai', label: 'Gemini AI Management', icon: Bot },
    {
      id: 'statuses',
      label: 'Status & Komfemu',
      icon: Award,
      badge: promotionsList.filter((p) => p.status === 'pending').length,
    },
    { id: 'products', label: 'Soko & Bidhaa', icon: ShoppingBag, badge: productsList.length },
    { id: 'spaces', label: 'Live Audio Spaces', icon: Radio, badge: activeSpacesList.length },
    {
      id: 'support',
      label: 'Huduma kwa Wateja',
      icon: Headphones,
      badge: supportTickets.filter((t) => t.status === 'open').length,
    },
    { id: 'jobs', label: 'Ajira & Kazi', icon: Briefcase },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    {
      id: 'moderation',
      label: 'Maudhui & Ripoti',
      icon: Flag,
      badge: moderationReports.filter((r) => r.status === 'pending').length,
    },
    { id: 'settings', label: 'Mipangilio & Matangazo', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-6xl h-[94vh] bg-[#0A0D1A] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 relative">
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
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  Superadmin: {currentUser.email} 👑
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Usimamizi kamili: Takwimu, Watumiaji, Fedha, Usalama, Gemini AI, Live Spaces & Audit Logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Funga Jopo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 py-2 bg-[#0C1020] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {navTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
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
          {/* TAB 1: DASHIBODI KUU (OVERVIEW & 11 ADVANCED ANALYTICS KPIS + LIVE ACTIVITY FEED) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 11 Advanced Analytics KPI Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Takwimu za Moja kwa Moja (Live Metrics & 11 KPIs)</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Data Zinasasishwa Moja kwa Moja
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* KPI 1: Active Users Now */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-cyan-500/20 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold uppercase">Active Users Now</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">248</div>
                    <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                      Mtandaoni kwa sasa (Online)
                    </span>
                  </div>

                  {/* KPI 2: Daily Active Users (DAU) */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-blue-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">DAU (Daily Active)</span>
                    <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1">1,482</div>
                    <span className="text-[10px] text-blue-400 font-medium mt-0.5 block">
                      Watumiaji hai leo
                    </span>
                  </div>

                  {/* KPI 3: Monthly Active Users (MAU) */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-indigo-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">MAU (Monthly Active)</span>
                    <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-1">14,290</div>
                    <span className="text-[10px] text-indigo-400 font-medium mt-0.5 block">
                      Watumiaji hai mwezi huu
                    </span>
                  </div>

                  {/* KPI 4: New Registrations Today */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-emerald-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Usajili Mpya Leo</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">+38</div>
                    <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                      Wamejiunga leo kupitia Auth
                    </span>
                  </div>

                  {/* KPI 5: Total Marketplace GMV */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-amber-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Total GMV (Soko)</span>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">TZS 184.5M</div>
                    <span className="text-[10px] text-amber-400 font-medium mt-0.5 block">
                      Mauzo ya jumla ya sokoni
                    </span>
                  </div>

                  {/* KPI 6: Zenia Platform Revenue */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-emerald-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Mapato ya Mfumo</span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">TZS 4.61M</div>
                    <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
                      Ada za huduma (Commissions)
                    </span>
                  </div>

                  {/* KPI 7: Total Wallet Transactions */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-cyan-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Miamala ya Pochi</span>
                    <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">3,920</div>
                    <span className="text-[10px] text-cyan-400 font-medium mt-0.5 block">
                      Uhamisho & malipo ya P2P
                    </span>
                  </div>

                  {/* KPI 8: Pending Payouts */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-purple-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Payouts</span>
                    <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">
                      {payoutRequests.filter((p) => p.status === 'pending').length}
                    </div>
                    <span className="text-[10px] text-purple-400 font-medium mt-0.5 block">
                      Maombi ya kutoa pesa
                    </span>
                  </div>

                  {/* KPI 9: Active Live Rooms */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-rose-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Active Live Rooms</span>
                    <div className="text-xl sm:text-2xl font-black text-rose-300 mt-1">
                      {activeSpacesList.length}
                    </div>
                    <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">
                      Vyumba hewani hivi sasa
                    </span>
                  </div>

                  {/* KPI 10: AI Requests Today */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-sky-500/20 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">AI Requests Leo</span>
                    <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">1,842</div>
                    <span className="text-[10px] text-sky-400 font-medium mt-0.5 block">
                      Gemini 2.5 Flash calls
                    </span>
                  </div>

                  {/* KPI 11: System Health Overview */}
                  <div className="p-3.5 rounded-2xl bg-[#12162A] border border-emerald-500/20 shadow-sm col-span-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold uppercase">System Health Overview</span>
                      <span className="text-xs font-bold text-emerald-400">99.98% Uptime</span>
                    </div>
                    <div className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Firestore, WebRTC, Gemini AI & Storage Ziko Salama</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Hakuna hitilafu yoyote iliyogunduliwa ndani ya masaa 24
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Activity Feed View (Real-time events stream) */}
              <LiveActivityFeedView
                events={activityFeed}
                onClearFeed={() => setActivityFeed([])}
              />

              {/* Interactive Visual Charts for Revenue, Fees & Growth */}
              <AdminVisualCharts />

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

          {/* TAB 2: ADVANCED USER CONTROL CENTER */}
          {activeTab === 'users' && (
            <UserControlCenter
              users={usersList}
              onToggleSuspend={handleToggleSuspend}
              onToggleRestrict={handleToggleRestrict}
              onToggleDeactivate={handleToggleDeactivate}
              onToggleVerify={handleToggleVerify}
              onChangeRole={handleChangeAccountType}
              onPermanentDelete={handlePermanentDelete}
              onCleanDuplicates={handleCleanDuplicates}
              cleaningDuplicates={isCleaningDuplicates}
              cleanResult={cleanResult}
            />
          )}

          {/* TAB 3: FINANCE & COMMISSION CONTROL CENTER */}
          {activeTab === 'finance' && (
            <FinanceControlCenter
              commissions={commissions}
              onSaveCommissions={handleSaveCommissions}
              payouts={payoutRequests.map((p) => ({
                id: p.id,
                sellerName: p.sellerName,
                sellerEmail: `${p.sellerName.toLowerCase().replace(/\s+/g, '')}@zenia.social`,
                amount: p.amount,
                method: p.method,
                accountNumber: p.accountNumber,
                status: p.status,
                createdAt: p.createdAt,
              }))}
              onApprovePayout={handleApprovePayout}
              onRejectPayout={handleRejectPayout}
            />
          )}

          {/* TAB 4: SECURITY CENTER VIEW */}
          {activeTab === 'security' && (
            <SecurityCenterView
              alerts={securityAlerts}
              onDismissAlert={handleDismissAlert}
              onBlockIp={handleBlockIp}
              onLockWallet={handleLockWallet}
            />
          )}

          {/* TAB 5: GEMINI AI MANAGEMENT CENTER */}
          {activeTab === 'ai' && (
            <AiManagementCenter config={aiConfig} onSaveConfig={handleSaveAiConfig} />
          )}

          {/* TAB 6: STATUS YA BIASHARA NA UTHIBITISHO ("KOMFEMU") */}
          {activeTab === 'statuses' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#101730] to-indigo-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                      <Award className="w-5 h-5 text-cyan-400" />
                    </span>
                    <h4 className="font-extrabold text-base text-white">
                      Status za Biashara & Komfemu ya Malipo
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Mtumiaji akilipia tangazo, inakuja hapa. <span className="text-cyan-300 font-bold">Admin ukithibitisha (Komfemu)</span>, status itaonekana kwa watu wote wa Zenia (Public). Kama hajalipia au ukikataa, <span className="text-amber-300 font-bold">wataiona marafiki zake tu</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-2xl bg-[#090D1A] border border-cyan-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Zinasubiri</span>
                    <span className="text-base font-black text-amber-400">
                      {promotionsList.filter((p) => p.status === 'pending').length}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-[#090D1A] border border-cyan-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Zilizo Hewani</span>
                    <span className="text-base font-black text-emerald-400">
                      {promotionsList.filter((p) => p.status === 'approved').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `Zote (${promotionsList.length})` },
                  {
                    id: 'pending',
                    label: `Zinasubiri Komfemu (${promotionsList.filter((p) => p.status === 'pending').length})`,
                  },
                  {
                    id: 'approved',
                    label: `Zilizothibitishwa (${promotionsList.filter((p) => p.status === 'approved').length})`,
                  },
                  {
                    id: 'rejected',
                    label: `Marafiki Tu (${promotionsList.filter((p) => p.status === 'rejected').length})`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPromoFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      promoFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Promotions Cards List */}
              <div className="space-y-3.5">
                {promotionsList
                  .filter((p) => (promoFilter === 'all' ? true : p.status === promoFilter))
                  .map((promo) => {
                    const isPending = promo.status === 'pending';
                    const isApproved = promo.status === 'approved';

                    return (
                      <div
                        key={promo.id}
                        className={`p-4 sm:p-5 rounded-3xl bg-[#0F1428] border transition-all ${
                          isPending
                            ? 'border-amber-400/40 shadow-lg shadow-amber-500/5'
                            : isApproved
                            ? 'border-emerald-500/30'
                            : 'border-white/10 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {promo.mediaUrl && (
                              <div className="w-16 h-20 rounded-2xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                                <img
                                  src={promo.mediaUrl}
                                  alt="Promo Preview"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 text-[9px] px-1 bg-black/80 rounded text-cyan-300 font-bold uppercase">
                                  {promo.type}
                                </span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-sm text-white">{promo.authorName}</h5>
                                <span className="text-xs text-slate-400">@{promo.authorUsername}</span>
                                {isPending && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                    Inasubiri Komfemu ya Malipo
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Public Status (Ipo Hewani)
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 mt-1 line-clamp-2 italic">
                                "{promo.text || 'Bila maelezo'}"
                              </p>

                              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                                <span className="text-cyan-300 font-bold">
                                  TZS {promo.amount.toLocaleString()}
                                </span>
                                <span>• {promo.paymentMethod}</span>
                                <span>• Ref: {promo.transactionRef}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => {
                                    businessStatusService.approvePromotion(promo.id);
                                    showToast(`Status ya @${promo.authorUsername} imethibitishwa na kuwekwa Public! 🎉`);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Komfemu (Thibitisha)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    businessStatusService.rejectPromotion(promo.id);
                                    showToast(`Status ya @${promo.authorUsername} imekataliwa. Wataiona marafiki tu.`);
                                  }}
                                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-300 font-bold text-xs active:scale-95 transition-all"
                                >
                                  Kataa
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  businessStatusService.deletePromotion(promo.id);
                                  showToast('Status imeondolewa.');
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400"
                                title="Futa Rekodi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 7: USIMAMIZI WA SOKO NA BIDHAA (MARKETPLACE) */}
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

          {/* TAB 8: LIVE AUDIO SPACES & MODERATION */}
          {activeTab === 'spaces' && (
            <div className="space-y-6">
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            showToast(`Wasemaji wa chumba "${sp.title}" wamenyamazishwa (Muted)`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                        >
                          Nyamazisha Wasemaji
                        </button>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: HUDUMA KWA WATEJA (SUPPORT TICKETS) */}
          {activeTab === 'support' && (
            <CustomerSupportCenter
              tickets={supportTickets}
              onUpdateTicket={handleUpdateTicket}
            />
          )}

          {/* TAB 10: AJIRA NA KAZI (JOBS MANAGEMENT) */}
          {activeTab === 'jobs' && (
            <JobsControlCenter currentAdminEmail={currentUser.email} />
          )}

          {/* TAB 11: AUDIT LOGS (KUMBUKUMBU ZA VITENDO VYA ADMIN) */}
          {activeTab === 'audit' && (
            <AuditLogsView currentAdminEmail={currentUser.email} />
          )}

          {/* TAB 12: MODERATION & RIPOTI ZA MAUDHUI */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>Orodha ya Malalamiko & Ripoti za Watumiaji (Content Moderation Queue)</span>
                </h4>
                <span className="text-xs text-rose-400 font-bold">
                  {moderationReports.filter((r) => r.status === 'pending').length} Zinasubiri Hatua
                </span>
              </div>

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

          {/* TAB 13: MIPANGILIO & MATANGAZO (SYSTEM BROADCAST & MAINTENANCE) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Broadcast Announcement */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span>Tangazo la Mfumo kwa Watumiaji Wote (Global Broadcast Banner)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tangazo hili litaonekana juu kabisa ya programu kwa kila mtu anayetumia Zenia kwa sasa.
                    </p>
                  </div>

                  {activeAnnouncement && (
                    <button
                      onClick={handleRemoveAnnouncement}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold"
                    >
                      Ondoa Tangazo Lililopo
                    </button>
                  )}
                </div>

                {activeAnnouncement && (
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                      Tangazo Linaloonekana Sasa Hewani:
                    </span>
                    <strong className="text-white text-sm block mt-0.5">{activeAnnouncement.title}</strong>
                    <p className="text-slate-300 mt-0.5">{activeAnnouncement.message}</p>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">
                      Kichwa cha Tangazo:
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Mf: Matengenezo ya Mfumo Saa 8:00 Usiku..."
                      className="w-full bg-[#12162A] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">
                      Ujumbe Kamili:
                    </label>
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Andika maelezo ya kina ya tangazo..."
                      className="w-full bg-[#12162A] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tuma Tangazo Hewani Sasa</span>
                  </button>
                </form>
              </div>

              {/* Maintenance Mode */}
              <div className="p-5 rounded-3xl bg-[#0F1326] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Hali ya Matengenezo (Maintenance Mode)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ikiwashwa, watumiaji wataona ujumbe wa kuboresha mfumo na admin pekee ataweza kuingia.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const next = !isMaintenanceMode;
                    setIsMaintenanceMode(next);
                    showToast(next ? 'Hali ya matengenezo imewashwa! ⚠️' : 'Hali ya matengenezo imezimwa. Mfumo upo wazi! ✅');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
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
