import React, { useState } from 'react';
import {
  X,
  User,
  AtSign,
  FileText,
  Briefcase,
  Camera,
  Check,
  AlertCircle,
  Save,
  Phone,
  Sparkles,
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { UserProfile, AccountType } from '../../types';
import { SafeImage } from '../../components/SafeImage';

// Preset avatars users can choose from
import aminaAvatar from '../../assets/images/amina_avatar_1790280951312.jpg';
import freshKkAvatar from '../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import sarahPortrait from '../../assets/images/sarah_portrait_1791059459448.jpg';
import alexPortrait from '../../assets/images/alex_portrait_1791059432462.jpg';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdate: (updated: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [accountType, setAccountType] = useState<AccountType>(currentUser.accountType || 'personal');
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || currentUser.phone || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetAvatars = [
    { label: 'Fresh kk', url: freshKkAvatar },
    { label: 'Amina', url: aminaAvatar },
    { label: 'Sarah', url: sarahPortrait },
    { label: 'Alex', url: alexPortrait },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const updatedUser: UserProfile = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      username: cleanUsername || currentUser.username,
      bio: bio.trim(),
      accountType,
      photoURL: photoURL.trim() || currentUser.photoURL,
      phoneNumber: phoneNumber.trim(),
      phone: phoneNumber.trim(),
    };

    try {
      // Update in Firestore if user is authenticated with Firebase
      if (currentUser.id && currentUser.id !== 'guest') {
        try {
          await updateDoc(doc(db, 'users', currentUser.id), {
            displayName: updatedUser.displayName,
            username: updatedUser.username,
            bio: updatedUser.bio,
            accountType: updatedUser.accountType,
            photoURL: updatedUser.photoURL,
            phoneNumber: updatedUser.phoneNumber,
          });
        } catch (dbErr) {
          console.warn('Firestore update notice (continuing locally):', dbErr);
        }
      }

      // Update state and localStorage
      onUserUpdate(updatedUser);
      localStorage.setItem('zenia_active_user', JSON.stringify(updatedUser));
      setSuccessMsg('Wasifu wako umesasishwa kikamilifu! (Profile updated)');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Hitilafu imetokea wakati wa kuhifadhi wasifu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0F1424] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Hariri Wasifu (Edit Profile)</h3>
              <p className="text-xs text-slate-400">Sasisha taarifa za akaunti yako ya Zenia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          {/* Avatar Selection & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Picha ya Wasifu (Profile Avatar)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-md shrink-0">
                <SafeImage
                  src={photoURL || currentUser.photoURL}
                  fallbackText={displayName || 'User'}
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                />
              </div>

              <div className="flex-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Chagua picha mojawapo au weka link ya picha:
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetAvatars.map((av) => (
                    <button
                      key={av.label}
                      type="button"
                      onClick={() => setPhotoURL(av.url)}
                      className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                        photoURL === av.url ? 'border-cyan-400 scale-110 shadow-cyan-400/50 shadow-sm' : 'border-white/20 hover:border-white/60'
                      }`}
                      title={av.label}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Photo URL Input */}
            <div className="mt-2.5">
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="Au weka kiunganishi cha picha (https://...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jina Kamili (Display Name) <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Mf. Amina Kaunga au John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jina la Mtumiaji (Username) <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="amina_kaunga"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Itatokea kama: @{username.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'username'}
            </p>
          </div>

          {/* Account Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Aina ya Akaunti (Account Role)
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full bg-[#161B2E] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="personal">Mtumiaji Binafsi (Personal User)</option>
                <option value="creator">Mbunifu / Mshawishi (Creator / Influencer)</option>
                <option value="business">Mfanyabiashara (Business Merchant)</option>
                <option value="organization">Shirika (Organization)</option>
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nambari ya Simu (Phone Number)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 712 345 678"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Wasifu Mfupi (Bio)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Eleza kwa ufupi kukuhusu au kuhusu biashara yako..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 pb-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Hifadhi Mabadiliko (Save Changes)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
