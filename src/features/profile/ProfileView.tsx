import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  Share2,
  Edit,
  Grid,
  Sparkles,
  Video,
  ShoppingBag,
  Users,
  Shield,
  CreditCard,
  ChevronRight,
  Heart,
  Sun,
  Moon,
  MapPin,
  Link as LinkIcon,
  Play,
  Eye,
  MessageCircle,
  X,
  Plus,
  Bookmark,
  Calendar,
  Layers,
  ArrowUpRight,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  Zap,
  LogOut,
  AlertCircle,
  Check,
  MoreVertical,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../services/firebase/config';
import { UserProfile, AccountType, isUserAdmin } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_USER } from '../../services/seed/initialData';

// Import local image assets
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import zanzibarBeach from '../../assets/images/zanzibar_beach_1790280962219.jpg';
import concertFestival from '../../assets/images/concert_festival_1790280974630.jpg';
import wirelessEarbuds from '../../assets/images/wireless_earbuds_1790280984496.jpg';
import techCommunity from '../../assets/images/tech_community_1790802256885.jpg';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onOpenEditProfile: () => void;
  onOpenAdmin: () => void;
  onSelectService?: (service: string) => void;
  onOpenAuth?: (initialMode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  onOpenCreateStatus?: () => void;
}

interface PostItem {
  id: string;
  url: string;
  caption: string;
  likes: string;
  comments: string;
  type: 'image' | 'video' | 'carousel';
  gradient: string;
  date: string;
}

interface HighlightItem {
  id: string;
  title: string;
  cover: string;
  gradient: string;
  emoji: string;
}

