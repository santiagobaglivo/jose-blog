import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";

import { UserProvider } from "@/lib/auth/UserProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Estudio Jurídico & Contable | Velázquez & Asociados",
  description:
    "Firma profesional de servicios contables, impositivos y de consultoría empresarial. Más de 20 años de experiencia acompañando a empresas y particulares.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <html lang="es" className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <UserProvider initialUser={user} initialProfile={profile}>
          {children}
        </UserProvider>
        <Toaster theme="light" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
