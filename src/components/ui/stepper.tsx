import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperEtapa {
  numero: number;
  titulo: string;
}

interface StepperProps {
  etapas: StepperEtapa[];
  etapaAtual: number;
}

export function Stepper({ etapas, etapaAtual }: StepperProps) {
  return (
    <ol className="flex w-full items-center">
      {etapas.map((etapa, indice) => {
        const concluida = etapa.numero < etapaAtual;
        const ativa = etapa.numero === etapaAtual;

        return (
          <li key={etapa.numero} className={cn("flex items-center", indice !== etapas.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transicao-premium",
                  concluida && "border-primary bg-primary text-white",
                  ativa && "border-primary bg-primary/10 text-primary",
                  !concluida && !ativa && "border-stone-200 bg-stone-100 text-stone-400"
                )}
                aria-current={ativa ? "step" : undefined}
              >
                {concluida ? <Check className="h-5 w-5" /> : etapa.numero}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  ativa || concluida ? "text-stone-900" : "text-stone-400"
                )}
              >
                {etapa.titulo}
              </span>
            </div>
            {indice !== etapas.length - 1 && (
              <div
                className={cn("mx-2 h-px flex-1 transicao-premium", concluida ? "bg-primary" : "bg-stone-200")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
