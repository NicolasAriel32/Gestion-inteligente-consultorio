# Recordatorios de sesión — especificación independiente

Estado: prototipo de frontend, sin persistencia ni transporte. Diseño propio; no reutiliza implementación, textos ni diseño de Cal.com. Fecha de revisión: 2026-10-24.

## Experiencia

Configuración contiene activación, uno o dos avisos y preferencias de contacto por paciente. Valores iniciales: email 24 horas antes y WhatsApp 2 horas antes. La interfaz ofrece anticipaciones de 15/30 minutos, 1/2/12/24/48/72 horas o 7 días; el dominio valida minutos enteros entre 1 y 10080. Cada aviso elige un canal; se rechazan dos avisos con la misma anticipación y canal. Aplicar modifica reglas de la demo y reconcilia citas existentes futuras. Las citas pendientes no generan avisos hasta confirmarse.

Agenda ofrece “Recordatorios” en cada cita. Configuración permite filtrar por cita, editarla, cancelarla, previsualizar el mensaje y consultar intentos. El reloj comienza a las 08:00 de la fecha de datos ficticios y solo avanza; no representa la hora real del sistema. Adelantarlo no ejecuta adaptadores: “Procesar vencidos” reclama trabajos y “Resolver simulaciones” los revalida y resuelve. Así puede demostrarse una cancelación entre ambos pasos.

Mensaje administrativo propio: “Recordatorio: tenés una cita el {fecha y hora} (hora de Buenos Aires). Si necesitás cambiarla, contactá al consultorio.” No incluye nombre del paciente, profesión, servicio, diagnóstico, motivo ni notas. La vista administrativa sí utiliza los nombres ficticios para identificar citas.

## Tres entidades separadas

| Entidad | Identidad y campos | Responsabilidad |
| --- | --- | --- |
| Regla `Rule` | `id`, `version`, `minutesBefore`, `channel` | Anticipación respecto al inicio. `ReminderConfig` contiene `enabled` y hasta dos reglas. |
| Trabajo `Job` | `id`, `appointmentId`, `appointmentVersion`, `recipientVersion`, `ruleId`, `ruleVersion`, `channel`, `scheduledAt`, `nextAttemptAt`, `appointmentAt`, `timeZone`, `status`, `attemptCount`, `reason?` | Una regla para una cita y canal concretos. No contiene destinatario ni mensaje. |
| Intento `Attempt` | `id`, `jobId`, `number`, `startedAt`, `finishedAt?`, `result`, `code?` | Un intento reclamado y su resultado técnico. No equivale a entrega. |

Las citas heredadas sin `reminderVersion` se interpretan como versión 1. Guardar una cita existente o cambiar su estado incrementa su versión. Cada ocurrencia de una serie tiene su propio ID; `seriesId` no se utiliza como identidad del trabajo. Editar una ocurrencia no modifica las otras.

Las preferencias `{email, whatsapp, version}` pertenecen al paciente. Ausencia de preferencias significa rechazo. Los pacientes ficticios iniciales tienen permisos de ejemplo; un paciente nuevo comienza sin permisos. Cambiar permisos o email/teléfono incrementa la versión de destinatario. Un contacto de formato inválido no es elegible. La validación local de formato no verifica la existencia del destinatario ni representa consentimiento legal para producción.

Clave de idempotencia de la demo: serialización JSON de `[appointmentId, appointmentVersion, ruleId, ruleVersion, channel, recipientVersion, patientId]`. Incluye los cuatro elementos requeridos y agrega revisión de destinatario. Cada intento usa `[jobId, number]`. Aplicar sin cambios conserva versiones de reglas; cambiar anticipación, canal o activación incrementa su versión. Los trabajos cancelados se conservan como registros que impiden recrear la misma clave.

## Tiempo y reconciliación

La presentación usa `America/Argentina/Buenos_Aires` explícitamente mediante `Intl`. Los instantes se representan como milisegundos UTC; el trabajo conserva la zona IANA. El conversor admite 2000–2099 y obtiene los offsets mediante `Intl` y datos IANA del runtime, comprobando candidatos a ambos lados de la fecha. Rechaza horas inexistentes o ambiguas y fechas imposibles. Incluye pruebas del horario de verano histórico de Buenos Aires; no presupone UTC−03 para todas las fechas. Producción deberá mantener actualizados los datos de zona, revisar cambios normativos y definir una política explícita de desambiguación. No se agregó una dependencia para esta simulación.

`scheduledAt = appointmentAt - minutesBefore * 60000`. Solo se crean trabajos cuando `scheduledAt > now`, la cita está confirmada y futura, la regla está activa y el contacto permite ese canal. Un trabajo ya existente puede procesarse después de su hora prevista, siempre antes del inicio de la cita. No se recuperan avisos que ya estaban vencidos al crear una regla/cita. Relojes inválidos, fechas imposibles o fuera del alcance se rechazan u omiten sin programar.

