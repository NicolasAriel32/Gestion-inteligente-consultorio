# Verificación de Recordatorios de sesión

Fecha: 2026-10-24. Rama `feat/appointment-reminders-demo`. Sin despliegue, mensajes reales, credenciales ni servicios contratados. Pruebas sobre checkout aislado de la demo; no sobre el SaaS de Cal.com.

## Revisión 1 — lógica y compilación

Runtime Node v24.22.1, TypeScript 5.6, Vite instalado 6.4.5. Dependencias existentes reutilizadas; no se agregaron paquetes. Suite `scripts/test-reminders.cjs`, con `node:test` y reloj inyectado como número UTC, sin esperas reales ni transporte. La comprobación de tipos la realiza `tsc -b` durante build.

```bash
npm install
npm run test:reminders
npm run test:recurrence
npm run build
# Equivalente para ambas suites:
npm test
```

Resultado final: **28/28 pruebas de recordatorios**, **8/8 de recurrencia**, **build TypeScript + Vite correcto**. Sin pruebas omitidas. npm emite un aviso del entorno sobre la opción `http-proxy`; no bloqueó pruebas ni compilación.

Cobertura de recordatorios: cálculo Buenos Aires/UTC y 24h; omisión de pasado e igualdad con ahora; confirmación; cancelación; reprogramación de fecha con versión; ocurrencias recurrentes independientes; ausencia/revocación/renovación de permisos; contacto inválido o inexistente; reconciliación/reclamo/resolución repetidos sin duplicados; fallos transitorios 5/15 minutos y límite de tres intentos; fallo permanente; resultado incierto y bloqueo de reemplazo automático; cancelación, cambio de versión y revocación entre reclamo y resolución; cita expirada; reintento demasiado cercano al inicio; canales independientes; exclusión de datos personales/clínicos de logs y mensajes; configuración/fechas inválidas; desactivación durante procesamiento; cambio de hora sin versión; cambio de destinatario; reglas semánticamente duplicadas y ausencia de intento en procesamiento.

La suite de recurrencia preexistente sigue comprobando cálculo semanal/quincenal, cruce de año y bisiesto, conflictos de lote, citas adyacentes/canceladas, IDs distintos, edición de una ocurrencia y revalidación de disponibilidad.

En la segunda lectura de lógica se corrigió además la conversión de fechas para consultar offsets IANA y rechazar cambios de hora ambiguos/inexistentes (dos pruebas históricas de Buenos Aires). Se detectaron otras dos mejoras: rechazar dos reglas con la misma anticipación/canal (aunque tengan IDs diferentes) y comprobar que existe el intento antes de invocar el adaptador ficticio. Se agregaron pruebas para ambas y se repitieron las dos suites y build. Estas garantías son locales en memoria; no prueban concurrencia distribuida ni persistencia.

## Revisión 2 — recorrido real en navegador

Chrome remoto, preview local `http://terminal.local:4173/`, tamaño observado aproximado 1348 × 926. Interacción mediante controles visibles, sin inyectar estado ni invocar funciones internas. Fecha de datos ficticios durante la sesión: 24/10/2026. Reloj inicial 08:00 Buenos Aires.

| Paso ejecutado | Resultado observado |
| --- | --- |
| Abrir Configuración y cambiar el aviso email a 1h, conservando WhatsApp 2h; aplicar | Reglas y trabajos futuros se actualizaron; trabajos de reglas anteriores quedaron cancelados. |
| Agenda → Nuevo turno; crear Sofía Martínez, 24/10, 17:00, confirmado | Cita nueva en agenda. En Configuración, filtro por esa cita mostró WhatsApp 15:00 y email 16:00. |
| Elegir fallo transitorio WhatsApp; adelantar con +1h hasta 15:00; Procesar vencidos | Trabajo WhatsApp “Procesando demo”, intento 1. |
| Resolver simulaciones | “Error simulado · Reintento programado”, próximo intento 15:05. |
| Cambiar WhatsApp a éxito; +5 minutos; procesar y resolver | “Simulado correctamente”, dos intentos. No se representó como mensaje enviado/entregado. |
| +1h hasta 16:05; procesar email; cancelar la cita antes de resolver; resolver | Email “Cancelado”, intento invalidado. El éxito simulado histórico de WhatsApp permaneció. |
| Seleccionar Mateo Fernández, 25/10 14:00; Editar esta cita → 15:00 | Trabajos anteriores cancelados; nuevos trabajos versión 2 para 25/10 14:00 email y 13:00 WhatsApp, coherentes con reglas 1h/2h. |
| Cancelar esa cita reprogramada | Nuevos trabajos versión 2 también cancelados. |
| Adelantar hasta después de la cita de Lucía | Trabajos aún pendientes quedaron cancelados al reconciliar; no hubo procesamiento tardío después del inicio. |
| Configurar ambos avisos email 1h y aplicar, después de la corrección | Error visible “No repitas la misma anticipación y canal en ambos avisos.” La configuración inválida no se aplicó. |

[Evidencia visual](reminders-browser-verification.jpg): cita ficticia cancelada, éxito histórico simulado WhatsApp y trabajo email cancelado, junto a los controles de adaptadores y texto neutro. Los modos seleccionados en la captura son entradas para próximas resoluciones, no una explicación retrospectiva del historial.

Durante QA se reemplazó el campo numérico libre de anticipación por opciones predefinidas para facilitar la demo y evitar valores parciales. Se repitió el recorrido con las opciones. Los intentos de automatizar el cambio de fecha en el input nativo no produjeron un cambio aplicado verificable; no se declara validado ese gesto en navegador. La reprogramación por **hora** sí se verificó visualmente, y la reprogramación por **fecha** está cubierta por prueba automatizada del servicio/motor. No se alteró el control de fecha preexistente a partir de esa observación aislada.

Después de corregir la conversión IANA, se recargó la versión final y se verificaron de nuevo los trabajos iniciales (Mateo: email 24/10 14:00 y WhatsApp 25/10 12:00 para su cita 25/10 14:00). Se adelantó el reloj a cada vencimiento: email produjo “Resultado incierto · Revisión manual”, y WhatsApp “Error simulado · Finalizado” con fallo permanente, un intento cada uno. [Captura de la versión final](reminders-browser-final.jpg). No se repitieron los gestos de reprogramación/cancelación después de este cambio aislado del conversor; sus pruebas automatizadas sí se repitieron.

## Alcance y pendientes de verificación

- Éxito, fallo transitorio, reintento, procesamiento, cancelación y reprogramación por hora: ejecutados en navegador.
- Fallo permanente e incertidumbre: también ejecutados en navegador en la versión final. Series, permisos, idempotencia y cambios de fecha: cubiertos mediante pruebas automatizadas; no se presenta cada uno como recorrido UI completado.
- Revisión visual de escritorio y etiquetas/estados accesibles, sin auditoría completa WCAG ni lector de pantalla. Layout responsive implementado con patrones existentes; no se verificó en dispositivo móvil físico ni desde dos dispositivos.
- No se probaron email/WhatsApp reales, entrega, webhooks, colas, reinicio de workers, múltiples pestañas, seguridad productiva o persistencia, porque no están implementados.
- La página pública sigue siendo demo sin autenticación del panel. No usar información real. Los componentes de recordatorios solo se renderizan en el panel, pero eso no equivale a autorización de servidor.
- REA sigue bloqueado por `ps`. Se conservó su error y salida parcial; la investigación complementaria es lectura directa, no una ejecución exitosa de REA.
