import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Offer {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  banner_url: string;
  cta_text: string | null;
  cta_link: string | null;
  bg_gradient: string | null;
  type: string;
  value: number | null;
}

interface OfferBannerSliderProps {
  visibility?: "home_hero" | "products_page" | "popup";
}

const OfferBannerSlider: React.FC<OfferBannerSliderProps> = ({ visibility = "home_hero" }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase.rpc("get_active_offers", { p_visibility: visibility });
        if (error) throw error;
        setOffers((data as any[]) || []);
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [visibility]);

  // ── Skeleton: strip height only ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full h-10 sm:h-11 bg-blue-700 animate-pulse" />
    );
  }

  if (offers.length === 0 || dismissed) return null;

  return (
    <div className="relative w-full bg-blue-700 border-b border-white/10 overflow-hidden">
      {/* Embla viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {offers.map((offer) => {
            const discountLabel =
              offer.value && offer.value > 0
                ? offer.type === "percentage"
                  ? `${offer.value}% OFF`
                  : `₹${offer.value} OFF`
                : null;

            return (
              <div
                key={offer.id}
                className="flex-[0_0_100%] min-w-0 relative"
              >
                {/* Per-slide gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${offer.bg_gradient || "from-blue-600 to-blue-800"}`}
                />

                {/* Strip content */}
                <div className="relative h-10 sm:h-11 flex items-center justify-center gap-2 sm:gap-4 px-10 sm:px-14">

                  {/* ── Left: Offer badge ── */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Sparkles size={9} className="text-yellow-300" />
                    Offer
                  </div>

                  {/* ── Centre: title + subtitle + discount ── */}
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Discount pill (always visible) */}
                    {discountLabel && (
                      <span className="shrink-0 rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-extrabold text-yellow-900 leading-none">
                        {discountLabel}
                      </span>
                    )}

                    {/* Title */}
                    <p className="text-white font-semibold text-sm sm:text-[13px] leading-none truncate max-w-[200px] sm:max-w-none">
                      {offer.title}
                    </p>

                    {/* Separator + subtitle (hidden on xs) */}
                    {offer.subtitle && (
                      <>
                        <span className="hidden sm:block h-3 w-px bg-white/30 shrink-0" />
                        <p className="hidden sm:block text-white/80 text-[12px] leading-none truncate max-w-xs">
                          {offer.subtitle}
                        </p>
                      </>
                    )}

                    {/* Description (visible md+) */}
                    {offer.description && (
                      <>
                        <span className="hidden md:block h-3 w-px bg-white/30 shrink-0" />
                        <p className="hidden md:block text-white/70 text-[11px] leading-none truncate max-w-sm">
                          {offer.description}
                        </p>
                      </>
                    )}
                  </div>

                  {/* ── Right: CTA button ── */}
                  <Link
                    to={offer.cta_link || "/#request-service"}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow group/btn"
                  >
                    {offer.cta_text || "Claim"}
                    <ArrowRight
                      size={11}
                      className="group-hover/btn:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Prev / Next arrows (only shown when > 1 offer) ── */}
      {offers.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous offer"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next offer"
            className="absolute right-8 sm:right-9 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      {/* ── Dot indicators (shown when > 1 offer) ── */}
      {offers.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1 z-10">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1 rounded-full transition-all ${
                i === selectedIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Dismiss button ── */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-5 w-5 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default OfferBannerSlider;