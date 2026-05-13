import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "a",
  "img",
  "br",
  "hr",
  "iframe",
];

const ALLOWED_ATTR = [
  "href",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "frameborder",
  "allow",
  "allowfullscreen",
  "title",
];

const PER_TAG_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "rel"]),
  img: new Set(["src", "alt"]),
  iframe: new Set([
    "src",
    "width",
    "height",
    "frameborder",
    "allow",
    "allowfullscreen",
    "title",
  ]),
};

// Hostnames permitidos como `src` de un <iframe>. Cualquier otro origen se rechaza
// y el iframe queda sin src (DOMPurify lo dejará sin src y el browser no carga nada).
const ALLOWED_IFRAME_HOSTS: ReadonlySet<string> = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
]);

function isAllowedIframeSrc(value: string): boolean {
  // URL absoluta con https obligatorio.
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return ALLOWED_IFRAME_HOSTS.has(parsed.hostname.toLowerCase());
}

let hooksRegistered = false;

function registerHooks() {
  if (hooksRegistered) return;
  hooksRegistered = true;

  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    const tagName = (node as Element).tagName?.toLowerCase();
    if (!tagName) return;
    const allowed = PER_TAG_ATTRS[tagName];
    if (!allowed || !allowed.has(data.attrName)) {
      data.keepAttr = false;
      return;
    }
    // Defensa extra: src de <iframe> debe ser de un host whitelisted.
    if (tagName === "iframe" && data.attrName === "src") {
      if (!isAllowedIframeSrc(data.attrValue)) {
        data.keepAttr = false;
      }
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as Element;
    const tag = el.tagName?.toLowerCase();
    if (tag === "a") {
      el.setAttribute("rel", "noopener noreferrer");
    }
    // Si un <iframe> quedó sin src (host inválido o ausente), lo removemos
    // del DOM para no dejar elementos vacíos.
    if (tag === "iframe" && !el.getAttribute("src")) {
      el.parentNode?.removeChild(el);
    }
  });
}

export function sanitizeHtml(html: string): string {
  registerHooks();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ADD_TAGS: ["iframe"],
  });
}
