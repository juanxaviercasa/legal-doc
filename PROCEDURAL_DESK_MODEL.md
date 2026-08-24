# Modelo de dominio: Mesa procesal de LegalDoc

## Finalidad y límite profesional

La Mesa procesal organiza **información operativa declarada o confirmada por el abogado**. No calcula de manera autónoma plazos legales, no sustituye notificaciones oficiales, no certifica movimientos de un expediente y no presenta una fecha como válida sin su origen y estado de verificación.

## Entidades

| Entidad | Finalidad | Campos de evidencia |
| --- | --- | --- |
| `matter_procedural_profiles` | Ficha procesal opcional de un Asunto. | Número de expediente, órgano, sede, vía, etapa, última verificación, URL/referencia y estado de confirmación. |
| `matter_procedural_events` | Audiencia, vencimiento, notificación, presentación o hito operativo. | Fecha/hora, tipo, si es vencimiento, origen, referencia, URL, estado de confirmación y notas. |

## Reglas de seguridad

| Regla | Aplicación |
| --- | --- |
| Acceso | Solo el propietario y los responsables del Asunto pueden consultar la ficha y los eventos; lectores no pueden modificarlos. |
| Fecha | Toda fecha exige un `sourceType`; el usuario puede crear un borrador, pero debe marcarlo como confirmado al contrastarlo. |
| Origen | El origen es `manual`, `official_notification`, `party_communication` u `other`; nunca se inventa una notificación oficial. |
| Alertas | La primera versión muestra un panel manual de “próximos 14 días”. No crea cron, correo ni notificación automática. |
| Cierre | Archivar un Asunto preserva su ficha y sus eventos. |

## Cronología

Los eventos procesales se integran visualmente a la cronología del Asunto, pero se conservan en una tabla independiente para mantener separados los hechos de trabajo y los datos procesales. La relación con una norma o la automatización de cómputo de plazos requerirá fuentes aprobadas y una definición jurídica posterior.
