"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeStats } from "@/lib/analytics";

function ago(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 5) return "ahora";
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  return `hace ${m} min`;
}

function sourceOf(referrer: string | null): string {
  if (!referrer) return "Directo";
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    if (h.includes("google")) return "Google";
    if (h.includes("facebook") || h.includes("fb.")) return "Facebook";
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("t.co") || h.includes("twitter") || h.includes("x.com")) return "X";
    if (h.includes("tiktok")) return "TikTok";
    if (h.includes("whatsapp") || h.includes("wa.me")) return "WhatsApp";
    return h;
  } catch {
    return "Directo";
  }
}

export function RealtimePanel() {
  const [data, setData] = useState<RealtimeStats | null>(null);
  const [stale, setStale] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/realtime", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const json = (await r.json()) as RealtimeStats;
        if (alive) {
          setData(json);
          setStale(false);
        }
      } catch {
        if (alive) setStale(true);
      }
    };
    load();
    timer.current = setInterval(load, 5000);
    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const maxBar = Math.max(1, ...(data?.perMinute.map((p) => p.count) ?? [1]));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          En vivo
        </h3>
        <span className="text-xs text-neutral-400">
          {stale ? "reconectando…" : "actualiza cada 5s"}
        </span>
      </div>

      {/* Usuarios activos */}
      <div className="mt-3 flex items-end gap-6">
        <div>
          <div className="text-5xl font-black leading-none text-neutral-900">
            {data ? data.activeNow.toLocaleString("es-EC") : "—"}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            usuarios activos ahora
          </div>
        </div>
        <div className="flex gap-4 pb-1 text-sm">
          <div>
            <div className="text-xl font-black text-neutral-900">{data?.views5m ?? "—"}</div>
            <div className="text-xs text-neutral-500">vistas · 5 min</div>
          </div>
          <div>
            <div className="text-xl font-black text-neutral-900">{data?.views30m ?? "—"}</div>
            <div className="text-xs text-neutral-500">vistas · 30 min</div>
          </div>
        </div>
      </div>

      {/* Vistas por minuto (últimos 30 min) */}
      <div className="mt-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          Vistas por minuto (últimos 30 min)
        </div>
        <div className="flex h-16 items-end gap-0.5">
          {(data?.perMinute ?? Array.from({ length: 30 }, (_, i) => ({ t: String(i), count: 0 }))).map(
            (p, i) => (
              <div
                key={p.t + i}
                title={`${p.count} vista(s)`}
                className="flex-1 rounded-t bg-accent transition-all"
                style={{ height: `${Math.max(2, (p.count / maxBar) * 100)}%`, opacity: p.count ? 1 : 0.25 }}
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Páginas activas */}
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Páginas activas (5 min)
          </div>
          {data && data.topPages.length > 0 ? (
            <ul className="space-y-1.5">
              {data.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-neutral-700">{p.path}</span>
                  <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    {p.views}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400">Nadie navegando ahora.</p>
          )}
        </div>

        {/* Feed en vivo */}
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Últimas visitas
          </div>
          {data && data.recent.length > 0 ? (
            <ul className="space-y-1.5">
              {data.recent.slice(0, 8).map((r, i) => (
                <li key={r.at + i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-neutral-700">
                    <span className="text-neutral-400">{sourceOf(r.referrer)} →</span> {r.path}
                  </span>
                  <span className="flex-shrink-0 text-xs text-neutral-400">{ago(r.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400">Sin visitas recientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}
