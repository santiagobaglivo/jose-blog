import type { ReactNode } from "react";
import {
  Award,
  Banknote,
  Briefcase,
  Building,
  Building2,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Crown,
  Eye,
  FileSearch,
  FileText,
  Gavel,
  Globe,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  Lightbulb,
  type LucideIcon,
  type LucideProps,
  MapPin,
  Phone,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  Stamp,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

/**
 * Mapping fijo de nombres de icono (kebab-case) a componentes lucide. Solo se
 * permiten estos para evitar inflar el bundle con un import dinámico de toda
 * la librería. Si Eugenia/cliente piden uno nuevo, agregarlo acá.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  banknote: Banknote,
  briefcase: Briefcase,
  building: Building,
  "building-2": Building2,
  calculator: Calculator,
  "clipboard-check": ClipboardCheck,
  "clipboard-list": ClipboardList,
  coins: Coins,
  crown: Crown,
  eye: Eye,
  "file-search": FileSearch,
  "file-text": FileText,
  gavel: Gavel,
  globe: Globe,
  handshake: Handshake,
  "heart-handshake": HeartHandshake,
  home: Home,
  landmark: Landmark,
  lightbulb: Lightbulb,
  "map-pin": MapPin,
  phone: Phone,
  "piggy-bank": PiggyBank,
  receipt: Receipt,
  scale: Scale,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  stamp: Stamp,
  target: Target,
  "trending-up": TrendingUp,
  users: Users,
  wallet: Wallet,
};

export const SERVICE_ICON_NAMES = Object.keys(ICON_MAP).sort();

interface ServiceIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined;
  /** Render alternativo cuando el nombre no matchea ningún icono. */
  fallback?: ReactNode;
}

export function ServiceIcon({ name, fallback = null, ...rest }: ServiceIconProps) {
  if (!name) return <>{fallback}</>;
  const Icon = ICON_MAP[name.trim().toLowerCase()];
  if (!Icon) return <>{fallback}</>;
  return <Icon {...rest} />;
}
