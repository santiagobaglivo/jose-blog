-- Seed inicial con las 8 marcas comerciales del estudio.
-- Contenido original provisto por el cliente (JOSE INFORMACION.docx).
-- Los textos pueden ajustarse luego desde el panel admin sin migration adicional.

-- 1. Escudo Tributario
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'escudo-tributario',
    'Escudo Tributario',
    'Asesoría legal tributaria y defensa fiscal frente a SUNAT',
    $b$Escudo Tributario es una marca especializada en asesoría legal tributaria, defensa fiscal y estrategia frente a SUNAT, Tribunal Fiscal y Poder Judicial. Brindamos acompañamiento a empresas industriales, mineras, de servicios, emprendedores y personas naturales en situaciones preventivas, correctivas y contenciosas, combinando análisis legal, contable, tributario y documental. Nuestro objetivo es proteger la posición tributaria del cliente, reducir contingencias fiscales y construir una defensa técnica sólida frente a auditorías, fiscalizaciones, requerimientos, reparos, multas, cobranza coactiva y procesos tributarios.$b$,
    $b$La asesoría de Escudo Tributario se inicia con la revisión integral del caso tributario: declaraciones, libros electrónicos, comprobantes de pago, estados financieros, requerimientos SUNAT, resoluciones, anexos, notificaciones y demás documentación vinculada. Luego se identifica el riesgo fiscal, la base legal aplicable, la posición de la Administración Tributaria y las opciones de defensa o regularización. La asesoría puede ser preventiva, correctiva o defensiva. El enfoque principal es construir una posición tributaria sustentada con normas, jurisprudencia, documentación contable y estrategia legal.$b$,
    '#1e3a5f', 1,
    'Escudo Tributario | Asesoría legal tributaria y defensa fiscal',
    'Defensa frente a SUNAT, Tribunal Fiscal y Poder Judicial. Fiscalizaciones, reparos, multas y cobranza coactiva.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Asesoría legal tributaria preventiva', 1),
  ('Diagnóstico de contingencias tributarias', 2),
  ('Atención de cartas inductivas SUNAT', 3),
  ('Atención de esquelas de citación', 4),
  ('Respuesta a requerimientos tributarios', 5),
  ('Acompañamiento en fiscalizaciones SUNAT', 6),
  ('Defensa frente a reparos tributarios', 7),
  ('Elaboración de descargos', 8),
  ('Recursos de reclamación', 9),
  ('Recursos de apelación ante el Tribunal Fiscal', 10),
  ('Demandas contencioso administrativas tributarias', 11),
  ('Defensa frente a órdenes de pago', 12),
  ('Defensa frente a resoluciones de determinación', 13),
  ('Defensa frente a resoluciones de multa', 14),
  ('Análisis de prescripción tributaria', 15),
  ('Fraccionamientos y aplazamientos', 16),
  ('Compensaciones tributarias', 17),
  ('Revisión de IGV, Impuesto a la Renta, ITAN, detracciones, retenciones y percepciones', 18),
  ('Soporte en cobranza coactiva', 19),
  ('Asesoría en riesgo penal tributario', 20),
  ('Elaboración de informes tributarios', 21)
) as t(name, ord);