Cada cambio reconcilia el conjunto deseado con los trabajos activos. Cancelación, finalización, revocación, desactivación, reprogramación o desaparición de la cita invalidan trabajos pendientes y en procesamiento. Cambiar inicio u hora programada sin incrementar versión también cancela el trabajo como protección; el contrato de escritura exige incrementar versiones. Se conservan resultados terminales como historial. Antes del adaptador se vuelve a comprobar estado, versiones, preferencias, fechas y configuración usando el estado actual.

## Estados y transiciones

| Estado interno | Texto visible | Transición |
| --- | --- | --- |
| `scheduled` | Programado | Al vencer pasa a `processing` mediante reclamo. |
| `processing` | Procesando demo | Revalidación y resolución explícitas. Puede cancelarse antes del adaptador. |
| `retry` | Error simulado · Reintento programado | Vuelve a `processing` cuando vence `nextAttemptAt`. |
| `simulated_success` | Simulado correctamente | Terminal. No prueba envío ni entrega real. |
| `simulated_error` | Error simulado · Finalizado | Terminal por error permanente, agotamiento o cercanía al inicio. |
| `uncertain` | Resultado incierto · Revisión manual | Terminal; sin reintento automático. |
| `cancelled` | Cancelado | Terminal para esa clave. |

Resultados del adaptador ficticio: `success`, `transient`, `permanent`, `uncertain`, con códigos constantes `DEMO_*`. No acepta destinatarios, no construye conexiones y no usa SDKs externos. Un fallo transitorio permite hasta tres intentos totales, con esperas de 5 y 15 minutos. Un reintento que alcanzaría o excedería el inicio no se programa. Un fallo permanente finaliza inmediatamente. Reclamar o resolver repetidamente no genera otro intento para el mismo trabajo ya reclamado o terminal.

Si el resultado es incierto, se bloquea también la generación automática de reemplazos de la misma cita/regla/canal, incluso con nueva versión. La demo no incluye una acción para resolver esa incertidumbre. En producción se necesitará consulta al proveedor mediante referencia, conciliación y revisión autorizada antes de cualquier reenvío. No se promete entrega exactamente una vez: el proveedor puede aceptar una solicitud y perderse la respuesta.

## Privacidad y límites

Los registros técnicos contienen IDs opacos locales, números de intento, tiempos, resultados y códigos constantes. No registran email, teléfono, nombre ni contenido. Los IDs tampoco deben derivarse de datos personales. No se añadieron logs de consola con datos de pacientes. Los datos de la demo y los recordatorios se pierden al recargar. Los controles privados no aparecen en la vista pública; el panel completo sigue sin autenticación y no constituye aislamiento de datos ni un sistema apto para pacientes reales.

## Arquitectura y fase productiva pendiente

- `src/reminders/types.ts`: contratos separados.
- `src/reminders/time.ts`: conversión y texto neutro.
- `src/reminders/engine.ts`: reglas puras, reconciliación, reclamo, revalidación y reintentos.
- `src/reminders/adapters.ts`: resultados simulados sin I/O.
- `src/hooks/useReminderDemo.ts`: estado en memoria y reloj controlado.
- `src/reminders/ReminderCenter.tsx`: presentación accesible mediante etiquetas, estados textuales, foco visible y componentes existentes.

En producción se requieren autenticación y aislamiento por profesional, almacenamiento UTC, índice único de idempotencia, transacción de cita + outbox, workers con reclamo atómico/lease y recuperación tras caída, cancelación lógica, revalidación en worker, adaptadores con secretos en servidor, consentimiento verificable y retención de auditoría sin contenido sensible. Separar `queued/processing/provider_accepted/delivered/failed/unknown` y verificar webhooks autenticados, deduplicados y fuera de orden. Aceptación por un proveedor no implica entrega. Las carreras y el envío ya aceptado no pueden revertirse por una cancelación local. Nada de esto está implementado en esta fase.

## Criterios de aceptación

1. Configurar uno o dos avisos y activarlos/desactivarlos modifica solo el estado de demo.
2. Una cita confirmada, futura y con permisos produce un trabajo por regla elegible; pendientes y fechas vencidas no producen nuevos avisos.
3. Reprogramar incrementa versión, cancela trabajos activos anteriores y crea solo los nuevos futuros.
4. Cancelar impide resolver trabajos pendientes/procesando; un éxito previo conserva su historial.
5. Cada ocurrencia recurrente se planifica individualmente.
6. Reclamos repetidos no duplican; el adaptador se ejecuta tras revalidación inmediata.
7. Fallos transitorios respetan límite y tiempos; permanentes finalizan; inciertos requieren revisión.
8. Todos los resultados locales dicen “simulado”, nunca se representan como mensajes enviados o entregados.
9. Mensajes y registros no contienen información clínica; registros tampoco contienen destinatarios.
10. Pruebas con reloj fijo y recorrido en navegador se documentan indicando lo ejecutado y las limitaciones.
