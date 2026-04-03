import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, TrendingUp, Clock, MapPin, CheckCircle, MessageSquare, Filter } from "lucide-react";
import { useListMarketDeals, useExpressInterestInDeal, getListMarketDealsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function MarketPage() {
  const [filter, setFilter] = useState<"all" | "urgent">("all");
  const [interestedDeals, setInterestedDeals] = useState<Set<number>>(new Set());
  
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

  const filteredDeals = (deals || []).filter((d: any) => filter === "all" || d.isUrgent);

  const COMPANY_LOGOS: Record<string, string> = {
    "Lays (PepsiCo India)": "🥔",
    "Britannia Industries": "🌾",
    "ITC Agri": "🌿",
    "Amul (GCMMF)": "🌺",
    "MTR Foods": "🍚",
    "Adani Wilmar": "🌻",
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center">
          <Handshake size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">B2B Marketplace</h1>
          <p className="text-xs text-gray-500">Direct industry contracts</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active Deals", value: deals?.length || "6", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Urgent", value: deals?.filter((d: any) => d.isUrgent).length || "3", color: "text-red-600", bg: "bg-red-50" },
          { label: "Avg Price", value: "₹56/kg", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
            <p className={`text-base font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "urgent"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? "bg-rose-500 text-white shadow-sm" : "bg-gray-100 text-gray-500"
            }`}
            data-testid={`filter-${f}`}
          >
            {f === "all" ? "All Deals" : "Urgent"}
          </button>
        ))}
      </div>

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

      {/* Deals List */}
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
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                deal.isUrgent ? "border-red-100" : "border-gray-100"
              }`}
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
                    {interestedDeals.has(deal.id) ? (
                      <>
                        <CheckCircle size={12} />
                        Registered
                      </>
                    ) : (
                      <>
                        <TrendingUp size={12} />
                        Express Interest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
