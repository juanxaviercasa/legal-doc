import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { JurisdictionSelector } from "@/components/JurisdictionSelector";
import { useState, useMemo } from "react";

export default function Catalogo() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [jurisdictionId, setJurisdictionId] = useState("pe");

  const templatesQuery = trpc.documents.getTemplates.useQuery({ jurisdictionId });

  const categories = useMemo(() => {
    if (!templatesQuery.data) return [];
    const categorySet = new Set(templatesQuery.data.map((t) => t.category));
    return Array.from(categorySet);
  }, [templatesQuery.data]);

  const filteredTemplates = useMemo(() => {
    if (!templatesQuery.data) return [];
    return templatesQuery.data.filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templatesQuery.data, searchTerm, selectedCategory]);

  const handleNavigateToGenerator = (templateId: string) => {
    navigate(`/generator/${templateId}?jurisdiction=${jurisdictionId}`);
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Catálogo de Documentos Legales
          </h1>
          <p className="text-slate-600">
            Selecciona el tipo de documento que necesitas generar
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><JurisdictionSelector value={jurisdictionId} onChange={setJurisdictionId} /></div><div className="space-y-4"><div className="relative"><Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><Input placeholder="Buscar documentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 py-2 border-slate-300" /></div><div className="flex flex-wrap gap-2"><Button variant={selectedCategory === null ? "default" : "outline"} onClick={() => setSelectedCategory(null)} className={selectedCategory === null ? "bg-blue-600" : ""}>Todos</Button>{categories.map((category) => <Button key={category} variant={selectedCategory === category ? "default" : "outline"} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "bg-blue-600" : ""}>{category}</Button>)}</div></div></div>

        {/* Templates Grid */}
        {templatesQuery.isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando plantillas...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              No se encontraron documentos que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mb-4 text-sm text-slate-600">
                    <p className="font-semibold mb-2">Campos del formulario:</p>
                    <ul className="space-y-1">
                      {template.formFields.slice(0, 3).map((field) => (
                        <li key={field.name} className="text-xs">
                          • {field.label}
                        </li>
                      ))}
                      {template.formFields.length > 3 && (
                        <li className="text-xs text-blue-600">
                          + {template.formFields.length - 3} más
                        </li>
                      )}
                    </ul>
                  </div>
                  <Button
                    onClick={() => handleNavigateToGenerator(template.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generar Documento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
