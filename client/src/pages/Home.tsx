import { useAuth } from "@/_core/hooks/useAuth";
import { BrandMark } from "@/components/BrandMark";
import { JurisdictionSelector } from "@/components/JurisdictionSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FilePenLine,
  FolderClock,
  Landmark,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const HERO_IMAGE = "/manus-storage/legal-doc-hero-editorial_c740f48c.png";

const workflow = [
  { number: "01", icon: BookOpen, title: "Elige el acto", description: "Explora un catálogo organizado por materia y selecciona la plantilla que necesitas." },
  { number: "02", icon: FilePenLine, title: "Aporta el contexto", description: "Completa un formulario diseñado para reunir los hechos, partes y condiciones del caso." },
  { number: "03", icon: ShieldCheck, title: "Revisa tu borrador", description: "Edita el texto, valida los datos relevantes y descarga una versión Word profesional." },
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [jurisdictionId, setJurisdictionId] = useState("pe");
  const templatesQuery = trpc.documents.getTemplates.useQuery({ jurisdictionId });

  const goToGenerator = (templateId: string) => navigate(`/generator/${templateId}?jurisdiction=${jurisdictionId}`);
  const scrollToWorkflow = () => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#102a43]">
      <header className="sticky top-0 z-50 border-b border-[#e8dec9]/80 bg-[#fbf8f1]/88 backdrop-blur-xl">
        <div className="container flex h-[4.8rem] items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/")} className="shrink-0 text-left" aria-label="Ir al inicio de LegalDoc"><BrandMark /></button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
            <button type="button" onClick={() => navigate("/catalogo")} className="legal-nav-link">Catálogo</button>
            <button type="button" onClick={scrollToWorkflow} className="legal-nav-link">Cómo funciona</button>
            <button type="button" onClick={() => navigate("/biblioteca")} className="legal-nav-link">Biblioteca</button>
            {isAuthenticated && <button type="button" onClick={() => navigate("/asuntos")} className="legal-nav-link">Asuntos</button>}
            {isAuthenticated && <button type="button" onClick={() => navigate("/mesa-procesal")} className="legal-nav-link">Mesa</button>}
            {isAuthenticated && <button type="button" onClick={() => navigate("/history")} className="legal-nav-link">Mi espacio</button>}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:block"><JurisdictionSelector value={jurisdictionId} onChange={setJurisdictionId} compact /></div>
            {isAuthenticated && user ? (
              <>
                <button type="button" onClick={() => navigate("/history")} className="hidden text-right sm:block"><span className="block text-xs font-bold text-[#1f415a]">{user.name || "Mi cuenta"}</span><span className="block text-[.65rem] text-slate-500">Espacio privado</span></button>
                <Button size="icon" variant="ghost" onClick={() => logout()} className="text-slate-500 hover:bg-[#f1eadc] hover:text-[#102a43]" aria-label="Cerrar sesión"><LogOut className="h-4 w-4" /></Button>
                <Button onClick={() => navigate("/catalogo")} className="legal-button-primary hidden rounded-xl px-4 text-white sm:flex">Nuevo documento <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => startLogin()} className="hidden rounded-xl text-[#284458] hover:bg-[#f1eadc] sm:flex">Ingresar</Button>
                <Button onClick={() => startLogin()} className="legal-button-primary rounded-xl px-4 text-white">Comenzar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-[#eadfc9] bg-[linear-gradient(115deg,#f9f4e8_0%,#fbf8f1_55%,#edf2f1_100%)]">
          <div className="container grid min-h-[660px] items-center gap-12 py-12 lg:grid-cols-[1.02fr_.98fr] lg:py-18">
            <div className="relative z-10 max-w-2xl py-8 lg:py-12">
              <div className="mb-7 flex flex-wrap items-center gap-3"><Badge className="border border-[#d9bf89] bg-[#f5ead0] px-3 py-1 text-[.67rem] font-extrabold uppercase tracking-[.16em] text-[#735529] hover:bg-[#f5ead0]">Perú · Jurisdicción activa</Badge><span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Entorno de trabajo privado</span></div>
              <p className="legal-kicker mb-5">El oficio jurídico, con más tiempo para pensar</p>
              <h1 className="font-display text-[3.2rem] font-semibold leading-[.91] tracking-[-.055em] text-[#102a43] sm:text-[4.25rem] lg:text-[5.25rem]">Redacta con <span className="text-[#8c6b35]">claridad.</span><br />Decide con criterio.</h1>
              <p className="mt-7 max-w-xl text-[1.04rem] leading-8 text-[#4e6374] sm:text-lg">LegalDoc organiza el primer borrador de tus documentos y te devuelve una base editable para trabajar dentro del contexto jurídico peruano.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button onClick={() => navigate("/catalogo")} size="lg" className="legal-button-primary h-13 rounded-xl px-6 text-white">Explorar documentos <ArrowRight className="ml-2 h-4 w-4" /></Button><Button onClick={scrollToWorkflow} size="lg" variant="outline" className="h-13 rounded-xl border-[#cdbb96] bg-[#fffdf8]/70 px-6 text-[#284458] hover:bg-[#f4ecdd]">Conocer el flujo <ArrowUpRight className="ml-2 h-4 w-4" /></Button></div>
              <div className="mt-10 grid max-w-xl grid-cols-1 gap-x-7 gap-y-4 border-t border-[#daccb3] pt-6 sm:grid-cols-3"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#8c6b35]">Documento</p><p className="mt-1 text-sm font-semibold text-[#284458]">Editable antes de descargar</p></div><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#8c6b35]">Historial</p><p className="mt-1 text-sm font-semibold text-[#284458]">Tus versiones en un lugar</p></div><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#8c6b35]">Criterio</p><p className="mt-1 text-sm font-semibold text-[#284458]">Revisión profesional siempre</p></div></div>
            </div>

            <div className="relative mx-auto w-full max-w-[650px] lg:mr-0">
              <div className="absolute -inset-5 rounded-[2.1rem] bg-[#c59a57]/14 blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-[#102a43] p-2 shadow-[0_28px_80px_rgba(16,42,67,.28)]">
                <img src={HERO_IMAGE} alt="Escritorio de trabajo jurídico con documentos y pluma" className="h-[420px] w-full rounded-[1.35rem] object-cover sm:h-[510px]" />
                <div className="absolute inset-x-2 bottom-2 rounded-b-[1.35rem] bg-gradient-to-t from-[#0b2138] via-[#0b2138]/70 to-transparent px-6 pb-6 pt-24 sm:px-8">
                  <div className="max-w-xs rounded-2xl border border-white/15 bg-[#0f2b45]/85 p-4 backdrop-blur-md"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5d98b] text-[#102a43]"><Landmark className="h-4 w-4" /></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#efcf85]">Marco activo</p><p className="mt-0.5 text-sm font-semibold text-white">Legislación peruana</p></div></div></div>
                </div>
              </div>
              <div className="legal-surface absolute -bottom-5 -left-4 hidden max-w-[230px] rounded-2xl p-4 md:block"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-[#e7f0ea] p-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" /></div><div><p className="text-xs font-extrabold uppercase tracking-[.13em] text-[#8c6b35]">Antes de firmar</p><p className="mt-1 text-sm font-bold leading-5 text-[#284458]">Revisa hechos, nombres, fechas y referencias.</p></div></div></div>
            </div>
          </div>
        </section>

        <section className="container py-9 lg:hidden"><div className="legal-surface rounded-2xl p-5"><JurisdictionSelector value={jurisdictionId} onChange={setJurisdictionId} /></div></section>

        <section id="como-funciona" className="container py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20"><div><p className="legal-kicker">Un flujo que respeta tu práctica</p><h2 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[.95] tracking-[-.045em] text-[#102a43]">Menos fricción.<br /><span className="text-[#8c6b35]">Más atención</span> al caso.</h2><p className="mt-6 max-w-sm leading-7 text-slate-600">La interfaz separa el contexto del caso, el borrador y la revisión para ayudarte a conservar el control de cada decisión.</p></div><div className="grid gap-4 md:grid-cols-3">{workflow.map((step) => { const Icon = step.icon; return <article key={step.number} className="legal-surface legal-hover-lift rounded-2xl p-6"><div className="flex items-start justify-between"><span className="font-display text-3xl font-semibold text-[#d0b176]">{step.number}</span><div className="rounded-xl bg-[#e9f0eb] p-2.5 text-[#1d5b4d]"><Icon className="h-5 w-5" /></div></div><h3 className="mt-12 text-lg font-extrabold text-[#284458]">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p></article>; })}</div></div>
        </section>

        <section className="border-y border-[#e8dec9] bg-[#f1eadc]/52 py-20 lg:py-24"><div className="container"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="legal-kicker">Catálogo jurídico</p><h2 className="mt-3 font-display text-5xl font-semibold leading-none tracking-[-.045em] text-[#102a43]">Elige tu punto de partida.</h2></div><Button variant="outline" onClick={() => navigate("/catalogo")} className="w-fit rounded-xl border-[#cdbb96] bg-[#fffdf8] text-[#284458] hover:bg-[#f4ecdd]">Ver catálogo completo <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          {templatesQuery.isLoading ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-[#e3d8c4]" />)}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templatesQuery.data?.slice(0, 6).map((template, index) => <button type="button" key={template.id} onClick={() => goToGenerator(template.id)} className="legal-surface legal-hover-lift group relative min-h-[220px] overflow-hidden rounded-2xl p-6 text-left"><span className="absolute right-5 top-3 font-display text-6xl text-[#d8c8aa]/30">0{index + 1}</span><Badge variant="outline" className="relative border-[#d8c49e] bg-[#fffaf0] text-[.65rem] font-extrabold uppercase tracking-[.12em] text-[#755725]">{template.category}</Badge><h3 className="relative mt-8 max-w-[15rem] text-lg font-extrabold text-[#284458] group-hover:text-[#8c6b35]">{template.title}</h3><p className="relative mt-3 max-w-[17rem] text-sm leading-6 text-slate-600">{template.description}</p><span className="relative mt-6 inline-flex items-center text-sm font-extrabold text-[#1d4b6e]">Abrir formulario <ArrowRight className="ml-2 h-4 w-4" /></span></button>)}</div>}
        </div></section>

        <section className="container py-20 lg:py-24"><div className="grid overflow-hidden rounded-[1.8rem] border border-[#d9c7a5] bg-[#fffaf0] lg:grid-cols-[.9fr_1.1fr]"><div className="p-8 sm:p-12"><p className="legal-kicker">Biblioteca de la Abogacía</p><h2 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[.94] tracking-[-.045em] text-[#102a43]">Un lugar para volver a <span className="text-[#8c6b35]">pensar el oficio.</span></h2><p className="mt-6 max-w-md leading-7 text-slate-600">Historia, dilemas y rutas de aprendizaje para estudiar la práctica jurídica con más profundidad, fuentes visibles y respeto por el contexto.</p><Button onClick={() => navigate("/biblioteca")} className="legal-button-primary mt-8 rounded-xl px-5 text-white">Entrar a la biblioteca <BookOpen className="ml-2 h-4 w-4" /></Button></div><div className="relative min-h-[300px] overflow-hidden"><img src="/manus-storage/legal-history-library-hero_573d9289.png" alt="Biblioteca editorial sobre historia y aprendizaje jurídico" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#fffaf0] via-[#fffaf0]/20 to-transparent" /></div></div></section>

        <section className="container py-20 lg:py-28"><div className="overflow-hidden rounded-[1.8rem] bg-[#102a43] px-6 py-12 text-white shadow-[0_30px_80px_rgba(16,42,67,.23)] sm:px-10 lg:px-14"><div className="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f3d58c]/30 bg-[#f3d58c]/10 text-[#f3d58c]"><Sparkles className="h-5 w-5" /></div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f3d58c]">Tu próximo borrador empieza aquí</p><h2 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[.95] tracking-[-.045em]">Una mesa de trabajo pensada para el abogado que decide.</h2></div><div className="lg:justify-self-end"><p className="mb-6 max-w-sm text-sm leading-7 text-[#c8d4df]">Explora el catálogo, completa los datos de tu caso y trabaja sobre un texto editable antes de descargarlo.</p><Button onClick={() => navigate("/catalogo")} size="lg" className="rounded-xl bg-[#f5d98b] px-6 font-extrabold text-[#102a43] hover:bg-[#ffe6a0]">Ir al catálogo <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></div></section>
      </main>

      <footer className="border-t border-[#e8dec9] bg-[#f7f1e5] py-10"><div className="container flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"><BrandMark /><div className="max-w-md text-sm leading-6 text-slate-500 sm:text-right"><p>LegalDoc es un asistente de redacción para el contexto peruano.</p><p className="mt-1">Todo documento requiere revisión profesional antes de su uso, firma o presentación.</p></div></div></footer>
    </div>
  );
}
