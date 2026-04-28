// ============================================================
// MOCK DATA — Premium institutional prototype
// Estudio contable / firma profesional
// ============================================================

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface Tag {
  slug: string;
  name: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  author: Author;
  date: string;
  readTime: string;
  status: "publicado" | "borrador" | "programado";
  scheduledDate?: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  avatar: string;
  content: string;
  date: string;
  status: "aprobado" | "pendiente" | "rechazado";
  postSlug: string;
}

export interface ForumCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  replyCount: number;
  lastActivity: string;
  lastAuthor: string;
}

export interface Thread {
  slug: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  date: string;
  replyCount: number;
  viewCount: number;
  lastReplyDate: string;
  lastReplyAuthor: string;
  pinned?: boolean;
  content: string;
}

export interface Reply {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  isAuthor?: boolean;
}

// --- Authors ---
export const authors: Author[] = [
  {
    name: "Martín Velázquez",
    role: "Socio fundador",
    avatar: "MV",
  },
  {
    name: "Carolina Méndez",
    role: "Directora de Impuestos",
    avatar: "CM",
  },
  {
    name: "Rodrigo Estévez",
    role: "Consultor Senior",
    avatar: "RE",
  },
];

// --- Blog Categories ---
export const blogCategories: Category[] = [
  {
    slug: "impuestos",
    name: "Impuestos",
    description: "Novedades impositivas, reformas y guías prácticas",
    count: 12,
  },
  {
    slug: "contabilidad",
    name: "Contabilidad",
    description: "Normativas contables, balances y reportes financieros",
    count: 8,
  },
  {
    slug: "empresas",
    name: "Empresas",
    description: "Constitución, gestión y consultoría empresarial",
    count: 6,
  },
  {
    slug: "laboral",
    name: "Laboral & RRHH",
    description: "Legislación laboral, liquidaciones y convenios",
    count: 5,
  },
  {
    slug: "finanzas",
    name: "Finanzas Personales",
    description: "Planificación financiera, inversiones y patrimonio",
    count: 4,
  },
];

// --- Tags ---
export const tags: Tag[] = [
  { slug: "iva", name: "IVA" },
  { slug: "ganancias", name: "Ganancias" },
  { slug: "monotributo", name: "Monotributo" },
  { slug: "pymes", name: "PyMEs" },
  { slug: "balances", name: "Balances" },
  { slug: "afip", name: "AFIP" },
  { slug: "liquidaciones", name: "Liquidaciones" },
  { slug: "inversiones", name: "Inversiones" },
  { slug: "sociedades", name: "Sociedades" },
  { slug: "facturacion", name: "Facturación" },
];