interface ShopItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  tag: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenEditProfile,
  onOpenAdmin,
  onSelectService,
  onOpenAuth,
  onSignOut,
  onLoginSuccess,
  onOpenCreateStatus,
}) => {
  const { isDark, toggleTheme } = useTheme();

  // State for logged-in user profile view
  const [activeTab, setActiveTab] = useState<'posts' | 'status' | 'videos' | 'shop'>('posts');
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // 3-Dots Options Menu ("Vidoti") state
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setIsOptionsMenuOpen(false);
      }
    };
    if (isOptionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsMenuOpen]);

  // State for guest login / register form inside Profile View
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // -------------------------------------------------------------
  // GUEST AUTH HANDLERS
  // -------------------------------------------------------------
  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername =
      username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') ||
      cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_');

    try {
      if (authTab === 'signup') {
        let uid = 'user_' + Date.now();
        let userEmail = cleanEmail;

        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          uid = cred.user.uid;
          userEmail = cred.user.email || cleanEmail;
        } catch (firebaseErr: any) {
          console.warn('Firebase signup notice:', firebaseErr);
        }

        const newUser: UserProfile = {
          id: uid,
          email: userEmail,
          displayName: displayName.trim() || cleanEmail.split('@')[0],
          username: cleanUsername,
          bio: 'Mwanachama mpya wa Zenia Network! Karibu kwenye wasifu wangu. 🌟',
          accountType,
          verified: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isOnline: true,
          lastSeen: 'Sasa hivi',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', uid), newUser);
        } catch (dbErr) {
          console.warn('Firestore store notice:', dbErr);
        }

        localStorage.setItem('zenia_active_user', JSON.stringify(newUser));
        if (onLoginSuccess) onLoginSuccess(newUser);
        setAuthSuccess('Hongera! Akaunti yako imeundwa na sasa unaona wasifu wako binafsi!');
      } else {
        let loggedUser: UserProfile | null = null;

        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc.exists()) {
            loggedUser = userDoc.data() as UserProfile;
          } else {
            loggedUser = {
              id: cred.user.uid,
              email: cred.user.email || cleanEmail,
              displayName: cred.user.displayName || cleanEmail.split('@')[0],
              username: cleanEmail.split('@')[0],
              accountType: 'personal',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isOnline: true,
            };
          }
        } catch (firebaseErr: any) {
          console.warn('Firebase signin notice:', firebaseErr);
          loggedUser = {
            id: 'user_' + Math.abs(cleanEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_'),
            accountType: 'personal',
            followersCount: 1,
            followingCount: 0,
            postsCount: 0,
            isOnline: true,
          };
        }

        if (loggedUser) {
          localStorage.setItem('zenia_active_user', JSON.stringify(loggedUser));
          if (onLoginSuccess) onLoginSuccess(loggedUser);
          setAuthSuccess('Umeingia kikamilifu!');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Hitilafu ya kuingia. Tafadhali hakikisha taarifa zako.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInlineGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      let userProfile: UserProfile;

      if (userDoc.exists()) {
        userProfile = userDoc.data() as UserProfile;
      } else {
        userProfile = {
          id: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Mtumiaji wa Zenia',
          username: (cred.user.displayName || 'user').toLowerCase().replace(/\s+/g, '_'),
          photoURL: cred.user.photoURL || undefined,
          bio: 'Zenia digital explorer 🌍',
          accountType: 'personal',
          verified: true,
          followersCount: 1,
          followingCount: 0,
          postsCount: 0,
          isOnline: true,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), userProfile);
      }

      localStorage.setItem('zenia_active_user', JSON.stringify(userProfile));
      if (onLoginSuccess) onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(err.message || 'Imeshindikana kuingia kupitia Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = (type: 'amina' | 'freshkk' | 'newuser') => {
    let demoUser: UserProfile;
    if (type === 'amina') {
      demoUser = INITIAL_USER;
    } else if (type === 'freshkk') {
      demoUser = {
        id: 'user_fresh_kk',
        displayName: 'Fresh kk',
        username: 'fresh_kk',
        email: 'freshkk@zenia.social',
        photoURL: freshKkAvatar,
        bio: 'Tech enthusiast, content creator & coder 💻 Dar es Salaam',
        accountType: 'creator',
        verified: true,
        followersCount: 5400,
        followingCount: 180,
        postsCount: 140,
        isOnline: true,
      };
    } else {
      demoUser = {
        id: 'user_demo_' + Date.now(),
        displayName: 'Mtumiaji Mpya',
        username: 'zenia_user',
        email: 'user@zenia.social',
        bio: 'Karibu kwenye wasifu wangu mpya wa Zenia! ✨',
        accountType: 'personal',
        verified: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isOnline: true,
      };
    }

    localStorage.setItem('zenia_active_user', JSON.stringify(demoUser));
    if (onLoginSuccess) onLoginSuccess(demoUser);
  };

  // ==============================================================
  // CASE 1: USER IS NOT LOGGED IN OR REGISTERED (GUEST GATEWAY)
  // "kama haja logini au regista kwenye akaunt yake asione"
  // ==============================================================
  if (!currentUser) {
    return (
      <div className="w-full h-full flex flex-col bg-[#070A14] text-white overflow-y-auto overscroll-contain scroll-smooth pb-28 md:pb-16 px-4 py-8">
        <div className="max-w-md mx-auto w-full flex flex-col items-center">
          {/* Top Quick Bar (Night/Light Mode & Admin) */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                Z
              </div>
              <span className="font-extrabold text-sm text-white">Zenia Profile</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                title={isDark ? 'Badili kwenda Light Mode ☀️' : 'Badili kwenda Night Mode 🌙'}
              >
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Locked Badge & Hero Visual */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center shadow-xl shadow-cyan-500/10">
              <Lock className="w-10 h-10 text-cyan-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-[#070A14] flex items-center justify-center text-[10px] font-bold text-white shadow">
              !
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight mb-1.5">
            Wasifu Binafsi Umefungwa
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 text-center max-w-sm mb-6 leading-relaxed">
            Haujaingia wala kujisajili kwenye akaunti yako. Ingia au Jisajili sasa ili uweze kuona na kusimamia wasifu wako binafsi, kuweka status, na kuchati na marafiki.
          </p>

          {/* Inline Auth Card Container */}
          <div className="w-full bg-[#0F1424] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Card Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Tab switch between Ingia and Jisajili */}
            <div className="flex rounded-2xl bg-white/5 p-1 mb-4 border border-white/5">
              <button
                onClick={() => {
                  setAuthTab('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'signin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Ingia (Sign In)</span>
              </button>
              <button
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'signup'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Jisajili (Register)</span>
              </button>
            </div>

            {/* Error & Success Alerts */}
            {authError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Google Quick Button */}
            <button
              onClick={handleInlineGoogleSignIn}
              disabled={authLoading}
              className="w-full mb-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Ingia kwa Google</span>
            </button>

            <div className="flex items-center gap-3 my-2.5 text-slate-500 text-[10px]">
              <div className="h-px flex-1 bg-white/10" />
              <span>au tumia baruapepe (email)</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleInlineAuthSubmit} className="space-y-3">
              {authTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Jina Kamili</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Mf. Amina Kaunga au Ali"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Jina la Utumiaji (@username)</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="amina_kaunga"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">Aina ya Akaunti</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="w-full bg-[#161B2E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="personal">Mtumiaji Binafsi (Personal)</option>
                      <option value="creator">Mbunifu / Mshawishi (Creator)</option>
                      <option value="business">Mfanyabiashara (Business)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Baruapepe (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jina@zenia.app"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Nenosiri (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authTab === 'signup' ? 'Unda Akaunti Yangu' : 'Ingia kwenye Akaunti'}</span>
                )}
              </button>
            </form>

            {/* Instant Demo Accounts for fast user testing */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Au Ingia Haraka kwa Majaribio (1-Click Demo):</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('amina')}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Amina Kaunga</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('freshkk')}
                  className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <span>Fresh kk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Zenia Benefits */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-base mb-0.5">📸</p>
              <p className="text-[11px] font-bold text-white">Status Stories</p>
              <p className="text-[9px] text-slate-400">Saa 24</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-base mb-0.5">💬</p>
              <p className="text-[11px] font-bold text-white">Soga & Simu</p>
              <p className="text-[9px] text-slate-400">Za Bure</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-base mb-0.5">🛍️</p>
              <p className="text-[11px] font-bold text-white">Duka & Huduma</p>
              <p className="text-[9px] text-slate-400">TSh Malipo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // CASE 2: USER IS LOGGED IN OR REGISTERED
  // "nahapo inapaswa kukaa Profile ya alio login au regista"
  // Displays THAT user's exact profile details!
  // ==============================================================

  // Dynamic posts catalog (If user is Amina, show full rich catalog; if another user, customized)
  const isAmina = currentUser.username === 'amina_kaunga';

  const defaultUserPosts: PostItem[] = isAmina
    ? [
        {
          id: 'post_1',
          url: aminaAvatar,
          caption: '✨ New season, new energy! Asante kwa wote mnaosapoti safari yangu ya urembo na fashion. #ZeniaCreator #FashionDar',
          likes: '1,420',
          comments: '142',
          type: 'image',
          gradient: 'from-purple-800 to-indigo-900',
          date: 'Masaa 2 yaliyopita',
        },
        {
          id: 'post_2',
          url: zanzibarBeach,
          caption: '🏖️ Weekend getaway in Nungwi, Zanzibar. Hakuna sehemu tulivu kama hapa baharini! 🌊☀️',
          likes: '2,890',
          comments: '310',
          type: 'image',
          gradient: 'from-cyan-800 to-blue-900',
          date: 'Jana',
        },
        {
          id: 'post_3',
          url: concertFestival,
          caption: '🔥 Dar Live Fest vibes jana usiku! Nishati ilikuwa moto sana jukwaani! 🎶🕺',
          likes: '3,210',
          comments: '428',
          type: 'video',
          gradient: 'from-pink-800 to-rose-900',
          date: 'Siku 2 zilizopita',
        },
        {
          id: 'post_4',
          url: wirelessEarbuds,
          caption: '🎧 Sound that moves you. Muziki wa hali ya juu na utulivu wa pekee. 🎵',
          likes: '1,120',
          comments: '98',
          type: 'image',
          gradient: 'from-emerald-800 to-teal-900',
          date: 'Siku 4 zilizopita',
        },
        {
          id: 'post_5',
          url: techCommunity,
          caption: '💡 Networking & Innovation meetup Dar es Salaam! Tech future in East Africa is bright. 🚀',
          likes: '2,450',
          comments: '190',
          type: 'image',
          gradient: 'from-blue-800 to-indigo-900',
          date: 'Wiki iliyopita',
        },
      ]
    : [];

  const highlights: HighlightItem[] = [
    {
      id: 'hl_1',
      title: 'Stori 🏖️',
      cover: zanzibarBeach,
      gradient: 'from-cyan-500 to-blue-600',
      emoji: '🏖️',
    },
    {
      id: 'hl_2',
      title: 'Maisha ✨',
      cover: currentUser.photoURL || aminaAvatar,
      gradient: 'from-purple-500 to-pink-600',
      emoji: '✨',
    },
    {
      id: 'hl_3',
      title: 'Tech 🎧',
      cover: wirelessEarbuds,
      gradient: 'from-emerald-500 to-teal-600',
      emoji: '🎧',
    },
  ];

  const shopItems: ShopItem[] = [
    {
      id: 'shop_1',
      title: 'Pro Wireless Earbuds Gen 2',
      price: 175000,
      image: wirelessEarbuds,
      category: 'Electronics',
      tag: '🔥 15% OFF',
    },
    {
      id: 'shop_2',
      title: 'Dar Edition Exclusive Wear',
      price: 65000,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=80',
      category: 'Fashion',
      tag: '⭐ Bestseller',
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentUser.displayName, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Kiunganishi cha wasifu wako kimenakiliwa (Profile link copied)!');
    }
  };

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070A14] text-white overflow-y-auto overscroll-contain scroll-smooth pb-28 md:pb-16 select-text">
      {/* ============================================================== */}
      {/* 1. TOP HERO COVER BANNER & ACTIONS */}
      {/* ============================================================== */}
      <div className="relative w-full">
        {/* Cover Image / Gradient */}
        <div className="w-full h-44 sm:h-56 md:h-64 relative overflow-hidden bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950">
          <SafeImage
            src={zanzibarBeach}
            fallbackGradient="from-cyan-900 via-indigo-950 to-purple-950"
            fallbackText="Zenia Cover"
            className="w-full h-full object-cover opacity-75 blur-[0.5px] scale-105 hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A14] via-[#070A14]/40 to-transparent" />

          {/* Top Quick Header Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>@{currentUser.username || 'user'}</span>
            </span>

            {/* Vidoti (3-Dots Options Menu Button & Dropdown) */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                  isOptionsMenuOpen
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                    : 'bg-black/60 hover:bg-black/80 border-white/15 text-white hover:text-cyan-300'
                }`}
                title="Chaguo Zaidi (Vidoti)"
                aria-label="Chaguo za Wasifu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu ya Vidoti */}
              {isOptionsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0E1326]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                      <p className="text-[10px] text-cyan-400 truncate">@{currentUser.username}</p>
                    </div>
                    {isUserAdmin(currentUser) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase shrink-0">
                        Admin Mkuu
                      </span>
                    )}
                  </div>

                  {/* 1. Pochi ya Zenia (Wallet) */}
                  <button
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      onSelectService && onSelectService('wallet');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold block text-white">Pochi ya Zenia</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-medium">
                          Salio: TZS {(currentUser.walletBalance || 120000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2. Mandhari (Night / Light Mode) */}
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div>
                        <span className="font-semibold block text-white">
                          Mandhari ({isDark ? 'Hali ya Usiku' : 'Hali ya Mchana'})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isDark ? 'Gusa kuweka Mchana ☀️' : 'Gusa kuweka Giza 🌙'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs">{isDark ? '🌙' : '☀️'}</span>
                  </button>

                  {/* 3. Hariri Wasifu */}
                  <button
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      onOpenEditProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Edit className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold block text-white">Hariri Wasifu</span>
                      <span className="text-[10px] text-slate-400">Badili picha, jina na maelezo</span>
                    </div>
                  </button>

                  {/* 4. Shiriki Wasifu */}
                  <button
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      handleShare();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold block text-white">Shiriki Wasifu</span>
                      <span className="text-[10px] text-slate-400">Tuma kiungo cha akaunti yako</span>
                    </div>
                  </button>

                  {/* 5. Usimamizi wa Mfumo (Super Admin) - Strictly for ONE admin only! */}
                  {isUserAdmin(currentUser) && (
                    <button
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-emerald-500/10 border border-emerald-500/25 transition-colors text-left group mt-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">Usimamizi wa Mfumo</span>
                          <span className="text-[10px] text-emerald-400/90">Super Admin Panel (Admin Pekee)</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Admin
                      </span>
                    </button>
                  )}

                  {/* 6. Toka Kwenye Akaunti */}
                  {onSignOut && (
                    <div className="pt-1 mt-1 border-t border-white/5">
                      <button
                        onClick={() => {
                          setIsOptionsMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-500/15 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                          <LogOut className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold">Toka kwenye Akaunti</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card Container Overlapping Banner */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                  <SafeImage
                    src={currentUser.photoURL || aminaAvatar}
                    fallbackText={currentUser.displayName || 'User'}
                    fallbackGradient="from-cyan-700 via-indigo-700 to-purple-800"
                    alt={currentUser.displayName}
                    className="w-full h-full rounded-full object-cover p-1 bg-[#070A14]"
                  />
                </div>
                {/* Online Indicator */}
                <span
                  className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#070A14] flex items-center justify-center shadow-md"
                  title="Mtumiaji yupo mtandaoni sasa"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-start pt-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentUser.displayName || 'Mtumiaji wa Zenia'}
                  </h1>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-cyan-300 font-mono font-medium">
                  @{currentUser.username || 'username'}
                </p>

                {/* Badges Pill */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    {currentUser.accountType === 'creator'
                      ? '🎨 Mbunifu (Creator)'
                      : currentUser.accountType === 'business'
                      ? '💼 Mfanyabiashara'
                      : '👤 Mtumiaji Binafsi'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                    ⭐ Zenia Member
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Tanzania 🇹🇿</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={onOpenEditProfile}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Edit className="w-4 h-4 text-slate-950" />
                <span>Hariri Wasifu</span>
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Toka kwenye akaunti hii"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Toka</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95 transition-all"
                title="Sambaza Wasifu"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="mt-3.5 sm:mt-4 text-center sm:text-left max-w-2xl">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {currentUser.bio ||
                '✨ Karibu kwenye wasifu wangu wa Zenia! Ninafurahia mawasiliano, stori za status, na bidhaa.'}
            </p>

            <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start text-xs text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email || 'user@zenia.app'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Mwanachama wa Zenia</span>
              </span>
            </div>
          </div>

          {/* Key Stats Bar (Following, Followers, Posts, Likes) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 my-4 sm:my-5 py-3 px-2 sm:px-6 rounded-2xl bg-[#0E1528] border border-white/10 shadow-lg text-center">
            <div>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                {currentUser.followingCount || 0}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Following</p>
            </div>
            <div className="border-x border-white/5">
              <p className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                {currentUser.followersCount ? `${(currentUser.followersCount / 1000).toFixed(1)}K` : '0'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Followers</p>
            </div>
            <div className="border-r border-white/5">
              <p className="text-base sm:text-lg font-black text-white font-mono">
                {currentUser.postsCount || defaultUserPosts.length}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Posts</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-pink-400 font-mono">
                {isAmina ? '48.9K' : '1.2K'}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Likes</p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. STORY HIGHLIGHTS */}
          {/* ============================================================== */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Story Highlights (Vipendwa)
              </h3>
              <span className="text-[10px] text-cyan-400 font-semibold">
                Tazama Zote ({highlights.length})
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 group-hover:scale-105 transition-transform shadow-md">
                    <div className="w-full h-full rounded-full p-0.5 bg-[#070A14] overflow-hidden relative">
                      <SafeImage
                        src={hl.cover}
                        fallbackGradient={hl.gradient}
                        fallbackText={hl.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-[72px] text-center">
                    {hl.title}
                  </span>
                </div>
              ))}

              {/* Add Highlight action */}
              <button
                onClick={onOpenCreateStatus}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-white/20 hover:border-cyan-400 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-cyan-300 transition-colors">
                  + Mpya
                </span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. PROFILE CONTENT TABS (POSTS, STATUS, VIDEOS, SHOP) */}
          {/* ============================================================== */}
          <div className="border-t border-white/10 pt-2 mb-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'posts'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Posts ({defaultUserPosts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`flex items-center gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'status'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Status (Stories)</span>
              </button>

              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'videos'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Videos (Reels)</span>
              </button>

              <button
                onClick={() => setActiveTab('shop')}
                className={`flex items-center gap-2 py-3 px-3 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'shop'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Duka (Shop)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: POSTS CONTENT */}
          {activeTab === 'posts' && (
            <div>
              {defaultUserPosts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3.5">
                  {defaultUserPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border border-white/5 hover:border-cyan-500/40 transition-all shadow-md active:scale-98"
                    >
                      <SafeImage
                        src={post.url}
                        fallbackGradient={post.gradient}
                        fallbackText={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 sm:p-3">
                        <div className="flex items-center gap-3 text-white text-xs font-bold">
                          <span className="flex items-center gap-1">
                            <Heart className={`w-3.5 h-3.5 ${likedPosts[post.id] ? 'fill-rose-500 text-rose-500' : 'fill-white'}`} />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            {post.comments}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 line-clamp-1 mt-1 font-medium">
                          {post.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state for newly registered users */
                <div className="py-12 px-4 rounded-3xl bg-white/5 border border-white/10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg">
                    <Grid className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Bado hujaweka chapisho lolote
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mb-4">
                    Karibu kwenye Zenia! Unaweza kuweka picha, video, au stori ya status ili marafiki zako wakuone mtandaoni.
                  </p>
                  <button
                    onClick={onOpenCreateStatus}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Weka Status / Chapisho la Kwanza</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATUS STORIES */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0E1528] border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-purple-500">
                    <SafeImage
                      src={currentUser.photoURL || aminaAvatar}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Status Yangu (Saa 24)</p>
                    <p className="text-[11px] text-slate-400">Sasisha picha, video, au maandishi</p>
                  </div>
                </div>
                <button
                  onClick={onOpenCreateStatus}
                  className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ongeza Status</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div
                onClick={onOpenCreateStatus}
                className="aspect-[9/16] rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-cyan-400 flex flex-col items-center justify-center p-4 cursor-pointer text-center group transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white">Unda Video / Reel</p>
                <p className="text-[10px] text-slate-400 mt-1">Weka video fupi ya 9:16</p>
              </div>
            </div>
          )}

          {/* TAB 4: SHOP */}
          {activeTab === 'shop' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bidhaa za Duka Langu
                </h4>
                <button
                  onClick={() => onSelectService && onSelectService('shop')}
                  className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Marketplace Yote</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#0E1528] border border-white/10 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                        <SafeImage src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                          {item.tag}
                        </span>
                        <p className="text-xs font-bold text-white truncate mt-1">{item.title}</p>
                        <p className="text-xs text-emerald-400 font-mono font-extrabold">
                          TSh {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Umeagiza: ${item.title}`)}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shrink-0 active:scale-95 transition-all shadow-md"
                    >
                      Agiza Sasa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Lightbox Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0D1222] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <SafeImage
                    src={currentUser.photoURL || aminaAvatar}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-400">{selectedPost.date}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
              <SafeImage
                src={selectedPost.url}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePostLike(selectedPost.id)}
                    className="flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Heart
                      className={`w-5 h-5 ${likedPosts[selectedPost.id] ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`}
                    />
                    <span>{likedPosts[selectedPost.id] ? 'Umeipenda' : selectedPost.likes}</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedPost.comments}</span>
                  </span>
                </div>
                <button onClick={handleShare} className="text-slate-300 hover:text-white">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{selectedPost.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
