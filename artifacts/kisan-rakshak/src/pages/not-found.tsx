import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
        <Home size={36} className="text-emerald-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => setLocation("/")}
        className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-200"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
