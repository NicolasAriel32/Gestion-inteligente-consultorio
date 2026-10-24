# Horario habitual del paciente — especificación propia

## Flujo de demo
Nuevo turno → paciente, fecha, horario configurado → Repetir como horario habitual → Semanal o Quincenal → 2 a 24 sesiones, incluyendo la primera → vista previa completa → Agregar serie a la demo.

Una fecha ocupada se señala y bloquea el lote completo. El usuario cambia el inicio o el horario; no se omiten citas silenciosamente. No hay carga parcial.

## Modelo
AppointmentSeries: id, anchorDate, intervalWeeks, count, timeZone America/Argentina/Buenos_Aires.
Appointment: serie opcional (seriesId) e índice original (occurrenceIndex). Cada cita tiene su identidad, fecha, duración y estado independientes. La regla se conserva al editar una ocurrencia; esa ocurrencia actúa como excepción y no se regenera automáticamente.

La fecha se calcula como fecha de calendario, sin sumar milisegundos a instantes locales. La hora HH:mm se conserva como hora de Buenos Aires. UTC se utiliza solo para aritmética de fechas, no para declarar que la sesión ocurre a esa hora UTC.

## Criterios
- Cada serie produce exactamente N citas, con diferencia de 7 o 14 días.
- Las fechas se previsualizan y validan todas antes de aplicar.
- Sesiones adyacentes permitidas; cualquier solapamiento real bloquea.
- Citas canceladas liberan disponibilidad.
- Editar una cita modifica solo su id y conserva duración y vínculo.
- La disponibilidad pública refleja los espacios ocupados por la serie.
- Cambios solo en memoria, reinicio al recargar.

## Pendientes
Editar esta y las siguientes, pausar series, omitir o resolver individualmente fechas ocupadas, notificaciones, persistencia transaccional y control de concurrencia de servidor. No se incorporaron backend ni datos clínicos.
