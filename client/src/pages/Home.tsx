import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { FileText, Zap, Shield, Clock, ArrowRight, LogOut } from "lucide-react";
import { startLogin } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const templatesQuery = trpc.documents.getTemplates.useQuery();

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigateToGenerator = (templateId: string) => {
    navigate(`/generator/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">LegalDoc</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-slate-600">Bienvenido, {user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                  className="text-slate-700 hover:text-blue-600"
                >
                  Mi Historial
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            Generación de Documentos Legales con IA
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Generador de Documentos Legales
            <span className="block text-blue-600">para Abogados Peruanos</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Crea documentos legales profesionales en minutos. Utiliza inteligencia artificial para generar contenido jurídico preciso, conforme a la legislación peruana, con un solo clic.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate("/catalogo")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              Explorar Documentos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {!isAuthenticated && (
              <Button
                onClick={() => startLogin()}
                variant="outline"
                className="px-8 py-6 text-lg border-slate-300"
              >
                Crear Cuenta
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          ¿Por qué elegir LegalDoc?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Rápido y Eficiente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Genera documentos legales profesionales en cuestión de minutos, no horas.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Conforme a la Ley</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Todos los documentos respetan la legislación peruana vigente y mejores prácticas legales.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Formatos Profesionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Descarga documentos en formato Word (.docx) listos para usar o personalizar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Historial Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Accede a todos tus documentos generados en un historial seguro y organizado.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Tipos de Documentos Disponibles
        </h2>
        {templatesQuery.isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando plantillas...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesQuery.data?.slice(0, 6).map((template) => (
              <Card
                key={template.id}
                className="border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => handleNavigateToGenerator(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Generar Documento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/catalogo")}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Ver todos los documentos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para simplificar tu trabajo legal?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Comienza a generar documentos legales profesionales hoy mismo.
          </p>
          {!isAuthenticated ? (
            <Button
              onClick={() => startLogin()}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
            >
              Crear Cuenta Gratis
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/catalogo")}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
            >
              Ir al Generador
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 LegalDoc. Generador de Documentos Legales para Abogados Peruanos.</p>
          <p className="text-sm text-slate-500 mt-2">
            Todos los documentos generados cumplen con la legislación peruana vigente.
          </p>
        </div>
      </footer>
    </div>
  );
}
