import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Star, MapPin, CheckCircle, X, Clock, DollarSign } from "lucide-react";
import { useListDrones, useBookDrone, useListDroneBookings, getListDroneBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PESTICIDES = ["Mancozeb 75% WP", "Copper Oxychloride", "Chlorpyrifos 20% EC", "Imidacloprid 17.8% SL", "Propiconazole 25% EC", "Urea (Foliar)", "NPK 19:19:19"];

export default function DronesPage() {
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({ fieldSize: "", date: "", pesticide: PESTICIDES[0] });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<any>(null);
  
  const { data: operators, isLoading } = useListDrones();
  const { data: bookings } = useListDroneBookings();
  const bookDrone = useBookDrone();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleBookNow = (operator: any) => {
    setSelectedOperator(operator);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedOperator || !bookingForm.fieldSize || !bookingForm.date) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const result = await bookDrone.mutateAsync({
        data: {
          operatorId: selectedOperator.id,
          fieldSizeAcres: parseFloat(bookingForm.fieldSize),
          scheduledDate: bookingForm.date,
          pesticide: bookingForm.pesticide,
          notes: ""
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListDroneBookingsQueryKey() });
      setShowBookingModal(false);
      setShowConfirmation(result);
    } catch (err) {
      toast({ title: "Booking Failed", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center">
          <Plane size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">Drone Swarm Center</h1>
          <p className="text-xs text-gray-500">Book precision spraying services</p>
        </div>
      </div>

      {/* Field Map Visualization */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-900 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="absolute border border-green-400" style={{
              left: `${(i % 4) * 25}%`, top: `${Math.floor(i/4) * 50}%`,
              width: "25%", height: "50%"
            }} />
          ))}
        </div>
        <div className="relative">
          <p className="text-green-300 text-xs font-medium mb-2">Your Field Map</p>
          {/* Hotspots */}
          {[
            { x: "20%", y: "30%", size: 24 },
            { x: "60%", y: "45%", size: 18 },
            { x: "75%", y: "20%", size: 14 },
          ].map((spot, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: spot.x, top: spot.y }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            >
              <div className={`w-${spot.size/4} h-${spot.size/4} rounded-full bg-red-500/70 border-2 border-red-400 flex items-center justify-center`}
                style={{ width: spot.size, height: spot.size }}>
                <div className="w-2 h-2 rounded-full bg-red-300" />
              </div>
            </motion.div>
          ))}
          <div className="h-28" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-green-300 text-xs">Pest Hotspot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-green-300 text-xs">Healthy Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operators List */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">Nearby Drone Operators</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {(operators || []).map((op: any, i: number) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                data-testid={`card-operator-${op.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-800">{op.name}</h3>
                      {!op.available && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">BUSY</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-700">{op.rating}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{op.distanceKm}km away</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{op.droneModel} • {op.speciality}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-600">₹{op.pricePerAcre}</p>
                    <p className="text-[10px] text-gray-400">per acre</p>
                    <button
                      onClick={() => handleBookNow(op)}
                      disabled={!op.available}
                      className="mt-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
                      data-testid={`btn-book-drone-${op.id}`}
                    >
                      {op.available ? "Book Now" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      {bookings && bookings.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">Your Bookings</h2>
          <div className="space-y-2">
            {bookings.slice(0, 3).map((b: any) => (
              <div key={b.id} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{b.operatorName}</p>
                    <p className="text-xs text-emerald-600">{b.fieldSizeAcres} acres • {b.pesticide}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600">{b.scheduledDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-700">₹{b.totalCost.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      b.status === "confirmed" ? "bg-green-100 text-green-700" :
                      b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                    }`}>{b.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedOperator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end"
            onClick={e => e.target === e.currentTarget && setShowBookingModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Book Drone Service</h3>
                <button onClick={() => setShowBookingModal(false)} data-testid="btn-close-drone-modal">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-emerald-800">{selectedOperator.name}</p>
                <p className="text-xs text-emerald-600">₹{selectedOperator.pricePerAcre}/acre • {selectedOperator.rating} rated</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Field Size (acres) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2.5"
                    value={bookingForm.fieldSize}
                    onChange={e => setBookingForm(f => ({...f, fieldSize: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    data-testid="input-field-size"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Scheduled Date *</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setBookingForm(f => ({...f, date: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                    data-testid="input-scheduled-date"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Pesticide / Fertilizer</label>
                  <select
                    value={bookingForm.pesticide}
                    onChange={e => setBookingForm(f => ({...f, pesticide: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                    data-testid="select-pesticide"
                  >
                    {PESTICIDES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {bookingForm.fieldSize && (
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-emerald-600">Estimated Cost</p>
                    <p className="text-xl font-black text-emerald-700">
                      ₹{(selectedOperator.pricePerAcre * parseFloat(bookingForm.fieldSize || "0")).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmitBooking}
                disabled={bookDrone.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md disabled:opacity-50"
                data-testid="btn-confirm-drone-booking"
              >
                {bookDrone.isPending ? "Booking..." : "Confirm Booking"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 text-center max-w-xs w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle size={32} className="text-emerald-500" />
              </motion.div>
              <h3 className="font-black text-gray-800 text-lg mb-1">Booking Confirmed!</h3>
              <p className="text-sm text-gray-500 mb-3">{showConfirmation.operatorName}</p>
              <div className="bg-emerald-50 rounded-xl p-3 mb-4 text-left space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold text-gray-700">{showConfirmation.scheduledDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Field Size</span>
                  <span className="font-semibold text-gray-700">{showConfirmation.fieldSizeAcres} acres</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-black text-emerald-600">₹{showConfirmation.totalCost.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmation(null)}
                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl"
                data-testid="btn-close-confirmation"
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
