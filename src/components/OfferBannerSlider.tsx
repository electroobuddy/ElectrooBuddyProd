import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Offer = Tables<'offers'>;

interface OfferBannerSliderProps {
  visibility?: "home_hero" | "products_page" | "popup";
}

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const distance = new Date(expiresAt).getTime() - new Date().getTime();
      if (distance <= 0) return null;
      return {
        h: Math.floor(distance / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) return null;

  return (
    <div className="hidden xs:flex items-center gap-1 font-mono text-[10px] sm:text-[11px] bg-black/20 px-2 py-0.5 rounded text-white border border-white/10 shrink-0">
      <span className="opacity-70 uppercase text-[8px] mr-1 font-sans font-bold hidden sm:inline">Ends in</span>
      <span>{String(timeLeft.h).padStart(2, '0')}</span>:
      <span>{String(timeLeft.m).padStart(2, '0')}</span>:
      <span>{String(timeLeft.s).padStart(2, '0')}</span>
    </div>
  );
};

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
                className="flex-[0_0_100%] min-w-0 relative cursor-pointer"
                onClick={() => {
                  const link = offer.cta_link || "";
                  if (link.startsWith("http://") || link.startsWith("https://")) {
                    window.open(link, "_blank", "noopener,noreferrer");
                  } else if (link) {
                    window.location.href = link;
                  } else {
                    // Default fallback: go to products
                    window.location.href = "/products";
                  }
                }}
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

                  {/* ── Countdown Timer ── */}
                  {offer.expires_at && <CountdownTimer expiresAt={offer.expires_at} />}

                  {/* ── Right: CTA button ── */}
                  {offer.cta_link && (offer.cta_link.startsWith('http://') || offer.cta_link.startsWith('https://')) ? (

                    <a
                      href={offer.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow group/btn"
                    >
                      {offer.cta_text || "Claim"}
                      <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      to={offer.cta_link || "/products"}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow group/btn"
                    >
                      {offer.cta_text || "Claim"}
                      <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Prev / Next arrows (only shown when > 1 offer) ── */}
      {
        offers.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
              aria-label="Previous offer"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 ..."
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); scrollNext(); }}
              aria-label="Next offer"
              className="absolute right-8 sm:right-9 top-1/2 -translate-y-1/2 z-20 ..."
            >
              <ChevronRight size={14} />
            </button>
          </>
        )
      }

      {/* ── Dot indicators (shown when > 1 offer) ── */}
      {
        offers.length > 1 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1 z-10">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1 rounded-full transition-all ${i === selectedIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
              />
            ))}
          </div>
        )
      }

      {/* ── Dismiss button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
        aria-label="Close"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-5 w-5 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={12} />
      </button>
    </div >
  );
};

export default OfferBannerSlider;