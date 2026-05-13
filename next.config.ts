import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera /.next/standalone con sólo lo necesario para correr la app.
  // La imagen Docker copia eso + /public + /.next/static y arranca con `node server.js`.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default Next es 1MB; subimos a 256MB para soportar uploads de video
      // a la galería de brand_media (mismo límite que el bucket brand-assets).
      bodySizeLimit: "256mb",
    },
  },
};

export default nextConfig;