-- 2. Defensa Legal Empresarial & Consumo
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'defensa-legal-empresarial',
    'Defensa Legal Empresarial & Consumo',
    'Protección legal de empresas frente a Indecopi y conflictos comerciales',
    $b$Defensa Legal Empresarial & Consumo es una marca orientada a la protección legal de empresas frente a conflictos comerciales, administrativos, civiles, penales y de consumo. Brindamos asesoría y defensa frente a reclamos de consumidores, procedimientos ante Indecopi, competencia desleal, conflictos contractuales, incumplimientos comerciales, delitos financieros, fraudes empresariales y controversias derivadas de la actividad económica. Nuestro enfoque es proteger la continuidad del negocio, la reputación empresarial, los activos, los contratos y la posición legal de la empresa frente a clientes, proveedores, competidores, autoridades y terceros.$b$,
    $b$La asesoría de Defensa Legal Empresarial & Consumo parte del análisis de la operación empresarial y del conflicto concreto. Se revisan contratos, correos, conversaciones, comprobantes, reclamos, actas, publicidad, términos comerciales, órdenes de compra, cotizaciones, facturas, constancias de entrega, evidencias digitales y antecedentes del caso. A partir de esa revisión se define la estrategia: prevención, negociación, respuesta formal, defensa administrativa, conciliación, denuncia, demanda civil o estrategia penal empresarial. El servicio está diseñado para empresas que necesitan actuar con rapidez, orden y sustento documental frente a controversias que pueden afectar su operación, reputación o estabilidad económica.$b$,
    '#0f5f4e', 2,
    'Defensa Legal Empresarial & Consumo | Indecopi y conflictos comerciales',
    'Defensa ante Indecopi, competencia desleal, contratos, delitos financieros y conflictos empresariales.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Defensa en procedimientos ante Indecopi', 1),
  ('Asesoría en protección al consumidor', 2),
  ('Respuesta a reclamos de consumidores', 3),
  ('Gestión del Libro de Reclamaciones', 4),
  ('Defensa por presunta falta de idoneidad del producto o servicio', 5),
  ('Defensa por publicidad engañosa', 6),
  ('Asesoría en promociones, ofertas y publicidad comercial', 7),
  ('Procedimientos por competencia desleal', 8),
  ('Denuncias y defensa por actos de confusión, engaño, denigración o comparación indebida', 9),
  ('Asesoría en barreras burocráticas', 10),
  ('Revisión de contratos empresariales', 11),
  ('Elaboración de contratos comerciales', 12),
  ('Cartas notariales empresariales', 13),
  ('Incumplimiento contractual', 14),
  ('Cobranza extrajudicial y judicial', 15),
  ('Responsabilidad civil empresarial', 16),
  ('Procesos civiles derivados de relaciones comerciales', 17),
  ('Procesos penales vinculados a la empresa', 18),
  ('Asesoría en delitos financieros', 19),
  ('Estafa, fraude, apropiación ilícita y administración fraudulenta', 20),
  ('Delitos contra la confianza y buena fe en los negocios', 21),
  ('Defensa frente a denuncias administrativas', 22),
  ('Auditoría legal de riesgos empresariales', 23),
  ('Asesoría en comercio electrónico y ventas digitales', 24),
  ('Elaboración de políticas comerciales y términos y condiciones', 25)
) as t(name, ord);

