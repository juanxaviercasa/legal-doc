# Modelo de dominio: Asuntos de LegalDoc

## Objetivo

Un **Asunto** reúne el trabajo de un abogado sobre un encargo concreto. El documento deja de ser un registro aislado y se convierte en un entregable asociado a hechos, partes, tareas y decisiones del mismo asunto. Esta primera versión está diseñada para un propietario individual; la colaboración entre integrantes se incorporará después mediante una tabla de membresías y permisos por asunto.

## Entidades iniciales

| Entidad | Propósito | Propietario y acceso |
| --- | --- | --- |
| `legal_matters` | Ficha central: título, materia, cliente, hechos, objetivo, estado, prioridad y próxima acción. | Pertenece a `ownerUserId`; todas las consultas y mutaciones filtran por ese usuario. |
| `matter_parties` | Partes relevantes y su rol procesal o contractual. | Se accede solo tras verificar propiedad del asunto. |
| `matter_tasks` | Tareas operativas con estado, prioridad y fecha de vencimiento. | Se accede solo tras verificar propiedad del asunto. |
| `matter_timeline_events` | Registro cronológico de decisiones, notas, tareas y documentos vinculados. | Inmutable desde la interfaz inicial; se crea como consecuencia de acciones relevantes. |
| `generated_documents.matterId` | Enlace opcional entre un documento existente y un asunto. | El enlace solo se permite si ambos pertenecen al mismo usuario. |

## Estados y reglas

| Campo | Valores iniciales | Regla |
| --- | --- | --- |
| Estado del asunto | `intake`, `active`, `waiting_client`, `on_hold`, `closed` | Un asunto cerrado preserva historial; no se elimina de forma destructiva. |
| Prioridad | `low`, `normal`, `high`, `urgent` | Es operativa, no una evaluación de riesgo jurídico. |
| Estado de tarea | `open`, `in_progress`, `done`, `cancelled` | Solo `done` establece `completedAt`. |
| Tipo de cronología | `note`, `task_created`, `task_completed`, `document_linked`, `matter_created` | Crea trazabilidad sin inferir hechos ni estados legales. |

## Límites de la primera entrega

Esta fase no calcula plazos procesales, no consulta portales judiciales, no envía alertas programadas, no realiza facturación ni da acceso a clientes externos. La Mesa procesal se construirá sobre estas entidades una vez que los asuntos, tareas y documentos estén estables.

## Convenciones de datos

Las fechas se almacenan en UTC. Los archivos conservan bytes exclusivamente en S3 y sus claves/metadatos en la base de datos. No se agregan claves foráneas físicas a tablas existentes, para mantener el patrón actual de relaciones lógicas; la capa de servidor debe verificar de manera explícita la propiedad antes de cada operación.