// --- Posts ---
export const posts: Post[] = [
  {
    slug: "reforma-tributaria-2026-impacto-pymes",
    title: "Reforma tributaria 2026: lo que toda PyME necesita saber",
    excerpt:
      "Analizamos los puntos clave de la nueva reforma tributaria y su impacto directo en pequeñas y medianas empresas. Cambios en alícuotas, nuevos beneficios y plazos de implementación.",
    content: `<h2>Un nuevo escenario impositivo</h2>
<p>La reforma tributaria sancionada en marzo de 2026 introduce modificaciones sustanciales al régimen impositivo para pequeñas y medianas empresas. Los cambios alcanzan tanto la imposición directa como la indirecta, con especial énfasis en la simplificación de obligaciones formales.</p>
<p>Desde el Estudio, venimos analizando cada aspecto de la normativa para ofrecer a nuestros clientes una visión clara y práctica de lo que estos cambios significan en el día a día de sus operaciones.</p>
<h2>Principales modificaciones</h2>
<p>Entre los cambios más relevantes se destacan:</p>
<ul>
<li>Reducción gradual de la alícuota del Impuesto a las Ganancias corporativas del 35% al 30% para empresas con facturación inferior a los 500 millones anuales.</li>
<li>Nuevo régimen simplificado de IVA para operaciones entre sujetos inscriptos del mismo sector.</li>
<li>Ampliación del plazo de compensación de quebrantos de 5 a 7 ejercicios fiscales.</li>
<li>Creación de un crédito fiscal por inversión en tecnología y capacitación del personal.</li>
</ul>
<h2>Plazos de implementación</h2>
<p>La entrada en vigencia será escalonada. Las modificaciones vinculadas al Impuesto a las Ganancias aplicarán a partir del ejercicio fiscal iniciado en enero de 2027. En cambio, los cambios relativos al IVA ya se encuentran operativos desde abril de 2026.</p>
<blockquote>Es fundamental que cada empresa revise su planificación fiscal con anticipación. Los beneficios no son automáticos: requieren adhesión formal y cumplimiento de requisitos específicos.</blockquote>
<h2>Nuestra recomendación</h2>
<p>Desde Velázquez & Asociados recomendamos a nuestros clientes agendar una revisión integral de su situación tributaria. Nuestro equipo de asesores está preparado para evaluar cada caso particular y definir la mejor estrategia de adaptación a la nueva normativa.</p>`,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6e?w=1200&h=600&fit=crop",
    category: "impuestos",
    tags: ["ganancias", "pymes", "iva"],
    author: authors[0],
    date: "12 de abril de 2026",
    readTime: "6 min de lectura",
    status: "publicado",
    commentCount: 4,
  },
  {
    slug: "balance-general-errores-comunes",
    title: "Errores frecuentes en la confección del balance general",
    excerpt:
      "Identificamos los errores más comunes que encontramos en balances de cierre y ofrecemos recomendaciones concretas para evitarlos. Una guía práctica para contadores y empresarios.",
    content: `<h2>La importancia de un balance preciso</h2>
<p>El balance general es mucho más que un requisito formal. Es la fotografía financiera de una empresa en un momento dado, y cualquier error en su confección puede derivar en decisiones incorrectas, observaciones fiscales o problemas con terceros.</p>
<p>A lo largo de nuestra trayectoria, hemos revisado cientos de balances y detectamos patrones de error que se repiten con frecuencia. Compartimos aquí los más habituales para que puedan ser prevenidos.</p>
<h2>Los 5 errores más frecuentes</h2>
<h3>1. Clasificación incorrecta de activos y pasivos</h3>
<p>Uno de los errores más comunes es no distinguir correctamente entre corriente y no corriente. Esto distorsiona los ratios de liquidez y puede generar una imagen equivocada de la salud financiera de la empresa.</p>
<h3>2. Omisión de previsiones</h3>
<p>Las previsiones por incobrables, juicios pendientes o contingencias fiscales suelen subestimarse o directamente omitirse, lo que genera un patrimonio neto inflado.</p>
<h3>3. Diferencias de cambio no registradas</h3>
<p>En contextos de alta volatilidad cambiaria, la falta de actualización de saldos en moneda extranjera es un error crítico que afecta la comparabilidad entre ejercicios.</p>`,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
    category: "contabilidad",
    tags: ["balances", "pymes"],
    author: authors[1],
    date: "8 de abril de 2026",
    readTime: "5 min de lectura",
    status: "publicado",
    commentCount: 2,
  },
  {
    slug: "constitucion-sas-guia-completa",
    title: "Cómo constituir una SAS en 2026: guía paso a paso",
    excerpt:
      "Todo lo que necesitás saber para constituir una Sociedad por Acciones Simplificada. Requisitos, plazos, costos estimados y errores a evitar en el proceso.",
    content: `<h2>¿Por qué elegir una SAS?</h2>
<p>La Sociedad por Acciones Simplificada se consolidó como el vehículo societario más elegido por emprendedores y nuevas empresas. Su proceso de constitución simplificado, menores requisitos de capital y flexibilidad organizativa la hacen ideal para proyectos en etapa temprana.</p>
<h2>Requisitos actualizados</h2>
<p>Para constituir una SAS en 2026 se requiere:</p>
<ul>
<li>Al menos un socio (puede ser unipersonal).</li>
<li>Capital social mínimo equivalente a dos salarios mínimos vitales y móviles.</li>
<li>Instrumento constitutivo digital firmado con certificación notarial o firma digital.</li>
<li>Designación de administrador y sede social.</li>
<li>Inscripción ante el Registro Público de Comercio de la jurisdicción correspondiente.</li>
</ul>`,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop",
    category: "empresas",
    tags: ["sociedades", "pymes"],
    author: authors[2],
    date: "3 de abril de 2026",
    readTime: "7 min de lectura",
    status: "publicado",
    commentCount: 6,
  },
  {
    slug: "monotributo-recategorizacion-julio",
    title: "Recategorización del monotributo: fechas clave y nuevos topes",
    excerpt:
      "Se acerca el período de recategorización semestral. Repasamos los nuevos topes de facturación, las categorías actualizadas y las obligaciones de cada contribuyente.",
    content: `<h2>Calendario de recategorización</h2><p>El próximo período de recategorización del monotributo se extiende del 1 al 20 de julio de 2026. Todos los contribuyentes adheridos deben evaluar si les corresponde un cambio de categoría.</p>`,
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop",
    category: "impuestos",
    tags: ["monotributo", "afip"],
    author: authors[1],
    date: "28 de marzo de 2026",
    readTime: "4 min de lectura",
    status: "publicado",
    commentCount: 8,
  },
  {
    slug: "liquidacion-sueldos-cambios-convenio",
    title: "Cambios en la liquidación de sueldos: novedades del convenio colectivo",
    excerpt:
      "Las recientes paritarias introdujeron modificaciones en ítems remunerativos y no remunerativos. Analizamos el impacto en las liquidaciones mensuales.",
    content: `<h2>Nuevas escalas salariales</h2><p>El acuerdo paritario alcanzado en febrero de 2026 establece incrementos escalonados y la incorporación de nuevos conceptos remunerativos que impactan directamente en la confección de recibos de haberes.</p>`,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=600&fit=crop",
    category: "laboral",
    tags: ["liquidaciones"],
    author: authors[0],
    date: "20 de marzo de 2026",
    readTime: "5 min de lectura",
    status: "publicado",
    commentCount: 3,
  },
  {
    slug: "facturacion-electronica-obligatoria",
    title: "Facturación electrónica: nuevas obligaciones para prestadores de servicios",
    excerpt:
      "AFIP amplió el universo de sujetos obligados a emitir factura electrónica. Detallamos quiénes están alcanzados y los pasos para cumplir con la normativa.",
    content: `<h2>Ampliación del régimen</h2><p>La Resolución General publicada en febrero de 2026 extiende la obligatoriedad de facturación electrónica a nuevas categorías de prestadores de servicios profesionales.</p>`,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop",
    category: "impuestos",
    tags: ["facturacion", "afip"],
    author: authors[2],
    date: "14 de marzo de 2026",
    readTime: "4 min de lectura",
    status: "publicado",
    commentCount: 1,
  },
  {
    slug: "planificacion-financiera-personal-2026",
    title: "Planificación financiera personal: cómo organizar tus finanzas este año",
    excerpt:
      "Una guía práctica para profesionales independientes que buscan ordenar sus finanzas, optimizar su carga tributaria y construir patrimonio de manera sostenible.",
    content: `<h2>El punto de partida</h2><p>La planificación financiera personal no es exclusiva de grandes patrimonios. Cualquier profesional independiente puede beneficiarse de una estrategia ordenada.</p>`,
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&h=600&fit=crop",
    category: "finanzas",
    tags: ["inversiones"],
    author: authors[0],
    date: "7 de marzo de 2026",
    readTime: "6 min de lectura",
    status: "publicado",
    commentCount: 5,
  },
  // Drafts and scheduled
  {
    slug: "borrador-regimen-fiscal-exportadores",
    title: "Nuevo régimen fiscal para exportadores de servicios",
    excerpt:
      "Análisis del proyecto de ley que propone un régimen diferencial para exportadores de servicios profesionales y tecnológicos.",
    content: "",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop",
    category: "impuestos",
    tags: ["pymes", "ganancias"],
    author: authors[1],
    date: "",
    readTime: "5 min de lectura",
    status: "borrador",
    commentCount: 0,
  },
  {
    slug: "programado-guia-impuesto-bienes-personales",
    title: "Guía práctica: Impuesto sobre los Bienes Personales 2026",
    excerpt:
      "Todo lo que necesitás saber para la declaración jurada del impuesto sobre los bienes personales. Mínimos no imponibles, alícuotas y estrategias de planificación.",
    content: "",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
    category: "impuestos",
    tags: ["ganancias", "afip"],
    author: authors[0],
    date: "",
    readTime: "8 min de lectura",
    status: "programado",
    scheduledDate: "22 de abril de 2026",
    commentCount: 0,
  },
];