-- 3. Derecho Laboral 360 Pro
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'derecho-laboral-360',
    'Derecho Laboral 360 Pro',
    'Asesoría laboral integral, SUNAFIL y gestión de personal',
    $b$Derecho Laboral 360 Pro es una marca especializada en asesoría laboral integral, cumplimiento normativo, gestión de personal y defensa frente a conflictos laborales. Brindamos soporte a empresas en la prevención, corrección y defensa de contingencias laborales, incluyendo contratos, planillas, beneficios sociales, medidas disciplinarias, despidos, fiscalizaciones SUNAFIL, reclamos de trabajadores y procesos judiciales laborales. Nuestro enfoque es ayudar a la empresa a gestionar correctamente sus relaciones laborales, reducir riesgos y responder de manera estratégica ante inspecciones, auditorías o conflictos.$b$,
    $b$La asesoría de Derecho Laboral 360 Pro se desarrolla revisando la situación laboral real de la empresa: contratos, asistencia, planillas, boletas, beneficios sociales, pagos, funciones, cargos, políticas internas y documentación de personal. Se identifican riesgos laborales y se proponen soluciones preventivas o correctivas. Cuando existe una fiscalización, reclamo o proceso laboral, se analiza la documentación disponible, los hechos ocurridos y la estrategia de defensa más adecuada. La asesoría busca que la empresa actúe con orden, sustento y cumplimiento normativo, evitando decisiones improvisadas que puedan generar multas, demandas o contingencias laborales mayores.$b$,
    '#c2410c', 3,
    'Derecho Laboral 360 Pro | Asesoría laboral, SUNAFIL y planillas',
    'Contratos, planillas, despidos, fiscalizaciones SUNAFIL y procesos judiciales laborales.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Asesoría laboral empresarial', 1),
  ('Diagnóstico de cumplimiento laboral', 2),
  ('Elaboración y revisión de contratos laborales', 3),
  ('Contratos sujetos a modalidad', 4),
  ('Contratos a plazo indeterminado', 5),
  ('Locación de servicios y análisis de riesgos laborales', 6),
  ('Reglamento interno de trabajo', 7),
  ('Políticas internas de personal', 8),
  ('Cartas de amonestación', 9),
  ('Memorandos laborales', 10),
  ('Cartas de preaviso y despido', 11),
  ('Procedimientos disciplinarios', 12),
  ('Cálculo de beneficios sociales', 13),
  ('Revisión de CTS, gratificaciones y vacaciones', 14),
  ('Revisión de horas extras', 15),
  ('Jornada, horario y descansos', 16),
  ('Auditoría laboral interna', 17),
  ('Atención de fiscalizaciones SUNAFIL', 18),
  ('Descargos ante actas de infracción', 19),
  ('Recursos administrativos laborales', 20),
  ('Defensa en procesos judiciales laborales', 21),
  ('Asesoría frente a denuncias de trabajadores', 22),
  ('Prevención de hostilidad laboral', 23),
  ('Revisión de contingencias laborales', 24),
  ('Implementación de boletas digitales', 25),
  ('Asesoría en reducción de riesgos laborales empresariales', 26)
) as t(name, ord);

-- 4. Familia & Patrimonio
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'familia-patrimonio',
    'Familia & Patrimonio',
    'Asesoría legal familiar, sucesoria y protección patrimonial',
    $b$Familia & Patrimonio es una marca especializada en asesoría legal familiar, patrimonial, sucesoria y civil. Brindamos orientación y defensa en asuntos relacionados con alimentos, tenencia, régimen de visitas, divorcio, unión de hecho, herencias, bienes familiares, sociedad de gananciales y protección patrimonial. Nuestro enfoque combina sensibilidad humana, estrategia legal y protección económica, buscando soluciones claras para conflictos familiares y patrimoniales.$b$,
    $b$La asesoría de Familia & Patrimonio inicia con la revisión de la situación familiar, económica y patrimonial del cliente. Se analizan partidas, documentos de propiedad, ingresos, gastos, acuerdos previos, procesos existentes, bienes adquiridos, obligaciones alimentarias y derechos involucrados. El servicio puede orientarse a la prevención, cuando se busca ordenar el patrimonio familiar; a la negociación, cuando se desea evitar un conflicto mayor; o a la defensa judicial, cuando ya existe un proceso o controversia. El objetivo es proteger derechos personales y económicos, buscando soluciones legales firmes, humanas y sostenibles.$b$,
    '#9d174d', 4,
    'Familia & Patrimonio | Alimentos, divorcios, herencias y patrimonio',
    'Procesos de alimentos, tenencia, divorcios, sucesiones, herencias y protección de patrimonio familiar.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Asesoría en procesos de alimentos', 1),
  ('Demandas de alimentos', 2),
  ('Aumento de pensión de alimentos', 3),
  ('Reducción de pensión de alimentos', 4),
  ('Exoneración de alimentos', 5),
  ('Tenencia de hijos', 6),
  ('Régimen de visitas', 7),
  ('Variación de tenencia o visitas', 8),
  ('Divorcio por mutuo acuerdo', 9),
  ('Divorcio por causal', 10),
  ('Separación de patrimonios', 11),
  ('Liquidación de sociedad de gananciales', 12),
  ('Reconocimiento de unión de hecho', 13),
  ('Disolución de unión de hecho', 14),
  ('Sucesión intestada', 15),
  ('Testamentos', 16),
  ('Anticipo de legítima', 17),
  ('División y partición de bienes', 18),
  ('Conflictos entre herederos', 19),
  ('Protección de patrimonio familiar', 20),
  ('Medidas cautelares sobre bienes', 21),
  ('Conciliaciones familiares', 22),
  ('Cartas notariales familiares', 23),
  ('Procesos civiles patrimoniales', 24),
  ('Defensa patrimonial frente a terceros', 25)
) as t(name, ord);

