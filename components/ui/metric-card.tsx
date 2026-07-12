import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="liuxiang-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 text-muted">
        <span className="text-xs">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-ivory">{value}</div>
      {helper ? <div className="mt-1 text-xs text-muted">{helper}</div> : null}
    </div>
  );
}
