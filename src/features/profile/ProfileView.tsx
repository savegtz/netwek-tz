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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

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
      <div className="w-full h-full flex flex-col bg-[#070A14] text-white overflow-y-auto overscroll-contain scroll-smooth pb-28 md:pb-16 px-3.5 sm:px-4 py-4 sm:py-6">
        <div className="max-w-sm sm:max-w-md mx-auto w-full flex flex-col items-center">
          {/* Top Quick Bar (Night/Light Mode & Admin) */}
          <div className="w-full flex items-center justify-between mb-4">
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
          <div className="relative mb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center shadow-xl shadow-cyan-500/10">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500 border-2 border-[#070A14] flex items-center justify-center text-[10px] font-bold text-white shadow">
              !
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white text-center tracking-tight mb-1">
            Wasifu Binafsi Umefungwa
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 text-center max-w-sm mb-4 leading-relaxed">
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
      showToast('Kiungo cha wasifu wako kimenakiliwa! 📋');
    }
  };

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div
      className={`w-full h-full flex flex-col ${
        isDark ? 'bg-[#070A14] text-white' : 'bg-slate-50 text-slate-900'
      } overflow-y-auto overscroll-contain scroll-smooth pb-28 md:pb-16 select-text transition-colors`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-4 right-4 z-50 max-w-sm mx-auto bg-gradient-to-r from-cyan-950 to-[#0F1426] border border-cyan-400/40 text-cyan-200 text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-cyan-400/70 hover:text-cyan-200 text-xs ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. COVER BANNER (CLEAN, ELEGANT BACKDROP WITHOUT OBSCURED PILLS) */}
      {/* ============================================================== */}
      <div className="relative w-full h-32 sm:h-44 overflow-hidden bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 shrink-0">
        <SafeImage
          src={zanzibarBeach}
          fallbackGradient="from-cyan-900 via-indigo-950 to-purple-950"
          fallbackText="Zenia Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isDark
              ? 'from-[#070A14] via-[#070A14]/25 to-transparent'
              : 'from-slate-50 via-slate-50/20 to-transparent'
          }`}
        />

        {/* Floating Controls at Top Right of Cover (Theme Toggle & 3-Dots Options) */}
        <div className="absolute top-2.5 right-3 flex items-center gap-2 z-20 pointer-events-auto">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all active:scale-95 shadow-md"
            title={isDark ? 'Badili kwenda Mchana ☀️' : 'Badili kwenda Usiku 🌙'}
            aria-label="Badili mandhari"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* Options Menu (Vidoti / 3-Dots) */}
          <div className="relative" ref={optionsMenuRef}>
            <button
              onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
              className={`p-2 rounded-full backdrop-blur-md border transition-all active:scale-95 shadow-md ${
                isOptionsMenuOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
              }`}
              title="Chaguo Zaidi"
              aria-label="Chaguo za Wasifu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu ya Vidoti (Theme-aware) */}
            {isOptionsMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] ${
                  isDark
                    ? 'bg-[#0E1326]/98 border-white/15 text-white'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                } backdrop-blur-2xl border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150`}
              >
                <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'} mb-1 flex items-center justify-between`}>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold truncate">{currentUser.displayName}</p>
                    <p className="text-[10px] text-cyan-500 truncate font-mono">@{currentUser.username}</p>
                  </div>
                  {isUserAdmin(currentUser) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold uppercase shrink-0">
                      Admin
                    </span>
                  )}
                </div>

                {/* 1. Pochi ya Zenia */}
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onSelectService && onSelectService('wallet');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    isDark
                      ? 'text-slate-200 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  } transition-colors text-left group`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold block">Pochi ya Zenia</span>
                      <span className="text-[10px] text-emerald-500 font-mono font-medium">
                        TZS {(currentUser.walletBalance || 120000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                </button>

                {/* 2. Hariri Wasifu */}
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onOpenEditProfile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${
                    isDark
                      ? 'text-slate-200 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  } transition-colors text-left`}
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
                    <Edit className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block">Hariri Wasifu</span>
                    <span className="text-[10px] text-slate-400">Picha, jina na maelezo</span>
                  </div>
                </button>

                {/* 3. Shiriki Wasifu */}
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    handleShare();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${
                    isDark
                      ? 'text-slate-200 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  } transition-colors text-left`}
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block">Shiriki Wasifu</span>
                    <span className="text-[10px] text-slate-400">Kiungo cha akaunti yako</span>
                  </div>
                </button>

                {/* 4. Super Admin Panel */}
                {isUserAdmin(currentUser) && (
                  <button
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                      isDark
                        ? 'text-slate-200 hover:text-white hover:bg-emerald-500/10'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-emerald-50'
                    } border border-emerald-500/25 transition-colors text-left mt-1`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block">Usimamizi wa Mfumo</span>
                        <span className="text-[10px] text-emerald-500/90">Super Admin Panel</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold uppercase">
                      Admin
                    </span>
                  </button>
                )}

                {/* 5. Toka Kwenye Akaunti */}
                {onSignOut && (
                  <div className={`pt-1 mt-1 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <button
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
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

      {/* ============================================================== */}
      {/* 2. PROFILE HEADER & METRICS (CLEAN, WORLD-CLASS MOBILE LAYOUT) */}
      {/* ============================================================== */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 relative z-10">
        {/* ROW 1: AVATAR (LEFT) + 3 STATS METRICS (RIGHT) - INSTAGRAM/THREADS STANDARD */}
        <div className="flex items-center justify-between gap-4 -mt-10 sm:-mt-12 mb-3">
          {/* Avatar with Glowing Gradient Ring */}
          <div className="relative shrink-0">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-xl ring-4 ${
                isDark ? 'ring-[#070A14]' : 'ring-slate-50'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                <SafeImage
                  src={currentUser.photoURL || aminaAvatar}
                  fallbackText={currentUser.displayName || 'User'}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Online Indicator */}
            <span
              className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ${
                isDark ? 'ring-[#070A14]' : 'ring-slate-50'
              }`}
              title="Yupo mtandaoni"
            />
          </div>

          {/* 3 STATS HORIZONTALLY ALIGNED RIGHT BESIDE AVATAR */}
          <div
            className={`flex-1 flex items-center justify-around py-2.5 px-3 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-[#0D1224]/70 border-white/[0.08]'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="text-center flex-1">
              <p className={`font-black text-sm sm:text-base font-mono leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUser.postsCount || defaultUserPosts.length}
              </p>
              <p className={`text-[10px] sm:text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Machapisho
              </p>
            </div>
            <div className={`h-5 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className="text-center flex-1">
              <p className="font-black text-sm sm:text-base text-cyan-600 dark:text-cyan-400 font-mono leading-tight">
                {currentUser.followersCount ? `${(currentUser.followersCount / 1000).toFixed(1)}K` : '12.4K'}
              </p>
              <p className={`text-[10px] sm:text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Wafuasi
              </p>
            </div>
            <div className={`h-5 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className="text-center flex-1">
              <p className={`font-black text-sm sm:text-base font-mono leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUser.followingCount || 245}
              </p>
              <p className={`text-[10px] sm:text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Wanaofuatwa
              </p>
            </div>
          </div>
        </div>

        {/* ROW 2: USER IDENTITY, HANDLE, ROLE & BIO (Full Width, Clear Hierarchy) */}
        <div className="space-y-1 mb-3">
          {/* Display Name + Verified Badge + Role Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className={`font-black text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentUser.displayName || 'Mtumiaji wa Zenia'}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-cyan-500 fill-cyan-500 shrink-0" />
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isDark
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              }`}
            >
              {currentUser.accountType === 'creator'
                ? 'Mbunifu (Creator)'
                : currentUser.accountType === 'business'
                ? 'Biashara (Business)'
                : 'Mtumiaji Binafsi'}
            </span>
          </div>

          {/* @Username */}
          <p className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
            @{currentUser.username || 'username'}
          </p>

          {/* Bio text */}
          <p
            className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            {currentUser.bio || 'Karibu kwenye wasifu wangu wa Zenia! ✨'}
          </p>

          {/* Location & Contact */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
              <span>Dar es Salaam, Tanzania 🇹🇿</span>
            </span>
            {currentUser.email && (
              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                <Mail className="w-3 h-3 shrink-0" />
                <span>{currentUser.email}</span>
              </span>
            )}
          </div>
        </div>

        {/* ROW 3: ACTION BUTTONS (FULL WIDTH ROW, BALANCED & TOUCH-FRIENDLY) */}
        <div className="flex items-center gap-2 mb-3">
          {/* Hariri Wasifu (Primary) */}
          <button
            onClick={onOpenEditProfile}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                : 'bg-slate-200/90 hover:bg-slate-300 border border-slate-300 text-slate-800'
            }`}
          >
            <Edit className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>Hariri Wasifu</span>
          </button>

          {/* Pochi ya Zenia */}
          <button
            onClick={() => onSelectService && onSelectService('wallet')}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs ${
              isDark
                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300'
                : 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-700'
            }`}
            title={`Pochi: TZS ${(currentUser.walletBalance || 120000).toLocaleString()}`}
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>Pochi: TZS {((currentUser.walletBalance || 120000) >= 1000 ? `${Math.round((currentUser.walletBalance || 120000) / 1000)}k` : currentUser.walletBalance || 120000)}</span>
          </button>

          {/* Shiriki Wasifu */}
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
            }`}
            title="Shiriki Wasifu"
            aria-label="Shiriki Wasifu"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ROW 4: STORY HIGHLIGHTS (Clean Circular Carousel) */}
        <div className={`pt-2 pb-1 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {/* New Highlight Action */}
            <button
              onClick={onOpenCreateStatus}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              title="Weka Story Mpya"
            >
              <div
                className={`w-14 h-14 aspect-square rounded-[20px] border-2 border-dashed ${
                  isDark ? 'border-white/20 bg-white/[0.02]' : 'border-slate-300 bg-slate-100'
                } group-hover:border-cyan-400 flex items-center justify-center transition-colors shadow-xs`}
              >
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
              </div>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>+ Mpya</span>
            </button>

            {highlights.map((hl) => (
              <div
                key={hl.id}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 aspect-square rounded-[20px] p-[2.5px] bg-gradient-to-tr from-cyan-400 to-indigo-600 group-hover:scale-105 transition-transform shadow-md">
                  <div
                    className={`w-full h-full rounded-[17.5px] overflow-hidden ${
                      isDark ? 'bg-[#070A14]' : 'bg-white'
                    } p-[1.5px]`}
                  >
                    <SafeImage
                      src={hl.cover}
                      fallbackGradient={hl.gradient}
                      fallbackText={hl.title}
                      className="w-full h-full object-cover rounded-[16px]"
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium truncate max-w-[62px] text-center ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {hl.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 5: CONTENT TABS (Segmented Bar) */}
        <div className={`mt-2 border-t ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'posts'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Posts</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'status'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Status</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'videos'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Reels</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'shop'
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Duka</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. TAB CONTENTS                                                */}
        {/* ============================================================== */}

        {/* TAB 1: 3-COLUMN EDGE-TO-EDGE POSTS GRID */}
        {activeTab === 'posts' && (
          <div className="pt-2">
            {defaultUserPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {defaultUserPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group relative aspect-square overflow-hidden bg-slate-900 cursor-pointer border border-white/5 hover:border-cyan-500/40 transition-all rounded-lg sm:rounded-xl active:scale-98"
                  >
                    <SafeImage
                      src={post.url}
                      fallbackGradient={post.gradient}
                      fallbackText={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover/touch info overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Heart className={`w-3.5 h-3.5 ${likedPosts[post.id] ? 'fill-rose-500 text-rose-500' : 'fill-white'}`} />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="py-10 px-4 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-md">
                  <Grid className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Bado hujaweka chapisho lolote
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mb-3">
                  Weka picha, video, au stori ya status ili marafiki zako wakuone mtandaoni.
                </p>
                <button
                  onClick={onOpenCreateStatus}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Weka Chapisho la Kwanza</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STATUS STORIES */}
        {activeTab === 'status' && (
          <div className="pt-2 space-y-2.5">
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                isDark
                  ? 'bg-[#0E1528] border-cyan-500/25 text-white'
                  : 'bg-white border-cyan-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-purple-500 shrink-0">
                  <SafeImage
                    src={currentUser.photoURL || aminaAvatar}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold">Status Yangu (Saa 24)</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Sasisha picha, video, au maandishi
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenCreateStatus}
                className="py-1.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ongeza</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: VIDEOS / REELS */}
        {activeTab === 'videos' && (
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-1.5">
              <div
                onClick={onOpenCreateStatus}
                className={`aspect-[9/16] rounded-xl border border-dashed flex flex-col items-center justify-center p-3 cursor-pointer text-center group transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/20 hover:border-cyan-400 text-white'
                    : 'bg-slate-100 border-slate-300 hover:border-cyan-500 text-slate-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold leading-tight">Unda Reel</p>
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Video ya 9:16</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUKA (SHOP) */}
        {activeTab === 'shop' && (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Bidhaa za Duka Langu
              </h4>
              <button
                onClick={() => onSelectService && onSelectService('shop')}
                className="text-xs text-cyan-500 font-bold hover:underline flex items-center gap-1"
              >
                <span>Marketplace Yote</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shopItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 shadow-sm ${
                    isDark
                      ? 'bg-[#0E1528] border-white/10 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                      <SafeImage src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.title}</p>
                      <p className="text-xs text-emerald-500 font-mono font-extrabold mt-0.5">
                        TSh {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Umeagiza: ${item.title} 🛍️`)}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shrink-0 active:scale-95 transition-all shadow-sm"
                  >
                    Agiza
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
