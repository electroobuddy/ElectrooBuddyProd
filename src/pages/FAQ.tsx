
import { motion, AnimatePresence } from "framer-motion";
import Section from "@/components/Section";
import { Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "What areas do you serve?", a: "We currently serve all major cities and surrounding areas. Contact us to check if we cover your location." },
  { q: "Are your electricians licensed?", a: "Yes, all our electricians are fully licensed, insured, and certified with years of professional experience." },
  { q: "Do you offer emergency services?", a: "Absolutely! We provide 24/7 emergency electrical services. Call us anytime and we'll be there as soon as possible." },
  { q: "How much do your services cost?", a: "Our pricing varies based on the service type and complexity. We provide transparent quotes before starting any work with no hidden fees." },
  { q: "Do you provide warranties?", a: "Yes, we offer warranties on all our work. The duration depends on the type of service performed." },
  { q: "How do I book a service?", a: "You can book through our website using the Book Now button, call us directly, or send us a WhatsApp message." },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

        .faq-hero {
          position: relative;
          padding: 96px 0 80px;
          overflow: hidden;
          background: hsl(var(--background));
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .fh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        .fh-glow {
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 360px;
          background: radial-gradient(ellipse, hsl(var(--primary) / 0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .fh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 100px;
          background: hsl(var(--primary) / 0.06);
          margin-bottom: 20px;
          font-size: 12px;
          font-weight: 600;
          color: hsl(var(--secondary));
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .fh-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 900;
          line-height: 0.93;
          color: hsl(var(--foreground));
          text-transform: uppercase;
          letter-spacing: -1px;
        }

        .fh-title span {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fh-sub {
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 14px;
          margin-top: 14px;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        /* FAQ accordion */
        .faq-wrap {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border) / 0.3);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .faq-item.open {
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 0 28px hsl(var(--primary) / 0.05), -3px 0 0 hsl(var(--primary) / 0.5);
        }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          outline: none;
        }

        .faq-trigger:hover .faq-q {
          color: hsl(var(--secondary));
        }

        .faq-num {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: hsl(var(--primary) / 0.4);
          letter-spacing: 0.5px;
          flex-shrink: 0;
          min-width: 28px;
        }

        .faq-item.open .faq-num { color: hsl(var(--secondary)); }

        .faq-q {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          letter-spacing: 0.3px;
          flex: 1;
          transition: color 0.25s;
          line-height: 1.2;
        }

        .faq-item.open .faq-q { color: hsl(var(--secondary)); }

        .faq-chevron {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid hsl(var(--border) / 0.3);
          background: hsl(var(--primary) / 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--primary) / 0.5);
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .faq-item.open .faq-chevron {
          background: hsl(var(--primary) / 0.12);
          border-color: hsl(var(--primary) / 0.4);
          color: hsl(var(--secondary));
          transform: rotate(180deg);
          box-shadow: 0 0 10px hsl(var(--primary) / 0.15);
        }

        .faq-divider {
          height: 1px;
          background: linear-gradient(90deg, hsl(var(--border) / 0.2), transparent);
          margin: 0 24px;
        }

        .faq-answer {
          padding: 18px 24px 22px;
          font-size: 14px;
          color: hsl(var(--muted-foreground) / 0.6);
          line-height: 1.75;
        }

        .faq-answer-inner {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .faq-answer-bolt {
          flex-shrink: 0;
          margin-top: 3px;
          color: hsl(var(--primary) / 0.4);
        }
      `}</style>

      {/* Hero */}
      <section className="faq-hero">
        <div className="fh-grid" />
        <div className="fh-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="fh-badge"><Zap size={12} /> FAQ</div>
            <h1 className="fh-title">Frequently Asked <span>Questions</span></h1>
            <p className="fh-sub">Answers to the things people ask us most</p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="faq-wrap">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              className={`faq-item ${openIdx === i ? "open" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
            >
              <button
                className="faq-trigger"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="faq-num">0{i + 1}</span>
                <span className="faq-q">{f.q}</span>
                <span className="faq-chevron">
                  <ChevronDown size={15} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="faq-divider" />
                    <div className="faq-answer">
                      <div className="faq-answer-inner">
                        <Zap size={14} className="faq-answer-bolt" />
                        <span>{f.a}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default FAQ;