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
];

const ALLOWED_ATTR = ["href", "rel", "src", "alt"];

const PER_TAG_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "rel"]),
  img: new Set(["src", "alt"]),
};

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
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as Element;
    if (el.tagName?.toLowerCase() === "a") {
      el.setAttribute("rel", "noopener noreferrer");
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
  });
}