-- 5. Tributa Fácil
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'tributa-facil',
    'Tributa Fácil',
    'Asesoría tributaria simple para emprendedores, MYPE y profesionales',
    $b$Tributa Fácil es una marca creada para emprendedores, MYPE, profesionales independientes y personas naturales que necesitan cumplir con SUNAT de manera clara, ordenada y simple. Brindamos asesoría tributaria práctica para iniciar negocios, elegir el régimen tributario adecuado, declarar correctamente, regularizar omisiones y atender comunicaciones simples de SUNAT. Nuestro objetivo es que el cliente entienda sus obligaciones, evite multas y pueda concentrarse en hacer crecer su negocio.$b$,
    $b$La asesoría de Tributa Fácil está pensada para personas que necesitan una explicación clara, directa y sin lenguaje complicado. Se revisa el tipo de actividad, los ingresos, los gastos, el régimen tributario, la forma de emitir comprobantes y las obligaciones mensuales o anuales. Cuando el cliente ya tiene problemas con SUNAT, se revisan las omisiones, inconsistencias, deudas o comunicaciones recibidas para proponer una solución ordenada. El servicio busca que el emprendedor tribute bien, evite sanciones y tenga control básico de su negocio.$b$,
    '#b45309', 5,
    'Tributa Fácil | Asesoría tributaria para emprendedores y MYPE',
    'RUC, regímenes tributarios, declaraciones, comprobantes electrónicos y regularización SUNAT para emprendedores.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Alta de RUC', 1),
  ('Activación de clave SOL', 2),
  ('Elección de régimen tributario', 3),
  ('Asesoría en Nuevo RUS', 4),
  ('Asesoría en Régimen Especial de Renta', 5),
  ('Asesoría en Régimen MYPE Tributario', 6),
  ('Asesoría en Régimen General', 7),
  ('Declaraciones mensuales de IGV y Renta', 8),
  ('Declaración anual de Impuesto a la Renta', 9),
  ('Revisión de ingresos y gastos', 10),
  ('Emisión de comprobantes electrónicos', 11),
  ('Facturas, boletas, notas de crédito y notas de débito', 12),
  ('Control tributario básico para emprendedores', 13),
  ('Asesoría para ventas por Instagram, redes sociales y comercio digital', 14),
  ('Regularización de declaraciones omitidas', 15),
  ('Atención de cartas inductivas', 16),
  ('Atención de esquelas SUNAT', 17),
  ('Revisión de inconsistencias tributarias', 18),
  ('Fraccionamientos', 19),
  ('Orientación sobre bancarización', 20),
  ('Capacitación tributaria básica para negocios', 21)
) as t(name, ord);

