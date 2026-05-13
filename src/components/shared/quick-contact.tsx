import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  TwitterIcon,
  WhatsAppIcon,
} from "@/components/shared/social-icons";

export interface QuickContactBrand {
  name: string;
  whatsapp_number: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
}

/**
 * Botones de "asesoría directa" que se muestran en cada post del blog y en
 * cualquier otra pantalla pública que quiera ofrecer contacto rápido.
 * Solo se renderiza si la brand tiene al menos un canal configurado.
 */
export function QuickContact({
  brand,
  title = "¿Tenés una consulta sobre este tema?",
  subtitle = "Escribinos directo por el canal que más te quede cómodo.",
  context,
  variant = "card",
}: {
  brand: QuickContactBrand;
  title?: string;
  subtitle?: string;
  /** Texto que se prepende al mensaje de WhatsApp ("Hola, consulta sobre <context>"). */
  context?: string;
  variant?: "card" | "inline";
}) {
  const channels: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    cls?: string;
  }> = [];

  if (brand.whatsapp_number) {
    const num = brand.whatsapp_number.replace(/[^\d]/g, "");
    const msg = encodeURIComponent(
      context ? `Hola, tengo una consulta sobre "${context}".` : "Hola, tengo una consulta."
    );
    channels.push({
      href: `https://wa.me/${num}?text=${msg}`,
      label: "WhatsApp",
      icon: <WhatsAppIcon className="h-4 w-4" />,
      cls: "bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20",
    });
  }
  if (brand.contact_email) {
    const subj = context ? encodeURIComponent(`Consulta: ${context}`) : "";
    channels.push({
      href: `mailto:${brand.contact_email}${subj ? `?subject=${subj}` : ""}`,
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
      cls: "bg-secondary/60 text-foreground hover:bg-secondary",
    });
  }
  if (brand.instagram_url) {
    channels.push({
      href: brand.instagram_url,
      label: "Instagram",
      icon: <InstagramIcon className="h-4 w-4" />,
      cls: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-pink-700 hover:from-purple-500/20 hover:to-pink-500/20",
    });
  }
  if (brand.facebook_url) {
    channels.push({
      href: brand.facebook_url,
      label: "Facebook",
      icon: <FacebookIcon className="h-4 w-4" />,
      cls: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20",
    });
  }
  if (brand.tiktok_url) {
    channels.push({
      href: brand.tiktok_url,
      label: "TikTok",
      icon: <TikTokIcon className="h-4 w-4" />,
      cls: "bg-black/5 text-foreground hover:bg-black/10",
    });
  }
  if (brand.linkedin_url) {
    channels.push({
      href: brand.linkedin_url,
      label: "LinkedIn",
      icon: <LinkedInIcon className="h-4 w-4" />,
      cls: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20",
    });
  }
  if (brand.twitter_url) {
    channels.push({
      href: brand.twitter_url,
      label: "Twitter / X",
      icon: <TwitterIcon className="h-4 w-4" />,
      cls: "bg-foreground/5 text-foreground hover:bg-foreground/10",
    });
  }

  if (channels.length === 0) {
    // Fallback: link a /contacto
    return (
      <div className="rounded-xl border border-border/50 bg-secondary/30 p-5 text-center">
        <p className="text-[0.875rem] text-foreground font-medium">{title}</p>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{subtitle}</p>
        <Link
          href="/contacto"
          className="mt-4 inline-flex items-center gap-2 h-10 px-5 text-[0.8125rem] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Hacé tu consulta
        </Link>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.label}
            className={`inline-flex items-center justify-center h-9 w-9 rounded-md transition-colors ${c.cls ?? "bg-secondary text-foreground"}`}
            title={c.label}
          >
            {c.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-secondary/30 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[0.875rem] font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 h-10 rounded-md text-[0.8125rem] font-medium transition-colors ${c.cls ?? "bg-secondary text-foreground"}`}
          >
            {c.icon}
            <span>{c.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
