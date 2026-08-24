import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ExternalLink, FileCheck2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type LegalStatus = "vigente" | "modificado" | "derogado_parcial" | "derogado" | "pendiente_verificacion";

export function LegalReviewQueue() {
  const utils = trpc.useUtils();
  const [versionStatuses, setVersionStatuses] = useState<Record<number, LegalStatus>>({});
  const pendingVersions = trpc.legalCorpus.adminPendingVersions.useQuery({ jurisdictionId: "pe" });
  const candidates = trpc.legalCorpus.adminCandidates.useQuery();
  const invalidateReviewData = async () => {
    await Promise.all([
      utils.legalCorpus.adminPendingVersions.invalidate(),
      utils.legalCorpus.adminCandidates.invalidate(),
      utils.legalCorpus.approvedVersions.invalidate(),
    ]);
  };
  const approveVersion = trpc.legalCorpus.approveVersion.useMutation({ onSuccess: invalidateReviewData });
  const rejectVersion = trpc.legalCorpus.rejectVersion.useMutation({ onSuccess: invalidateReviewData });
  const reviewCandidate = trpc.legalCorpus.reviewCandidate.useMutation({ onSuccess: invalidateReviewData });

  const pendingCandidateCount = candidates.data?.filter((candidate) => candidate.status === "pending_review").length ?? 0;

  const handleApproveVersion = async (versionId: number) => {
    const legalStatus = versionStatuses[versionId] ?? "vigente";
    if (!window.confirm("Confirmas que contrastaste esta versión con su fuente oficial y que debe quedar disponible para citas de LegalDoc? Las aprobaciones anteriores del mismo instrumento quedarán supersedidas.")) return;
    try {
      await approveVersion.mutateAsync({ versionId, legalStatus, changeSummary: "Aprobación humana registrada desde la cola de revisión." });
      toast.success("Versión aprobada. Solo esta versión actual podrá usarse como referencia del instrumento.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo aprobar la versión");
    }
  };

  const handleRejectVersion = async (versionId: number) => {
    const reason = window.prompt("Indica el motivo del rechazo para dejar una trazabilidad útil al equipo jurídico.");
    if (reason === null) return;
    try {
      await rejectVersion.mutateAsync({ versionId, reason: reason.trim() || undefined });
      toast.success("Versión rechazada. No será usada por el generador.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo rechazar la versión");
    }
  };

  const handleReviewCandidate = async (candidateId: number, status: "approved" | "rejected") => {
    const approved = status === "approved";
    const message = approved
      ? "Marcar este hallazgo como revisado habilita al equipo a preparar una versión con archivo original y Markdown. No activa ninguna norma ni cita automáticamente. ¿Continuar?"
      : "Rechazarás este hallazgo y quedará registro de la decisión. ¿Continuar?";
    if (!window.confirm(message)) return;
    try {
      await reviewCandidate.mutateAsync({ candidateId, status, notes: approved ? "Hallazgo revisado: preparar versión y contrastar texto antes de aprobar." : "Hallazgo rechazado por revisión humana." });
      toast.success(approved ? "Hallazgo aprobado para preparar una versión; sigue pendiente su carga y aprobación normativa." : "Hallazgo rechazado y mantenido en el registro de auditoría.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la revisión");
    }
  };

  return <section className="mt-8 grid gap-6 xl:grid-cols-2">
    <div className="legal-surface rounded-2xl p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="legal-kicker">Revisión de versiones</p><h2 className="mt-1 text-xl font-extrabold text-[#284458]">Ninguna versión entra sola al corpus</h2><p className="mt-2 text-sm leading-6 text-slate-500">Contrasta texto, URL oficial, fecha de corte y modificatorias antes de aprobar. La acción reemplaza la versión aprobada previa del mismo instrumento.</p></div><Badge className="w-fit bg-[#e8f0eb] text-[#32604e] hover:bg-[#e8f0eb]">{pendingVersions.data?.length ?? 0} pendientes</Badge></div>
      {pendingVersions.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Cargando versiones…</div> : pendingVersions.data?.length ? <div className="mt-6 space-y-3">{pendingVersions.data.map((version) => {
        const status = versionStatuses[version.id] ?? "vigente";
        return <article key={version.id} className="rounded-xl border border-[#e6dbc7] bg-[#fffdf8] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-extrabold text-[#284458]">{version.instrumentTitle}</p><p className="mt-1 text-xs text-slate-500">{version.versionLabel} · corte {new Date(version.versionAsOf).toLocaleDateString("es-PE")}</p><a href={version.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1d5b4d] underline underline-offset-2">Abrir fuente oficial <ExternalLink className="h-3 w-3" /></a></div><select value={status} onChange={(event) => setVersionStatuses({ ...versionStatuses, [version.id]: event.target.value as LegalStatus })} className="h-9 rounded-lg border border-[#d9c9aa] bg-white px-2 text-xs font-bold text-[#284458]"><option value="vigente">Aprobar como vigente</option><option value="modificado">Aprobar como modificado</option><option value="derogado_parcial">Derogado parcialmente</option><option value="derogado">Derogado</option><option value="pendiente_verificacion">Pendiente de verificación</option></select></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => handleApproveVersion(version.id)} disabled={approveVersion.isPending || rejectVersion.isPending} className="rounded-lg bg-[#1d5b4d] text-white hover:bg-[#16483e]"><FileCheck2 className="mr-2 h-3.5 w-3.5" />Aprobar versión</Button><Button size="sm" variant="outline" onClick={() => handleRejectVersion(version.id)} disabled={approveVersion.isPending || rejectVersion.isPending} className="rounded-lg border-[#d6aaa0] text-[#9d3f32] hover:bg-[#fff0ec]"><XCircle className="mr-2 h-3.5 w-3.5" />Rechazar</Button></div></article>;
      })}</div> : <div className="mt-6 rounded-xl border border-dashed border-[#d8c49e] bg-[#fffaf0] p-6 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-[#1d5b4d]" /><p className="mt-3 text-sm font-extrabold text-[#284458]">No hay versiones pendientes</p><p className="mt-1 text-xs leading-5 text-slate-500">Las versiones cargadas aparecerán aquí antes de que el generador pueda consultarlas.</p></div>}
    </div>
    <div className="legal-surface rounded-2xl p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="legal-kicker">Hallazgos externos</p><h2 className="mt-1 text-xl font-extrabold text-[#284458]">Cola de cambios detectados</h2><p className="mt-2 text-sm leading-6 text-slate-500">Aprobar un hallazgo solo confirma que merece preparación documental; nunca publica ni sustituye texto del corpus.</p></div><Badge className="w-fit bg-[#f1eadc] text-[#755725] hover:bg-[#f1eadc]">{pendingCandidateCount} pendientes</Badge></div>
      {candidates.data?.length ? <div className="mt-6 space-y-3">{candidates.data.slice(0, 12).map((candidate) => <article key={candidate.id} className="rounded-xl border border-[#e6dbc7] bg-[#fffdf8] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-extrabold text-[#284458]">{candidate.title}</p><p className="mt-1 text-xs text-slate-500">{candidate.changeType} · detectado {new Date(candidate.detectedAt).toLocaleDateString("es-PE")}</p><a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1d5b4d] underline underline-offset-2">Revisar publicación <ExternalLink className="h-3 w-3" /></a></div><Badge variant="outline" className="h-fit w-fit border-[#d8c49e] bg-[#fffaf0] text-[#755725]">{candidate.status}</Badge></div>{candidate.status === "pending_review" && <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => handleReviewCandidate(candidate.id, "approved")} disabled={reviewCandidate.isPending} className="rounded-lg border-[#98c6b4] text-[#1d5b4d] hover:bg-[#edf7f1]"><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Preparar versión</Button><Button size="sm" variant="outline" onClick={() => handleReviewCandidate(candidate.id, "rejected")} disabled={reviewCandidate.isPending} className="rounded-lg border-[#d6aaa0] text-[#9d3f32] hover:bg-[#fff0ec]"><XCircle className="mr-2 h-3.5 w-3.5" />Rechazar hallazgo</Button></div>}</article>)}</div> : <div className="mt-6 rounded-xl border border-dashed border-[#d8c49e] bg-[#fffaf0] p-6 text-center"><ShieldAlert className="mx-auto h-6 w-6 text-[#8c6b35]" /><p className="mt-3 text-sm font-extrabold text-[#284458]">Aún no hay cambios detectados</p><p className="mt-1 text-xs leading-5 text-slate-500">La detección supervisada registrará candidatos aquí; ningún contenido externo se activará por sí mismo.</p></div>}
    </div>
  </section>;
}

const blankCandidate = { sourceId: "", title: "", sourceUrl: "", externalIdentifier: "", changeType: "unknown", notes: "" };

export function ManualDetectionCapture() {
  const utils = trpc.useUtils();
  const [candidate, setCandidate] = useState(blankCandidate);
  const sources = trpc.legalCorpus.adminSources.useQuery({ jurisdictionId: "pe" });
  const createCandidate = trpc.legalCorpus.createCandidate.useMutation();
  const markSourceChecked = trpc.legalCorpus.markSourceChecked.useMutation();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!candidate.sourceId || !candidate.title || !candidate.sourceUrl) {
      toast.error("Selecciona la fuente e indica título y URL oficial del hallazgo.");
      return;
    }
    try {
      await createCandidate.mutateAsync({
        sourceId: Number(candidate.sourceId),
        title: candidate.title,
        sourceUrl: candidate.sourceUrl,
        externalIdentifier: candidate.externalIdentifier || undefined,
        changeType: candidate.changeType as "new_publication" | "modification" | "repeal" | "correction" | "unknown",
        notes: candidate.notes || undefined,
      });
      await markSourceChecked.mutateAsync({ sourceId: Number(candidate.sourceId) });
      await Promise.all([utils.legalCorpus.adminCandidates.invalidate(), utils.legalCorpus.adminSources.invalidate()]);
      setCandidate(blankCandidate);
      toast.success("Hallazgo registrado como candidato. No se incorporó ningún texto ni se activó una norma.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el hallazgo");
    }
  };

  return <section className="mt-8 rounded-2xl border border-[#d8c49e] bg-[#102a43] p-5 text-white sm:p-7">
    <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f3d58c]">Detección supervisada</p><h2 className="mt-3 font-display text-4xl font-semibold leading-[.95]">Registrar un hallazgo no equivale a actualizar la ley.</h2><p className="mt-5 text-sm leading-7 text-[#c8d4df]">Mientras no exista una API pública autorizada, LegalDoc no extrae ni copia automáticamente publicaciones. El revisor visita la fuente oficial, registra el enlace y crea un candidato auditable para la cola humana.</p><div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4 text-xs leading-5 text-[#d8e3eb]"><strong className="text-[#f3d58c]">Siguiente paso obligatorio:</strong> si el candidato se acepta, carga el original y Markdown, y aprueba la versión separadamente. Nunca se activa desde esta pantalla.</div></div>
      <form onSubmit={submit} className="rounded-2xl bg-[#fffdf8] p-5 text-[#284458]"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#8c6b35]">Nuevo candidato de cambio</p><div className="mt-4 grid gap-4"><div className="space-y-2"><Label className="text-sm font-extrabold">Fuente revisada</Label><select required value={candidate.sourceId} onChange={(event) => setCandidate({ ...candidate, sourceId: event.target.value })} className="h-11 w-full rounded-xl border border-[#d9c9aa] bg-white px-3 text-sm font-medium"><option value="">Selecciona una fuente oficial registrada</option>{sources.data?.filter((source) => source.isEnabled).map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label className="text-sm font-extrabold">Tipo de hallazgo</Label><select value={candidate.changeType} onChange={(event) => setCandidate({ ...candidate, changeType: event.target.value })} className="h-11 w-full rounded-xl border border-[#d9c9aa] bg-white px-3 text-sm font-medium"><option value="unknown">Por clasificar</option><option value="new_publication">Nueva publicación</option><option value="modification">Modificatoria</option><option value="repeal">Derogatoria</option><option value="correction">Fe de erratas / corrección</option></select></div><div className="space-y-2"><Label className="text-sm font-extrabold">Identificador externo</Label><Input value={candidate.externalIdentifier} onChange={(event) => setCandidate({ ...candidate, externalIdentifier: event.target.value })} placeholder="Ej.: N.º de norma o edición" /></div></div><div className="space-y-2"><Label className="text-sm font-extrabold">Título publicado</Label><Input required value={candidate.title} onChange={(event) => setCandidate({ ...candidate, title: event.target.value })} placeholder="Título tal como aparece en la fuente oficial" /></div><div className="space-y-2"><Label className="text-sm font-extrabold">URL de la publicación oficial</Label><Input required type="url" value={candidate.sourceUrl} onChange={(event) => setCandidate({ ...candidate, sourceUrl: event.target.value })} placeholder="https://..." /></div><div className="space-y-2"><Label className="text-sm font-extrabold">Notas de contraste</Label><Textarea value={candidate.notes} onChange={(event) => setCandidate({ ...candidate, notes: event.target.value })} className="min-h-20" placeholder="Indica qué se verificó, fecha de consulta y qué falta por contrastar." /></div></div><Button type="submit" disabled={createCandidate.isPending || markSourceChecked.isPending} className="legal-button-primary mt-5 rounded-xl text-white">{createCandidate.isPending || markSourceChecked.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando…</> : <><ShieldAlert className="mr-2 h-4 w-4" />Registrar para revisión</>}</Button></form>
    </div>
  </section>;
}
