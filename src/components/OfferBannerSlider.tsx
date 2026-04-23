import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Using the newly created get_active_offers RPC for optimized fetching
        const { data, error } = await supabase.rpc("get_active_offers", {
          p_visibility: visibility
        });

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

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-[200px] sm:h-[300px] md:h-[400px] bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-[2rem]" />
      </div>
    );
  }

  if (offers.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950">
      <div className="embla overflow-hidden relative group" ref={emblaRef}>
        <div className="embla__container flex">
          {offers.map((offer) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative h-[400px] sm:h-[500px] md:h-[600px]" key={offer.id}>
              {/* Background with Image and Gradient Overlay */}
              <div className="absolute inset-0 overflow-hidden">
                {offer.banner_url ? (
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    src={offer.banner_url} 
                    alt={offer.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${offer.bg_gradient || 'from-indigo-600 to-indigo-900'}`} />
                )}
                
                {/* Sophisticated Layered Overlays */}
                <div className="absolute inset-0 bg-zinc-950/20" />
                <div className={`absolute inset-0 bg-gradient-to-r ${offer.bg_gradient?.includes('from-') ? 'from-black/80 via-black/40 to-transparent' : 'from-indigo-950/80 via-indigo-950/20 to-transparent'} hidden md:block`} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full container mx-auto px-6 sm:px-12 flex flex-col justify-center">
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-6"
                  >
                    <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                    Special Offer
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
                  >
                    {offer.title}
                  </motion.h2>
                  
                  {offer.subtitle && (
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-lg sm:text-2xl text-zinc-300 max-w-xl mb-8 font-light"
                    >
                      {offer.subtitle}
                    </motion.p>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-6"
                  >
                    <Button 
                      asChild
                      size="lg"
                      className="rounded-full bg-blue-600 text-white font-bold h-14 px-10 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/20 group/btn"
                    >
                      <Link to={offer.cta_link || "/#request-service"}>
                        {offer.cta_text || "Get Started"}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    
                    {offer.value && offer.value > 0 && (
                      <div className="flex flex-col border-l border-white/20 pl-6 py-1">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Saving</span>
                        <span className="text-white text-3xl font-bold">
                          {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Navigation Controls */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950/50 to-transparent pointer-events-none hidden md:block" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950/50 to-transparent pointer-events-none hidden md:block" />

        <button
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/10 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 z-20 hover:border-white/30"
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/10 hover:bg-white/10 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 z-20 hover:border-white/30"
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
        >
          <ChevronRight size={28} />
        </button>

        {/* Premium Progress Indicators */}
        <div className="absolute bottom-12 container mx-auto px-6 sm:px-12 flex items-center gap-4 z-20">
          <div className="flex gap-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                className={`h-1 transition-all duration-700 rounded-full ${
                  selectedIndex === index ? "w-12 bg-blue-500" : "w-6 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <div className="text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase hidden sm:block">
            {selectedIndex + 1} / {offers.length} Featured Offers
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBannerSlider;