// --- Comments ---
export const comments: Comment[] = [
  {
    id: "c1",
    author: "Laura Giménez",
    email: "laura.g@email.com",
    avatar: "LG",
    content:
      "Excelente artículo. ¿Saben si la reducción de alícuota aplica también para empresas del sector agropecuario?",
    date: "13 de abril de 2026",
    status: "aprobado",
    postSlug: "reforma-tributaria-2026-impacto-pymes",
  },
  {
    id: "c2",
    author: "Martín Velázquez",
    email: "martin@velazquez.com",
    avatar: "MV",
    content:
      "Laura, sí aplica. El sector agropecuario queda incluido dentro del universo de beneficiarios siempre que cumpla con el tope de facturación establecido.",
    date: "13 de abril de 2026",
    status: "aprobado",
    postSlug: "reforma-tributaria-2026-impacto-pymes",
  },
  {
    id: "c3",
    author: "Federico Ruiz",
    email: "fruiz@empresa.com",
    avatar: "FR",
    content:
      "Muy claro el análisis. Lo compartí con mi contador para que revisemos nuestra situación. Gracias por el detalle sobre los plazos de adhesión.",
    date: "14 de abril de 2026",
    status: "aprobado",
    postSlug: "reforma-tributaria-2026-impacto-pymes",
  },
  {
    id: "c4",
    author: "Silvia Pacheco",
    email: "silvia.p@correo.com",
    avatar: "SP",
    content: "¿Podrían hacer un artículo sobre el impacto en contribuyentes del régimen simplificado?",
    date: "14 de abril de 2026",
    status: "pendiente",
    postSlug: "reforma-tributaria-2026-impacto-pymes",
  },
  {
    id: "c5",
    author: "Gonzalo Ortega",
    email: "gortega@mail.com",
    avatar: "GO",
    content: "El punto sobre la clasificación de activos me resultó muy útil. Justamente estamos cerrando ejercicio.",
    date: "9 de abril de 2026",
    status: "aprobado",
    postSlug: "balance-general-errores-comunes",
  },
  {
    id: "c6",
    author: "Test Spam",
    email: "spam@test.com",
    avatar: "TS",
    content: "Compra ya los mejores productos financieros en www.spam-link.com !!!",
    date: "10 de abril de 2026",
    status: "rechazado",
    postSlug: "balance-general-errores-comunes",
  },
  {
    id: "c7",
    author: "Ana Rosales",
    email: "ana.r@email.com",
    avatar: "AR",
    content: "¿El capital mínimo se actualiza automáticamente con el SMVM o hay que estar pendiente?",
    date: "5 de abril de 2026",
    status: "aprobado",
    postSlug: "constitucion-sas-guia-completa",
  },
  {
    id: "c8",
    author: "Diego Martínez",
    email: "diego.m@email.com",
    avatar: "DM",
    content: "Gracias por la guía. Estamos evaluando constituir una SAS para un proyecto nuevo y esto nos aclara mucho el panorama.",
    date: "4 de abril de 2026",
    status: "pendiente",
    postSlug: "constitucion-sas-guia-completa",
  },
];

