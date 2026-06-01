"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What does my career palace say about my work life?",
  "How do my stars affect my relationships?",
  "What's my biggest strength based on my chart?",
];

export function AskZiwei() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    if (sendingRef.current) return;
    const question = (text ?? input).trim();
    if (!question) return;

    sendingRef.current = true;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const d = await r.json();

      if (d.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: d.answer }]);
      } else {
        setError(d.message || "Unable to answer right now.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [input, loading]);

  return (
    <section className="mb-8">
      <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5" />
        Ask Zi Wei
      </h2>

      {/* Chat messages */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-white/30 text-xs mb-2">Try asking:</p>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-4 py-2.5 rounded-xl
                           bg-white/[0.02] border border-white/[0.04]
                           text-white/50 text-xs hover:text-white/70
                           hover:border-white/[0.08] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500/15 text-amber-100/90 rounded-br-md"
                  : "bg-white/[0.04] text-white/80 rounded-bl-md border border-white/[0.05]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400/70 text-xs text-center">{error}</p>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Ask about your chart..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]
                     text-white/80 text-sm placeholder:text-white/20
                     focus:outline-none focus:border-amber-500/20"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/15
                     text-amber-400/70 hover:bg-amber-500/20 disabled:opacity-30
                     transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
