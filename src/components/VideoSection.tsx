import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { useState } from "react";

const VideoSection = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, hsl(var(--primary) / 0.08), transparent)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              border: "1px solid hsl(var(--primary) / 0.2)",
              color: "hsl(var(--primary))",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase" as const,
            }}
          >
            <Zap size={14} />
            See Us In Action
          </div>

          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              textTransform: "uppercase" as const,
              color: "hsl(var(--foreground))",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Watch How We <span style={{ color: "hsl(var(--primary))" }}>Power</span> Your Home
          </h2>

          <p
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              color: "hsl(var(--muted-foreground))",
              fontSize: "16px",
              lineHeight: 1.7,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            From complex installations to quick repairs — see the quality, speed, and professionalism that sets Electroobuddy apart.
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "16/9",
              background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))",
              border: "1px solid hsl(var(--border) / 0.5)",
              boxShadow: "0 25px 80px hsl(var(--primary) / 0.15), 0 10px 30px hsl(var(--foreground) / 0.08)",
            }}
          >
            {playing ? (
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="Electroobuddy Services"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={() => setPlaying(true)}
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--secondary) / 0.08))",
                }}
              >
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `
                      linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                      linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Electric bolts decoration */}
                <motion.div
                  className="absolute top-8 left-8"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Zap size={28} style={{ color: "hsl(var(--secondary))" }} />
                </motion.div>
                <motion.div
                  className="absolute bottom-8 right-8"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <Zap size={28} style={{ color: "hsl(var(--primary))" }} />
                </motion.div>

                {/* Play button */}
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Pulse rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: "100px",
                      height: "100px",
                      top: "-14px",
                      left: "-14px",
                      border: "2px solid hsl(var(--primary) / 0.3)",
                    }}
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: "100px",
                      height: "100px",
                      top: "-14px",
                      left: "-14px",
                      border: "2px solid hsl(var(--primary) / 0.2)",
                    }}
                    animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />

                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: "72px",
                      height: "72px",
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--electric-blue-dark)))",
                      boxShadow: "0 0 40px hsl(var(--primary) / 0.4)",
                    }}
                  >
                    <Play size={28} fill="hsl(var(--primary-foreground))" color="hsl(var(--primary-foreground))" style={{ marginLeft: "3px" }} />
                  </div>
                </motion.div>

                {/* Caption */}
                <p
                  className="absolute bottom-6 left-1/2 -translate-x-1/2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "hsl(var(--muted-foreground))",
                    letterSpacing: "0.3px",
                  }}
                >
                  Click to play
                </p>
              </div>
            )}
          </div>

          {/* Bottom glow */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl"
            style={{ background: "hsl(var(--primary) / 0.15)" }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
