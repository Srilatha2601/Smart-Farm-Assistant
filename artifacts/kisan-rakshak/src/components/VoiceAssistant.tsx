import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send, Bot, User, Loader } from "lucide-react";
import { useCreateGeminiConversation } from "@workspace/api-client-react";

const QUICK_PROMPTS = [
  { en: "When to harvest?", te: "పంట ఎప్పుడు కోయాలి?" },
  { en: "Market rates today?", te: "నేటి మార్కెట్ రేట్లు?" },
  { en: "Best fertilizer for rice?", te: "వరికి మంచి ఎరువు?" },
  { en: "Rain forecast today?", te: "ఈరోజు వర్షం వస్తుందా?" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Namaskaram! I'm Kisan Mitra, your AI farming assistant. Ask me anything about crops, diseases, prices, or farming tips! (పంట విషయంలో ఏదైనా అడగండి!)" }
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const createConversation = useCreateGeminiConversation();

  useEffect(() => {
    if (open && !conversationId) {
      createConversation.mutateAsync({ data: { title: "Kisan Mitra Session" } })
        .then(conv => setConversationId(conv.id))
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming || !conversationId) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "", streaming: true }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/gemini/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text })
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullText += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText, streaming: true };
                  return updated;
                });
              }
              if (data.done) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, I had trouble responding. Please try again." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-50 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-xl shadow-emerald-300 flex flex-col items-center justify-center w-14 h-14"
            data-testid="btn-voice-assistant"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Mic size={20} />
            </motion.div>
            <span className="text-[8px] font-bold mt-0.5 leading-none">Mawa</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl overflow-hidden"
              style={{ height: "75vh" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Bot size={20} className="text-white" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Kisan Mitra AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-white/80 text-xs">Matladu Mawa (Talk to me)</span>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} data-testid="btn-close-voice-assistant">
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Quick Prompts */}
              <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b border-gray-100">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.en)}
                    disabled={isStreaming}
                    className="shrink-0 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    data-testid={`btn-quick-prompt-${i}`}
                  >
                    {p.te}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ height: "calc(75vh - 200px)" }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "assistant" ? "bg-emerald-100" : "bg-gray-200"
                    }`}>
                      {msg.role === "assistant" ? <Bot size={14} className="text-emerald-600" /> : <User size={14} className="text-gray-600" />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}>
                      {msg.streaming && !msg.content ? (
                        <div className="flex gap-1 py-1">
                          {[0,1,2].map(j => (
                            <motion.div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full bg-gray-400"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                          {msg.streaming && <span className="inline-block w-0.5 h-3 bg-emerald-600 ml-0.5 animate-pulse" />}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Ask anything... (ఏదైనా అడగండి)"
                    disabled={isStreaming || !conversationId}
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                    data-testid="input-voice-message"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isStreaming || !conversationId}
                    className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-emerald-600 transition-colors"
                    data-testid="btn-send-message"
                  >
                    {isStreaming ? <Loader size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
