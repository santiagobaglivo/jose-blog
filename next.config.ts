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
};

export default nextConfig;
