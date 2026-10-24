# Gestión Inteligente Consultorio

Prototipo comercial para consultorios de psicología. Esta primera versión se enfoca en organizar la agenda, administrar datos básicos de pacientes y recibir solicitudes de turnos online.

## Alcance del MVP

- Agenda diaria con turnos y estados.
- Fichas administrativas mínimas de pacientes.
- Solicitud pública de turnos con disponibilidad de ejemplo.
- Datos de demostración ficticios y persistencia en el navegador.

No incluye historias clínicas, diagnósticos, notas de sesión, pagos ni teleconsultas. No cargues datos reales de pacientes: la demo guarda su información en el almacenamiento local del navegador y no cuenta con servidor, autenticación ni sincronización.

## Desarrollo local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Para generar la versión estática:

```bash
npm run build
npm run preview
```

## Publicación

La app está preparada como frontend estático y puede desplegarse en Vercel conectando este repositorio. La integración con una base de datos y reservas compartidas entre dispositivos queda para una fase posterior, después de validar el flujo con profesionales.

## Estado

Inicio del prototipo. La especificación y las decisiones de producto se irán registrando en `docs/MVP.md`.
