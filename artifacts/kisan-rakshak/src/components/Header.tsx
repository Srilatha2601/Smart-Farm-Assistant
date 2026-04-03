import { useState, useEffect, createContext, useContext } from "react";
import { MapPin, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Lang = "en" | "te" | "hi";

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "te", label: "Telugu", native: "తె" },
  { code: "hi", label: "Hindi", native: "हि" },
];

const GREETINGS: Record<Lang, { morning: string; afternoon: string; evening: string }> = {
  en: { morning: "Good Morning!", afternoon: "Good Afternoon!", evening: "Good Evening!" },
  te: { morning: "శుభోదయం!", afternoon: "శుభ మధ్యాహ్నం!", evening: "శుభ సాయంత్రం!" },
  hi: { morning: "शुभ प्रभात!", afternoon: "शुभ दोपहर!", evening: "शुभ संध्या!" },
};

export default function Header() {
  const [location, setLocation] = useState("GPS గుర్తిస్తోంది...");
  const [lang, setLang] = useState<Lang>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [time, setTime] = useState(new Date());

  // Auto-detect GPS location only — no manual fallback UI
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Your Location";
          const state = data.address?.state_district || data.address?.state || "AP";
          setLocation(`${city}, ${state}`);
        } catch {
          setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
        }
      },
      () => {
        setLocation("Location unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = (() => {
    const h = time.getHours();
    const g = GREETINGS[lang];
    if (h < 12) return g.morning;
    if (h < 17) return g.afternoon;
    return g.evening;
  })();

  const currentLangOption = LANG_OPTIONS.find(l => l.code === lang)!;

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Kisan Rakshak AI</p>
            <h1 className="text-sm font-bold text-gray-800">{greeting}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* GPS Location — read-only, auto-detected */}
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
              <MapPin size={11} className="text-emerald-500 shrink-0" />
              <span className="max-w-[90px] truncate">{location}</span>
            </div>

            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(v => !v)}
                className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors"
                data-testid="btn-language-toggle"
              >
                <Globe size={10} />
                {currentLangOption.native}
                <ChevronDown size={10} />
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[120px]"
                  >
                    {LANG_OPTIONS.map(opt => (
                      <button
                        key={opt.code}
                        onClick={() => { setLang(opt.code); setShowLangMenu(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-emerald-50 transition-colors ${lang === opt.code ? "bg-emerald-50 text-emerald-700 font-bold" : "text-gray-700"}`}
                        data-testid={`btn-lang-${opt.code}`}
                      >
                        <span className="font-medium w-5">{opt.native}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <a href="/profile">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-emerald-600 transition-colors" data-testid="btn-profile-avatar">
                R
              </div>
            </a>
          </div>
        </div>
      </motion.header>
    </LangContext.Provider>
  );
}
