import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface WhatsappCTAProps {
  /** Mensaje pre-cargado en el chat. Se URL-encodea automáticamente. */
  message?: string;
  /** Número con código de país sin "+". Por defecto lee NEXT_PUBLIC_WHATSAPP_NUMBER. */
  phone?: string;
  /** Texto visible del botón. */
  label?: string;
  /** Variantes visuales pensadas para distintos contextos. */
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const DEFAULT_LABEL = "Conversar por WhatsApp";

const VARIANT_CLASSES: Record<NonNullable<WhatsappCTAProps["variant"]>, string> = {
  primary:
    "h-11 px-5 bg-[#25D366] text-white hover:bg-[#1da851] shadow-sm",
  secondary:
    "h-10 px-4 bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border/60",
  ghost:
    "h-10 px-3 text-foreground hover:bg-secondary/60",
};

export function WhatsappCTA({
  message,
  phone,
  label = DEFAULT_LABEL,
  variant = "primary",
  className = "",
}: WhatsappCTAProps) {
  const number = phone ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!number) return null;

  const params = new URLSearchParams();
  if (message) params.set("text", message);
  const qs = params.toString();
  const href = `https://wa.me/${number}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-lg text-[0.875rem] font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
