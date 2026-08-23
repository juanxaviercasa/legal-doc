# Estrategia de jurisdicciones de LegalDoc

## Alcance actual

LegalDoc está especializado en **Perú**. La generación utiliza plantillas, formularios y contexto jurídico peruano; no se permite mezclar normas, instituciones o terminología de otros países dentro de una misma generación. Todo borrador requiere revisión profesional antes de su uso o presentación.

| Jurisdicción | Estado del selector | Catálogo y prompts | Revisión local | Generación |
|---|---|---|---|---|
| Perú | Disponible | Configurados para el MVP | Requerida antes de usar cada documento | Activa |
| México | Próximamente | No iniciado | Pendiente | Bloqueada |
| Colombia | Próximamente | No iniciado | Pendiente | Bloqueada |
| Chile | Próximamente | No iniciado | Pendiente | Bloqueada |

## Paquete requerido para activar un país

Cada nueva jurisdicción debe incorporar, de manera independiente, su catálogo de documentos, formularios, prompts, terminología, referencias normativas, moneda y formatos de salida. Antes de activar la jurisdicción deben ejecutarse pruebas de generación, edición, descarga e historial y debe existir revisión legal local documentada.

La configuración actual deja visibles los países futuros en el selector, pero los mantiene bloqueados. Esta decisión evita que el sistema presente contenido peruano como si fuera aplicable en otra jurisdicción.

## Regla de producto

> Precisión local antes que cobertura global: primero se consolida Perú y luego se replica el producto país por país, sin reutilizar automáticamente los prompts legales ni afirmar validez normativa sin revisión local.
