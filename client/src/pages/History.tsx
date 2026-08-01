import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RotateCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [regenerating, setRegenerating] = useState<number | null>(null);

  const historyQuery = trpc.documents.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Debes iniciar sesión para ver tu historial</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = async (doc: any) => {
    try {
      const response = await fetch(`/api/download-doc/${doc.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error descargando documento");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.documentTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Documento descargado exitosamente");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error descargando documento");
    }
  };

  const handleRegenerate = async (doc: any) => {
    setRegenerating(doc.id);
    try {
      // Parse the form data
      const formData = JSON.parse(doc.formData);

      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: doc.templateId,
          formData: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Error regenerando documento");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.documentTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Documento regenerado y descargado");
    } catch (error) {
      toast.error("Error regenerando documento");
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Mi Historial de Documentos</h1>
          <p className="text-slate-600">
            Accede a todos los documentos que has generado
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {historyQuery.isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Cargando historial...</p>
          </div>
        ) : !historyQuery.data || historyQuery.data.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 text-lg mb-4">
                Aún no has generado ningún documento
              </p>
              <Button
                onClick={() => navigate("/catalogo")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generar tu primer documento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyQuery.data.map((doc) => (
              <Card key={doc.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doc.documentTitle}</CardTitle>
                      <CardDescription>
                        {doc.templateName} • Generado el{" "}
                        {format(new Date(doc.createdAt), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{doc.templateId}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 font-semibold mb-2">Datos utilizados:</p>
                    <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 max-h-24 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {JSON.stringify(JSON.parse(doc.formData), null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(doc)}
                      variant="outline"
                      className="flex-1 border-slate-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button
                      onClick={() => handleRegenerate(doc)}
                      disabled={regenerating === doc.id}
                      variant="outline"
                      className="flex-1 border-slate-300"
                    >
                      {regenerating === doc.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Regenerando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Regenerar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
