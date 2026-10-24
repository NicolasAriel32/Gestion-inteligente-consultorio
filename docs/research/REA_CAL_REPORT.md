# Investigación de recurrencia: Cal.com / Cal.diy

## Alcance y estado
Se ejecutó REA 6.7.0 mediante CLI oficial rea-agents sobre cuatro archivos de código público de Cal.diy, obtenidos del repositorio al que redirige calcom/cal.com. No se analizó una sesión autenticada de Cal.com ni se inspeccionó su backend productivo. El análisis estático de REA quedó PARCIAL: produjo inventario y huellas, pero interrumpió el parseo antes de obtener semántica por un fallo del entorno con ps (process-ownership, capability_unavailable). El JSON original se conserva en rea-cal-evidence.json. No equivale a una ingeniería inversa completa.

## Evidencia
Snapshot: 0f19cc46ef6b6426ee398c670575b3c96be7af9e
Archivos seleccionados:
- https://github.com/calcom/cal.diy/blob/0f19cc46ef6b6426ee398c670575b3c96be7af9e/packages/features/eventtypes/components/tabs/recurring/RecurringEventController.tsx
- https://github.com/calcom/cal.diy/blob/0f19cc46ef6b6426ee398c670575b3c96be7af9e/packages/features/eventtypes/components/tabs/recurring/EventRecurringTab.tsx
- https://github.com/calcom/cal.diy/blob/0f19cc46ef6b6426ee398c670575b3c96be7af9e/packages/features/bookings/lib/service/RecurringBookingService.ts
- https://github.com/calcom/cal.diy/blob/0f19cc46ef6b6426ee398c670575b3c96be7af9e/packages/lib/recurringStrings.ts

Hallazgos de lectura directa del código, NO atribuidos a REA:
- El controlador permite activar recurrencia, elegir intervalo, frecuencia y cantidad máxima. En este snapshot, la configuración inicial es semanal con 12 citas.
- El propio controlador incluye una advertencia de funcionalidad experimental relacionada con disponibilidad. Por ello no lo tomamos como prueba de fiabilidad de todos los casos.
- El servicio procesa una lista de reservas y reutiliza el servicio de reserva individual. Mantiene referencias de la serie y trata los avisos de manera diferenciada.
- Un parámetro limita parte de las comprobaciones de disponibilidad; su efecto total depende del servicio de reserva individual no incluido. No se concluye que Cal.com permita superposiciones.

Límites: cuatro archivos seleccionados, dependencias externas sin recuperar, sin recorrido del SaaS ni verificación de permisos/planes; ninguna afirmación de equivalencia con el producto alojado actual. Código ajeno no incorporado a nuestra app.

## Decisión propia
Crear Horario habitual del paciente, con regla separada y citas independientes vinculadas. Validar TODAS las fechas antes de aplicar el lote; rechazar el lote completo ante un conflicto. La edición inicial afecta una sola sesión y conserva duración y pertenencia. Frecuencia semanal o quincenal, entre 2 y 24 sesiones, en hora local de Buenos Aires.

## Ejecución reproducible
Node v24.22.1.
Comando: npx -y rea-agents@6.7.0 analyze-javascript-application <directorio-de-los-cuatro-archivos> --format json
Resultado: exit 1, capability_unavailable. REA inventarió artefactos y no completó el análisis semántico. Para concluirlo es necesario repetir el mismo análisis en un entorno Linux con ps/procps funcional o una máquina compatible; no se alteró ni falseó la inspección de procesos.
