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

## Nueva evolución: Perú primero, arquitectura multinacional
- [x] Definir entidad de jurisdicción con Perú como jurisdicción activa y predeterminada
- [x] Separar plantillas, prompts y metadatos legales por jurisdicción
- [x] Agregar selector de jurisdicción preparado para futuras expansiones
- [x] Ampliar el catálogo peruano con plantillas laborales, confidencialidad y poderes especializados
- [x] Implementar edición del contenido legal antes de descargar
- [x] Implementar previsualización completa y consistente del contenido editado
- [x] Persistir y descargar documentos históricos sin regenerar su contenido
- [x] Agregar analítica de uso por jurisdicción y tipo de documento
- [x] Crear pruebas unitarias de límites de jurisdicción y mantener pruebas existentes de generación, descarga e historial
- [x] Verificar que los avisos indiquen que el contenido requiere revisión profesional
- [x] Verificar build de producción
- [ ] Guardar checkpoint de la nueva versión

## Próximas jurisdicciones, fuera del alcance actual
- [ ] Incorporar una jurisdicción adicional únicamente después de validar su catálogo y prompts legales independientes
- [ ] Añadir configuración específica por país para terminología, normativa, moneda y formato documental
- [ ] Validar cada jurisdicción con revisión legal local antes de activarla para usuarios finales

Nota de producto: LegalDoc se mantiene especialista en Perú en esta versión. La selección de jurisdicción prepara la expansión, pero no habilita otros países hasta que existan plantillas y prompts revisados específicamente para cada marco legal.

## Cobertura de flujos antes del siguiente checkpoint
- [x] Agregar pruebas automatizadas para /api/generate-doc: autenticación, jurisdicción no habilitada y plantilla fuera de jurisdicción
- [x] Agregar pruebas automatizadas para /api/download-doc/:documentId y /api/download-content
- [x] Agregar pruebas tRPC para historial, edición persistente y analítica
