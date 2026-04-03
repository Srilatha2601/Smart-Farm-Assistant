import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Award, Settings, ChevronRight, Shield, Bell, Globe, LogOut, Check } from "lucide-react";
import { useLocation } from "wouter";

type Lang = "en" | "te" | "hi";

const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "te", label: "Telugu", native: "తె" },
  { code: "hi", label: "Hindi", native: "हि" },
];

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<Lang>("en");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const carbonScore = 450;
  const maxScore = 1000;

  const handleLogout = () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      setTimeout(() => setLogoutConfirm(false), 3000);
      return;
    }
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    setLocation("/");
    window.location.reload();
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
            R
          </div>
          <div>
            <h2 className="text-lg font-black">Ravi Kumar</h2>
            <p className="text-emerald-200 text-sm">Guntur District, AP</p>
            <p className="text-emerald-200 text-xs mt-0.5">Farmer ID: KR-2024-001847</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Acres", value: "8.5" },
            { label: "Scans", value: "24" },
            { label: "Bookings", value: "6" }
          ].map(s => (
            <div key={s.label} className="bg-white/20 rounded-xl p-2.5 text-center">
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] text-emerald-200">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Carbon Credit Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
            <Leaf size={16} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Carbon Credit Score</h3>
            <p className="text-xs text-gray-500">Eco farming rewards</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-green-600">{carbonScore}</p>
            <p className="text-[10px] text-gray-400">of {maxScore} pts</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(carbonScore / maxScore) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">0</span>
          <span className="text-[10px] text-emerald-600 font-medium">Level 4 — Eco Farmer</span>
          <span className="text-[10px] text-gray-400">{maxScore}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Trees Saved", value: "12" },
            { label: "CO2 Offset", value: "0.8T" },
            { label: "Cash Value", value: "₹2,250" }
          ].map(s => (
            <div key={s.label} className="bg-green-50 rounded-xl p-2 text-center">
              <p className="text-sm font-black text-green-700">{s.value}</p>
              <p className="text-[9px] text-green-600">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <Award size={14} className="text-amber-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "🌱", label: "First Scan", earned: true },
            { icon: "🚁", label: "Drone Pro", earned: true },
            { icon: "📦", label: "Storer", earned: true },
            { icon: "🤝", label: "Trader", earned: false },
            { icon: "💚", label: "Eco Farmer", earned: true },
            { icon: "⭐", label: "5 Deals", earned: false },
            { icon: "🔬", label: "Lab Pro", earned: false },
            { icon: "🏆", label: "Elite", earned: false },
          ].map((a, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${a.earned ? "bg-amber-50" : "bg-gray-50 opacity-50"}`}>
              <span className="text-xl">{a.icon}</span>
              <p className="text-[9px] text-center text-gray-600 leading-tight">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <button
          onClick={() => setShowLangPicker(v => !v)}
          className="flex items-center gap-3 w-full"
          data-testid="btn-language-preference"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Globe size={15} className="text-emerald-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-800">Language / భాష / भाषा</p>
            <p className="text-xs text-gray-400">{LANG_OPTIONS.find(l => l.code === lang)?.label}</p>
          </div>
          <ChevronRight size={16} className={`text-gray-300 transition-transform ${showLangPicker ? "rotate-90" : ""}`} />
        </button>

        {showLangPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 grid grid-cols-3 gap-2"
          >
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => { setLang(opt.code); setShowLangPicker(false); }}
                className={`flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border-2 transition-all ${
                  lang === opt.code
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                }`}
                data-testid={`btn-profile-lang-${opt.code}`}
              >
                <span className="text-lg font-bold text-gray-700">{opt.native}</span>
                <span className="text-[10px] text-gray-500">{opt.label}</span>
                {lang === opt.code && <Check size={12} className="text-emerald-500 mt-0.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {[
          { icon: Bell, label: "Notifications", sub: "Alerts & reminders" },
          { icon: Shield, label: "Privacy & Security", sub: "Account protection" },
          { icon: Settings, label: "App Settings", sub: "Units, display" },
        ].map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-3 p-4 w-full hover:bg-gray-50 transition-colors"
            data-testid={`btn-setting-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <item.icon size={15} className="text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${
          logoutConfirm
            ? "bg-red-500 text-white shadow-lg shadow-red-200"
            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
        }`}
        data-testid="btn-logout"
      >
        <LogOut size={16} />
        {logoutConfirm ? "Tap again to confirm logout" : "Logout / లాగ్ అవుట్ / लॉग आउट"}
      </motion.button>

      <div className="pb-2 text-center">
        <p className="text-[10px] text-gray-300">Kisan Rakshak AI v1.0 · Made for Telugu Farmers</p>
      </div>
    </div>
  );
}
