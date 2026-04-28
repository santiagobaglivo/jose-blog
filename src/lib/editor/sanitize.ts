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

const ALLOWED_ATTR = ["href", "rel", "target", "src", "alt"];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
