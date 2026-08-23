import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Download, Edit3, FileText, Loader2, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function decodeBase64(value: string) {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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
      setGeneratedContent(content);
      setEditedContent(content);
      setShowPreview(true);
      setIsEditing(false);
      toast.success("Documento generado. Revisa el contenido antes de descargarlo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error generando documento");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    try {
      if (documentId) {
        await updateContent.mutateAsync({ documentId, generatedContent: editedContent });
      }
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
    return <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#173b67]" /></div>;
  }
  if (!templateQuery.data) {
    return <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center"><Card><CardContent className="p-8 text-center"><p className="mb-4 text-slate-600">Plantilla no encontrada.</p><Button onClick={() => navigate("/catalogo")}>Volver al catálogo</Button></CardContent></Card></div>;
  }

  const template = templateQuery.data;
  const jurisdiction = jurisdictionQuery.data;
  const currentJurisdiction = jurisdiction?.options.find((option) => option.id === jurisdictionId);
  const currentContent = editedContent || generatedContent || "";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/catalogo")} className="mb-5 -ml-3 text-slate-600"><ArrowLeft className="mr-2 h-4 w-4" />Volver al catálogo</Button>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-[#e8f0f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#173b67]">Perú · Jurisdicción activa</span><ShieldCheck className="h-4 w-4 text-emerald-600" /></div><h1 className="text-3xl font-semibold tracking-tight text-[#102a43] md:text-4xl">{template.title}</h1><p className="mt-2 max-w-2xl text-slate-600">{template.description}</p></div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"><span className="font-medium text-slate-900">Contexto:</span> {jurisdiction?.selectedId === "pe" ? `Marco legal peruano · ${currentJurisdiction?.locale ?? "es-PE"} · ${currentJurisdiction?.legalTerminology ?? "terminología jurídica peruana"} · ${currentJurisdiction?.documentFormat ?? "DOCX"}` : "Jurisdicción no disponible"}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-[#c9d8e8] bg-[#eef5fb] p-4 text-sm text-[#244b73]"><p className="font-semibold">Generación especializada en Perú</p><p className="mt-1">{jurisdiction?.notice || "Este contenido requiere revisión profesional antes de ser utilizado."}</p></div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
          <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-5 w-5 text-[#173b67]" />Datos del documento</CardTitle><CardDescription>Completa los campos para que LegalDoc prepare un primer borrador contextualizado.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {template.formFields.map((field) => <div key={field.name} className="space-y-2"><Label htmlFor={field.name} className="text-sm font-semibold text-slate-800">{field.label}{field.required && <span className="ml-1 text-red-600">*</span>}</Label>{field.type === "textarea" ? <Textarea id={field.name} placeholder={field.placeholder} {...register(field.name, { required: field.required })} className="min-h-24 resize-y border-slate-300 bg-white" /> : field.type === "select" ? <select id={field.name} {...register(field.name, { required: field.required })} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#173b67] focus:ring-2 focus:ring-[#173b67]/20"><option value="">Selecciona una opción</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <Input id={field.name} type={field.type} placeholder={field.placeholder} {...register(field.name, { required: field.required })} className="border-slate-300 bg-white" />}{errors[field.name] && <p className="text-xs text-red-600">Este campo es requerido.</p>}</div>)}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row"><Button type="submit" disabled={isGenerating} className="flex-1 bg-[#173b67] text-white hover:bg-[#102a43]">{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando borrador...</> : <><FileText className="mr-2 h-4 w-4" />Generar borrador</>}</Button>{generatedContent && <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="border-slate-300">{showPreview ? "Ocultar vista previa" : "Ver vista previa"}</Button>}</div>
          </form></CardContent></Card>

          <section className="lg:sticky lg:top-6 lg:self-start">{showPreview && generatedContent ? <Card className="overflow-hidden border-slate-200 shadow-sm"><CardHeader className="border-b border-slate-200 bg-white"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-xl">Vista previa</CardTitle><CardDescription className="mt-1">Edita el texto y guarda la versión que descargarás.</CardDescription></div><Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="border-slate-300">{isEditing ? <><Check className="mr-2 h-4 w-4" />Ver texto</> : <><Edit3 className="mr-2 h-4 w-4" />Editar</>}</Button></div></CardHeader><CardContent className="space-y-4 p-4">{isEditing ? <Textarea value={currentContent} onChange={(event) => setEditedContent(event.target.value)} className="min-h-[28rem] resize-y border-slate-300 font-serif text-sm leading-7" aria-label="Contenido editable del documento" /> : <article className="max-h-[30rem] overflow-y-auto rounded-xl border border-slate-200 bg-[#fffefb] p-5 font-serif text-sm leading-7 text-slate-700 shadow-inner whitespace-pre-wrap">{currentContent}</article>}<div className="flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={handleSave} disabled={!isEditing || updateContent.isPending} variant="outline" className="flex-1 border-slate-300"><Save className="mr-2 h-4 w-4" />{updateContent.isPending ? "Guardando..." : "Guardar cambios"}</Button><Button type="button" onClick={handleDownload} disabled={isDownloading} className="flex-1 bg-[#173b67] text-white hover:bg-[#102a43]"><Download className="mr-2 h-4 w-4" />{isDownloading ? "Preparando Word..." : "Descargar Word"}</Button></div><p className="text-xs leading-5 text-slate-500">La vista previa es editable. Verifica nombres, fechas, facultades, montos y referencias antes de utilizar el documento.</p></CardContent></Card> : <Card className="border-dashed border-slate-300 bg-white/70"><CardContent className="flex min-h-[24rem] flex-col items-center justify-center p-8 text-center"><div className="mb-4 rounded-full bg-[#e8f0f8] p-4"><FileText className="h-7 w-7 text-[#173b67]" /></div><h2 className="text-lg font-semibold text-slate-800">Tu borrador aparecerá aquí</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Genera el documento para revisarlo, editarlo y descargarlo en formato Word.</p></CardContent></Card>}</section>
        </div>
      </main>
    </div>
  );
}
