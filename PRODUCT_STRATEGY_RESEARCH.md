# Investigación estratégica de LegalDoc

## Hallazgos iniciales sobre necesidades globales de la práctica jurídica

- El informe Legal Trends de Clio declara basarse en datos agregados y anonimizados de decenas de miles de profesionales jurídicos estadounidenses. Sus mensajes de producto agrupan las necesidades en eficiencia operativa, crecimiento de ingresos, experiencia del cliente y adopción de IA. La página informa que más de la mitad de clientes consulta IA antes de acudir a la firma, y destaca reducción de carga mental con tecnología. Fuente: https://www.clio.com/resources/legal-trends/
- Thomson Reuters informa que el rendimiento de la IA cambia con una estrategia clara: 66 % de profesionales dice que la IA cumple o supera expectativas con estrategia, frente a 22 % sin ella. También reporta 34 % de uso de IA no aprobada, 41 % sin herramientas que satisfagan estándares de responsabilidad profesional y una brecha entre calidad habilitada por IA esperada por clientes corporativos y la entregada. Fuente: https://www.thomsonreuters.com/en/institute/c/future-of-professionals

## Implicación preliminar

LegalDoc no debe competir como un generador genérico. La propuesta debe unir productividad con controles verificables: fuente normativa, trazabilidad, revisión humana, seguridad, gestión de información y una experiencia de cliente clara. Estos hallazgos se contrastarán con plataformas comparables y necesidades del mercado peruano antes de recomendar funcionalidades o prioridades.

## Señales competitivas iniciales en Perú

- ArgosLex se posiciona como software de gestión de práctica para Perú. Declara monitorear CEJ/SINOE, centralizar expedientes, audiencias y honorarios, calcular plazos, sincronizar calendario y brindar un portal de clientes. También presenta recursos auxiliares, directorio judicial, enlaces oficiales, calculadoras y formatos. Fuente: https://www.argoslex.com/
- Lexius Perú se posiciona en investigación/conversación jurídica mediante IA. Declara cobertura de legislación y sentencias actualizadas, análisis de extractos, borradores básicos, revisión documental y carga de documentos, audio y video con transcripción. Sus cifras y promesas son declaraciones del proveedor y deben tratarse como tales hasta una verificación independiente. Fuente: https://lexius.io/pe/

## Hipótesis competitiva

El mercado peruano ya muestra al menos dos categorías diferenciadas: gestión de expedientes/plazos/finanzas y búsqueda-análisis jurídico amplio. LegalDoc puede diferenciarse si convierte la redacción en un flujo verificable de principio a fin —información estructurada, versión normativa aprobada, citas persistentes, revisión y entrega— y luego conecta dicho flujo con el expediente, el cliente y la operación de la firma.

## Referentes globales: patrones de plataforma

- Clio se presenta como una plataforma integral de práctica jurídica que reúne gestión de asuntos, automatización documental, facturación, gestión de cobros, entrada de clientes, portal de clientes, contabilidad e integraciones. Expone una segmentación por tamaño de firma y afirma que su IA aprovecha el contexto de asuntos, clientes, escritos, comunicaciones y datos financieros. Fuente: https://www.clio.com/
- MyCase se presenta como una plataforma que abarca desde la captación hasta la factura. Incluye formularios de entrada, portal de cliente, calendario, documentos, gestión de casos asistida por IA, tiempo/gastos, facturación, pagos y reportes financieros. Declara ser usada por más de 19 000 firmas; la cifra es una declaración comercial del proveedor. Fuente: https://www.mycase.com/

## Patrón transferible validado por el benchmark

Las plataformas de práctica que se perciben como completas no agregan herramientas aisladas. Organizan un **ciclo de trabajo**: captar al cliente, abrir el asunto, solicitar y custodiar información, planificar plazos, trabajar documentos y evidencia, comunicar avances, cobrar, medir la rentabilidad y conservar el conocimiento. LegalDoc ya posee una base diferenciada en borradores con trazabilidad normativa; la oportunidad es convertir esa base en el punto de entrada de dicho ciclo, en lugar de competir únicamente por producir texto.

