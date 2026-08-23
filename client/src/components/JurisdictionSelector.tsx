import { Globe2, LockKeyhole } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface JurisdictionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function JurisdictionSelector({ value, onChange, compact = false }: JurisdictionSelectorProps) {
  const query = trpc.jurisdictions.list.useQuery();
  const options = query.data?.options ?? [];

  return <div className={compact ? "flex items-center gap-2" : "space-y-2"}>
    {!compact && <label htmlFor="jurisdiction-selector" className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Jurisdicción legal</label>}
    <div className="relative flex items-center">
      <Globe2 className="pointer-events-none absolute left-3 h-4 w-4 text-[#173b67]" />
      <select id="jurisdiction-selector" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm font-medium text-slate-800 outline-none transition focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/20">
        {options.map((option) => <option key={option.id} value={option.id} disabled={option.disabled}>{option.name}{option.disabled ? " · Próximamente" : " · Disponible"}</option>)}
      </select>
      <LockKeyhole className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
    </div>
    {!compact && <p className="text-xs leading-5 text-slate-500">Perú está activo. Los demás países se habilitarán después de contar con plantillas y revisión legal local.</p>}
  </div>;
}
