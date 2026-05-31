import type { DayPoint } from "@/lib/analytics";

export function ViewsChart({ data }: { data: DayPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.views));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-500">
        Visitas por día (últimos {data.length} días)
      </h2>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d) => {
          const h = Math.round((d.views / max) * 100);
          return (
            <div
              key={d.date}
              className="group flex h-full flex-1 flex-col items-center justify-end"
              title={`${d.label}: ${d.views} visitas`}
            >
              <span className="mb-1 text-[10px] font-bold text-neutral-400 opacity-0 transition group-hover:opacity-100">
                {d.views}
              </span>
              <div
                className="w-full rounded-t bg-accent transition hover:bg-accent-600"
                style={{ height: `${Math.max(2, h)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
