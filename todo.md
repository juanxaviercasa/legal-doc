# Generador de Documentos Legales - TODO

## Publicación de código autorizada
- [x] Verificar y publicar el estado validado actual en el repositorio GitHub juanxaviercasa/legal-doc

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

## Biblioteca de la Abogacía y aprendizaje profesional
- [x] Investigar una línea histórica del derecho y la abogacía con fuentes verificables
- [x] Crear una narrativa editorial de casos, dilemas y lecciones históricas sin presentar ficción como hecho
- [x] Diseñar ilustraciones originales para la línea de tiempo y los estudios de caso
- [x] Implementar una página inspiradora de historia, casos y aprendizaje continuo
- [x] Crear rutas de aprendizaje sobre razonamiento, ética, investigación y estrategia jurídica contemporánea
- [x] Incluir fuentes, distinciones históricas y avisos claros en los contenidos educativos
- [x] Validar la experiencia de la biblioteca en escritorio y móvil

## Cierre de verificación de la Biblioteca de la Abogacía
- [x] Verificar y documentar una fuente abierta para el bloque de Atenas clásica
- [x] Integrar una ilustración original específica en la sección de línea de tiempo
- [x] Validar nuevamente las referencias y la experiencia visual de la Biblioteca de la Abogacía

## Corpus legal peruano verificable
- [x] Definir las fuentes oficiales permitidas y la cobertura normativa inicial
- [x] Investigar accesos gratuitos y opciones programáticas oficiales para legislación y jurisprudencia peruana
- [x] Diseñar el modelo de fuentes con URL, fecha de consulta, vigencia y fragmentos citables
- [x] Implementar recuperación de fuentes aprobadas antes de cada generación
- [x] Mostrar referencias verificables y advertencias de vigencia en cada borrador
- [ ] Validar el flujo de fuentes con documentos y revisión jurídica humana
- [x] Seleccionar una única versión vigente más reciente por instrumento antes de generar
- [x] Probar que las citas ignoran versiones aprobadas anteriores o no vigentes

## Actualización automática de fuentes oficiales
- [x] Verificar el mecanismo técnico y las condiciones de uso de El Peruano y demás fuentes oficiales
- [ ] Diseñar sincronización periódica con detección de altas, modificatorias, derogatorias y errores
- [x] Persistir versiones, fecha de publicación, fuente de origen y trazabilidad de cada norma
- [x] Implementar cola de revisión humana para cambios normativos de alto impacto
- [ ] Configurar actualización periódica aprobada y alertas de fallos o cambios pendientes

## Corpus gratuito y autosostenible
- [x] Definir repositorio jurídico propio como fuente de verdad y respaldo externo opcional
- [x] Preparar formato Markdown y metadatos obligatorios para documentos oficiales aportados por el equipo
- [x] Crear inventario priorizado de Constitución, códigos, leyes y normas requeridas por las plantillas activas
- [x] Diseñar detección gratuita de cambios desde publicaciones públicas sin depender de APIs de pago
- [x] Implementar revisión humana obligatoria antes de promover una actualización al corpus activo

## Auditoría estratégica de producto para abogados
- [x] Investigar intenciones de búsqueda, tendencias y principales dolores de abogados en Perú y mercados comparables
- [x] Realizar benchmark de plataformas jurídicas comparables, propuesta de valor, señales de adopción y prácticas transferibles
- [x] Auditar las capacidades actuales de LegalDoc frente al ciclo completo de trabajo jurídico
- [x] Definir propuesta de valor, segmentos prioritarios y problemas de alto impacto a resolver
- [x] Diseñar una hoja de ruta priorizada de funcionalidades, diferenciación y métricas de producto
- [x] Verificar y persistir el documento estratégico con propuesta de valor, segmentos y dolores prioritarios
- [x] Verificar y persistir la hoja de ruta con fases, diferenciadores y métricas de producto

## Evolución operativa: Asuntos → Mesa procesal → Investigación jurídica
- [x] Definir modelo de Asunto con cliente, partes, hechos, estado, responsables y control de propiedad
- [x] Implementar persistencia, permisos y operaciones CRUD de Asuntos
- [x] Conectar documentos existentes a un Asunto sin romper el historial actual
- [x] Implementar tareas, cronología y notas de decisión por Asunto
- [x] Construir índice y detalle responsive de Asuntos para el espacio privado
- [x] Añadir responsables o asignados reales al modelo de Asuntos y exponerlos con permisos seguros
- [x] Implementar archivado seguro de Asuntos con validación de propiedad, interfaz y pruebas
- [x] Añadir agenda procesal con eventos, audiencias, vencimientos y fuente de fecha
- [x] Implementar expediente, cronología procesal y alertas de próxima acción sin automatización no autorizada
- [x] Crear experiencia de Mesa procesal con calendario, filtros y confirmación de fechas
- [x] Modelar ficha de expediente con órgano, número, etapa, última verificación y fuente declarada
- [x] Mantener cada evento procesal como fecha confirmable con origen, referencia y estado de verificación
- [x] Implementar una vista de calendario real para la Mesa procesal con eventos y estados de verificación
- [x] Añadir filtros de tipo, confirmación y rango temporal con pruebas y validación responsive
- [x] Exponer búsqueda de normas aprobadas por texto, materia, identificador, vigencia y fuente
- [x] Vincular resultados de investigación y citas a Asuntos y documentos
- [x] Restringir la búsqueda a versiones aprobadas actuales y mostrar extractos con URL y fecha de corte
- [x] Persistir referencias de investigación añadidas a un Asunto y evitar duplicar citas por documento
- [x] Mostrar en el detalle del Asunto las fuentes jurídicas de investigación que fueron vinculadas
- [x] Añadir filtros explícitos por identificador normativo, vigencia y fuente oficial en búsqueda jurídica
- [x] Validar TypeScript, pruebas, build y experiencia responsive por cada hito
