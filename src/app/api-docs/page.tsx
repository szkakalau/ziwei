"use client";

import { useState } from "react";
import { Key, Copy, Check, Code, Sparkles } from "lucide-react";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Code className="h-5 w-5 text-amber-400/60" />
        <h1 className="text-white/80 text-lg font-semibold">Zi Wei Dou Shu API</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">
        Integrate Zi Wei Dou Shu astrology into your own applications.
        Free for non-commercial use. Contact us for commercial licensing.
      </p>

      {/* Authentication */}
      <section className="mb-8">
        <h2 className="text-white/50 text-sm font-semibold mb-3 flex items-center gap-2">
          <Key className="h-4 w-4" /> Authentication
        </h2>
        <p className="text-white/40 text-xs mb-3">
          All API requests require an API key passed in the <code className="text-amber-300/60 bg-white/[0.04] px-1.5 py-0.5 rounded text-[11px]">X-API-Key</code> header.
        </p>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs text-white/50">
          curl -H &quot;X-API-Key: zwds_xxxx&quot; https://api.destinyblueprint.xyz/v1/chart
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-8">
        <h2 className="text-white/50 text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Endpoints
        </h2>

        {[
          {
            method: "POST",
            path: "/v1/chart",
            desc: "Compute a Zi Wei Dou Shu birth chart",
            body: `{\n  "birthDate": "1990-05-15",\n  "birthTime": "14:30",\n  "gender": "female",\n  "location": "Los Angeles, CA"\n}`,
            response: `{\n  "ok": true,\n  "chart": {\n    "palaces": [\n      { "name": "Soul", "majorStars": ["Zi Wei", "Tian Fu"] },\n      ...\n    ]\n  }\n}`,
          },
          {
            method: "POST",
            path: "/v1/horoscope",
            desc: "Generate a daily horoscope from a birth chart",
            body: `{\n  "chart": { ... },\n  "date": "2026-06-01"\n}`,
            response: `{\n  "ok": true,\n  "horoscope": "Today, Zi Wei in your Career Palace..."\n}`,
          },
          {
            method: "POST",
            path: "/v1/compatibility",
            desc: "Compare two birth charts for compatibility",
            body: `{\n  "chartA": { ... },\n  "chartB": { ... }\n}`,
            response: `{\n  "ok": true,\n  "analysis": "These charts show strong..."\n}`,
          },
        ].map((ep) => (
          <div key={ep.path} className="mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300/80">
                {ep.method}
              </span>
              <code className="text-white/70 text-sm font-mono">{ep.path}</code>
              <span className="text-white/30 text-xs ml-auto">{ep.desc}</span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-wider mb-1.5">Request</p>
                <div className="relative">
                  <pre className="text-white/50 text-[11px] font-mono bg-black/30 rounded-lg p-3 overflow-x-auto">{ep.body}</pre>
                  <button
                    onClick={() => copyToClipboard(ep.body, ep.path + "-req")}
                    className="absolute top-2 right-2 p-1.5 rounded hover:bg-white/[0.05] transition-colors"
                  >
                    {copied === ep.path + "-req"
                      ? <Check className="h-3 w-3 text-emerald-400" />
                      : <Copy className="h-3 w-3 text-white/20" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-wider mb-1.5">Response</p>
                <pre className="text-white/50 text-[11px] font-mono bg-black/30 rounded-lg p-3 overflow-x-auto">{ep.response}</pre>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Rate Limits */}
      <section className="mb-8 rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
        <h2 className="text-white/50 text-sm font-semibold mb-2">Rate Limits</h2>
        <div className="space-y-2 text-white/40 text-xs">
          <p>• Free tier: 100 requests/day</p>
          <p>• Pro tier: 1,000 requests/day</p>
          <p>• Enterprise: Custom limits</p>
        </div>
      </section>

      <p className="text-white/15 text-[11px] text-center mt-12">
        DestinyBlueprint API v1 — Beta
      </p>
    </main>
  );
}
