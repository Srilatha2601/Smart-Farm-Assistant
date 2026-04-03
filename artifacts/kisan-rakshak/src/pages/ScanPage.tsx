import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Leaf, AlertCircle, CheckCircle, ChevronRight, Plane, X, RefreshCw, Droplets, FlaskConical } from "lucide-react";
import { useDetectDisease } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface DetectionResult {
  isLeaf: boolean;
  diseaseName: string;
  confidence: number;
  severity: string;
  description: string;
  symptoms: string[];
  fertilizers: Array<{ name: string; dosage: string; frequency: string; notes: string; canBook: boolean }>;
  preventionTips: string[];
  scanId: number;
}

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const detectDisease = useDetectDisease();

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permission in your browser settings.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const scanLeaf = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.85);

    setAnalyzing(true);
    setResult(null);

    try {
      const data = await detectDisease.mutateAsync({
        data: { imageBase64, cropType: "unknown" }
      });
      setResult(data as DetectionResult);
      if (data.isLeaf) {
        stopCamera();
      }
    } catch (err) {
      toast({
        title: "Scan Failed",
        description: "Could not analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  }, [detectDisease, stopCamera, toast]);

  const resetScan = () => {
    setResult(null);
    startCamera();
  };

  const severityColors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
    none: "bg-green-100 text-green-700"
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Camera size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">AI Disease Doctor</h1>
          <p className="text-xs text-gray-500">Point camera at a plant leaf</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {/* Camera Viewfinder */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Leaf detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-emerald-400 rounded-2xl w-3/4 h-3/4 opacity-70">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <div className="bg-black/50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                      <Leaf size={12} className="text-emerald-400" />
                      <span className="text-white text-xs">Align leaf in frame</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  {cameraError ? (
                    <>
                      <AlertCircle size={32} className="text-red-400" />
                      <p className="text-red-300 text-sm text-center px-4">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                        data-testid="btn-retry-camera"
                      >
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera size={32} className="text-gray-500" />
                      <p className="text-gray-400 text-sm">Starting camera...</p>
                    </>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Analyze button */}
            <AnimatePresence>
              {analyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw size={18} className="text-emerald-600" />
                    </motion.div>
                    <span className="text-emerald-700 font-semibold text-sm">Analyzing Leaf with Gemini AI...</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{ width: "60%" }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={scanLeaf}
                  disabled={!cameraActive}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="btn-scan-leaf"
                >
                  <Camera size={20} />
                  Scan Leaf / ఆకు స్కాన్ చేయండి
                </motion.button>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <p className="text-xs font-semibold text-blue-700 mb-1">Tips for best results:</p>
              <ul className="text-xs text-blue-600 space-y-0.5">
                <li>• Hold phone 15-20cm from the leaf</li>
                <li>• Ensure good lighting — natural sunlight is best</li>
                <li>• Camera must see a plant leaf (not a person, food, or object)</li>
                <li>• Keep the leaf steady while scanning</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {!result.isLeaf ? (
              /* Not a leaf error */
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
                <h3 className="font-bold text-red-700 text-base mb-1">Not a Plant Leaf!</h3>
                <p className="text-red-600 text-sm mb-4">
                  Please point your camera at a plant leaf for disease detection. Objects, people, and food items cannot be analyzed.
                </p>
                <button
                  onClick={resetScan}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
                  data-testid="btn-retry-scan"
                >
                  Try Again with a Leaf
                </button>
              </div>
            ) : (
              <>
                {/* Disease Result Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`px-4 py-3 flex items-center justify-between ${
                    result.severity === "high" ? "bg-red-500" :
                    result.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`}>
                    <div>
                      <p className="text-white/80 text-xs">Disease Detected</p>
                      <h3 className="text-white font-black text-lg">{result.diseaseName}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-xs">Confidence</p>
                      <p className="text-white font-black text-2xl">{Math.round(result.confidence * 100)}%</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityColors[result.severity]}`}>
                        {result.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{result.description}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-500" />
                    Symptoms Identified
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {result.symptoms.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 bg-amber-50 rounded-lg px-2 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                        <span className="text-xs text-amber-700">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fertilizer Recommendations */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                    <FlaskConical size={14} className="text-emerald-500" />
                    Recommended Fertilizers / Pesticides
                  </h4>
                  <div className="space-y-2.5">
                    {result.fertilizers.map((f, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-emerald-800">{f.name}</p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                              <span className="font-medium">Dosage:</span> {f.dosage}
                            </p>
                            <p className="text-xs text-emerald-600">
                              <span className="font-medium">Frequency:</span> {f.frequency}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 italic">{f.notes}</p>
                          </div>
                          {f.canBook && (
                            <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              BOOKABLE
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention Tips */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-blue-500" />
                    Prevention Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {result.preventionTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-blue-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button
                    onClick={resetScan}
                    className="py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                    data-testid="btn-scan-again"
                  >
                    <Camera size={14} />
                    Scan Again
                  </button>
                  <button
                    onClick={() => setLocation("/drones")}
                    className="py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                    data-testid="btn-book-drone-from-scan"
                  >
                    <Plane size={14} />
                    Book Drone
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
