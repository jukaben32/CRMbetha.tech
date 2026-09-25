# Bitácora — CRM Agencia

Registro de decisiones y próximos pasos del CRM central de leads.

## Pendiente

- [ ] **Conectar todas las landing pages/SaaS que sigan el patrón de NailAtelier.**
  NailAtelier ya está conectado (`src/app/api/website/subscribe/route.ts`, avisa a
  `/api/leads` del CRM cuando `source === 'contact_form'`, con el `Origin` fijado a
  mano porque es una llamada servidor-a-servidor). Revisar cuáles otros proyectos
  usan el mismo patrón de `createWebsiteSubscriber` / `website_subscribers`
  (candidatos probables por estructura similar: Esteticall, NextStepPhysio,
  NoirInkStudio, StylePreviewBarberPro — verificar cada uno antes de asumir que
  el código es idéntico) y repetir la misma integración:
  1. Agregar el `slug` del proyecto a la tabla `projects` del CRM (con su
     `allowed_origin` real) si no existe todavía.
  2. Agregar el fetch best-effort a `/api/leads` en su endpoint server-side
     equivalente, solo para leads reales (no cualquier suscriptor).
  3. Verificar con `tsc --noEmit` / type-check propio del proyecto.
  4. Probar la llamada exacta contra `https://crm-agencia-tan.vercel.app/api/leads`
     antes de dar por buena la integración.
  5. Confirmar con el usuario antes de hacer push (dominio genérico *.vercel.app
     sin cliente real = más margen; dominio propio de un cliente real = pedir
     confirmación explícita primero, ver excepción abajo).

- [ ] Landing de la agencia (sin nombre todavía — "Betha" es candidato por el
  nombre del repo `CRMbetha.tech`, sin confirmar con el usuario).

- [ ] Facebook Lead Ads → n8n → `/api/leads` (Fase 9 del plan original).

## Excepción — NO tocar sin permiso explícito

`jukaben32/n8n-school-expert-landingpage` (Gran Manantial de Sabiduría) es la
**única** app del portafolio confirmada en producción real con un cliente real.
Ya se intentó conectarla (funcionaba) pero se revirtió a pedido del usuario para
no arriesgar esa app. No reabrir esa integración sin que el usuario lo pida.

## Hecho

- CRM desplegado en producción: https://crm-agencia-tan.vercel.app
- Fases 1–7 completas: login, esquema (`projects`/`leads`/`lead_notes`/`tasks`),
  endpoint público `/api/leads`, pantalla de leads, kanban, tareas + resumen
  diario por email, dashboard de métricas.
- NailAtelier conectado y desplegado.
