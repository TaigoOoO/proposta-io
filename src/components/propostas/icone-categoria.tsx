import { PartyPopper, HardHat, Palette, Briefcase, Sparkles, type LucideIcon } from "lucide-react";
import type { CategoriaTemplate } from "@/types";

export const ICONE_CATEGORIA: Record<CategoriaTemplate, LucideIcon> = {
  eventos: PartyPopper,
  construcao: HardHat,
  design: Palette,
  consultoria: Briefcase,
  outros: Sparkles
};
