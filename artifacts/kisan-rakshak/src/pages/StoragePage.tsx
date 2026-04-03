import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warehouse, Star, MapPin, Thermometer, CheckCircle, X, TrendingUp, TrendingDown } from "lucide-react";
import { useListStorages, useBookStorage } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function StoragePage() {
  const [selectedStorage, setSelectedStorage] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<any>(null);
  const [form, setForm] = useState({ quantity: "", startDate: "", duration: "30", cropType: "Rice" });

  const { data: storages, isLoading } = useListStorages();
  const bookStorage = useBookStorage();
  const { toast } = useToast();

  const CROPS = ["Rice", "Wheat", "Potato", "Tomato", "Chilli", "Turmeric", "Onion", "Cotton"];

  const handleBook = (storage: any) => {
    setSelectedStorage(storage);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.quantity || !form.startDate) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      const result = await bookStorage.mutateAsync({
        data: {
          storageId: selectedStorage.id,
          quantityTons: parseFloat(form.quantity),
          startDate: form.startDate,
          durationDays: parseInt(form.duration),
          cropType: form.cropType
        }
      });
      setShowModal(false);
      setShowConfirmation(result);
    } catch (err) {
      toast({ title: "Booking failed", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
          <Warehouse size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">Smart Storage</h1>
          <p className="text-xs text-gray-500">Cold storage and spoilage monitoring</p>
        </div>
      </div>

      {/* Sell vs Store Advisor */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
        <p className="text-xs font-medium text-blue-200 mb-2">Sell vs Store Advisor</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-green-300" />
              <span className="text-xs text-blue-100">Sell Now (Rice)</span>
            </div>
            <p className="text-xl font-black">₹22/kg</p>
            <p className="text-xs text-blue-200 mt-0.5">Current Market Rate</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-300" />
              <span className="text-xs text-blue-100">Store 3 Months</span>
            </div>
            <p className="text-xl font-black text-emerald-300">₹28/kg</p>
            <p className="text-xs text-blue-200 mt-0.5">Projected Forecast</p>
          </div>
        </div>
        <p className="text-xs text-blue-200 mt-2">Storing for 3 months could earn you <span className="text-emerald-300 font-bold">27% more</span></p>
      </div>

      {/* Storage List */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">Nearby Cold Storages</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2.5">
            {(storages || []).map((storage: any, i: number) => (
              <motion.div
                key={storage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                data-testid={`card-storage-${storage.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800">{storage.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-700">{storage.rating}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{storage.distanceKm}km</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Thermometer size={10} className="text-blue-400" />
                        <span className="text-xs text-gray-500">{storage.temperature}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {storage.features.slice(0, 2).map((f: string) => (
                        <span key={f} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {storage.availableSlots}T available of {storage.capacityTons}T total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-amber-600">₹{storage.pricePerDayTon}</p>
                    <p className="text-[10px] text-gray-400">per ton/day</p>
                    <button
                      onClick={() => handleBook(storage)}
                      className="mt-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                      data-testid={`btn-book-storage-${storage.id}`}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedStorage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Book Storage</h3>
                <button onClick={() => setShowModal(false)} data-testid="btn-close-storage-modal">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-amber-800">{selectedStorage.name}</p>
                <p className="text-xs text-amber-600">₹{selectedStorage.pricePerDayTon}/ton/day • {selectedStorage.temperature}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Crop Type</label>
                  <select
                    value={form.cropType}
                    onChange={e => setForm(f => ({...f, cropType: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white"
                    data-testid="select-crop-type"
                  >
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity (Tons) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={form.quantity}
                    onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    data-testid="input-quantity"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(f => ({...f, startDate: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Duration</label>
                  <select
                    value={form.duration}
                    onChange={e => setForm(f => ({...f, duration: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-white"
                    data-testid="select-duration"
                  >
                    {["7", "15", "30", "60", "90", "180"].map(d => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
                {form.quantity && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600">Estimated Total Cost</p>
                    <p className="text-xl font-black text-amber-700">
                      ₹{(selectedStorage.pricePerDayTon * parseFloat(form.quantity || "0") * parseInt(form.duration)).toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-500">{form.quantity}T × {form.duration} days × ₹{selectedStorage.pricePerDayTon}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={bookStorage.isPending}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md disabled:opacity-50"
                data-testid="btn-confirm-storage-booking"
              >
                {bookStorage.isPending ? "Booking..." : "Confirm Storage Booking"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 text-center max-w-xs w-full"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-amber-500" />
              </div>
              <h3 className="font-black text-gray-800 text-lg mb-1">Storage Booked!</h3>
              <p className="text-sm text-gray-500 mb-3">{showConfirmation.storageName}</p>
              <div className="bg-amber-50 rounded-xl p-3 mb-4 text-left space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-semibold text-gray-700">{showConfirmation.quantityTons}T</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-700">{showConfirmation.durationDays} days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-black text-amber-600">₹{showConfirmation.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmation(null)}
                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl"
                data-testid="btn-close-storage-confirmation"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
