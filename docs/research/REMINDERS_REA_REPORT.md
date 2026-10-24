# Investigación de recordatorios: REA y Cal.com

Fecha: 2026-10-24. Base de nuestra app: `8a4c800f99435b8254e9ea88bc8ae58f7b2b80d0`. Rama: `feat/appointment-reminders-demo`. Se revisaron README, documentación de MVP, recurrencia e investigación previa; no existe AGENTS.md en el árbol remoto consultado. La implementación se preparó en un checkout aislado para conservar la demo publicada.

## Resultado y procedencia

**REA no completó la operación.** Produjo una observación parcial y un error de capacidad al inspeccionar procesos. Ninguna conclusión funcional de este informe se atribuye a un análisis semántico exitoso de REA. Los hallazgos funcionales siguientes provienen de documentación oficial y lectura directa complementaria de código histórico. No se observó una cuenta ni el SaaS alojado de Cal.com; no se puede afirmar que su despliegue actual coincida con ese código.

No se copió implementación, contenido de mensajes ni diseño de Cal.com. El código EE histórico se consultó como referencia: su licencia comercial no autoriza asumir libre reutilización productiva. No se agregó ninguna dependencia nueva; el prototipo utiliza React, TypeScript y utilidades existentes. La identificación completa de blobs consultados está en [el manifiesto](reminders-source-manifest.json).

## Etapa REA: instalación, requisitos y limitación

