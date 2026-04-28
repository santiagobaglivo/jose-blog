# Preguntas para el cliente y datos a solicitar

## Bloqueantes para arrancar (responder antes de Sprint 1)

### Producto
1. **Sistema de "seguimiento de casos":** ¿Es un portal con login donde el cliente ve el estado de su caso, o solo gestión interna del estudio? Federico lo absorbió como formulario de contacto + gestión interna. **Necesitamos confirmación explícita.**
2. **Comentarios anónimos vs registrados:** ¿Se permite comentar sin estar registrado (con nombre + email + moderación), o exigimos registro previo?
3. **Foros — acceso:** ¿Cualquiera puede leer foros sin login, o solo registrados? ¿Crear hilo requiere registro? Asumimos: leer público, escribir registrado.
4. **Multilenguaje:** ¿MVP en español argentino o también peruano? El cliente es de Perú pero el contenido es genérico hispano. ¿Hay terminología regional a respetar?
5. **Newsletter:** ¿Se envía newsletter automatizado con nuevos artículos? (default MVP: NO)
6. **Pagos / Stripe:** ¿Se integra ahora o queda para fase 2? (default: fase 2)

### Identidad / contenido
7. **Nombre real del estudio:** El prototipo usa "Velázquez & Asociados" como ejemplo. **¿Cuál es el nombre real?**
8. **Logotipo:** ¿Tiene logo? Necesitamos SVG o PNG en alta resolución.
9. **Slogan / tagline oficial.**
10. **Servicios reales:** Federico entendió que es UN servicio principal con sub-servicios. Confirmar el nombre del servicio principal y los sub-servicios. (Ej. "Asesoría tributaria", sub-servicios: consultas, planificación, defensa fiscal...)
11. **Páginas adicionales por servicio:** Cliente mencionó "consultas tributarias" como página separada. ¿Qué páginas adicionales requiere y qué contenido?
12. **Sobre el estudio:** Texto institucional real (historia, misión, valores), foto/foto de equipo, profesionales con foto + bio + matrícula.
13. **Datos de contacto reales:** dirección, teléfono, email, horario.
14. **Número de WhatsApp Business** (con código país).
15. **Cuentas de redes sociales** (LinkedIn, Twitter/X, Instagram, Facebook si aplican).

### Visual
16. **Fotografía institucional:** ¿Cliente provee fotos del estudio/equipo o usamos banco de imágenes premium (Unsplash/Pexels)?
17. **Hero carousel:** ¿Cuántas imágenes? ¿Provee el cliente las imágenes o las elegimos?
18. **Color por categoría/blog:** Confirmar paleta de acentos por categoría (ej. impuestos=ámbar, contabilidad=verde, empresas=azul, etc.) o si lo decidimos nosotros.
19. **Tono de marca:** ¿Más conservador, moderno, fresco? El prototipo apuesta por "editorial premium institucional moderno" — confirmar.

### Operativo
20. **¿Quién será admin?** Solo Jose Luis o varios profesionales del estudio. ¿Cuántos usuarios admin estimados?
21. **Email para notificaciones:** ¿Qué email recibe alertas de comentarios pendientes y nuevos casos?
22. **Dominio:** ¿Tiene dominio comprado? ¿DNS gestionado por el cliente o lo hacemos nosotros?
23. **Aviso de privacidad / términos:** ¿Tiene textos legales o necesitamos generarlos? (en Perú, ley de protección de datos personales)
24. **GA / Pixel:** ¿Quiere Google Analytics o Tag Manager?

## Datos a solicitar específicamente

### Mínimo viable para lanzar
- [ ] Nombre estudio + tagline + logo (SVG)
- [ ] Texto "Sobre el estudio" (mínimo 200 palabras)
- [ ] 3-5 servicios con descripción (50-100 palabras cada uno)
- [ ] Datos de contacto: dirección, teléfono, email, WhatsApp, horarios
- [ ] 3-5 fotos institucionales (alta calidad, mínimo 1920×1080 para hero)
- [ ] Bio de 2-3 profesionales (foto + nombre + rol + descripción de 50 palabras)
- [ ] Email del admin para recibir notificaciones
- [ ] 5 artículos iniciales reales (título, contenido, categoría, imagen) — para no lanzar con blog vacío
- [ ] Aviso de privacidad y términos (o autorización para generar plantilla)

### Deseable
- [ ] Video institucional corto (30-60s) para hero o sección about
- [ ] Testimonios de clientes (con foto, nombre, empresa)
- [ ] Casos de éxito o números clave
- [ ] Preguntas frecuentes (FAQs) para nutrir el blog/foro

## Decisiones técnicas pendientes (sin bloquear desarrollo)

| # | Decisión | Default | Confirmar con |
|---|---|---|---|
| 1 | Editor de blog | TipTap | — |
| 2 | Email provider | Resend | Jose / Federico |
| 3 | Hosting | Vercel | — |
| 4 | Paleta por categoría | Definimos nosotros | Jose |
| 5 | OAuth providers | Solo email/pass MVP | — |
| 6 | Captcha | Honeypot + rate-limit MVP, Turnstile post-MVP | — |
| 7 | Comentarios anónimos | Permitir con moderación obligatoria | Jose |
| 8 | Soft delete retention | 30 días | — |
| 9 | Programación blog | Cron c/5min vía pg_cron | — |
| 10 | Storage transformation | Resize en Edge Function al subir | — |
