# Plan del Proyecto — Índice

Documentación maestra para transformar el prototipo visual actual en un sistema productivo con Supabase.

## Documentos

| # | Documento | Descripción |
|---|---|---|
| 01 | [Resumen ejecutivo](./01-RESUMEN-EJECUTIVO.md) | Vista general, stack, alcance, estimación, riesgos clave |
| 02 | [Auditoría del estado actual](./02-AUDITORIA.md) | Pantallas, flujos, deuda técnica detectada |
| 03 | [Modelo funcional](./03-MODELO-FUNCIONAL.md) | Módulos, roles, entidades, eventos, métricas |
| 04 | [Arquitectura Supabase](./04-ARQUITECTURA-SUPABASE.md) | Schema SQL completo, RLS, Storage, Edge Functions |
| 05 | [Preguntas para el cliente](./05-PREGUNTAS-CLIENTE.md) | Bloqueantes y datos a solicitar |
| 06 | [Plan de sprints](./06-SPRINT-PLAN.md) | Sprints 0-6 con objetivos, tareas, entregables |
| 07 | [Backlog Jira completo](./07-BACKLOG-JIRA.md) | ~127 tareas con prompts para Claude Code |
| 08 | [Roadmap, riesgos y orden de ejecución](./08-ROADMAP-Y-RIESGOS.md) | Roadmap funcional/técnico, riesgos, anti-roadmap |

## Resumen rápido

- **Estado:** Prototipo visual completo, sin backend.
- **Objetivo:** Sistema productivo con Supabase.
- **Stack:** Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + Resend.
- **Timeline:** 8-10 semanas para 1 dev senior.
- **Sprints:** 7 (Sprint 0 prep + 6 sprints feature).
- **Tareas Jira:** ~127.
- **Bloqueantes:** decisión sobre "seguimiento de casos" + entrega de contenido por cliente.

## Cómo usar este plan

1. **Cliente:** revisar [01-Resumen ejecutivo](./01-RESUMEN-EJECUTIVO.md) y [05-Preguntas](./05-PREGUNTAS-CLIENTE.md). Aprobar scope y resolver bloqueantes.
2. **Tech lead:** revisar [02-Auditoría](./02-AUDITORIA.md), [04-Arquitectura](./04-ARQUITECTURA-SUPABASE.md), [06-Sprint plan](./06-SPRINT-PLAN.md). Validar y ajustar.
3. **Equipo:** trabajar tarea por tarea desde [07-Backlog](./07-BACKLOG-JIRA.md). Cada tarea tiene su prompt para Claude Code.
4. **PM:** subir todo a Jira proyecto JB usando los formatos definidos.