-- 6. Costos Híbridos 360
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'costos-hibridos-360',
    'Costos Híbridos 360',
    'Sistemas de costos para minería, industria y servicios',
    $b$Costos Híbridos 360 es una marca especializada en diagnóstico, diseño, implementación, auditoría y defensa de sistemas de costos para empresas mineras, industriales, manufactureras y de servicios. Brindamos asesoría técnica, contable y estratégica para determinar costos reales, controlar inventarios, sustentar costo de ventas, identificar mermas, valorar productos en proceso y mejorar la información gerencial. Nuestro enfoque integra procesos productivos, contabilidad, almacenes, operaciones, sistemas ERP y criterios tributarios.$b$,
    $b$La asesoría de Costos Híbridos 360 inicia con el levantamiento del proceso operativo real de la empresa. Se analiza cómo ingresa la materia prima, cómo se transforma, qué procesos intervienen, qué centros de costo participan, cómo se generan productos terminados, subproductos, mermas, desmedros y productos en proceso. Luego se revisa la conexión entre producción, almacén, contabilidad y ventas para determinar si el costo calculado refleja la realidad económica del negocio. El servicio puede ser de implementación, de auditoría o de defensa técnica. El objetivo es que la empresa tenga costos confiables para decidir, controlar, sustentar y defender.$b$,
    '#374151', 6,
    'Costos Híbridos 360 | Sistemas de costos minería, industria y servicios',
    'Diagnóstico, diseño, auditoría y defensa de sistemas de costos. Costo de ventas, inventarios y mermas.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Diagnóstico de sistemas de costos', 1),
  ('Diseño de sistemas de costos industriales', 2),
  ('Costeo por procesos', 3),
  ('Costeo por órdenes de trabajo', 4),
  ('Costeo híbrido', 5),
  ('Costos para empresas mineras', 6),
  ('Costos para empresas industriales', 7),
  ('Costos para empresas de servicios', 8),
  ('Diseño de centros de costo', 9),
  ('Liquidación de órdenes de producción', 10),
  ('Control de materia prima', 11),
  ('Control de productos en proceso', 12),
  ('Control de productos terminados', 13),
  ('Valorización de inventarios', 14),
  ('Determinación de costo de ventas', 15),
  ('Sustento de costo computable', 16),
  ('Análisis de mermas y desmedros', 17),
  ('Control de subproductos', 18),
  ('Reconstrucción de costos históricos', 19),
  ('Auditoría interna de costos', 20),
  ('Soporte en fiscalizaciones SUNAT vinculadas a costo de ventas', 21),
  ('Informes técnicos de costos', 22),
  ('Integración de costos con contabilidad', 23),
  ('Diagnóstico de software de producción o ERP', 24),
  ('Reportes gerenciales de rentabilidad', 25),
  ('Capacitación a equipos contables, producción y almacén', 26)
) as t(name, ord);

-- 7. Estudio Contable JL
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'estudio-contable-jl',
    'Estudio Contable JL',
    'Servicios contables integrales para empresas y emprendedores',
    $b$Estudio Contable JL es una marca dedicada a brindar servicios contables integrales para empresas, emprendedores y profesionales que necesitan información financiera ordenada, cumplimiento tributario y soporte contable estratégico. Brindamos contabilidad mensual, revisión de estados financieros, regularización contable, análisis de cuentas, libros electrónicos y soporte ante auditorías, fiscalizaciones o controversias. Nuestro enfoque es que la contabilidad no sea solo una obligación formal, sino una herramienta útil para tomar decisiones empresariales.$b$,
    $b$La asesoría de Estudio Contable JL se basa en ordenar, revisar y procesar la información económica de la empresa. Se analizan comprobantes, movimientos bancarios, contratos, cuentas contables, libros electrónicos, declaraciones, estados financieros y documentación de soporte. Cuando la empresa requiere regularización, se identifican errores, omisiones o inconsistencias y se propone una ruta de corrección. Cuando existe auditoría, fiscalización o controversia, se prepara el sustento contable y documental necesario para defender la razonabilidad de las operaciones. El objetivo es contar con una contabilidad confiable, sustentada y útil para la gestión empresarial.$b$,
    '#5b21b6', 7,
    'Estudio Contable JL | Contabilidad mensual y estados financieros',
    'Contabilidad integral, libros electrónicos, estados financieros y soporte en auditorías y fiscalizaciones.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Contabilidad mensual', 1),
  ('Registro de compras', 2),
  ('Registro de ventas', 3),
  ('Registro de operaciones contables', 4),
  ('Conciliaciones bancarias', 5),
  ('Análisis de cuentas contables', 6),
  ('Elaboración de estados financieros', 7),
  ('Estado de situación financiera', 8),
  ('Estado de resultados', 9),
  ('Flujo de efectivo', 10),
  ('Notas a los estados financieros', 11),
  ('Declaraciones tributarias mensuales', 12),
  ('Declaración anual de renta', 13),
  ('Libros electrónicos', 14),
  ('Presentación de PLE', 15),
  ('Implementación de plan contable', 16),
  ('Revisión de plan de cuentas', 17),
  ('Cierre contable mensual y anual', 18),
  ('Regularización contable', 19),
  ('Reconstrucción contable', 20),
  ('Auditoría contable interna', 21),
  ('Soporte en auditorías externas', 22),
  ('Soporte en fiscalizaciones SUNAT', 23),
  ('Sustento documental de operaciones', 24),
  ('Informes contables para procesos administrativos, civiles o penales', 25),
  ('Peritajes contables de parte', 26),
  ('Reportes gerenciales', 27),
  ('Control de cuentas por cobrar', 28),
  ('Control de cuentas por pagar', 29)
) as t(name, ord);

