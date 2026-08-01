import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Generator() {
  const [match, params] = useRoute("/generator/:id");
  const [, navigate] = useLocation();
  const templateId = params?.id as string;

  const [showPreview, setShowPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const templateQuery = trpc.documents.getTemplateById.useQuery(
    { id: templateId },
    { enabled: !!templateId }
  );

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<Record<string, any>>({
    defaultValues: {},
  });

  const formData = watch();

  const onSubmit = async (data: Record<string, any>) => {
    if (!templateId) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          formData: data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error generando documento");
      }

      // Get the content for preview from header
      const contentHeader = response.headers.get("X-Generated-Content");
      if (contentHeader) {
        try {
          const decodedContent = atob(contentHeader);
          setGeneratedContent(decodedContent);
          setShowPreview(true);
        } catch (e) {
          console.error("Error decoding content", e);
        }
      }

      // Get the blob for download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateQuery.data?.title || "documento"}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Documento generado y descargado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error generando documento");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!match) return null;

  if (templateQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando plantilla...</p>
        </div>
      </div>
    );
  }

  if (!templateQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Plantilla no encontrada</p>
          <Button onClick={() => navigate("/catalogo")}>Volver al catálogo</Button>
        </div>
      </div>
    );
  }

  const template = templateQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/catalogo")}
            className="mb-6 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{template.title}</h1>
          <p className="text-slate-600">{template.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Ingresa los datos</CardTitle>
                <CardDescription>
                  Completa el formulario con la información necesaria para generar tu documento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {template.formFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name} className="font-semibold text-slate-900">
                        {field.label}
                        {field.required && <span className="text-red-600 ml-1">*</span>}
                      </Label>

                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          {...register(field.name, { required: field.required })}
                          className="border-slate-300 min-h-24"
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={formData[field.name] || ""}
                          onValueChange={(value) => setValue(field.name, value)}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          {...register(field.name, { required: field.required })}
                          className="border-slate-300"
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-red-600 text-sm">Este campo es requerido</p>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generar y Descargar
                        </>
                      )}
                    </Button>
                    {generatedContent && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                        className="border-slate-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? "Ocultar" : "Vista Previa"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div>
            {showPreview && generatedContent ? (
              <Card className="border-slate-200 sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 border border-slate-200 rounded max-h-96 overflow-y-auto">
                    <div className="text-sm text-slate-700 whitespace-pre-wrap font-serif">
                      {generatedContent}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Esta es una vista previa del contenido. El documento completo se descargará en formato Word.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600 text-center">
                    Completa el formulario y genera el documento para ver una vista previa
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
