# Hallazgos post-meet 21/04 y deltas al plan

> **Para revisión de Federico antes de cerrar el plan.**
>
> Este documento NO reemplaza a los docs `00` a `08` (plan original armado en base al meet del 21/04). Solo recoge lo que apareció **después** de ese meet —principalmente la información que envió José por correo— y lo confronta con el plan vigente, marcando lo que cambia, lo que abre preguntas nuevas y lo que ya se implementó como propuesta.

---

## 1. Información nueva del cliente (post-meet)

José envió **`JOSE INFORMACION.docx`** (en la raíz del repo del proyecto, fuera de `jose-blog/`) con el detalle de los servicios. Este documento llegó después de la reunión, en línea con lo que cerró Federico al final del meet:

> *"Lo único que yo te voy a pasar ahora es, bueno, ya los que quedaron, que vos nos digas los nombres, perfecto, y que nos envíes un poco de información y después nosotros con inteligencia artificial y eso vamos mejorando esa información. **Quedaron estos ocho al final**, vamos modificando esa información para ya completar toda la información."*  
> — Federico, min 13:46 del meet

El docx contiene **8 marcas comerciales** del estudio, cada una con su propio:
- Nombre
- Bloque "Quiénes somos" (1 párrafo institucional)
- Lista de servicios (entre 21 y 30 ítems por marca)
- Bloque "Información de la asesoría que se da" (descripción metodológica)

### Las 8 marcas

| #   | Marca                               | Foco                                                                   | Servicios |
| --- | ----------------------------------- | ---------------------------------------------------------------------- | --------- |
| 1   | Escudo Tributario                   | Asesoría legal tributaria, defensa fiscal SUNAT/Tribunal Fiscal        | 21        |
| 2   | Defensa Legal Empresarial & Consumo | Indecopi, conflictos comerciales, contratos, delitos financieros       | 25        |
| 3   | Derecho Laboral 360 Pro             | Cumplimiento laboral, SUNAFIL, despidos, planillas, juicios laborales  | 26        |
| 4   | Familia & Patrimonio                | Alimentos, divorcios, herencias, sucesiones, patrimonio familiar       | 25        |
| 5   | Tributa Fácil                       | Tributario simple para emprendedores, MYPE, RUC, regímenes             | 21        |
| 6   | Costos Híbridos 360                 | Sistemas de costos para minería, industria y servicios                 | 26        |
| 7   | Estudio Contable JL                 | Contabilidad mensual, estados financieros, libros electrónicos, PLE    | 29        |
| 8   | Payroll 360 Pro                     | Planillas, beneficios sociales, software RRHH                          | 30        |

**Volumen total:** 8 marcas × ~26 servicios promedio = **~203 ítems** de contenido a cargar y mantener.

---

## 2. Confrontación con el plan vigente

### Pregunta abierta del plan que ya tiene respuesta

El doc `05-PREGUNTAS-CLIENTE.md` lista como bloqueante:

> **#10 — Servicios reales:** *"Federico entendió que es UN servicio principal con sub-servicios. Confirmar el nombre del servicio principal y los sub-servicios. (Ej. 'Asesoría tributaria', sub-servicios: consultas, planificación, defensa fiscal...)"*

**El docx la responde:** no es un servicio principal con sub-servicios. Son **8 marcas independientes**, cada una con identidad propia y su propia lista de servicios. Esto cambia varios tickets del backlog (ver §3).

> **#11 — Páginas adicionales por servicio:** *"Cliente mencionó 'consultas tributarias' como página separada. ¿Qué páginas adicionales requiere y qué contenido?"*

**El docx + transcripción la responden:** una página por marca. En la reunión José dijo *"tal cual esto se debería desarrollar para, por ejemplo, consultas tributarias"* (min 11:02) y Federico contestó *"sería otra página"*. Cruzando con el docx, son las 8 marcas.

### Decisión que tomó el plan vigente que conviene revisar

El meet (min 8:59 - 9:30) dejó las páginas institucionales como **estáticas**:

