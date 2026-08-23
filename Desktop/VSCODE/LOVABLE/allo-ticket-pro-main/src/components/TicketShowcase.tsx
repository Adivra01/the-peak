import { motion } from "framer-motion";

/**
 * Représentation visuelle (mock) d'un ticket, inspirée de la capture.
 * Purement UI (aucune logique ticketing).
 */
export default function TicketShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative"
    >
      {/* Soft shadow under */}
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-secondary/50 blur-2xl" />

      <motion.div
        animate={{ rotate: [-2, -1.2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto w-full max-w-xl"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
          {/* Top band */}
          <div className="relative bg-primary px-8 py-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold tracking-[0.2em] opacity-90">YOUR PRESENT</div>
              <div className="flex gap-1 opacity-90">
                <span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
                <span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
                <span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
              </div>
            </div>
            <div className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">ONE WAY TICKET</div>
          </div>

          {/* Middle content */}
          <div className="relative px-8 py-8">
            {/* Faux perforation line */}
            <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-border" />
            <div className="text-xs font-semibold tracking-[0.22em] text-muted-foreground">YOUR PRESENT</div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">ONE WAY TICKET</div>
            <div className="mt-4 flex items-center gap-2 text-muted-foreground">
              <span className="text-base">★</span>
              <span className="text-base">★</span>
              <span className="text-base">★</span>
            </div>
          </div>

          {/* Side punch cutouts */}
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
            <div className="relative h-40 w-10">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute right-[-14px] h-10 w-10 rounded-full bg-background shadow-soft"
                  style={{ top: `${i * 48}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Caption */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Aperçu du ticket digital (style) — le vrai ticket se génère après réservation.
      </div>
    </motion.div>
  );
}
