# Gestión Inteligente — Psicología

Prototipo visual para demostraciones comerciales de gestión de turnos para psicólogos independientes en Argentina.

## Fase actual: interfaz y navegación

- Dashboard privado de demostración con próximos turnos y solicitudes pendientes.
- Agenda diaria y semanal con filtros; crear, editar, confirmar y cancelar turnos en memoria.
- Directorio de pacientes con búsqueda, alta, edición y ficha administrativa con historial de citas.
- Configuración del perfil, duración, modalidad, días y horarios de atención.
- Página pública de reservas con selección de servicio, fecha, horario y modalidad.
- Componentes reutilizables con Tailwind CSS, Radix UI y patrones visuales de shadcn/ui.
- Datos completamente ficticios; no hay historia clínica ni notas terapéuticas.

## Importante sobre esta demo

Los cambios viven únicamente en la memoria de la pestaña y se pierden al recargar. No hay backend, base de datos, autenticación, sincronización ni reservas enviadas a un servidor. El panel no está protegido por login. No uses datos reales de pacientes ni compartas el enlace como un sistema operativo. La página pública solo muestra perfil profesional y disponibilidad de demostración; no muestra el directorio ni la información del panel.

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Build local:

```bash
npm run build
npm run preview
```

## Rutas de la demo

- `/`: panel de demostración.
- `/reservar/martina-rios`: vista pública de reserva.

La configuración de Vercel reescribe `/reservar/*` hacia la aplicación estática para que la ruta pública pueda abrirse directamente.

## Fases siguientes

1. **Reservas funcionales:** persistencia, disponibilidad real, creación, cancelación y reprogramación.
2. **Seguridad y validación:** autenticación, aislamiento por profesional, protección de datos y pruebas.
3. **Demo comercial:** publicación controlada y validación desde dos dispositivos.

No avanzar con backend productivo hasta aprobar el diseño de esta fase.

## Horarios habituales

Desde Nuevo turno se puede previsualizar una serie semanal o quincenal de 2 a 24 sesiones. Los conflictos bloquean el lote completo; editar una cita modifica solo esa sesión. Demo en memoria.

- [Especificación propia](docs/RECURRING_APPOINTMENTS.md)
- [Informe de investigación y limitación de REA](docs/research/REA_CAL_REPORT.md)
- [Dos revisiones y resultados](docs/research/RECURRENCE_VERIFICATION.md)

Pruebas: `npm run test:recurrence`.

## Recordatorios de sesión

Prototipo en memoria disponible en Configuración y desde cada cita de Agenda. Permite uno o dos avisos, permisos por canal, vista previa neutra, reloj simulado, reintentos limitados y resultados ficticios. No envía email ni WhatsApp.

- [Especificación independiente](docs/REMINDERS_SPEC.md)
- [Investigación, fuentes y bloqueo de REA](docs/research/REMINDERS_REA_REPORT.md)
- [Verificación automatizada y recorrido en navegador](docs/research/REMINDERS_VERIFICATION.md)

```bash
npm run test:reminders
npm run test:recurrence
npm run build
```

`npm test` ejecuta ambas suites. Para demostrar: configurar avisos, crear una cita confirmada con paciente ficticio habilitado, adelantar el reloj hasta un aviso, presionar “Procesar vencidos” y luego “Resolver simulaciones”. Los resultados se seleccionan por canal. Recargar restablece toda la demo.