> *"Lo que es inicio de soluciones, esto va a quedar estático, todo esto. Lo que se va a alimentar todo el tiempo va a ser los blogs."* — Federico

Pero José preguntó dos veces si se podían modificar (*"¿no se puede modificar?"*). Y mirando el volumen del docx:

- 8 × ~26 servicios = ~200 líneas de contenido fluctuante.
- Las normas tributarias y laborales en Perú cambian con regularidad, y los servicios reflejan esas normas (CTS, gratificaciones, IGV, ITAN, etc.).
- Si las 8 páginas quedan hardcoded, **cada cambio futuro es un ticket a SyroxTech + deploy.**

**Recomendación a evaluar:** convertir las páginas de marca en contenido editable desde el panel admin (modelo CMS). Cuesta ~2-3 días extra al inicio pero le saca a SyroxTech la dependencia operativa y le da a José autonomía. Pendiente de confirmar con José.

### Pregunta nueva que no estaba contemplada

**¿Las 8 marcas son una sola operación comercial o pueden necesitar identidad independiente (subdominios o dominios separados)?**

El plan vigente asume "un solo estudio = un solo sitio = un solo dominio" (`06-SPRINT-PLAN.md:340` descarta multi-tenant explícitamente). Con la información del docx esa premisa sigue siendo válida funcionalmente, pero si en algún momento José querría hacer marketing pagado independiente para "Tributa Fácil" (B2C) vs "Escudo Tributario" (B2B premium), eso requeriría arquitectura distinta. Conviene preguntárselo antes de comprar dominios o configurar publicidad.

### Identidad visual por marca

El meet (min 11:19 - 11:50) dejó decidido que cada **blog** tendría color distinto. No se conversó nada sobre identidad visual por **marca**. Si José quiere paleta y tipografía específicas por marca (lo cual sería razonable dado que tienen audiencias muy distintas: emprendedores vs. empresas industriales), eso debería entrar al alcance.

---

## 3. Tickets del backlog que el delta afecta

Los siguientes tickets del `07-BACKLOG-JIRA.md` se diseñaron asumiendo "1 servicio principal con sub-servicios". Con la información nueva ya **no aplican tal cual** y conviene revisarlos antes de ejecutarlos:

### JB-506 — Página `/servicios/[slug]` template

Original asume hero, descripción rich content, lista de sub-servicios, CTA, sidebar de blog relacionado. **Funcionalmente sigue aplicando**, pero el path probablemente debería ser `/marcas/[slug]` (son marcas, no servicios) y la "lista de sub-servicios" pasa a ser una entidad anidada con su propia tabla.

### JB-507 — Migración tabla `services`

Original propone una tabla plana: `services(id, slug, name, description, hero_image, content jsonb, display_order, is_active, related_category, accent_color, seo_title, seo_description, ...)`. Eso modela bien una marca, pero no contempla la **lista anidada de servicios por marca** (los ~26 ítems). Convendría desdoblarlo en dos tablas: una cabecera (la marca) y una hija (los servicios de esa marca).

### JB-508 — RLS services

Sin cambios conceptuales: lectura pública si activo, escritura solo admin. Solo cambia el nombre de la tabla.

### JB-509 — Admin CRUD servicios

Sin cambios conceptuales. Solo se agrega un sub-form para gestionar la lista de servicios anidados de cada marca (agregar / eliminar / reordenar / activar-desactivar).

---

## 4. Implementación-propuesta ya armada (revisar antes de aceptar)

Como la sesión avanzó hasta aquí, **se dejó armado un módulo "Marcas" funcional** que materializa la propuesta de §2 y §3, pensado como punto de discusión, no como decisión cerrada. Está todo separable: si Federico decide otro modelo, se descartan estos archivos sin afectar el resto del proyecto.

### Archivos creados (todos nuevos, ningún archivo del plan original fue modificado)

**Migrations Supabase** (`supabase/migrations/`):

