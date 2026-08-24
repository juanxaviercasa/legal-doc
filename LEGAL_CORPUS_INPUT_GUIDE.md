# Guía de aportes al corpus jurídico peruano de LegalDoc

## Principio operativo

LegalDoc debe usar un **corpus propio y versionado** como fuente de verdad. Las páginas públicas oficiales se emplean para detectar publicaciones o modificaciones; una actualización no reemplaza automáticamente el contenido activo hasta que una persona autorizada la revise y apruebe.

El archivo original oficial se conservará como evidencia. LegalDoc extraerá una versión en Markdown para búsqueda y citas, pero la cita siempre conservará el enlace, la fecha de consulta y el identificador de la fuente original.

## Qué subir

Se acepta un PDF oficial, una descarga oficial en DOCX o una versión Markdown preparada por el equipo. Es preferible subir el **PDF oficial** junto con un archivo Markdown opcional, ya que el PDF preserva la presentación y el origen del documento.

Cada norma debe incluir un bloque de metadatos al inicio del Markdown, o bien un archivo de manifiesto con la misma información.

```md
---
title: "Código Civil"
authority: "Ministerio de Justicia y Derechos Humanos"
norm_identifier: "Decreto Legislativo N.º 295"
document_type: "Código"
source_url: "https://..."
official_publication_date: "1984-07-24"
version_as_of: "AAAA-MM-DD"
legal_status: "vigente / modificado / derogado parcialmente"
coverage: "Libro I a Libro X"
notes: "Describe la edición y las modificatorias incorporadas"
---

# Código Civil

## Artículo 1
Texto oficial...
```

No debe agregarse doctrina, resúmenes de IA ni interpretaciones al mismo archivo que el texto oficial. Ese material, si se usa, debe mantenerse en una fuente separada y claramente etiquetada.

## Corpus inicial prioritario

| Prioridad | Documento requerido | Razón dentro de LegalDoc |
|---|---|---|
| 1 | Constitución Política del Perú vigente y sus reformas incorporadas | Marco constitucional y control de referencias superiores |
| 1 | Código Civil — edición oficial consolidada y relación de modificatorias posteriores | Contratos, compraventa, préstamo, transacción, confidencialidad y comunicaciones civiles |
| 1 | Código Procesal Civil — edición oficial consolidada | Demandas civiles, poderes para litigar y reglas procesales asociadas |
| 1 | Decreto Legislativo N.º 1049, Ley del Notariado, y modificatorias | Poderes, instrumentos y actos notariales |
| 1 | TUO del Decreto Legislativo N.º 728, Ley de Productividad y Competitividad Laboral, y reglamento aplicable | Contrato de trabajo y documentos laborales iniciales |
| 2 | Código Penal — D. Leg. N.º 635 y modificatorias | Módulo penal; no debe mezclarse con plantillas civiles o laborales |
| 2 | Código Procesal Penal — D. Leg. N.º 957 y modificatorias | Módulo procesal penal separado |
| 2 | Ley de Protección de Datos Personales y reglamento vigente | Documentos de confidencialidad cuando involucren datos personales |
| 3 | Jurisprudencia vinculante y precedentes que el equipo jurídico haya validado | Citas de apoyo, siempre con órgano, expediente, fecha, enlace y texto completo |

## Flujo gratuito de actualización

1. LegalDoc registra diariamente enlaces y publicaciones nuevas de fuentes públicas autorizadas, como la sección de normas actualizadas de El Peruano.
2. Si detecta una norma nueva, una modificatoria, una derogatoria o un cambio de archivo, crea una versión candidata con enlace, fecha y huella del contenido.
3. La versión candidata queda en revisión y no puede ser usada para redactar ni citar hasta que una persona autorizada la apruebe.
4. Al aprobarse, se conserva la versión anterior, se activa la nueva y se actualiza el historial de vigencia.
5. Todo documento generado conserva las fuentes y versiones utilizadas para permitir una auditoría posterior.

## Almacenamiento y respaldo

La aplicación debe guardar el contenido estructurado y sus metadatos en su base de datos, y los archivos originales en almacenamiento de objetos del proyecto. Como respaldo independiente, puede exportarse periódicamente un paquete versionado del corpus a un repositorio privado o a una carpeta de Drive que controle el equipo.

Google Drive es adecuado como respaldo y recepción manual de documentos; no debe ser la única fuente de verdad. TeraBox no se recomienda como repositorio operativo porque no se ha validado una interfaz estable, documentada y autorizada para integraciones automáticas.