## Referentes de IA legal y contrato

- Harvey describe un modelo empresarial que une agentes para tareas jurídicas complejas, investigación, almacenamiento y análisis masivo de documentos, flujos de revisión y controles como SSO, auditoría y gestión de ciclo de vida de datos. Fuente: https://www.harvey.ai/
- Spellbook se concentra en la práctica contractual dentro de Word: revisa contra estándares, propone redlines, permite redactar desde precedentes, busca acuerdos firmados y compara contratos con mercado. La lección no es replicar su producto, sino tratar el precedente, la cláusula y la lista de riesgos como objetos de trabajo, no como texto suelto. Fuente: https://spellbook.com/

## Consecuencia de diseño

La funcionalidad de “generar documento” debe evolucionar a un **espacio de trabajo por asunto**. Cada asunto deberá conservar una ficha de hechos, partes, documentos, versiones, fuentes jurídicas, preguntas abiertas, lista de riesgos, aprobaciones y comunicaciones. Esto permite que la IA ayude sin perder el control profesional ni la trazabilidad.

## Auditoría del estado actual de LegalDoc

### Capacidades ya construidas

LegalDoc posee una base sólida y diferenciable para Perú: catálogo de nueve plantillas, formularios de hechos estructurados, generación de borrador editable y Word, historial autenticado, analítica básica, jurisdicción peruana aislada, biblioteca de aprendizaje y un corpus jurídico diseñado para usar solo versiones aprobadas con citas persistentes. El documento puede mostrar fuentes consultadas y conserva una advertencia explícita de revisión profesional.

La experiencia pública presenta con claridad el flujo **elegir acto → aportar contexto → revisar borrador**, más una biblioteca de aprendizaje. La promesa visible sigue siendo un "primer borrador" y no una plataforma operativa completa.

### Brechas por etapa del trabajo jurídico

| Etapa | Estado actual | Brecha que limita el valor recurrente |
| --- | --- | --- |
| Captación y calificación | No cubierta | Formulario de cliente, conflicto de interés, aceptación de encargo y embudo de oportunidades. |
| Apertura de asunto | Parcial: el formulario vive por documento | Falta una ficha de asunto reutilizable con partes, hechos, objetivos, jurisdicción, responsables y presupuesto. |
| Investigación | Parcial: corpus curado en preparación | Falta búsqueda jurídica por artículo, tema, fecha, vigencia, jurisprudencia y cuaderno de investigación con citas. |
| Documentos | Cubierta de forma inicial | Faltan precedentes privados, cláusulas, comparación, redlines, aprobaciones, firma y relación entre documentos de un asunto. |
| Expediente y plazos | No cubierta | Falta calendario procesal, cálculo de plazos configurable, alertas, audiencias, tareas y cronología. |
| Evidencia | No cubierta | Falta carga segura, OCR, clasificación, línea de tiempo probatoria y cadena de revisión. |
| Cliente | No cubierta | Falta portal, solicitud de documentos, actualizaciones, mensajes seguros y visibilidad del estado del caso. |
| Operación y rentabilidad | No cubierta | Faltan tiempo, honorarios, presupuestos, facturación, pagos, gastos y reportes. |
| Equipo y gobierno | Parcial: roles de corpus | Faltan permisos por asunto, delegación, auditoría de trabajo, controles de seguridad y políticas de IA. |

### Diagnóstico

El producto no está vacío: ya resuelve una fricción valiosa —empezar un documento peruano de manera estructurada y con una ruta de trazabilidad normativa—. Sin embargo, es **episódico**: se abre cuando se necesita un documento y pierde continuidad antes y después del borrador. El salto de nivel consiste en convertir cada documento en un activo dentro de un asunto, y cada asunto en un espacio de ejecución, aprendizaje y relación con el cliente.