// --- Forum Categories ---
export const forumCategories: ForumCategory[] = [
  {
    slug: "impuestos",
    name: "Impuestos",
    description: "Consultas sobre IVA, Ganancias, Bienes Personales, monotributo y regímenes especiales.",
    icon: "receipt",
    threadCount: 47,
    replyCount: 186,
    lastActivity: "Hace 2 horas",
    lastAuthor: "Laura G.",
  },
  {
    slug: "recursos-humanos",
    name: "Recursos Humanos",
    description: "Liquidación de sueldos, convenios colectivos, ART y consultas laborales.",
    icon: "users",
    threadCount: 32,
    replyCount: 128,
    lastActivity: "Hace 5 horas",
    lastAuthor: "Federico R.",
  },
  {
    slug: "empresas",
    name: "Empresas & Sociedades",
    description: "Constitución de sociedades, actas, estatutos y gestión societaria.",
    icon: "building",
    threadCount: 23,
    replyCount: 89,
    lastActivity: "Hace 1 día",
    lastAuthor: "Ana R.",
  },
  {
    slug: "contabilidad",
    name: "Contabilidad",
    description: "Registración contable, normas, balances y auditoría.",
    icon: "calculator",
    threadCount: 38,
    replyCount: 142,
    lastActivity: "Hace 3 horas",
    lastAuthor: "Gonzalo O.",
  },
  {
    slug: "consultas-generales",
    name: "Consultas Generales",
    description: "Preguntas generales sobre trámites, plazos y procedimientos.",
    icon: "help-circle",
    threadCount: 56,
    replyCount: 234,
    lastActivity: "Hace 30 min",
    lastAuthor: "Silvia P.",
  },
];

