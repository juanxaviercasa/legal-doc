import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Download, Eye, FileText, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function safeFormData(value: string) {
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

async function downloadBlob(response: Response, filename: string) {
  if (!response.ok) throw new Error("No se pudo descargar el documento");
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

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<number | null>(null);
  const historyQuery = trpc.documents.getHistory.useQuery(undefined, { enabled: isAuthenticated });
  const analyticsQuery = trpc.documents.analytics.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) return <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center"><Card><CardContent className="p-8 text-center"><p className="mb-4 text-slate-600">Debes iniciar sesión para ver tu historial.</p><Button onClick={() => navigate("/")} className="bg-[#173b67]">Volver al inicio</Button></CardContent></Card></div>;

  const handleDownload = async (doc: any) => {
    try { await downloadBlob(await fetch(`/api/download-doc/${doc.id}`), `${doc.documentTitle}.docx`); toast.success("Documento descargado."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Error descargando documento"); }
  };

  const handleRegenerate = async (doc: any) => {
    setRegenerating(doc.id);
    try {
      const response = await fetch("/api/generate-doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId: doc.templateId, jurisdictionId: doc.jurisdictionId || "pe", formData: safeFormData(doc.formData) }) });
      await downloadBlob(response, `${doc.templateName}.docx`);
      await historyQuery.refetch();
      await analyticsQuery.refetch();
      toast.success("Documento regenerado y guardado como una nueva versión.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Error regenerando documento"); }
    finally { setRegenerating(null); }
  };

  const analytics = analyticsQuery.data;
  return <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><Button variant="ghost" onClick={() => navigate("/")} className="mb-5 -ml-3 text-slate-600"><ArrowLeft className="mr-2 h-4 w-4" />Volver al inicio</Button><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2"><span className="rounded-full bg-[#e8f0f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#173b67]">Espacio privado</span><ShieldCheck className="h-4 w-4 text-emerald-600" /></div><h1 className="text-3xl font-semibold tracking-tight text-[#102a43] md:text-4xl">Mi historial legal</h1><p className="mt-2 text-slate-600">Tus documentos, versiones editadas y descargas en un solo lugar.</p></div><Button onClick={() => navigate("/catalogo")} className="bg-[#173b67] hover:bg-[#102a43]"><FileText className="mr-2 h-4 w-4" />Nuevo documento</Button></div></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card className="border-slate-200"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Generados</p><p className="mt-2 text-3xl font-semibold text-[#173b67]">{analytics?.documentsGenerated ?? "—"}</p></CardContent></Card><Card className="border-slate-200"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Descargas</p><p className="mt-2 text-3xl font-semibold text-[#173b67]">{analytics?.downloads ?? "—"}</p></CardContent></Card><Card className="border-slate-200"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Ediciones</p><p className="mt-2 text-3xl font-semibold text-[#173b67]">{analytics?.edits ?? "—"}</p></CardContent></Card><Card className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-full bg-[#e8f0f8] p-3"><BarChart3 className="h-5 w-5 text-[#173b67]" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Jurisdicción</p><p className="mt-1 font-semibold text-slate-800">Perú</p><p className="text-xs text-slate-500">Contexto activo</p></div></CardContent></Card></section>
      <div className="mb-6 rounded-2xl border border-[#c9d8e8] bg-[#eef5fb] p-4 text-sm text-[#244b73]"><p className="font-semibold">Historial contextualizado para Perú</p><p className="mt-1">Las futuras jurisdicciones tendrán catálogos y prompts independientes; por ahora solo Perú está habilitado.</p></div>
      {historyQuery.isLoading ? <div className="py-16 text-center"><Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#173b67]" /><p className="text-slate-600">Cargando historial...</p></div> : !historyQuery.data?.length ? <Card className="border-dashed border-slate-300"><CardContent className="p-12 text-center"><FileText className="mx-auto mb-4 h-9 w-9 text-slate-400" /><p className="mb-4 text-lg text-slate-600">Aún no has generado ningún documento.</p><Button onClick={() => navigate("/catalogo")} className="bg-[#173b67]">Generar tu primer documento</Button></CardContent></Card> : <div className="space-y-4">{historyQuery.data.map((doc: any) => { const isPreview = previewing === doc.id; return <Card key={doc.id} className="border-slate-200 shadow-sm"><CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><CardTitle className="text-lg text-[#102a43]">{doc.documentTitle}</CardTitle><CardDescription className="mt-1">{doc.templateName} · Generado el {format(new Date(doc.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}</CardDescription></div><div className="flex items-center gap-2"><Badge className="bg-[#e8f0f8] text-[#173b67] hover:bg-[#e8f0f8]">Perú</Badge><Badge variant="outline">{doc.templateId}</Badge></div></div></CardHeader><CardContent><div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Datos utilizados</p><pre className="max-h-24 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-700">{JSON.stringify(safeFormData(doc.formData), null, 2)}</pre></div>{isPreview && <article className="mb-4 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-[#fffefb] p-5 font-serif text-sm leading-7 text-slate-700 whitespace-pre-wrap">{doc.generatedContent}</article>}<div className="flex flex-col gap-2 sm:flex-row"><Button onClick={() => setPreviewing(isPreview ? null : doc.id)} variant="outline" className="flex-1 border-slate-300"><Eye className="mr-2 h-4 w-4" />{isPreview ? "Ocultar vista previa" : "Ver vista previa"}</Button><Button onClick={() => handleDownload(doc)} variant="outline" className="flex-1 border-slate-300"><Download className="mr-2 h-4 w-4" />Descargar</Button><Button onClick={() => handleRegenerate(doc)} disabled={regenerating === doc.id} variant="outline" className="flex-1 border-slate-300">{regenerating === doc.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Regenerando...</> : <><RotateCcw className="mr-2 h-4 w-4" />Regenerar</>}</Button></div></CardContent></Card>; })}</div>}
    </main>
  </div>;
}