Fuente oficial: [morluto/rea](https://github.com/morluto/rea). README consultado mediante GitHub `fetch_file`, blob `8c71d24bac3fa7cf969af96b673d21f438283dd5`. Declara Node 22 >=22.23.4, Node 24 >=24.22.1 o Node 26 >=26.12.1, npm y `ps` compatible con procps para inspección de procesos en Linux. Versión CLI instalada: **6.7.0**; runtime observado: **Node v24.22.1**. Se usó el ejecutable ya disponible en caché, sin parchearlo ni reemplazar las comprobaciones.

Se eligió análisis estático de seis archivos TypeScript del snapshot histórico, porque la implementación de workflows ya no está en la rama pública actual y no se dispone de acceso autorizado al despliegue privado.

Comandos efectivamente ejecutados:

```bash
node --version
/root/.npm/_npx/af752b90495482d7/node_modules/.bin/rea --version
ps -axo pid=,ppid=,pgid=,uid=,stat=,command=
/root/.npm/_npx/af752b90495482d7/node_modules/.bin/rea analyze-javascript-application /workspace/scratch/74bf031674ef/rea-reminders-target --format json > /workspace/scratch/74bf031674ef/rea-reminders-attempt.json
```

Resultado de `ps`: `fatal library error, lookup self`. REA terminó con código de salida **1**, `code: capability_unavailable`, `category: unsupported_provider`, proveedor `process-ownership`, operación `prepare_owned_process`, `retryable: false`. Mensaje conservado:

```text
Linux process ownership inspection requires a procps-compatible ps on REA's PATH before launching a child: Command failed: ps -axo pid=,ppid=,pgid=,uid=,stat=,command=
fatal library error, lookup self
```

La limitación del intento anterior continúa en este entorno. No se desactivaron ni falsearon verificaciones. [Salida JSON íntegra](reminders-rea-evidence.json), con inventario/observaciones parciales, limitaciones e incógnitas, SHA-256 `3e47468abbe623bf9dd4afe7bd72bfffb9bdcaff165ca7d0a79ae2ab8062ae78`. Este material no demuestra comportamiento de ejecución. No se adjuntan los archivos de código de terceros usados como objetivo; el manifiesto permite recuperarlos desde sus commits oficiales.

Reproducción en otro entorno: instalar REA según su README oficial, verificar versión/runtime y `ps`, recuperar las seis primeras entradas del manifiesto en sus rutas relativas y ejecutar `rea analyze-javascript-application RUTA --format json`. No se garantiza repetir el fallo específico fuera de este sandbox.

## Ubicación y versiones oficiales

La URL pública `calcom/cal.com` redirigió a `calcom/cal.diy`. Snapshot actual consultado: **`0f19cc46ef6b6426ee398c670575b3c96be7af9e`**; su árbol completo contiene 10289 entradas y ya no contiene la implementación principal de workflows EE. El historial de la ruta mostró la eliminación en [commit ab21c7f](https://github.com/calcom/cal.diy/commit/ab21c7f805a089fa3a11ffd61c4a9aecc349c16c), “refactor: Cal.diy”, del 2026-04-15. Se leyó su padre **`a17f28e9ab44d34a24840cff70082470d775b9b1`** como referencia histórica, no como versión del SaaS actual.

Procedimiento complementario mediante herramientas del conector GitHub, independiente de REA:

```text
fetch https://api.github.com/repos/calcom/cal.com/git/trees/main?recursive=1
fetch https://api.github.com/repos/calcom/cal.diy/commits?path=packages/features/ee/workflows&per_page=1
fetch https://api.github.com/repos/calcom/cal.diy/commits/ab21c7f805a089fa3a11ffd61c4a9aecc349c16c
fetch https://api.github.com/repos/calcom/cal.diy/git/trees/a17f28e9ab44d34a24840cff70082470d775b9b1?recursive=1
fetch_file repository_full_name=calcom/cal.diy path=<ruta del manifiesto> ref=a17f28e9ab44d34a24840cff70082470d775b9b1
```

La lectura local posterior numeró líneas con `split('\n')` y seleccionó términos/rangos; no fue un comando de REA. Los enlaces fijados abajo permiten comprobar la evidencia sin depender de `main`.

## Hallazgos verificables

Todos los hallazgos de código de esta tabla usan `fetch_file` + lectura directa, commit histórico **a17f28e9…**. Las conclusiones se limitan al contenido de esa versión. “Alta” indica certeza sobre ese código/documentación, no sobre una instalación productiva.

| Pregunta | Fuente y evidencia concreta | Conclusión, certeza y límite |
| --- | --- | --- |
| Configuración previa al inicio | [Documentación oficial de workflows](https://cal.com/features/workflows), consultada con búsqueda web; describe disparador previo al evento y unidades minutos/horas/días. [Guía de recordatorio](https://cal.supportpages.io/workflows-notifications/how-to-create-an-automated-reminder-workflow) ilustra email 24h antes. | Observación documental, alta: existe regla relativa. No se probó el editor del SaaS ni sus opciones actuales por cuenta/plan. |
| Regla y trabajo | [schema.prisma](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/prisma/schema.prisma): modelos `Workflow` (`trigger`, `time`, `timeUnit`), `WorkflowStep` (`action`, verificaciones) y `WorkflowReminder` (`bookingUid`, `method`, `scheduledDate`, `referenceId`, `uuid`, `scheduled`, `cancelled`, `retryCount`, `seatReferenceId`). `uuid` y `referenceId` son únicos. | Observación estática, alta: regla/paso y registro de trabajo son entidades distintas. Unicidad de referencias no prueba unicidad de intención ni entrega exactamente una vez. |
| Momento de ejecución | [WorkflowService.ts L280–362](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/service/WorkflowService.ts#L280): resta anticipación al inicio para `BEFORE_EVENT`; omite fechas pasadas; crea registro y `tasker.create('sendWorkflowEmails', …, {scheduledAt, referenceUid})`. [emailReminderManager.ts](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/reminders/emailReminderManager.ts), `scheduleEmailReminderForEvt`, también comprueba pasado. | Observación estática, alta: cálculo relativo y programación diferida. No prueba cuándo un worker real ejecuta ni su latencia. |
| Creación, confirmación, reprogramación | [WorkflowService.ts L190–245](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/service/WorkflowService.ts#L190): distingue solicitud no confirmada, reserva confirmada y `isRescheduleEvent`; esta última selecciona disparador de reprogramación y antes/después. [reminderScheduler.ts](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/reminders/reminderScheduler.ts) despacha por acción/canal. | Alta sobre selección de disparadores; media sobre ciclo completo. No se auditó toda la cadena de llamadas de cada ruta de confirmación/reprogramación. La guía menciona reservas nuevas; no se equipara con comportamiento de todas las versiones históricas. |
| Cancelación | [emailReminderManager.ts L245–294](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/reminders/emailReminderManager.ts#L245) usa `tasker.cancelWithReference(uuid, 'sendWorkflowEmails')` y elimina registro cuando se cancela la tarea; fallback SendGrid marca cancelado o elimina sin referencia. [WorkflowReminderRepository.ts](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/repositories/WorkflowReminderRepository.ts) filtra mensajes programados no cancelados. | Alta sobre mecanismos presentes, media sobre cobertura completa. Cancelar una tarea no demuestra que un proveedor no haya aceptado ya el mensaje; no se verificó la carrera en producción. |
| Series recurrentes | `WorkflowService.ts L190–229` aplica `isNormalBookingOrFirstRecurringSlot` a `NEW_EVENT`, pero no restringe con esa bandera los disparadores antes/después. Los trabajos se vinculan a `bookingUid` y opcionalmente asiento. | Inferencia, media: el diseño contempla distinguir notificación de nueva serie de avisos relativos de cada reserva. No se ejecutó una serie real ni se comprobó que todos los productores invoquen por ocurrencia. Nuestro diseño sí exige explícitamente un trabajo por cita individual. |
| Duplicados y reintentos | Unicidad de referencias en schema; [getWorkflowReminders.ts L211–227](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/getWorkflowReminders.ts#L211) selecciona email no programado, futuro hasta dos horas, no cancelado y `retryCount < 3`. | Alta sobre filtro histórico, baja sobre garantías globales. No se demostró índice único por cita/regla/versión, reclamo transaccional ni política homogénea de todos los canales. No se extrapola el límite a todo el producto. |
| Programación versus entrega | Schema distingue programación/cancelación/contador, y tasker recibe fecha/referencia. Esos campos no son recibos del destinatario ni un estado universal de entrega. | Inferencia fundada, alta: `scheduled` no significa entregado. No se verificó manejo completo de webhooks, aceptación del proveedor, errores definitivos o resultados inciertos. |
| Email, WhatsApp y servicios externos | [whatsappReminderManager.ts](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/lib/reminders/whatsappReminderManager.ts) calcula fecha, comprueba verificación y delega al despacho/proveedor. Email usa tasker; [API scheduleEmailReminders.ts](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/workflows/api/scheduleEmailReminders.ts) declara obsolescencia y conserva gestión SendGrid. | Alta sobre dependencias históricas, desconocido sobre configuración actual del SaaS. No se llamaron proveedores ni se obtuvieron credenciales. |

## Señales actuales que no deben confundirse

En el snapshot público actual `0f19cc46…`, `.github/workflows/cron-scheduleEmailReminders.yml` tiene comentarios de obsolescencia respecto a SMTP/tasker. El archivo de cron WhatsApp conserva un intervalo de 15 minutos; un cron residual no demuestra que su endpoint o servicio esté disponible. `apps/web/app/api/cron/bookingReminder/route.ts` recuerda al organizador solicitudes pendientes de aprobación, una función diferente del aviso de sesión al paciente. Los wrappers actuales `packages/features/bookings/lib/tasker/trigger/notifications/{confirm,reschedule}.ts` usan Trigger.dev y un servicio de notificaciones de reserva; no prueban por sí solos la ejecución/entrega de recordatorios previos. Estas observaciones se obtuvieron mediante árbol GitHub + `fetch_file` al commit actual, no mediante REA.

## Licencia, decisiones propias y preguntas pendientes

[Licencia histórica EE](https://github.com/calcom/cal.diy/blob/a17f28e9ab44d34a24840cff70082470d775b9b1/packages/features/ee/LICENSE), blob `a8c6744758303a74c18b8e4decd6058f747acb53`: código comercial con condiciones distintas para desarrollo/pruebas y producción. No se reutilizó. No se propone añadir dependencias de Cal.com ni contratar proveedores. La separación regla/trabajo/intento, claves versionadas, dos pasos de simulación, política de reintentos 5/15 minutos y bloqueo ante incertidumbre son decisiones propias, descritas en [la especificación](../REMINDERS_SPEC.md).

Pendiente de investigación futura: topología real del SaaS, workers y garantías del proveedor, carreras cancelación/envío, reprogramación completa por canal, actualización de reglas sobre reservas existentes, deduplicación transaccional, reconciliación de resultado incierto y recibos de entrega. Para responderlas haría falta un entorno autorizado de prueba y/o código de la versión desplegada. No se presenta este informe como certificación de equivalencia con Cal.com.
