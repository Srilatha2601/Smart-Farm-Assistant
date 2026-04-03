import { useLocation } from "wouter";
import { Home, Camera, Plane, Warehouse, Handshake } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home", labelTe: "హోమ్" },
  { path: "/scan", icon: Camera, label: "Scan", labelTe: "స్కాన్" },
  { path: "/drones", icon: Plane, label: "Drones", labelTe: "డ్రోన్" },
  { path: "/storage", icon: Warehouse, label: "Storage", labelTe: "స్టోరేజ్" },
  { path: "/market", icon: Handshake, label: "Market", labelTe: "మార్కెట్" },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-emerald-100 z-40 shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "text-gray-400"}`}>
                <Icon size={18} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
