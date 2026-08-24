import { BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
  light?: boolean;
}

export function BrandMark({ className, compact = false, light = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "grid h-10 w-10 place-items-center rounded-[14px] border shadow-sm",
        light ? "border-white/20 bg-white/10 text-[#f8e6bd]" : "border-[#d8bd85]/60 bg-[#102a43] text-[#f8d98a]"
      )}>
        <BookOpenCheck className="h-5 w-5" strokeWidth={1.8} />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className={cn("font-display text-[1.6rem] font-semibold tracking-[-0.04em]", light ? "text-white" : "text-[#102a43]")}>LegalDoc</p>
          <p className={cn("mt-1 text-[0.61rem] font-bold uppercase tracking-[0.19em]", light ? "text-[#f2ddae]/80" : "text-[#8c6b35]")}>Perú · práctica legal</p>
        </div>
      )}
    </div>
  );
}
