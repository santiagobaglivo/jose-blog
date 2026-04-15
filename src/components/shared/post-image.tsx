"use client";

import Image from "next/image";
import { useState } from "react";

interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

const gradients = [
  "from-slate-700 via-slate-800 to-slate-900",
  "from-slate-600 via-slate-700 to-slate-800",
  "from-stone-600 via-stone-700 to-stone-800",
  "from-zinc-700 via-zinc-800 to-zinc-900",
  "from-neutral-600 via-neutral-700 to-neutral-800",
];

function getGradient(alt: string) {
  let hash = 0;
  for (let i = 0; i < alt.length; i++) {
    hash = alt.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function PostImage({ src, alt, className = "", fill = true, priority = false }: PostImageProps) {
  const [error, setError] = useState(false);
  const gradient = getGradient(alt);

  if (error) {
    return (
      <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}>
        <div className="text-white/20 text-center px-6">
          <div className="h-10 w-10 mx-auto mb-2 rounded-lg bg-white/10 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