// --- Forum Threads ---
export const threads: Thread[] = [
  {
    slug: "compensacion-saldo-iva-a-favor",
    title: "¿Cómo compensar saldo de IVA a favor con otros impuestos?",
    author: "Laura Giménez",
    authorAvatar: "LG",
    category: "impuestos",
    date: "14 de abril de 2026",
    replyCount: 5,
    viewCount: 89,
    lastReplyDate: "Hace 2 horas",
    lastReplyAuthor: "Martín V.",
    content:
      "Buenos días. Tengo un cliente con saldo técnico a favor de IVA acumulado durante los últimos tres períodos. ¿Es posible compensarlo con el saldo de Ganancias? ¿Cuál es el procedimiento en AFIP?",
  },
  {
    slug: "plazo-presentacion-ddjj-ganancias-sociedades",
    title: "Plazo de presentación DDJJ Ganancias Sociedades — ¿se prorrogó?",
    author: "Federico Ruiz",
    authorAvatar: "FR",
    category: "impuestos",
    date: "12 de abril de 2026",
    replyCount: 3,
    viewCount: 124,
    lastReplyDate: "Hace 5 horas",
    lastReplyAuthor: "Carolina M.",
    pinned: true,
    content:
      "Vi rumores sobre una prórroga para la presentación de la DDJJ de Ganancias de sociedades con cierre en diciembre. ¿Alguien tiene confirmación oficial?",
  },
  {
    slug: "alta-empleado-modalidad-hibrida",
    title: "Alta de empleado en modalidad híbrida: ¿qué convenio aplica?",
    author: "Ana Rosales",
    authorAvatar: "AR",
    category: "recursos-humanos",
    date: "11 de abril de 2026",
    replyCount: 4,
    viewCount: 67,
    lastReplyDate: "Hace 1 día",
    lastReplyAuthor: "Rodrigo E.",
    content:
      "Estamos incorporando personal bajo modalidad híbrida (3 días presencial, 2 remoto). ¿El convenio colectivo aplicable es el de la actividad principal o existe alguna regulación especial?",
  },
  {
    slug: "constitucion-srl-vs-sas-2026",
    title: "SRL vs SAS en 2026: ¿cuál conviene más?",
    author: "Diego Martínez",
    authorAvatar: "DM",
    category: "empresas",
    date: "10 de abril de 2026",
    replyCount: 7,
    viewCount: 203,
    lastReplyDate: "Hace 2 días",
    lastReplyAuthor: "Martín V.",
    content:
      "Estamos por arrancar un emprendimiento con dos socios. ¿Sigue siendo más conveniente la SAS o hay algún escenario donde la SRL sea preferible?",
  },
  {
    slug: "ajuste-por-inflacion-contable-obligatorio",
    title: "Ajuste por inflación contable: ¿sigue siendo obligatorio?",
    author: "Gonzalo Ortega",
    authorAvatar: "GO",
    category: "contabilidad",
    date: "9 de abril de 2026",
    replyCount: 6,
    viewCount: 156,
    lastReplyDate: "Hace 3 horas",
    lastReplyAuthor: "Carolina M.",
    content:
      "Con la baja del IPC, ¿el ajuste por inflación contable sigue siendo obligatorio para balances del ejercicio 2025? ¿Alguien tiene el criterio que está adoptando la IGJ?",
  },
  {
    slug: "tramite-cuit-persona-juridica-demora",
    title: "Demoras en el trámite de CUIT para personas jurídicas",
    author: "Silvia Pacheco",
    authorAvatar: "SP",
    category: "consultas-generales",
    date: "8 de abril de 2026",
    replyCount: 9,
    viewCount: 178,
    lastReplyDate: "Hace 30 min",
    lastReplyAuthor: "Laura G.",
    content:
      "¿Alguien más está teniendo demoras con la obtención del CUIT para sociedades nuevas? Hace 15 días iniciamos el trámite y sigue en estado 'en proceso'.",
  },
];

