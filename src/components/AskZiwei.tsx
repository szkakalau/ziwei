"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send } from "lucide-react";
import Link from "next/link";

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
      } else if (d.error === "CHAT_TRIAL_LIMIT") {
        setError(d.message);
        // Show upgrade CTA below the error
        setMessages((prev) => [...prev, { role: "assistant", content: `Trial limit reached. Upgrade to a paid subscription for unlimited AI chat.` }]);
      } else {
        setError(d.message || "Unable to answer right now.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [input]);

  return (
    <section className="mb-8" data-testid="ask-ziwei">
      <h2 className="text-ink-dim text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5" />
        Ask Zi Wei
      </h2>

      {/* Chat messages */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-ink-dim text-xs mb-2">Try asking:</p>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-4 py-2.5 rounded-xl
                           bg-black/[0.02] border border-white/[0.04]
                           text-ink-muted text-xs hover:text-ink
                           hover:border-black/6 transition-colors"
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
                  : "bg-black/[0.04] text-ink rounded-bl-md border border-black/5"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/[0.04] border border-black/5 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-amber-400/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <p className="text-red-400/70 text-xs text-center">{error}</p>
            {error.includes("Upgrade") && (
              <Link
                href="/daily"
                className="block text-center px-4 py-2 rounded-xl bg-amber-500/15 text-amber-700 text-xs font-medium border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
              >
                Upgrade now →
              </Link>
            )}
          </div>
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
          className="flex-1 px-4 py-3 rounded-xl bg-black/[0.04] border border-black/5
                     text-ink text-sm placeholder:text-ink-dim/60
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
