"use client"

import { useEffect, useState, memo, useMemo } from "react"
import { ArrowRight, Phone, Shield, Clock, Zap } from "lucide-react"

/* ─── Constants ─── */
const STATS = [
  { value: "100+", label: "Happy Clients", icon: Shield },
  { value: "4.9★", label: "Avg Rating", icon: Clock },
  { value: "2min", label: "Quick Booking", icon: Zap },
]

const SERVICES_MARQUEE = [
  "Exterior Wash",
  "Interior Detailing",
  "Foam Wash",
  "Engine Bay",
  "Ceramic Coating",
]

const BG_IMAGE =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop"

const WHATSAPP_URL =
  "https://wa.me/916900706456?text=Hi%2C%20I%27d%20like%20to%20book%20a%20car%20wash"

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

/* ─── Greeting Hook ─── */
function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome")
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening")
  }, [])
  return greeting
}

/* ─── Marquee ─── */
const ServicesMarquee = memo(function ServicesMarquee() {
  const doubled = useMemo(() => [...SERVICES_MARQUEE, ...SERVICES_MARQUEE], [])
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
      <div
        style={{
          display: "inline-flex",
          gap: 24,
          animation: "hero-scroll 28s linear infinite",
        }}
      >
        {doubled.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.18)",
                fontFamily: SANS,
              }}
            >
              {s}
            </span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  )
})

/* ─── Pulsing Dot ─── */
function PulsingDot() {
  return (
    <span
      style={{
        position: "relative",
        display: "flex",
        width: 6,
        height: 6,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#fff",
          opacity: 0.5,
          animation: "hero-ping 2s cubic-bezier(0,0,0.2,1) infinite",
        }}
      />
      <span
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#fff",
        }}
      />
    </span>
  )
}

/* ─── Stat Card ─── */
function StatCard({ stat, compact }) {
  const Icon = stat.icon
  return (
    <div
      style={{
        padding: compact ? "10px 12px" : "14px 18px",
        borderRadius: 10,
        border: "0.5px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        flex: compact ? undefined : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,0.2)",
          marginBottom: compact ? 6 : 8,
        }}
      >
        <Icon size={12} strokeWidth={1.5} />
        {!compact && (
          <div style={{ width: 12, height: 0.5, background: "rgba(255,255,255,0.1)" }} />
        )}
      </div>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: compact ? 16 : "clamp(1rem, 1.8vw, 1.3rem)",
          color: "#fff",
          lineHeight: 1,
          margin: "0 0 3px",
        }}
      >
        {stat.value}
      </p>
      <p
        style={{
          fontSize: 7,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
          margin: 0,
          fontFamily: SANS,
        }}
      >
        {compact ? stat.label.split(" ")[0] : stat.label}
      </p>
    </div>
  )
}

