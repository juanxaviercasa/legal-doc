# Generador de Documentos Legales - TODO

## Fase 1: Estructura de Datos y Backend
- [x] Configurar variables de entorno (OpenAI API Key)
- [x] Crear esquema de base de datos (documentos generados, historial)
- [x] Crear archivo de plantillas legales peruanas (6 plantillas)
- [x] Implementar helpers de base de datos

## Fase 2: API de Generación
- [x] Instalar dependencias (docx, openai)
- [x] Crear ruta API /api/generate-doc
- [x] Implementar lógica de generación con OpenAI
- [x] Implementar generación de archivos .docx
- [x] Crear procedimientos tRPC para obtener historial
- [x] Crear procedimientos tRPC para obtener documentos

## Fase 3: Interfaz de Usuario - Landing y Catálogo
- [x] Diseñar e implementar landing page profesional
- [x] Crear componente de catálogo de plantillas
- [x] Implementar navegación y rutas
- [x] Aplicar estilos profesionales y elegantes

## Fase 4: Formularios Dinámicos y Generación
- [x] Crear página de generador con formulario dinámico
- [x] Implementar vista previa del documento
- [x] Implementar descarga de .docx
- [x] Crear página de historial de documentos
- [x] Implementar opciones de regenerar y descargar

## Fase 5: Pruebas y Optimización
- [x] Corregir getDocumentById con condiciones SQL válidas
- [x] Implementar vista previa real del contenido generado
- [x] Crear ruta API /api/download-doc/:documentId para descargas del historial
- [x] Implementar descarga real desde el historial usando endpoint dedicado
- [x] Mejorar vista previa para mostrar contenido completo
- [x] Verificar compilación de TypeScript
- [x] Guardar checkpoint final
