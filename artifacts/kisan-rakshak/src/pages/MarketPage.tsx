import { useState } from "react";
import { motion } from "framer-motion";
import {
  Handshake, TrendingUp, Clock, MapPin, CheckCircle,
  MessageSquare, Phone, Star, Wheat, Users, ShoppingBag
} from "lucide-react";
import { useListMarketDeals, useExpressInterestInDeal, getListMarketDealsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Static farmer listings for Direct Connect
const FARMERS = [
  {
    id: 1, name: "Ravi Kumar Reddy", village: "Pedakurapadu, Guntur",
    phone: "+919848012345", rating: 4.8, reviews: 42,
    crop: "Rice (Sona Masoori)", qty: "12 Tons", price: "₹22/kg",
    avatar: "R", color: "bg-emerald-500", verified: true,
    desc: "Grade A quality. Harvested last week. Willing to deliver within 30km.",
  },
  {
    id: 2, name: "Suresh Babu", village: "Narasaraopet, Guntur",
    phone: "+919848023456", rating: 4.6, reviews: 28,
    crop: "Groundnut (Bold)", qty: "5 Tons", price: "₹58/kg",
    avatar: "S", color: "bg-blue-500", verified: true,
    desc: "Freshly harvested. Good oil content. Price negotiable for bulk.",
  },
  {
    id: 3, name: "Lakshmi Devi", village: "Tenali, Guntur",
    phone: "+919848034567", rating: 4.9, reviews: 67,
    crop: "Chilli (Guntur Sannam)", qty: "3 Tons", price: "₹95/kg",
    avatar: "L", color: "bg-red-500", verified: true,
    desc: "S4 grade red chilli. High pungency. Export quality available.",
  },
  {
    id: 4, name: "Venkat Rao", village: "Bapatla, Guntur",
    phone: "+919848045678", rating: 4.5, reviews: 19,
    crop: "Cotton (Bt)", qty: "8 Tons", price: "₹67/kg",
    avatar: "V", color: "bg-orange-500", verified: false,
    desc: "Well-dried cotton. Good staple length. Ready for immediate pickup.",
  },
  {
    id: 5, name: "Annapurna", village: "Macherla, Guntur",
    phone: "+919848056789", rating: 4.7, reviews: 35,
    crop: "Maize (Yellow)", qty: "20 Tons", price: "₹18/kg",
    avatar: "A", color: "bg-yellow-500", verified: true,
    desc: "Moisture below 14%. Ideal for poultry feed. Bulk discount available.",
  },
  {
    id: 6, name: "Krishnamurti", village: "Repalle, Guntur",
    phone: "+919848067890", rating: 4.4, reviews: 13,
    crop: "Banana (Cavendish)", qty: "2 Tons/week", price: "₹25/kg",
    avatar: "K", color: "bg-purple-500", verified: false,
    desc: "Regular weekly supply. Good colour and ripening. Organic farming.",
  },
];

const COMPANY_LOGOS: Record<string, string> = {
  "Lays (PepsiCo India)": "🥔",
  "Britannia Industries": "🌾",
  "ITC Agri": "🌿",
  "Amul (GCMMF)": "🌺",
  "MTR Foods": "🍚",
  "Adani Wilmar": "🌻",
};

type Tab = "all" | "urgent" | "connect";

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [filter] = useState<"all" | "urgent">("all");
  const [interestedDeals, setInterestedDeals] = useState<Set<number>>(new Set());
  const [calledFarmers, setCalledFarmers] = useState<Set<number>>(new Set());

  const { data: deals, isLoading } = useListMarketDeals();
  const expressInterest = useExpressInterestInDeal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleExpressInterest = async (dealId: number) => {
    if (interestedDeals.has(dealId)) return;
    try {
      const result = await expressInterest.mutateAsync({ id: dealId });
      setInterestedDeals(prev => new Set([...prev, dealId]));
      await queryClient.invalidateQueries({ queryKey: getListMarketDealsQueryKey() });
      toast({ title: "Interest Registered!", description: result.message });
    } catch {
      toast({ title: "Failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleCall = (farmer: typeof FARMERS[0]) => {
    setCalledFarmers(prev => new Set([...prev, farmer.id]));
    window.open(`tel:${farmer.phone}`, "_self");
    toast({ title: `Calling ${farmer.name}`, description: farmer.phone });
  };

  const handleWhatsApp = (farmer: typeof FARMERS[0]) => {
    const msg = encodeURIComponent(`Namaskaram ${farmer.name} garu! Mee ${farmer.crop} gurinchi meeru Kisan Rakshak app lo chusanu. Direct purchase cheyyalanukuntunanu. Please contact me.`);
    window.open(`https://wa.me/${farmer.phone.replace("+", "")}?text=${msg}`, "_blank");
  };

  const filteredDeals = (deals || []).filter((d: any) => tab === "urgent" ? d.isUrgent : true);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center">
          <Handshake size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">B2B Marketplace</h1>
          <p className="text-xs text-gray-500">Industry contracts & direct farmer connect</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active Deals", value: deals?.length || "6", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Urgent", value: deals?.filter((d: any) => d.isUrgent).length || "3", color: "text-red-600", bg: "bg-red-50" },
          { label: "Farmers Live", value: FARMERS.length, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
            <p className={`text-base font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All Deals", icon: ShoppingBag },
          { key: "urgent", label: "Urgent", icon: Clock },
          { key: "connect", label: "Farmer Connect", icon: Users },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t.key
                ? t.key === "connect"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-rose-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500"
            }`}
            data-testid={`tab-${t.key}`}
          >
            <t.icon size={11} />
            {t.label}
          </button>
        ))}
      </div>

      {/* DIRECT FARMER CONNECT TAB */}
      {tab === "connect" && (
        <div className="space-y-3">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Direct Farmer Connect</p>
              <p className="text-white/70 text-xs">Call or WhatsApp farmers to buy directly — no middlemen</p>
            </div>
          </div>

          {FARMERS.map((farmer, i) => (
            <motion.div
              key={farmer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              data-testid={`card-farmer-${farmer.id}`}
            >
              {/* Farmer Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-2xl ${farmer.color} flex items-center justify-center text-white font-black text-base shrink-0`}>
                  {farmer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-800 truncate">{farmer.name}</p>
                    {farmer.verified && (
                      <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">VERIFIED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-gray-600">{farmer.rating}</span>
                      <span className="text-[10px] text-gray-400">({farmer.reviews})</span>
                    </div>
                    <span className="text-gray-200">·</span>
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                      <MapPin size={9} />
                      <span className="truncate max-w-[120px]">{farmer.village}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Info */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wheat size={12} className="text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700">{farmer.crop}</span>
                </div>
                <div className="flex gap-3 text-xs mb-1.5">
                  <span className="text-gray-400">Qty: <span className="font-semibold text-gray-700">{farmer.qty}</span></span>
                  <span className="text-gray-400">Price: <span className="font-semibold text-emerald-600">{farmer.price}</span></span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{farmer.desc}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCall(farmer)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    calledFarmers.has(farmer.id)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-100"
                  }`}
                  data-testid={`btn-call-${farmer.id}`}
                >
                  <Phone size={13} />
                  {calledFarmers.has(farmer.id) ? "Called" : "Call Farmer"}
                </button>
                <button
                  onClick={() => handleWhatsApp(farmer)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md shadow-green-100"
                  data-testid={`btn-whatsapp-${farmer.id}`}
                >
                  <MessageSquare size={13} />
                  WhatsApp
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* B2B DEALS TABS (all / urgent) */}
      {tab !== "connect" && (
        <>
          {/* AI Negotiator Banner */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">AI Negotiator</p>
              <p className="text-white/70 text-xs">Get professional message drafts for better pricing</p>
            </div>
            <button
              className="bg-white text-violet-700 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
              data-testid="btn-ai-negotiator"
              onClick={() => toast({ title: "AI Negotiator", description: "Opening Kisan Mitra AI to help negotiate..." })}
            >
              Ask AI
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeals.map((deal: any, i: number) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${deal.isUrgent ? "border-red-100" : "border-gray-100"}`}
                  data-testid={`card-deal-market-${deal.id}`}
                >
                  {deal.isUrgent && (
                    <div className="bg-red-500 px-4 py-1.5 flex items-center gap-1.5">
                      <Clock size={11} className="text-white" />
                      <span className="text-white text-xs font-bold">URGENT REQUIREMENT</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                          {COMPANY_LOGOS[deal.company] || "🏢"}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">{deal.company}</h3>
                          <p className="text-xs text-gray-500">Needs {deal.cropType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">₹{deal.pricePerKg}</p>
                        <p className="text-[10px] text-gray-400">per kg</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="font-semibold text-gray-700 ml-1">{deal.quantityTons}T</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-gray-400">Deadline:</span>
                        <span className="font-semibold text-gray-700 ml-1">{new Date(deal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg p-2">{deal.requirements}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} />
                        <span>{deal.location}</span>
                        <span className="ml-2 text-gray-400">{deal.interestedCount} interested</span>
                      </div>
                      <button
                        onClick={() => handleExpressInterest(deal.id)}
                        disabled={interestedDeals.has(deal.id) || expressInterest.isPending}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          interestedDeals.has(deal.id)
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-100"
                        }`}
                        data-testid={`btn-interest-${deal.id}`}
                      >
                        {interestedDeals.has(deal.id) ? <><CheckCircle size={12} />Registered</> : <><TrendingUp size={12} />Express Interest</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