// --- Forum Replies ---
export const replies: Reply[] = [
  {
    id: "r1",
    author: "Carolina Méndez",
    avatar: "CM",
    date: "14 de abril de 2026 — 10:30",
    content:
      "Sí, es posible compensar el saldo técnico de IVA con otros impuestos nacionales. El procedimiento se realiza a través del Sistema de Cuentas Tributarias de AFIP. Tenés que generar la solicitud de compensación indicando el impuesto de origen (IVA) y el de destino (Ganancias, por ejemplo).",
    isAuthor: false,
  },
  {
    id: "r2",
    author: "Martín Velázquez",
    avatar: "MV",
    date: "14 de abril de 2026 — 14:15",
    content:
      "Complemento lo que dice Carolina: es importante que el saldo a favor sea «saldo técnico» y no «saldo de libre disponibilidad». La compensación de saldos técnicos tiene requisitos adicionales y en algunos casos requiere dictamen de contador público.",
    isAuthor: false,
  },
  {
    id: "r3",
    author: "Laura Giménez",
    avatar: "LG",
    date: "14 de abril de 2026 — 15:00",
    content:
      "Gracias a ambos por la respuesta. Justamente es saldo técnico. Voy a revisar el procedimiento en el Sistema de Cuentas Tributarias. ¿Saben si hay algún tope de monto para la compensación?",
    isAuthor: true,
  },
];

// --- Admin user role config ---
export const roleConfig = {
  admin: { label: "Admin", className: "bg-primary/10 text-primary border-primary/20" },
  usuario: { label: "Usuario", className: "bg-secondary text-muted-foreground border-border/50" },
};

// --- Stats for admin dashboard ---
export const dashboardStats = {
  totalPosts: 9,
  publishedPosts: 7,
  draftPosts: 1,
  scheduledPosts: 1,
  totalComments: 8,
  pendingComments: 2,
  totalThreads: 6,
  totalUsers: 24,
  monthlyViews: 3842,
  viewsTrend: "+12%",
};
