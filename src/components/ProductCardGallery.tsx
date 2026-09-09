"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 3500;

// Image area for a product card. With a single image it renders exactly one
// <Image>. With several (main image + gallery_urls) it cross-fades through them
// on a timer and shows dot indicators; the dots are also clickable. Auto-play
// pauses while the pointer is over the card.
export function ProductCardGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const multi = images.length > 1;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!multi || paused) return;
    timer.current = setInterval(
      () => setIdx((i) => (i + 1) % images.length),
      INTERVAL_MS,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [multi, paused, images.length]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={`${i}-${src}`}
          src={src}
          alt={alt}
          fill
          priority={i === 0}
          className={cn(
            "object-cover transition-all duration-700 group-hover:scale-105",
            i === idx ? "opacity-100" : "opacity-0",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ))}

      {multi && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIdx(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 shadow",
                i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