/* ─── Main ─── */
export default function Hero() {
  const greeting = useGreeting()
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVis(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const fi = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  })

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        background: "#000",
        fontFamily: SANS,
      }}
      aria-label="Hero section"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;1,300&display=swap');

        @keyframes hero-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes hero-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }

        .hero-btn-primary {
          display: flex; align-items: center; justify-content: space-between;
          height: 56px; padding: 0 20px; background: #fff; color: #000;
          border-radius: 12px; text-decoration: none;
          transition: box-shadow 0.3s, transform 0.15s;
        }
        .hero-btn-primary:hover { box-shadow: 0 12px 36px rgba(255,255,255,0.1); }
        .hero-btn-primary:active { transform: scale(0.98); }

        .hero-btn-ghost {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; height: 52px; border-radius: 12px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4); text-decoration: none;
          transition: color 0.25s, border-color 0.25s, background 0.25s;
        }
        .hero-btn-ghost:hover {
          color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
        }

        .hero-arrow-box {
          width: 32px; height: 32px; border-radius: 8px; background: #000;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .hero-btn-primary:hover .hero-arrow-box { transform: scale(1.1); }

        .hero-qlink {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; text-decoration: none;
        }
        .hero-qlink-text {
          font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.22); transition: color 0.25s;
        }
        .hero-qlink:hover .hero-qlink-text { color: rgba(255,255,255,0.5); }
        .hero-qlink-bar {
          height: 0.5px; background: rgba(255,255,255,0.25);
          width: 0; transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-qlink:hover .hero-qlink-bar { width: 36px; }

        @media (prefers-reduced-motion: reduce) {
          .hero-scroll { animation: none !important; }
          .hero-ping { animation: none !important; }
        }
      `}</style>

      {/* ── Background ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <img
          src={BG_IMAGE}
          alt=""
          role="presentation"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.3) contrast(1.1) saturate(0.7)",
            display: "block",
          }}
        />
      </div>

      {/* ── Overlays ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 30%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 22%)",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MOBILE                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="sm:hidden"
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          padding: "16px 16px 0",
        }}
      >
        {/* Header */}
        <div style={{ ...fi(0.1), display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexShrink: 0 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>
            Wash<span style={{ color: "rgba(255,255,255,0.58)" }}>2</span>Door
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <PulsingDot />
            <span style={{ fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>Open</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Content */}
        <div style={{ paddingBottom: 72 }}>
          {/* Greeting */}
          <div style={{ ...fi(0.2), display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 16, height: 0.5, background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)" }} />
            <span style={{ fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
              {greeting}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ ...fi(0.3), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(2.5rem, 11vw, 4rem)", color: "#fff", lineHeight: 0.92, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            The Shine
          </h1>
          <h1 style={{ ...fi(0.38), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(2.5rem, 11vw, 4rem)", color: "#fff", lineHeight: 0.92, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            That Finds
          </h1>
          <h1 style={{ ...fi(0.46), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(2.2rem, 10vw, 3.5rem)", color: "rgba(255,255,255,0.1)", lineHeight: 0.92, letterSpacing: "-0.02em", fontStyle: "italic", margin: "0 0 20px" }}>
            You
          </h1>

          {/* Divider */}
          <div style={{ ...fi(0.5), display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 24, height: 0.5, background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
          </div>

          <p style={{ ...fi(0.56), fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: "0 0 24px", letterSpacing: "0.005em" }}>
            Premium doorstep car wash in Duliajan. Book in seconds — we bring everything.
          </p>

          {/* CTAs */}
          <div style={{ ...fi(0.64), display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            <a href="/services" className="hero-btn-primary">
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>Book Now</span>
              <div className="hero-arrow-box"><ArrowRight size={14} color="#fff" /></div>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hero-btn-ghost">
              <Phone size={15} strokeWidth={1.5} />
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" }}>WhatsApp Us</span>
            </a>
          </div>

          {/* Stats */}
          <div style={{ ...fi(0.72), display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} compact />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABLET                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden sm:flex lg:hidden"
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100svh",
          flexDirection: "column",
          padding: "24px 24px 0",
        }}
      >
        {/* Header */}
        <div style={{ ...fi(0.1), display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, flexShrink: 0 }}>
          <div>
            <span style={{ display: "block", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>
              Wash<span style={{ color: "rgba(255,255,255,0.58)" }}>2</span>Door
            </span>
            <span style={{ display: "block", fontSize: 6, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginTop: 3 }}>
              Duliajan, Assam
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <PulsingDot />
            <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>Open · 9–5 PM</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ paddingBottom: 72 }}>
          {/* Tagline */}
          <div style={{ ...fi(0.2), display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 24, height: 0.5, background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)" }} />
            <span style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
              The Shine That Finds You
            </span>
          </div>

          <h1 style={{ ...fi(0.3), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "#fff", lineHeight: 0.92, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            The Shine That
          </h1>
          <h1 style={{ ...fi(0.4), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "rgba(255,255,255,0.1)", lineHeight: 0.92, letterSpacing: "-0.02em", fontStyle: "italic", margin: "0 0 32px" }}>
            Finds You
          </h1>

          <p style={{ ...fi(0.5), fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 600 }}>
            Premium car wash that comes to you. Book in seconds — we arrive fully equipped.
          </p>

          {/* CTAs */}
          <div style={{ ...fi(0.58), display: "flex", gap: 12, marginBottom: 48, maxWidth: 500 }}>
            <a href="/services" className="hero-btn-primary" style={{ flex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>Book Now</span>
              <div className="hero-arrow-box"><ArrowRight size={14} color="#fff" /></div>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hero-btn-ghost" style={{ padding: "0 20px" }}>
              <Phone size={15} strokeWidth={1.5} />
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" }}>WhatsApp</span>
            </a>
          </div>

          <div style={{ ...fi(0.64), marginBottom: 16 }}>
            <ServicesMarquee />
          </div>
          <div style={{ ...fi(0.66), width: "100%", height: 0.5, background: "rgba(255,255,255,0.05)", marginBottom: 16 }} />

          {/* Stats */}
          <div style={{ ...fi(0.7), display: "flex", gap: 10 }}>
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100svh",
          flexDirection: "column",
          padding: "32px 48px",
        }}
      >
        {/* Header */}
        <div style={{ ...fi(0.1), display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 64, flexShrink: 0 }}>
          <div>
            <span style={{ display: "block", fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>
              Wash<span style={{ color: "rgba(255,255,255,0.58)" }}>2</span>Door
            </span>
            <span style={{ display: "block", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.14)", marginTop: 4 }}>
              Duliajan, Assam
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{greeting}</span>
            <div style={{ width: 0.5, height: 16, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              <PulsingDot />
              <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>Open · 9–5 PM</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 60 }} />

        {/* Main */}
        <div style={{ flexShrink: 0, paddingBottom: 24 }}>
          {/* Tagline */}
          <div style={{ ...fi(0.2), display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
            <div style={{ width: 28, height: 0.5, background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)" }} />
            <span style={{ fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
              The Shine That Finds You
            </span>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
          </div>

          {/* Headline + Right col */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 64, marginBottom: 64 }}>
            <div style={{ flexShrink: 0, maxWidth: 700 }}>
              <h1 style={{ ...fi(0.3), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(4rem, 7vw, 8rem)", color: "#fff", lineHeight: 0.92, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
                The Shine
              </h1>
              <h1 style={{ ...fi(0.38), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(4rem, 7vw, 8rem)", color: "#fff", lineHeight: 0.92, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                That Finds
              </h1>
              <h1 style={{ ...fi(0.46), fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(3rem, 6vw, 7rem)", color: "rgba(255,255,255,0.1)", lineHeight: 0.92, letterSpacing: "-0.02em", fontStyle: "italic", margin: 0 }}>
                You
              </h1>
            </div>

            {/* Right panel */}
            <div style={{ ...fi(0.5), flexShrink: 0, width: "clamp(280px, 24vw, 340px)", paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 20, height: 0.5, background: "linear-gradient(to right, rgba(255,255,255,0.25), transparent)" }} />
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.8, margin: "0 0 32px" }}>
                Premium car wash that comes to you. Book in seconds — we arrive fully equipped.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/services" className="hero-btn-primary">
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>Book Your Wash</span>
                  <div className="hero-arrow-box"><ArrowRight size={14} color="#fff" /></div>
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hero-btn-ghost" style={{ height: 48 }}>
                  <Phone size={13} strokeWidth={1.5} />
                  <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" }}>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={fi(0.6)}>
            <div style={{ marginBottom: 20 }}>
              <ServicesMarquee />
            </div>
            <div style={{ width: "100%", height: 0.5, background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
              <div style={{ display: "flex", gap: 14 }}>
                {STATS.map((stat) => (
                  <StatCard key={stat.label} stat={stat} />
                ))}
              </div>

              <nav style={{ display: "flex", gap: 32 }} aria-label="Quick links">
                {["Services", "About", "Contact"].map((link) => (
                  <a key={link} href={`/${link.toLowerCase()}`} className="hero-qlink">
                    <span className="hero-qlink-text">{link}</span>
                    <span className="hero-qlink-bar" />
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}