import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Download, Edit3, FilePenLine, FileText, Loader2, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

function decodeBase64(value: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(value), (character) => character.charCodeAt(0)));
}

type LegalCitationPreview = {
  instrumentVersionId: number;
  label: string;
  sourceUrl: string;
  versionAsOf: string;
};

function decodeCitations(value: string | null): LegalCitationPreview[] {
  if (!value) return [];
  try {
    return JSON.parse(decodeBase64(value)) as LegalCitationPreview[];
  } catch {
    return [];
  }
}

async function downloadResponse(response: Response, filename: string) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "No se pudo descargar el documento");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Generator() {
  const [match, params] = useRoute("/generator/:id");
  const [, navigate] = useLocation();
  const templateId = params?.id ?? "";
  const jurisdictionId = "pe";
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [legalCitations, setLegalCitations] = useState<LegalCitationPreview[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const templateQuery = trpc.documents.getTemplateById.useQuery({ id: templateId, jurisdictionId }, { enabled: !!templateId });
  const jurisdictionQuery = trpc.jurisdictions.list.useQuery();
  const updateContent = trpc.documents.updateContent.useMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, string>>();

  const onSubmit = async (data: Record<string, string>) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, jurisdictionId, formData: data }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Error generando documento");
      }
      const contentHeader = response.headers.get("X-Generated-Content");
      if (!contentHeader) throw new Error("La generación no devolvió contenido para previsualizar");
      const content = decodeBase64(contentHeader);
      const idHeader = response.headers.get("X-Document-Id");
      setDocumentId(idHeader ? Number(idHeader) : null);
      setLegalCitations(decodeCitations(response.headers.get("X-Legal-Citations")));
      setGeneratedContent(content);
      setEditedContent(content);
      setShowPreview(true);
      setIsEditing(false);
      toast.success("Borrador listo. Revísalo antes de descargarlo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error generando documento");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    try {
      if (documentId) await updateContent.mutateAsync({ documentId, generatedContent: editedContent });
      setGeneratedContent(editedContent);
      setIsEditing(false);
      toast.success(documentId ? "Cambios guardados en tu historial." : "Vista previa actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron guardar los cambios");
    }
  };

  const handleDownload = async () => {
    const content = editedContent.trim() || generatedContent?.trim();
    if (!content || !templateQuery.data) return;
    setIsDownloading(true);
    try {
      if (documentId && content !== generatedContent) {
        await updateContent.mutateAsync({ documentId, generatedContent: content });
        setGeneratedContent(content);
      }
      const response = documentId
        ? await fetch(`/api/download-doc/${documentId}`)
        : await fetch("/api/download-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: templateQuery.data.title, content }),
        });
      await downloadResponse(response, `${templateQuery.data.title}.docx`);
      toast.success("Documento Word descargado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error descargando documento");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!match) return null;
  if (templateQuery.isLoading || jurisdictionQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#fbf8f1]"><Loader2 className="h-8 w-8 animate-spin text-[#8c6b35]" /></div>;
  }
  if (!templateQuery.data) {
    return <div className="grid min-h-screen place-items-center bg-[#fbf8f1] p-5"><Card className="legal-surface max-w-md"><CardContent className="p-8 text-center"><p className="font-semibold text-[#284458]">Plantilla no encontrada.</p><Button onClick={() => navigate("/catalogo")} className="legal-button-primary mt-5 rounded-xl text-white">Volver al catálogo</Button></CardContent></Card></div>;
  }

  const template = templateQuery.data;
  const jurisdiction = jurisdictionQuery.data;
  const currentJurisdiction = jurisdiction?.options.find((option) => option.id === jurisdictionId);
  const currentContent = editedContent || generatedContent || "";

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#102a43]">
      <header className="border-b border-[#e8dec9] bg-[#fbf8f1]/92 backdrop-blur-xl">
        <div className="container flex min-h-[5.35rem] items-center justify-between gap-4 py-4">
          <button type="button" onClick={() => navigate("/")} aria-label="Volver a LegalDoc"><BrandMark /></button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/catalogo")} className="hidden rounded-xl text-[#496173] hover:bg-[#f1eadc] sm:flex"><ArrowLeft className="mr-2 h-4 w-4" />Catálogo</Button>
            <Button variant="outline" onClick={() => navigate("/history")} className="rounded-xl border-[#cdbb96] bg-[#fffdf8] text-[#284458] hover:bg-[#f4ecdd]">Mi historial</Button>
          </div>
        </div>
      </header>
      <main className="container py-8 sm:py-10 lg:py-12">
        <button type="button" onClick={() => navigate("/catalogo")} className="mb-6 inline-flex items-center text-sm font-bold text-[#607483] transition hover:text-[#8c6b35]"><ArrowLeft className="mr-2 h-4 w-4" />Volver a las plantillas</button>
        <section className="mb-8 border-b border-[#dfcfb4] pb-8">
          <p className="legal-kicker">Mesa de trabajo · {template.category}</p>
          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><h1 className="font-display text-5xl font-semibold leading-[.95] tracking-[-.05em] text-[#102a43] sm:text-6xl">{template.title}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">{template.description}</p></div>
            <div className="rounded-2xl border border-[#d8c49e] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#556779]"><p className="font-extrabold uppercase tracking-[.14em] text-[#8c6b35]">Contexto de generación</p><p className="mt-1 font-semibold text-[#284458]">Perú · {currentJurisdiction?.locale ?? "es-PE"} · {currentJurisdiction?.documentFormat ?? "DOCX"}</p></div>
          </div>
        </section>
        <div className="mb-7 flex items-start gap-3 rounded-2xl border border-[#d8c49e] bg-[#f8efd9] p-4 text-sm text-[#4d6170]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#8c6b35]" /><div><p className="font-extrabold text-[#284458]">Borrador especializado para Perú</p><p className="mt-1 leading-6">{jurisdiction?.notice || "Este contenido requiere revisión profesional antes de ser utilizado."}</p></div></div>
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(400px,.9fr)] xl:gap-9">
          <section className="legal-surface rounded-2xl p-5 sm:p-7">
            <div className="mb-7 flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e7f0ea] text-[#1d5b4d]"><FilePenLine className="h-5 w-5" /></div><div><p className="legal-kicker">Paso 1</p><h2 className="mt-1 text-xl font-extrabold text-[#284458]">Contextualiza el documento</h2><p className="mt-1 text-sm leading-6 text-slate-500">Completa los datos relevantes. Los campos marcados con asterisco son obligatorios.</p></div></div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {template.formFields.map((field, index) => <div key={field.name} className="rounded-xl border border-[#e9dfce] bg-[#fffdf8]/80 p-4"><div className="mb-2 flex items-center justify-between gap-3"><Label htmlFor={field.name} className="text-sm font-extrabold text-[#284458]"><span className="mr-2 text-xs text-[#b58b49]">{String(index + 1).padStart(2, "0")}</span>{field.label}{field.required && <span className="ml-1 text-[#b4533a]">*</span>}</Label></div>{field.type === "textarea" ? <Textarea id={field.name} placeholder={field.placeholder} {...register(field.name, { required: field.required })} className="min-h-28 resize-y border-[#d9c9aa] bg-white focus-visible:ring-[#c59a57]/30" /> : field.type === "select" ? <select id={field.name} {...register(field.name, { required: field.required })} className="flex h-11 w-full rounded-lg border border-[#d9c9aa] bg-white px-3 text-sm font-medium text-[#284458] outline-none transition focus:border-[#8c6b35] focus:ring-2 focus:ring-[#c59a57]/20"><option value="">Selecciona una opción</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <Input id={field.name} type={field.type} placeholder={field.placeholder} {...register(field.name, { required: field.required })} className="h-11 border-[#d9c9aa] bg-white focus-visible:ring-[#c59a57]/30" />}{errors[field.name] && <p className="mt-2 text-xs font-semibold text-[#b4533a]">Este campo es requerido.</p>}</div>)}
              <div className="border-t border-[#e2d5bd] pt-5"><Button type="submit" disabled={isGenerating} className="legal-button-primary h-12 w-full rounded-xl text-white">{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparando borrador...</> : <><Sparkles className="mr-2 h-4 w-4" />Generar borrador editable</>}</Button><p className="mt-3 text-center text-xs leading-5 text-slate-500">Antes de descargar, revisa identidades, fechas, facultades, montos y citas aplicables.</p></div>
            </form>
          </section>
          <section className="xl:sticky xl:top-6 xl:self-start">
            {showPreview && generatedContent ? <div className="overflow-hidden rounded-2xl border border-[#d8c49e] bg-[#fffdf8] shadow-[0_20px_55px_rgba(16,42,67,.12)]">
              <div className="border-b border-[#e6dbc7] bg-[#f8efd9]/65 px-5 py-5 sm:px-6"><div className="flex items-start justify-between gap-3"><div><p className="legal-kicker">Paso 2 · Revisión</p><h2 className="mt-1 text-xl font-extrabold text-[#284458]">Vista previa del borrador</h2><p className="mt-1 text-sm text-slate-500">Edita el texto antes de guardar o descargar.</p></div><Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="rounded-xl border-[#cdbb96] bg-[#fffdf8] text-[#284458]">{isEditing ? <><Check className="mr-2 h-4 w-4" />Vista</> : <><Edit3 className="mr-2 h-4 w-4" />Editar</>}</Button></div></div>
              <div className="p-4 sm:p-5">
                {isEditing ? <Textarea value={currentContent} onChange={(event) => setEditedContent(event.target.value)} className="min-h-[30rem] resize-y border-[#d9c9aa] bg-white font-serif text-base leading-7 focus-visible:ring-[#c59a57]/30" aria-label="Contenido editable del documento" /> : <article className="legal-paper max-h-[33rem] overflow-y-auto rounded-xl border border-[#e6dbc7] p-5 font-serif text-base leading-8 text-[#354b5b] shadow-inner whitespace-pre-wrap">{currentContent}</article>}
                <aside className={`mt-4 rounded-xl border p-4 text-sm ${legalCitations.length ? "border-[#bfd8cd] bg-[#edf7f1]" : "border-[#e2c89e] bg-[#fff5df]"}`} aria-live="polite">
                  {legalCitations.length ? <><p className="font-extrabold text-[#1d5b4d]">Fuentes verificables consultadas</p><p className="mt-1 text-xs leading-5 text-[#48665b]">Estas versiones aprobadas se agregan al anexo del Word. Verifica su aplicación al caso concreto.</p><ul className="mt-3 space-y-2">{legalCitations.map((citation) => <li key={citation.instrumentVersionId} className="border-t border-[#cce3d8] pt-2 first:border-t-0 first:pt-0"><a href={citation.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-[#1d5b4d] underline decoration-[#7ca995]/60 underline-offset-2 hover:text-[#0f4d3e]">{citation.label}</a><span className="block text-xs text-[#5d776d]">Corte: {citation.versionAsOf}</span></li>)}</ul></> : <><p className="font-extrabold text-[#805524]">Sin fuente aprobada aplicable</p><p className="mt-1 leading-5 text-[#6b5d4a]">El corpus aún no contiene una versión oficial aprobada para esta plantilla. El borrador no debe tratarse como una cita normativa verificada.</p></>}
                </aside>
                <div className="mt-4 grid gap-2 sm:grid-cols-2"><Button type="button" onClick={handleSave} disabled={!isEditing || updateContent.isPending} variant="outline" className="rounded-xl border-[#cdbb96] text-[#284458] hover:bg-[#f4ecdd]"><Save className="mr-2 h-4 w-4" />{updateContent.isPending ? "Guardando..." : "Guardar cambios"}</Button><Button type="button" onClick={handleDownload} disabled={isDownloading} className="legal-button-primary rounded-xl text-white"><Download className="mr-2 h-4 w-4" />{isDownloading ? "Preparando Word..." : "Descargar Word"}</Button></div>
              </div>
            </div> : <div className="legal-surface flex min-h-[390px] flex-col items-center justify-center rounded-2xl p-8 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f0ea] text-[#1d5b4d]"><FileText className="h-6 w-6" /></div><p className="legal-kicker mt-6">Paso 2 · Revisión</p><h2 className="mt-2 text-xl font-extrabold text-[#284458]">Tu borrador aparecerá aquí</h2><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Completa el formulario para generar una primera versión que podrás editar y descargar.</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
