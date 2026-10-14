import { cn } from "@/lib/utils";

// Progress bar sederhana (tanpa library) — dipakai dashboard R10
export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-rule", className)}
    >
      <div
        className="h-full rounded-full bg-survey transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