-- 8. Payroll 360 Pro
with b as (
  insert into public.brands (
    slug, name, tagline, about_text, asesoria_text,
    accent_color, display_order, seo_title, seo_description
  ) values (
    'payroll-360',
    'Payroll 360 Pro',
    'Gestión de planillas, auditoría de nómina y software de RRHH',
    $b$Payroll 360 Pro es una marca especializada en gestión de planillas, auditoría de nómina, cumplimiento laboral y soluciones tecnológicas para empresas. Brindamos asesoría en cálculo de remuneraciones, beneficios sociales, aportes, retenciones, boletas de pago, fiscalizaciones laborales e implementación de software de planillas. Nuestro enfoque integra conocimiento laboral, contable, tributario y tecnológico para que la empresa administre su nómina de forma segura, eficiente y automatizada.$b$,
    $b$La asesoría de Payroll 360 Pro se enfoca en asegurar que la planilla de la empresa esté correctamente calculada, documentada y alineada con la normativa laboral vigente. Se revisan trabajadores, cargos, remuneraciones, conceptos de pago, descuentos, beneficios sociales, aportes, contratos, asistencia, boletas y reportes. Cuando existen errores o contingencias, se plantea una estrategia de regularización y defensa. Cuando la empresa desea modernizar su gestión, se implementan herramientas tecnológicas para automatizar cálculos, emitir boletas, generar reportes y reducir errores operativos. El objetivo es que la nómina sea segura, eficiente, verificable y preparada para auditorías o fiscalizaciones.$b$,
    '#0e7490', 8,
    'Payroll 360 Pro | Planillas, nómina y software laboral',
    'Cálculo de planillas, beneficios sociales, fiscalizaciones SUNAFIL y software de RRHH.'
  ) returning id
)
insert into public.brand_services (brand_id, name, display_order)
select b.id, name, ord from b, (values
  ('Elaboración mensual de planillas', 1),
  ('Cálculo de remuneraciones', 2),
  ('Cálculo de asignación familiar', 3),
  ('Cálculo de horas extras', 4),
  ('Cálculo de descuentos', 5),
  ('Cálculo de beneficios sociales', 6),
  ('CTS', 7),
  ('Gratificaciones', 8),
  ('Vacaciones', 9),
  ('Liquidación de beneficios sociales', 10),
  ('Cálculo de renta de quinta categoría', 11),
  ('AFP', 12),
  ('ONP', 13),
  ('EsSalud', 14),
  ('Vida Ley', 15),
  ('Emisión de boletas de pago', 16),
  ('Implementación de boletas digitales', 17),
  ('Auditoría de planillas', 18),
  ('Revisión de conceptos remunerativos', 19),
  ('Revisión de conceptos no remunerativos', 20),
  ('Regularización de planillas', 21),
  ('Soporte en fiscalizaciones SUNAFIL', 22),
  ('Soporte en auditorías laborales', 23),
  ('Informes de planilla para procesos laborales', 24),
  ('Implementación de software de planillas', 25),
  ('Venta de software de planillas', 26),
  ('Parametrización de conceptos laborales', 27),
  ('Migración de información laboral', 28),
  ('Reportes de payroll', 29),
  ('Capacitación en uso del sistema de planillas', 30)
) as t(name, ord);
