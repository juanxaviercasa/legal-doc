import { BrandMark } from "@/components/BrandMark";
import { JurisdictionSelector } from "@/components/JurisdictionSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, FileText, LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Catalogo() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [jurisdictionId, setJurisdictionId] = useState("pe");
  const templatesQuery = trpc.documents.getTemplates.useQuery({ jurisdictionId });

  const categories = useMemo(() => templatesQuery.data ? Array.from(new Set(templatesQuery.data.map((template) => template.category))) : [], [templatesQuery.data]);
  const filteredTemplates = useMemo(() => (templatesQuery.data ?? []).filter((template) => {
    const query = searchTerm.toLowerCase();
    return (!query || template.title.toLowerCase().includes(query) || template.description.toLowerCase().includes(query)) && (!selectedCategory || template.category === selectedCategory);
  }), [templatesQuery.data, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#102a43]">
      <header className="border-b border-[#e8dec9] bg-[#fbf8f1]/92 backdrop-blur-xl">
        <div className="container flex min-h-[5.35rem] items-center justify-between gap-4 py-4"><button type="button" onClick={() => navigate("/")} aria-label="Volver a LegalDoc"><BrandMark /></button><Button variant="outline" onClick={() => navigate("/")} className="rounded-xl border-[#cdbb96] bg-[#fffdf8] text-[#284458] hover:bg-[#f4ecdd]"><ArrowLeft className="mr-2 h-4 w-4" />Inicio</Button></div>
      </header>

      <main className="container py-9 sm:py-12 lg:py-16">
        <div className="border-b border-[#dfcfb4] pb-9"><p className="legal-kicker">Biblioteca de documentos</p><div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="font-display text-5xl font-semibold tracking-[-.05em] text-[#102a43] sm:text-6xl">Encuentra el punto de partida.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Selecciona una plantilla peruana, completa el contexto del caso y trabaja sobre un borrador editable antes de descargarlo.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#d9c9aa] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#5e724f]"><span className="h-2 w-2 rounded-full bg-emerald-600" />Perú activo</div></div></div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start"><div className="legal-surface rounded-2xl p-5"><JurisdictionSelector value={jurisdictionId} onChange={setJurisdictionId} /></div><div className="legal-surface rounded-2xl p-3"><div className="flex items-center gap-2 px-3 pb-3 pt-2"><SlidersHorizontal className="h-4 w-4 text-[#8c6b35]" /><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#6d7c86]">Materia</p></div><div className="space-y-1"><button type="button" onClick={() => setSelectedCategory(null)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${!selectedCategory ? "bg-[#102a43] text-white shadow-sm" : "text-[#496173] hover:bg-[#f1eadc]"}`}><span>Todos los documentos</span><span className="text-xs opacity-70">{templatesQuery.data?.length ?? 0}</span></button>{categories.map((category) => <button type="button" key={category} onClick={() => setSelectedCategory(category)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selectedCategory === category ? "bg-[#ead8b5] text-[#5d451f]" : "text-[#496173] hover:bg-[#f1eadc]"}`}><span>{category}</span><span className="text-xs opacity-70">{templatesQuery.data?.filter((template) => template.category === category).length}</span></button>)}</div></div><p className="hidden px-2 text-xs leading-5 text-slate-500 lg:block">Las plantillas están organizadas para la jurisdicción activa. Verifica el documento antes de firmarlo o presentarlo.</p></aside>

          <section><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative max-w-xl flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c6b35]" /><Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Busca por acto, materia o necesidad" className="h-12 rounded-xl border-[#d9c9aa] bg-[#fffdf8] pl-11 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-[#c59a57]/30" /></div><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><LayoutGrid className="h-4 w-4 text-[#8c6b35]" />{filteredTemplates.length} resultado{filteredTemplates.length === 1 ? "" : "s"}</div></div>
            {templatesQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-[#e5dccb]" />)}</div> : filteredTemplates.length === 0 ? <div className="legal-surface rounded-2xl px-6 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1eadc] text-[#8c6b35]"><Search className="h-5 w-5" /></div><h2 className="mt-5 text-lg font-extrabold text-[#284458]">No encontramos esa plantilla</h2><p className="mt-2 text-sm text-slate-500">Prueba con otra palabra o vuelve a mostrar todas las materias.</p><Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory(null); }} className="mt-6 rounded-xl border-[#cdbb96]">Limpiar filtros</Button></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredTemplates.map((template, index) => <article key={template.id} className="legal-surface legal-hover-lift flex min-h-[290px] flex-col rounded-2xl p-6"><div className="flex items-start justify-between gap-3"><Badge variant="outline" className="border-[#d8c49e] bg-[#fffaf0] text-[.64rem] font-extrabold uppercase tracking-[.12em] text-[#755725]">{template.category}</Badge><span className="font-display text-4xl text-[#d6c4a5]/70">{String(index + 1).padStart(2, "0")}</span></div><h2 className="mt-6 text-xl font-extrabold leading-6 text-[#284458]">{template.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p><div className="mt-auto border-t border-[#e7ddca] pt-4"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><FileText className="h-3.5 w-3.5 text-[#8c6b35]" />{template.formFields.length} campos para contextualizar</div><Button onClick={() => navigate(`/generator/${template.id}?jurisdiction=${jurisdictionId}`)} className="legal-button-primary w-full rounded-xl text-white">Abrir formulario <ArrowRight className="ml-2 h-4 w-4" /></Button></div></article>)}</div>}
          </section>
        </div>
      </main>
    </div>
  );
}
