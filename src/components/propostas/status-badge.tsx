import { cn, LABEL_STATUS } from "@/lib/utils";
import type { StatusProposta } from "@/types";

const CORES_DOT: Record<StatusProposta, string> = {
  rascunho: "bg-stone-100 text-stone-600 border border-stone-200",
  enviada: "bg-primary/10 text-primary border border-primary/20",
  aprovada: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejeitada: "bg-red-50 text-red-700 border border-red-200"
};

export const CORES_PONTO: Record<StatusProposta, string> = {
  rascunho: "bg-stone-400",
  enviada: "bg-primary",
  aprovada: "bg-emerald-500",
  rejeitada: "bg-red-500"
};

interface StatusBadgeProps {
  status: StatusProposta;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transicao-premium",
        CORES_DOT[status],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          CORES_PONTO[status],
          status === "aprovada" && "animate-pulse-soft"
        )}
      />
      {LABEL_STATUS[status]}
    </span>
  );
}
