import Section from "@/components/Section";
import { motion } from "framer-motion";
import { Zap, FileText, CreditCard, ShieldCheck, AlertTriangle } from "lucide-react";

const terms = [
  {
    icon: FileText,
    num: "01",
    title: "Service Agreement",
    text: "By booking a service through Electroobuddy, you agree to provide accurate information and be available at the scheduled time. Cancellations must be made at least 2 hours before the appointment.",
  },
  {
    icon: CreditCard,
    num: "02",
    title: "Payment Terms",
    text: "Payment is due upon completion of service unless otherwise agreed. We accept cash, bank transfers, and digital payments.",
  },
  {
    icon: ShieldCheck,
    num: "03",
    title: "Warranty",
    text: "All work performed comes with a service warranty. The warranty period varies by service type and will be communicated at the time of booking.",
  },
  {
    icon: AlertTriangle,
    num: "04",
    title: "Liability",
    text: "Electroobuddy is not liable for damages resulting from pre-existing electrical issues. Our team will inform you of any risks before proceeding with work.",
  },
];

const Terms = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

      .terms-hero {
        position: relative;
        padding: 96px 0 80px;
        overflow: hidden;
        background: hsl(var(--background));
        text-align: center;
        font-family: 'DM Sans', sans-serif;
      }

      .th-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(hsl(var(--primary) / 0.035) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary) / 0.035) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
      }

      .th-glow {
        position: absolute;
        top: -80px; left: 50%;
        transform: translateX(-50%);
        width: 500px; height: 350px;
        background: radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%);
        pointer-events: none;
      }

      .th-badge {
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

      .th-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: clamp(44px, 6vw, 76px);
        font-weight: 900;
        line-height: 0.93;
        color: hsl(var(--foreground));
        text-transform: uppercase;
        letter-spacing: -1px;
      }

      .th-title span {
        background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--electric-yellow-light)) 50%, hsl(var(--electric-blue-dark)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .th-sub {
        color: hsl(var(--muted-foreground) / 0.5);
        font-size: 14px;
        margin-top: 14px;
        max-width: 360px;
        margin-left: auto;
        margin-right: auto;
      }

      /* Cards */
      .terms-wrap {
        max-width: 760px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .term-card {
        position: relative;
        display: flex;
        gap: 22px;
        align-items: flex-start;
        padding: 28px 28px;
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border) / 0.3);
        border-radius: 18px;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.35s ease;
      }

      .term-card:hover {
        border-color: hsl(var(--primary) / 0.5);
        background: hsl(var(--primary) / 0.02);
        transform: translateX(4px);
        box-shadow: -3px 0 0 hsl(var(--primary) / 0.5), 0 8px 32px hsl(var(--foreground) / 0.1);
      }

      .term-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: hsl(var(--primary) / 0.08);
        border: 1px solid hsl(var(--border) / 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: hsl(var(--secondary));
        flex-shrink: 0;
        transition: all 0.35s;
      }

      .term-card:hover .term-icon-box {
        background: hsl(var(--primary) / 0.15);
        box-shadow: 0 0 16px hsl(var(--primary) / 0.2);
      }

      .term-num {
        position: absolute;
        bottom: 8px; right: 16px;
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 52px;
        font-weight: 900;
        color: hsl(var(--primary) / 0.03);
        line-height: 1;
        user-select: none;
        pointer-events: none;
      }

      .term-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 20px;
        font-weight: 800;
        text-transform: uppercase;
        color: hsl(var(--foreground));
        letter-spacing: 0.4px;
        margin-bottom: 8px;
      }

      .term-text {
        font-size: 14px;
        color: hsl(var(--muted-foreground) / 0.6);
        line-height: 1.75;
      }

      .terms-footer-note {
        margin-top: 40px;
        padding: 20px 24px;
        background: hsl(var(--primary) / 0.04);
        border: 1px solid hsl(var(--border) / 0.3);
        border-radius: 14px;
        font-size: 13px;
        color: hsl(var(--muted-foreground) / 0.6);
        text-align: center;
        font-family: 'DM Sans', sans-serif;
        line-height: 1.65;
        max-width: 760px;
        margin-left: auto;
        margin-right: auto;
      }
    `}</style>

    <section className="terms-hero">
      <div className="th-grid" />
      <div className="th-glow" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="th-badge"><Zap size={12} /> Legal</div>
          <h1 className="th-title">Terms & <span>Conditions</span></h1>
          <p className="th-sub">Please read these terms carefully before using our services</p>
        </motion.div>
      </div>
    </section>

    <Section>
      <div className="terms-wrap">
        {terms.map((t, i) => (
          <motion.div
            key={t.title}
            className="term-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="term-icon-box">
              <t.icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="term-title">{t.title}</div>
              <p className="term-text">{t.text}</p>
            </div>
            <div className="term-num">{t.num}</div>
          </motion.div>
        ))}
      </div>

      <div className="terms-footer-note">
        By using Electroobuddy's services, you acknowledge that you have read and agree to these Terms & Conditions. We reserve the right to update these terms at any time. Last updated 2025.
      </div>
    </Section>
  </>
);

export default Terms;