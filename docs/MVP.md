# MVP de Gestión Inteligente Consultorio

## Usuario principal

Profesional independiente de psicología que necesita ordenar su agenda, mantener los datos de contacto de sus pacientes y recibir solicitudes de turnos sin intercambiar tantos mensajes.

## Problema que resuelve

Centralizar en una vista simple los próximos turnos, los datos administrativos mínimos y las nuevas solicitudes de reserva.

## Alcance de esta demostración

1. **Agenda:** vista diaria, navegación entre días y turnos con hora, modalidad, tipo y estado.
2. **Pacientes:** búsqueda por nombre o email, datos de contacto y próximo turno.
3. **Reservas online:** vista previa de una futura página pública y formulario de solicitud simulado dentro del prototipo. Las solicitudes quedan pendientes hasta una confirmación humana.
4. **Persistencia de demo:** los turnos agregados se guardan en el almacenamiento local del navegador actual.
5. **Diseño adaptable:** interfaz de escritorio y navegación móvil.

## Criterios de aceptación del prototipo

- Se puede navegar entre Inicio, Agenda, Pacientes y Reservas online.
- Se puede crear un turno desde la agenda con nombre, tipo, fecha y horario.
- En la vista de reservas se puede simular una solicitud y verla como pendiente.
- Una solicitud nueva también aparece en el directorio de pacientes.
- El buscador filtra los pacientes por nombre o correo electrónico.
- Los turnos creados permanecen en el mismo navegador después de recargar.
- La interfaz informa que utiliza datos ficticios y no debe recibir datos reales.

## Fuera de alcance

- Historia clínica, diagnósticos, notas de sesión, evaluaciones, tratamientos y recetas.
- Pagos, facturación, videollamadas e integración con WhatsApp.
- Inicio de sesión, roles, base de datos remota y sincronización entre dispositivos.
- Publicación de una página pública real para reservas; el enlace de la demo no acepta solicitudes externas.
- Confirmación automática de solicitudes.

## Límites de seguridad del prototipo

La app no tiene backend ni controles de acceso. Los datos se almacenan localmente en el navegador y pueden ser vistos por otras personas con acceso al mismo dispositivo o perfil. Usar solo información ficticia hasta implementar autenticación, autorización, almacenamiento seguro, respaldo y revisión de privacidad.
