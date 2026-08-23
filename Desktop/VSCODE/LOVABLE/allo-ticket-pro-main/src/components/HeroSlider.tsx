import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type HeroSlide = {
  src: string;
  alt: string;
  label?: string;
};

interface HeroSliderProps {
  slides: HeroSlide[];
  intervalMs?: number;
  /** Tailwind aspect-ratio utility class for the media container (ex: "aspect-[16/7]") */
  aspectClassName?: string;
}

export default function HeroSlider({
  slides,
  intervalMs = 5000,
  aspectClassName = "aspect-[4/3]",
}: HeroSliderProps) {
  const safeSlides = useMemo(() => (slides.length ? slides : []), [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, safeSlides.length]);

  if (!safeSlides.length) return null;

  const slide = safeSlides[index];

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
        <div className={`${aspectClassName} w-full`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover"
              loading="eager"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Subtle label pill (reference-like) */}
        {slide.label ? (
          <div className="absolute left-5 top-5">
            <span className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {slide.label}
            </span>
          </div>
        ) : null}

        {/* Dots */}
        {safeSlides.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-background/70 px-3 py-2 backdrop-blur-sm">
            {safeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller à l'image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={
                  "h-2 w-2 rounded-full transition-all " +
                  (i === index ? "bg-primary" : "bg-foreground/25 hover:bg-foreground/40")
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
