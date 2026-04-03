import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, FlaskConical, Plane, Warehouse, Handshake, Leaf,
  Thermometer, Droplets, Wind, CloudRain, Shield, ShieldOff,
  TrendingUp, AlertTriangle, ChevronRight, Zap
} from "lucide-react";
import { useListMarketDeals } from "@workspace/api-client-react";

function HealthGauge({ value }: { value: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * value) / 100;

  const getColor = (v: number) => {
    if (v >= 80) return "#10b981";
    if (v >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black text-emerald-600"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            {value}%
          </motion.span>
          <span className="text-xs text-gray-500 font-medium">Field Health</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-emerald-600 font-medium">Excellent</span>
      </div>
    </div>
  );
}

function NightGuard() {
  const [active, setActive] = useState(false);

  return (
    <motion.div
      className={`rounded-2xl p-4 border transition-all duration-500 ${active
        ? "bg-gray-900 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
        : "bg-gray-800/80 border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">AI Night Guard</h3>
          <p className="text-gray-400 text-xs">Perimeter Security</p>
        </div>
        <button
          onClick={() => setActive(a => !a)}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${active ? "bg-emerald-500" : "bg-gray-600"}`}
          data-testid="toggle-night-guard"
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
            animate={{ left: active ? "calc(100% - 22px)" : "2px" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </button>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-20 h-20 mb-2">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Shield size={16} className="text-emerald-400" />
                </div>
              </div>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full relative">
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 origin-bottom"
                    style={{
                      background: "linear-gradient(to top, rgba(16,185,129,0.8), transparent)"
                    }}
                  />
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-emerald-400 text-xs font-bold tracking-wide">SECURITY ACTIVE</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">Scanning for wild animals...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-2"
          >
            <ShieldOff size={16} className="text-gray-500" />
            <span className="text-gray-400 text-xs">Security inactive. Tap to activate.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { label: "Spot Disease", subLabel: "AI Scan", icon: Camera, color: "from-emerald-500 to-emerald-600", path: "/scan" },
  { label: "Smart Dosing", subLabel: "Pesticide Lab", icon: FlaskConical, color: "from-blue-500 to-blue-600", path: "/scan" },
  { label: "Drone Spraying", subLabel: "Book Now", icon: Plane, color: "from-violet-500 to-violet-600", path: "/drones" },
  { label: "Spoilage Alert", subLabel: "Cold Storage", icon: Warehouse, color: "from-amber-500 to-amber-600", path: "/storage" },
  { label: "Industry Deals", subLabel: "B2B Market", icon: Handshake, color: "from-rose-500 to-rose-600", path: "/market" },
  { label: "Eco Earnings", subLabel: "450 pts", icon: Leaf, color: "from-teal-500 to-teal-600", path: "/profile" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [weather] = useState({ temp: 31, humidity: 68, wind: 14, rain: "3 hrs" });
  const { data: deals } = useListMarketDeals();

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Weather Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">Heavy rain in 3 hours. Avoid spraying now!</p>
      </motion.div>

      {/* Weather + Health Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <HealthGauge value={88} />
          <div className="flex-1 ml-4 space-y-2">
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-red-500" />
                <span className="text-xs text-gray-600">Temp</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{weather.temp}°C</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-blue-500" />
                <span className="text-xs text-gray-600">Soil</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Wind size={14} className="text-gray-500" />
                <span className="text-xs text-gray-600">Wind</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{weather.wind}km/h</span>
            </div>
            <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <CloudRain size={14} className="text-indigo-500" />
                <span className="text-xs text-gray-600">Rain</span>
              </div>
              <span className="text-sm font-bold text-gray-800">in {weather.rain}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
          <Zap size={14} className="text-emerald-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation(action.path)}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              data-testid={`btn-action-${action.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}>
                <action.icon size={18} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-gray-700 leading-tight">{action.label}</p>
                <p className="text-[9px] text-gray-400">{action.subLabel}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Night Guard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <NightGuard />
      </motion.div>

      {/* Live B2B Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <TrendingUp size={14} className="text-emerald-500" />
            Live Industry Deals
          </h2>
          <button
            onClick={() => setLocation("/market")}
            className="text-xs text-emerald-600 flex items-center gap-0.5 font-medium"
            data-testid="btn-view-all-deals"
          >
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {(deals || [
            { id: 1, company: "Lays", cropType: "Potato", quantityTons: 500, pricePerKg: 18.5, isUrgent: true },
            { id: 2, company: "Britannia", cropType: "Wheat", quantityTons: 2000, pricePerKg: 24.0, isUrgent: false },
            { id: 3, company: "ITC Agri", cropType: "Chilli", quantityTons: 300, pricePerKg: 85.0, isUrgent: true },
          ]).slice(0, 5).map((deal, i) => (
            <motion.button
              key={deal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/market")}
              className="shrink-0 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all w-36"
              data-testid={`card-deal-${deal.id}`}
            >
              {deal.isUrgent && (
                <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">URGENT</span>
              )}
              <p className="text-xs font-bold text-gray-800 mt-1">{deal.company}</p>
              <p className="text-[10px] text-gray-500">{deal.cropType}</p>
              <p className="text-sm font-black text-emerald-600 mt-1">₹{deal.pricePerKg}/kg</p>
              <p className="text-[10px] text-gray-400">{deal.quantityTons}T needed</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
