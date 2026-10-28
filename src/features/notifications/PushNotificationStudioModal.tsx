import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Smartphone,
  Lock,
  Layers,
  Image as ImageIcon,
  Zap,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  Play,
  RotateCcw,
  Check,
  Shield,
  Send,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import {
  pushNotificationService,
  PushSettings,
  NotificationMode,
} from '../../services/notifications/pushNotificationService';

interface PushNotificationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationStudioModal: React.FC<PushNotificationStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    pushNotificationService.getPermission()
  );
  const [settings, setSettings] = useState<PushSettings>(() =>
    pushNotificationService.getSettings()
  );
  const [currentBadgeCount, setCurrentBadgeCount] = useState<number>(() =>
    pushNotificationService.getAppBadgeCount()
  );
  const [activeTab, setActiveTab] = useState<'testing' | 'settings'>('testing');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPermission(pushNotificationService.getPermission());
    setCurrentBadgeCount(pushNotificationService.getAppBadgeCount());

    const handleBadgeChange = (e: any) => {
      setCurrentBadgeCount(e.detail?.count || 0);
    };

    window.addEventListener('zenia_app_badge_changed', handleBadgeChange);
    return () => window.removeEventListener('zenia_app_badge_changed', handleBadgeChange);
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const res = await pushNotificationService.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        showToast('Ruhusa ya Push Notifications imekubaliwa! 🎉');
      } else if (res === 'denied') {
        showToast('Ruhusa imezuiwa kwenye kivinjari chako.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggleSetting = (key: keyof PushSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    pushNotificationService.saveSettings(next);
    showToast('Mipangilio imehifadhiwa.');
  };

  const handleToggleCategory = (catKey: keyof PushSettings['categories']) => {
    const next = {
      ...settings,
      categories: {
        ...settings.categories,
        [catKey]: !settings.categories[catKey],
      },
    };
    setSettings(next);
    pushNotificationService.saveSettings(next);
    showToast('Aina za taarifa zimesasishwa.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#0B1020] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 relative">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0F162E] border-b border-white/10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
              <Bell className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Kituo cha Push Notifications
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  Aina Zote 9 Hewani ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Usimamizi wa Lock Screen, Banner, Panel, Badge, Actions, na Progress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner Strip */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0C142A] via-[#101A38] to-[#0C142A] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {permission === 'granted' ? (
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
            )}
            <div className="text-xs min-w-0">
              <span className="text-slate-400">Hali ya Ruhusa ya Simu: </span>
              <strong
                className={
                  permission === 'granted'
                    ? 'text-emerald-400'
                    : permission === 'denied'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }
              >
                {permission === 'granted'
                  ? 'Imekubaliwa (Granted & Active) ✅'
                  : permission === 'denied'
                  ? 'Imezuiwa (Blocked) ⚠️'
                  : 'Inahitaji Ruhusa (Tap Kuwasha)'}
              </strong>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isRequesting ? 'Inaomba...' : 'Washa Push Notifications'}</span>
            </button>
          )}

          {permission === 'granted' && (
            <span className="text-[11px] text-cyan-300 font-mono font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              Service Worker: Active
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 bg-[#0A0E1C] border-b border-white/5 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'testing'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jaribu Aina Zote 9 (Interactive Playground)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mipangilio ya Taarifa (Settings)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'testing' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Bofya kitufe cha aina yoyote kati ya hizi 9 hapa chini ili kujaribu jinsi taarifa inavyoonekana hewani kwenye skrini yako, kwenye bango la juu, na kwenye mfumo wa simu!
                </span>
              </div>

              {/* 9 Modes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. 🔔 Lock Screen */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">🔔</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Lock Screen
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Lock Screen Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Inaonekana simu ikiwa imefungwa ikiwa na jina la mtumaji na muhtasari salama.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerLockScreenDemo();
                      showToast('🔔 Lock screen notification imetumwa hewani!');
                    }}
                    className="mt-4 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jaribu Lock Screen</span>
                  </button>
                </div>

                {/* 2. 📱 Notification Banner */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">📱</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Banner Pop-up
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Notification Banner</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Ujumbe unajitokeza juu kabisa ya skrini (Heads-Up) papo hapo bila kukatiza unachofanya.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerBannerDemo();
                      showToast('📱 Banner notification inajitokeza juu!');
                    }}
                    className="mt-4 w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jaribu Banner</span>
                  </button>
                </div>

                {/* 3. 📥 Notification Panel */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">📥</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Drawer Panel
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Notification Panel</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Inaonekana ukishusha sehemu ya juu ya simu (Notification Center) ikiwa na maelezo kamili.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerPanelDemo();
                      showToast('📥 Panel notification imetumwa kwenye droo!');
                    }}
                    className="mt-4 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jaribu Panel</span>
                  </button>
                </div>

                {/* 4. 🔴 App Badge */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">🔴</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Icon Badge ({currentBadgeCount})
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">App Badge (Alama ya Idadi)</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Inaweka namba nyekundu ya taarifa ambazo hazijasomwa juu ya icon ya Zenia (Badging API).
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const cnt = await pushNotificationService.triggerBadgeDemo();
                        showToast(`🔴 Badge ya icon ya app imewekwa namba "${cnt}"!`);
                      }}
                      className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>Weka Badge (+1)</span>
                    </button>
                    <button
                      onClick={async () => {
                        await pushNotificationService.clearAppBadge();
                        showToast('Badge ya icon imefutwa (0).');
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all"
                      title="Futa Badge"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5. 🖼️ Rich Notification */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">🖼️</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Rich Media
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Rich Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Huonyesha picha ya bidhaa, thumbnail ya video au picha ya mtumaji ndani ya notification yenyewe.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerRichNotificationDemo();
                      showToast('🖼️ Rich notification yenye picha imetumwa!');
                    }}
                    className="mt-4 w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jaribu Picha (Rich Media)</span>
                  </button>
                </div>

                {/* 6. ⚡ Action Notification */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">⚡</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Quick Actions
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Action Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Ina vitufe vya moja kwa moja kama "Jibu", "Angalia", "Kubali" au "Kataa" bila kufungua app yote!
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        pushNotificationService.triggerActionDemo('order');
                        showToast('⚡ Action: "Kubali / Kataa" imetumwa!');
                      }}
                      className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>Kubali / Kataa</span>
                    </button>
                    <button
                      onClick={() => {
                        pushNotificationService.triggerActionDemo('chat');
                        showToast('⚡ Action: "Jibu / Angalia" imetumwa!');
                      }}
                      className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>Jibu / Angalia</span>
                    </button>
                  </div>
                </div>

                {/* 7. 📚 Grouped Notification */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">📚</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Bundled
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Grouped Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Hukusanya jumbe nyingi kutoka mtumaji mmoja kwenye kadi moja safi ili isijaze notification panel.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerGroupedDemo();
                      showToast('📚 Grouped notifications 3 zinatumwa kwa mfululizo...');
                    }}
                    className="mt-4 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jaribu Grouped Messages</span>
                  </button>
                </div>

                {/* 8. 🤫 Silent Notification */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-slate-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">🤫</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        Silent Sync
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Silent Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Inawasilisha taarifa ya chinichini bila sauti wala mlio, ikisawazisha data kimyakimya.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushNotificationService.triggerSilentDemo();
                      showToast('🤫 Silent notification imetumwa kimyakimya bila sauti!');
                    }}
                    className="mt-4 w-full py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Jaribu Kimyakimya (Silent)</span>
                  </button>
                </div>

                {/* 9. ⏳ Progress Notification */}
                <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 hover:border-sky-500/40 transition-all flex flex-col justify-between sm:col-span-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">⏳</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Live Progress 0% - 100%
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">Progress Notification</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Huonyesha maendeleo ya kazi ya moja kwa moja kama kupakua video, kutuma faili au kuchakata malipo kwa grafu na asilimia!
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        pushNotificationService.startProgressDemo('Video ya Kariakoo HD 1080p');
                        showToast('⏳ Progress bar imeanza: Inapakua video 0% -> 100%...');
                      }}
                      className="flex-1 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Anzisha Progress Simulation</span>
                    </button>
                    <button
                      onClick={() => {
                        pushNotificationService.cancelProgressDemo();
                        showToast('Upakuaji umesimamishwa.');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-bold rounded-xl transition-all"
                    >
                      Simamisha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* General Toggles */}
              <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Mipangilio ya Uwasilishaji (Delivery Controls)</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Washa Push Notifications</span>
                      <span className="text-[11px] text-slate-400">Ruhusu taarifa zote za mfumo</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('enabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">Sauti ya Mlio (Sound Chime)</span>
                      <span className="text-[11px] text-slate-400">Piga kengele taarifa ikitua</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('soundEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">Mtetemo wa Simu (Vibration)</span>
                      <span className="text-[11px] text-slate-400">Tetemesha kifaa taarifa ikifika</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('vibrationEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.vibrationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">Mabango ya Juu (Notification Banners)</span>
                      <span className="text-[11px] text-slate-400">Onyesha ujumbe ukiteleza juu ya skrini</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('bannersEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.bannersEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.bannersEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">Alama ya Namba Kwenye Icon (App Badge)</span>
                      <span className="text-[11px] text-slate-400">Onyesha namba ya taarifa ambazo hazijasomwa</span>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('badgesEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings.badgesEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.badgesEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Subscriptions */}
              <div className="p-4 rounded-2xl bg-[#11172E] border border-white/10 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Aina za Taarifa Zinazotumwa (Category Channels)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'chats', label: 'Mazungumzo (Chats & DMs)', icon: '💬' },
                    { id: 'wallet', label: 'Pochi & Malipo (Transactions)', icon: '💰' },
                    { id: 'shop', label: 'Soko la Bidhaa & Oda', icon: '🛒' },
                    { id: 'social', label: 'Status & Marafiki (Social)', icon: '👥' },
                    { id: 'system', label: 'Matangazo ya Mfumo (Admin)', icon: '📢' },
                  ].map((cat) => {
                    const isChecked = settings.categories[cat.id as keyof PushSettings['categories']];
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id as any)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
