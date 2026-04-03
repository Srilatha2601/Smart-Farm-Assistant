import { useState, useEffect } from "react";
import { MapPin, Globe, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const [location, setLocation] = useState("Detecting location...");
  const [lang, setLang] = useState<"en" | "te">("en");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Your Location";
            const state = data.address?.state || "AP";
            setLocation(`${city}, ${state}`);
          } catch {
            setLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          }
        },
        () => {
          setLocation("Guntur, AP");
        }
      );
    } else {
      setLocation("Guntur, AP");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return "Subhodayam, Mawa!";
    if (h < 17) return "Namaskaram, Mawa!";
    return "Shubha Sandhya, Mawa!";
  })();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-600 font-medium">Kisan Rakshak AI</p>
          <h1 className="text-sm font-bold text-gray-800">{greeting} 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} className="text-emerald-500" />
            <span className="max-w-24 truncate">{location}</span>
          </div>
          <button
            onClick={() => setLang(l => l === "en" ? "te" : "en")}
            className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors"
            data-testid="btn-language-toggle"
          >
            <Globe size={10} />
            {lang === "en" ? "EN | తె" : "తె | EN"}
          </button>
          <button
            className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
            data-testid="btn-profile-avatar"
          >
            M
          </button>
        </div>
      </div>
    </motion.header>
  );
}
