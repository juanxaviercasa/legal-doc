# Generador de Documentos Legales - TODO

## Fase 1: Estructura de Datos y Backend
- [x] Configurar variables de entorno (OpenAI API Key)
- [x] Crear esquema de base de datos (documentos generados, historial)
- [x] Crear archivo de plantillas legales peruanas (9 plantillas)
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
- [x] Guardar checkpoint de la nueva versión

## Próximas jurisdicciones, fuera del alcance actual
- [x] Definir la incorporación de una jurisdicción adicional únicamente después de validar su catálogo y prompts legales independientes; países futuros permanecen bloqueados
- [x] Añadir matriz de configuración base por país para terminología, moneda, estado y formato; el paquete legal específico queda pendiente antes de activar
- [x] Establecer la revisión legal local como requisito obligatorio antes de activar cada jurisdicción futura

Nota de producto: LegalDoc se mantiene especialista en Perú en esta versión. La selección de jurisdicción prepara la expansión, pero no habilita otros países hasta que existan plantillas y prompts revisados específicamente para cada marco legal.

## Cobertura de flujos antes del siguiente checkpoint
- [x] Agregar pruebas automatizadas para /api/generate-doc: autenticación, jurisdicción no habilitada y plantilla fuera de jurisdicción
- [x] Agregar pruebas automatizadas para /api/download-doc/:documentId y /api/download-content
- [x] Agregar pruebas tRPC para historial, edición persistente y analítica

## Cierre técnico de configuración por jurisdicción
- [x] Agregar campos explícitos de locale, terminología jurídica y formato documental por país
- [x] Usar locale, terminología y formato documental en el contexto de generación y en la interfaz

## Última verificación de configuración visible
- [x] Mostrar explícitamente la terminología jurídica configurada para la jurisdicción activa en la interfaz y verificar su renderizado

## Rediseño visual y experiencia para abogados
- [x] Definir identidad de marca jurídica premium, paleta, tipografía y sistema de componentes
- [x] Crear recursos visuales originales para la landing y los estados de producto
- [x] Rediseñar la navegación, landing y catálogo con UX responsive
- [x] Rediseñar generador, editor, vista previa e historial para máxima claridad operativa
- [x] Aplicar microinteracciones, estados vacíos, accesibilidad y adaptación móvil
- [x] Validar diseño en escritorio y móvil sin afectar flujos de generación, descarga e historial
- [x] Ejecutar pruebas automatizadas y build de producción después del rediseño

## Corpus legal peruano verificable
- [ ] Definir las fuentes oficiales permitidas y la cobertura normativa inicial
- [ ] Investigar accesos gratuitos y opciones programáticas oficiales para legislación y jurisprudencia peruana
- [ ] Diseñar el modelo de fuentes con URL, fecha de consulta, vigencia y fragmentos citables
- [ ] Implementar recuperación de fuentes aprobadas antes de cada generación
- [ ] Mostrar referencias verificables y advertencias de vigencia en cada borrador
- [ ] Validar el flujo de fuentes con documentos y revisión jurídica humana

## Actualización automática de fuentes oficiales
- [ ] Verificar el mecanismo técnico y las condiciones de uso de El Peruano y demás fuentes oficiales
- [ ] Diseñar sincronización periódica con detección de altas, modificatorias, derogatorias y errores
- [ ] Persistir versiones, fecha de publicación, fuente de origen y trazabilidad de cada norma
- [ ] Implementar cola de revisión humana para cambios normativos de alto impacto
- [ ] Configurar actualización periódica aprobada y alertas de fallos o cambios pendientes

## Corpus gratuito y autosostenible
- [ ] Definir repositorio jurídico propio como fuente de verdad y respaldo externo opcional
- [x] Preparar formato Markdown y metadatos obligatorios para documentos oficiales aportados por el equipo
- [ ] Crear inventario priorizado de Constitución, códigos, leyes y normas requeridas por las plantillas activas
- [ ] Diseñar detección gratuita de cambios desde publicaciones públicas sin depender de APIs de pago
- [ ] Implementar revisión humana obligatoria antes de promover una actualización al corpus activo