- `20260701000001_brands.sql` — tablas `brands` (cabecera de marca) y `brand_services` (servicios anidados). Soft delete en `brands`. Índices en `slug`, `is_active`, `display_order`, `brand_id`.
- `20260701000002_rls_brands.sql` — RLS: lectura pública si `is_active=true and deleted_at is null`, escritura solo `is_admin()`. Reutiliza la función `is_admin()` ya definida en `20260501000004_rls_profiles_taxonomy.sql`.
- `20260701000003_brands_seed.sql` — seed con las 8 marcas y los ~203 servicios reales del docx (no placeholders).

**Backend / data access** (`src/lib/`):

- `validators/brand.ts` — Zod schemas para marca y servicios anidados.
- `queries/brands.ts` — `getActiveBrands`, `getBrandBySlug` (con servicios), `getAllBrandsAdmin` (con conteo), `getBrandByIdAdmin`.

**Páginas públicas** (`src/app/(public)/marcas/`):

- `page.tsx` — listado en cards de las marcas activas.
- `[slug]/page.tsx` — Server Component con hero, "Quiénes somos", grid de servicios, "Cómo trabajamos" y CTA. SEO con `generateStaticParams` + `generateMetadata`. `revalidate = 300`.

**Admin CRUD** (`src/app/admin/marcas/`):

- `page.tsx` — listado con badge de servicios, estado, fecha, acciones.
- `nuevo/page.tsx` y `[id]/page.tsx` — comparten `brand-form.tsx` (Client Component con state local).
- `services-editor.tsx` — sub-componente con la lista de servicios anidados (agregar / eliminar / reordenar / activar-desactivar).
- `brand-row-actions.tsx` — toggle visible / soft delete con confirmación.
- `actions.ts` — server actions: `createBrand`, `updateBrand`, `deleteBrand`, `toggleBrandActive`. Todas con auth + role check + Zod `safeParse`.

**Componente compartido** (`src/components/shared/`):

- `whatsapp-cta.tsx` — botón reutilizable con número desde `NEXT_PUBLIC_WHATSAPP_NUMBER` y mensaje pre-cargado por contexto. Reemplaza la necesidad de armar uno por página.

### Decisiones técnicas tomadas en esta implementación

- **Texto plano con saltos de línea, no rich text.** Para `about_text` y `asesoria_text`. Si Federico prefiere TipTap como en `posts`, se cambia el campo y se agrega el editor.
- **Reemplazo total de servicios al editar marca.** El form sobrescribe la lista entera de `brand_services` en cada update. Tabla chica (~26 filas), no requiere diff fino.
- **Soft delete solo en `brands`.** Los `brand_services` se borran físicamente con `on delete cascade`.
- **`/marcas/[slug]` como path.** Decisión tentativa, pendiente confirmar.
- **Color por marca aplicado vía `style` inline.** Sin clases dinámicas (Tailwind no lo soporta) ni CSS variables a nivel de root. Funciona pero es prosa, podría refactorizarse a CSS vars si lo amerita.

### Lo que queda pendiente aunque se acepte esta propuesta

- Agregar entry "Marcas" al sidebar del admin (no encontré el archivo del sidebar a tiempo).
- Linkear desde `/sobre-nosotros` al listado `/marcas`.
- Decidir si el listado `/marcas` tiene su propia entry en el menú principal del header o queda como sub-página.
- Subida de hero image desde el admin (hoy es campo URL, sin upload directo a Storage).

---

## 5. Lo que recomendamos pasarle a José antes de seguir

Bloque corto para confirmar 3 puntos:

> 1. ¿Las 8 marcas que mandaste van a vivir en una misma web (`tusitio.com/marcas/escudo-tributario`, etc.) o cada una tendría que ir en su propio dominio para hacer publicidad por separado?
> 2. ¿Querés poder editar vos mismo desde el panel los textos y la lista de servicios de cada marca, o preferís pedirnos los cambios cuando haga falta?
> 3. ¿Cada marca tiene logo, paleta o guía de marca propia, o las trabajamos con una identidad común y un color de acento por marca?

Con esas 3 respuestas se cierra el alcance del módulo y se puede ejecutar JB-506 a JB-509 con seguridad —ya sea con la implementación propuesta acá o con otra que decida Federico.
