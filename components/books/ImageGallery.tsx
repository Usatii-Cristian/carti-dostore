"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Imaginile din catalog sunt normalizate 1:1 (vezi
          scripts/squarify-product-images.mts), dar cele încărcate din admin
          păstrează proporția sursei — de-asta `contain`, ca să nu se taie. */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-cream-soft">
        <Image
          src={activeImage}
          alt={`Coperta cărții ${title}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Arată imaginea ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-colors ${
                index === activeIndex ? "ring-terracotta" : "ring-transparent hover:ring-border"
              }`}
            >
              <Image src={image} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
