// import Section from "@/components/Section";
// import { Zap } from "lucide-react";

// const Privacy = () => (
//   <>
//     <section className="bg-hero py-20">
//       <div className="container mx-auto px-4 text-center">
//         <Zap className="w-10 h-10 text-secondary mx-auto mb-4" />
//         <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-primary-foreground">Privacy Policy</h1>
//       </div>
//     </section>
//     <Section>
//       <div className="max-w-3xl mx-auto prose prose-sm text-muted-foreground">
//         <div className="space-y-6">
//           <div>
//             <h2 className="text-xl font-heading font-bold text-foreground">Information We Collect</h2>
//             <p>We collect personal information such as your name, phone number, email address, and service details when you fill out our booking or contact forms. This information is used solely to provide our services and communicate with you.</p>
//           </div>
//           <div>
//             <h2 className="text-xl font-heading font-bold text-foreground">How We Use Your Information</h2>
//             <p>Your information is used to process bookings, respond to inquiries, improve our services, and send relevant updates. We do not sell or share your personal data with third parties without your consent.</p>
//           </div>
//           <div>
//             <h2 className="text-xl font-heading font-bold text-foreground">Data Security</h2>
//             <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
//           </div>
//           <div>
//             <h2 className="text-xl font-heading font-bold text-foreground">Contact Us</h2>
//             <p>If you have any questions about this Privacy Policy, please contact us at hello@electroobuddy.com.</p>
//           </div>
//         </div>
//       </div>
//     </Section>
//   </>
// );

// export default Privacy;

import Section from "@/components/Section";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Eye, Lock, Mail } from "lucide-react";

const policies = [
  {
    icon: Eye,
    title: "Information We Collect",
    text: "We collect personal information such as your name, phone number, email address, and service details when you fill out our booking or contact forms. This information is used solely to provide our services and communicate with you.",
  },
  {
    icon: Zap,
    title: "How We Use Your Information",
    text: "Your information is used to process bookings, respond to inquiries, improve our services, and send relevant updates. We do not sell or share your personal data with third parties without your consent.",
  },
  {
    icon: Lock,
    title: "Data Security",
    text: "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    text: "If you have any questions about this Privacy Policy, please contact us at hello@electroobuddy.com.",
  },
];

const Privacy = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap');

      .privacy-hero {
        position: relative;
        padding: 96px 0 80px;
        overflow: hidden;
        background: #050b18;
        text-align: center;
        font-family: 'DM Sans', sans-serif;
      }

      .ph-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,200,0,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,200,0,0.035) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
      }

      .ph-glow {
        position: absolute;
        top: -80px; left: 50%;
        transform: translateX(-50%);
        width: 500px; height: 350px;
        background: radial-gradient(ellipse, rgba(255,200,0,0.08) 0%, transparent 70%);
        pointer-events: none;
      }

      .ph-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 18px;
        border: 1px solid rgba(255,200,0,0.3);
        border-radius: 100px;
        background: rgba(255,200,0,0.06);
        margin-bottom: 20px;
        font-size: 12px;
        font-weight: 600;
        color: #ffc800;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-family: 'Barlow Condensed', sans-serif;
      }

      .ph-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: clamp(44px, 6vw, 76px);
        font-weight: 900;
        line-height: 0.93;
        color: #f0f4ff;
        text-transform: uppercase;
        letter-spacing: -1px;
      }

      .ph-title span {
        background: linear-gradient(135deg, #ffc800, #ffec6e 50%, #ffa000);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .ph-sub {
        color: rgba(180,200,240,0.4);
        font-size: 14px;
        margin-top: 14px;
        max-width: 340px;
        margin-left: auto;
        margin-right: auto;
      }

      /* Policy cards */
      .policy-wrap {
        max-width: 760px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .policy-card {
        position: relative;
        display: flex;
        gap: 22px;
        align-items: flex-start;
        padding: 28px 28px;
        background: #0a0f1e;
        border: 1px solid rgba(255,200,0,0.1);
        border-radius: 18px;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.35s ease;
      }

      .policy-card::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, #ffc800, transparent);
        opacity: 0;
        border-radius: 18px 0 0 18px;
        transition: opacity 0.35s;
      }

      .policy-card:hover {
        border-color: rgba(255,200,0,0.3);
        background: rgba(255,200,0,0.02);
        transform: translateX(4px);
        box-shadow: -3px 0 0 rgba(255,200,0,0.5), 0 8px 32px rgba(0,0,0,0.3);
      }

      .policy-card:hover::before { opacity: 1; }

      .policy-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255,200,0,0.08);
        border: 1px solid rgba(255,200,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffc800;
        flex-shrink: 0;
        transition: all 0.35s;
      }

      .policy-card:hover .policy-icon-box {
        background: rgba(255,200,0,0.15);
        box-shadow: 0 0 16px rgba(255,200,0,0.2);
      }

      .policy-num {
        position: absolute;
        bottom: 10px; right: 16px;
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 52px;
        font-weight: 900;
        color: rgba(255,200,0,0.03);
        line-height: 1;
        user-select: none;
        pointer-events: none;
      }

      .policy-content { flex: 1; }

      .policy-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-size: 20px;
        font-weight: 800;
        text-transform: uppercase;
        color: #f0f4ff;
        letter-spacing: 0.4px;
        margin-bottom: 8px;
      }

      .policy-text {
        font-size: 14px;
        color: rgba(180,200,240,0.6);
        line-height: 1.75;
      }

      .policy-email {
        color: #ffc800;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .policy-email:hover { opacity: 0.75; }

      /* Bottom note */
      .privacy-note {
        margin-top: 40px;
        padding: 20px 24px;
        background: rgba(255,200,0,0.04);
        border: 1px solid rgba(255,200,0,0.1);
        border-radius: 14px;
        font-size: 13px;
        color: rgba(180,200,240,0.45);
        text-align: center;
        font-family: 'DM Sans', sans-serif;
        line-height: 1.6;
        max-width: 760px;
        margin-left: auto;
        margin-right: auto;
      }
    `}</style>

    {/* Hero */}
    <section className="privacy-hero">
      <div className="ph-grid" />
      <div className="ph-glow" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="ph-badge"><ShieldCheck size={12} /> Legal</div>
          <h1 className="ph-title">Privacy <span>Policy</span></h1>
          <p className="ph-sub">How we collect, use, and protect your information</p>
        </motion.div>
      </div>
    </section>

    <Section>
      <div className="policy-wrap">
        {policies.map((p, i) => (
          <motion.div
            key={p.title}
            className="policy-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="policy-icon-box">
              <p.icon size={20} />
            </div>
            <div className="policy-content">
              <div className="policy-title">{p.title}</div>
              <p className="policy-text">
                {p.title === "Contact Us" ? (
                  <>
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <a href="mailto:hello@electroobuddy.com" className="policy-email">
                      hello@electroobuddy.com
                    </a>
                    .
                  </>
                ) : (
                  p.text
                )}
              </p>
            </div>
            <div className="policy-num">0{i + 1}</div>
          </motion.div>
        ))}
      </div>

      <div className="privacy-note">
        This policy was last updated in 2025. By using our services, you agree to the collection and use of information as described above. We reserve the right to update this policy at any time.
      </div>
    </Section>
  </>
);

export default Privacy;