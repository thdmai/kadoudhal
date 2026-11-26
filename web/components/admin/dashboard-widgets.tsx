import type { CSSProperties } from "react";

type RingStatProps = {
  title: string;
  value: number | string;
  caption: string;
  percent: number;
  color: string;
};

export function RingStat({
  title,
  value,
  caption,
  percent,
  color,
}: RingStatProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <article className="admin-card relative p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
        <span className="text-[var(--admin-muted)]" aria-hidden>
          ⋮
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative size-[88px] shrink-0">
          <svg viewBox="0 0 88 88" className="size-full -rotate-90">
            <circle
              cx="44"
              cy="44"
              r={r}
              fill="none"
              stroke="var(--admin-soft)"
              strokeWidth="8"
            />
            <circle
              cx="44"
              cy="44"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="admin-ring-progress"
              style={{ "--admin-ring-full": c } as CSSProperties}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--admin-ink)]">
            {Math.round(clamped)}%
          </span>
        </div>
        <div>
          <p className="admin-stat-value">{value}</p>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">{caption}</p>
        </div>
      </div>
    </article>
  );
}

type ProgressStatProps = {
  title: string;
  value: number | string;
  caption: string;
  percent: number;
  badge: string;
  color: string;
};

export function ProgressStat({
  title,
  value,
  caption,
  percent,
  badge,
  color,
}: ProgressStatProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <article className="admin-card relative p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
        <span className="text-[var(--admin-muted)]" aria-hidden>
          ⋮
        </span>
      </div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="rounded px-2 py-0.5 text-xs font-semibold text-white"
          style={{ background: color }}
        >
          {badge}
        </span>
        <p className="admin-stat-value !text-[1.75rem]">{value}</p>
      </div>
      <p className="mb-3 text-sm text-[var(--admin-muted)]">{caption}</p>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-soft)]">
        <div
          className="admin-bar-fill h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 55%, white), ${color})`,
          }}
        />
      </div>
    </article>
  );
}

type DonutSlice = { label: string; value: number; color: string };

type DonutChartProps = {
  title: string;
  centerLabel: string;
  centerValue: number | string;
  slices: DonutSlice[];
};

export function DonutChart({
  title,
  centerLabel,
  centerValue,
  slices,
}: DonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let cursor = 0;

  return (
    <article className="admin-card relative p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
        <span className="text-[var(--admin-muted)]" aria-hidden>
          ⋮
        </span>
      </div>
      <div className="relative mx-auto size-[180px]">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90">
          {slices.map((slice) => {
            const len = (slice.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={dash}
                strokeDashoffset={-cursor}
              />
            );
            cursor += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-[var(--admin-muted)]">{centerLabel}</p>
          <p className="font-display text-3xl text-[var(--admin-ink)]">
            {centerValue}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
        {slices.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center gap-2 text-xs text-[var(--admin-muted)]"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: slice.color }}
            />
            {slice.label} ({slice.value})
          </li>
        ))}
      </ul>
    </article>
  );
}

type BarChartProps = {
  title: string;
  bars: { label: string; value: number }[];
  color?: string;
};

export function BarChart({
  title,
  bars,
  color = "#5b8def",
}: BarChartProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <article className="admin-card relative p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
        <span className="text-[var(--admin-muted)]" aria-hidden>
          ⋮
        </span>
      </div>
      <div className="flex h-48 items-end gap-3 px-1">
        {bars.map((bar) => {
          const h = Math.max(8, (bar.value / max) * 100);
          return (
            <div
              key={bar.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[0.65rem] font-semibold text-[var(--admin-muted)]">
                {bar.value}
              </span>
              <div
                className="w-full max-w-10 rounded-t-sm"
                style={{ height: `${h}%`, background: color }}
                title={`${bar.label}: ${bar.value}`}
              />
              <span className="truncate text-[0.7rem] text-[var(--admin-muted)]">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

type LineSeries = { label: string; color: string; values: number[] };

type LineChartProps = {
  title: string;
  labels: string[];
  series: LineSeries[];
};

export function LineChart({ title, labels, series }: LineChartProps) {
  const width = 320;
  const height = 180;
  const padX = 28;
  const padY = 20;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1);
  const min = 0;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const n = Math.max(labels.length - 1, 1);

  function point(i: number, v: number) {
    const x = padX + (i / n) * innerW;
    const y = padY + (1 - (v - min) / (max - min || 1)) * innerH;
    return `${x},${y}`;
  }

  return (
    <article className="admin-card relative p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
        <span className="text-[var(--admin-muted)]" aria-hidden>
          ⋮
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + t * innerH;
          return (
            <line
              key={t}
              x1={padX}
              y1={y}
              x2={width - padX}
              y2={y}
              stroke="var(--admin-border)"
              strokeWidth="1"
            />
          );
        })}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.values.map((v, i) => point(i, v)).join(" ")}
          />
        ))}
        {labels.map((label, i) => {
          const x = padX + (i / n) * innerW;
          return (
            <text
              key={label}
              x={x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[var(--admin-muted)] text-[9px]"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-2 text-xs text-[var(--admin-muted)]"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: s.color }}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </article>
  );
}

type LeadCardProps = {
  name: string;
  email: string;
  initials: string;
  role: string;
};

export function LeadCard({ name, email, initials, role }: LeadCardProps) {
  return (
    <article className="admin-card flex items-center gap-3 p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--admin-soft)] text-sm font-semibold text-[var(--admin-accent)]">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--admin-ink)]">
          {name}
        </p>
        <p className="truncate text-xs text-[var(--admin-muted)]">{email}</p>
        <p className="mt-0.5 text-[0.65rem] tracking-wide text-[var(--admin-muted)] uppercase">
          {role}
        </p>
      </div>
    </article>
  );
}
