# Gestión Inteligente — Psicología

## Objetivo

Diseñar la primera fase visual de una aplicación SaaS para psicólogos independientes en Argentina, apta para una demostración comercial desde celular y computadora.

## Fase 1: interfaz y navegación

Incluye cinco pantallas navegables:

1. **Dashboard privado de demo:** turnos del día, próximas sesiones, solicitudes pendientes y acciones rápidas.
2. **Agenda:** calendario diario/semanal, filtro de estados, crear/editar/cancelar turnos y validación visual de superposiciones.
3. **Pacientes:** buscador, alta/edición de datos administrativos y ficha con historial de citas.
4. **Configuración:** perfil profesional, duración, modalidad, días/horarios y slug de la página pública.
5. **Reservas públicas:** perfil profesional, servicios, calendario de días habilitados, horarios disponibles y formulario de solicitud.

Las acciones usan estado en memoria de la pestaña. Una confirmación en pantalla siempre identifica que pertenece a la demo; no significa que haya sido enviada a un servidor.

## Datos y privacidad

- Nombres y datos de contacto ficticios reservados para demostración.
- No hay historia clínica, diagnósticos, notas terapéuticas ni tratamientos.
- No hay autenticación ni backend; el panel privado es una representación visual y no debe recibir datos reales.
- La ruta pública muestra solamente el perfil profesional ficticio, servicios y disponibilidad de demo. No recibe el listado de pacientes ni expone citas privadas.
- Los cambios se pierden al recargar y no se sincronizan entre dispositivos.

## Criterios de aceptación de fase 1

- Se navega por dashboard, agenda, pacientes, configuración y la ruta pública.
- Crear y editar una cita actualiza la agenda durante la sesión.
- La validación de demo impide turnos superpuestos según fecha, hora y duración.
- La vista semanal ofrece filtros por estado y una alternativa vacía cuando no hay turnos.
- La ficha administrativa permite crear, editar y consultar datos de contacto e historial de citas.
- La configuración permite modificar los días y horarios que aparecen en la página pública.
- La solicitud pública deja elegir servicio, fecha, horario, modalidad y datos básicos, y muestra explícitamente que es una simulación local.
- La disponibilidad no ofrece días u horarios que estén deshabilitados u ocupados en la demo.
- Las pantallas usan diseño responsive, foco visible, campos etiquetados, estados accesibles y botones con áreas táctiles cómodas.
- Se presentan estados de carga, vacío, error y éxito.

## No incluido en fase 1

- Persistencia real, autenticación, API, base de datos o sincronización.
- Confirmaciones por email, WhatsApp u otra integración.
- Historias clínicas, diagnósticos, pagos y facturación.
- Seguridad productiva, aislamiento multiusuario y auditoría.

## Plan posterior

### Fase 2 · Reservas funcionales

Persistencia, disponibilidad real, altas, cancelaciones y reprogramaciones.

### Fase 3 · Seguridad y validación

Autenticación, aislamiento por profesional, pruebas, revisión de privacidad y corrección de errores.

### Fase 4 · Demo comercial

Publicación controlada, perfil ficticio y pruebas desde dos dispositivos.
