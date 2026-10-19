'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Sessions', href: '#sessions' },
  { label: 'Find Us', href: '#find-us' },
]

const FEATURE_CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Gentle Contact',
    body: 'No forceful manipulation. Feather-light touches at specific spinal gateways signal the nervous system to self-organise and release.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Spinal Intelligence',
    body: 'The spine is your body\'s primary communication highway. Meru sessions help it rediscover natural breathing waves and rhythmic movement.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Progressive Care',
    body: 'Three levels — Discover, Transform, Awaken — each building on the last. Clients progress through phases as their system evolves.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Holistic Wellbeing',
    body: 'Beyond pain relief — clients report improved sleep, emotional resilience, mental clarity, and a deeper sense of ease in daily life.',
  },
]

const PHILOSOPHY_CARDS = [
  {
    label: 'RTA · ऋत',
    title: 'Cosmic Order',
    body: 'The Vedic principle of natural law and cosmic rhythm — the intelligence that holds stars in orbit and seasons in sequence. Healing is a return to this order.',
  },
  {
    label: 'SPANDA · स्पन्द',
    title: 'The Sacred Pulse',
    body: 'From the Spanda Kārikā — the primordial vibration underlying all existence. Every cell pulses, every breath undulates. Meru reconnects us to this living wave.',
  },
  {
    label: 'MERU · मेरु',
    title: 'The Sacred Mountain',
    body: 'The spine as Mount Meru — axis of the body-world. Clearing the spine is not merely physical; it is restoring the channel through which consciousness flows.',
  },
  {
    label: 'CHIKITSA · चिकित्सा',
    title: 'Healing as Inquiry',
    body: 'Not a treatment done to you but a process that unfolds within you. The practitioner is a facilitator; your body is the healer. Every session deepens that self-knowledge.',
  },
]

const PACKAGES = [
  {
    name: 'Complimentary',
    sessions: '1 session',
    price: '₹0',
    per: 'introductory',
    body: 'Experience a full session. No commitment required. For first-time visitors only.',
    popular: false,
  },
  {
    name: 'Single',
    sessions: '1 session',
    price: '₹1,500',
    per: 'per session',
    body: 'One standalone session for continuing clients.',
    popular: false,
  },
  {
    name: 'Starter',
    sessions: '3 sessions',
    price: '₹4,000',
    per: '₹1,333 per session',
    body: 'Begin noticing the spinal wave and initial releases.',
    popular: false,
  },
  {
    name: 'Discovery',
    sessions: '11 sessions',
    price: '₹12,000',
    per: '₹1,091 per session',
    body: 'Complete the Discover Phase. Most clients see lasting shifts at this stage.',
    popular: true,
  },
  {
    name: 'Transform',
    sessions: '16 sessions',
    price: '₹16,000',
    per: '₹1,000 per session',
    body: 'Enter the Transform Phase. Deeper patterns begin to reorganise.',
    popular: false,
  },
  {
    name: 'Full Journey',
    sessions: '24 sessions',
    price: '₹22,000',
    per: '₹917 per session',
    body: 'Discover → Transform. A complete first arc of Meru Chikitsa care.',
    popular: false,
  },
]

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#C99A2E" strokeWidth="0.8" opacity="0.6" />
      <path d="M20 8 Q23 14 20 20 Q17 26 20 32" stroke="#5B8A5E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14 12 Q20 10 26 12" stroke="#5B8A5E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M13 17 Q20 15 27 17" stroke="#5B8A5E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M13 22 Q20 20 27 22" stroke="#5B8A5E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M14 27 Q20 25 26 27" stroke="#5B8A5E" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="20" cy="20" r="2.5" fill="#C99A2E" opacity="0.8" />
      <circle cx="20" cy="11" r="1.5" fill="#C99A2E" opacity="0.5" />
      <circle cx="20" cy="29" r="1.5" fill="#C99A2E" opacity="0.5" />
    </svg>
  )
}

function SpineIllustration() {
  const vertebrae = [60, 88, 114, 138, 160, 180, 198, 216, 236, 258, 282, 304, 326]
  const widths =    [22, 25,  27,  28,  28,  30,  30,  29,  27,  26,  24,  23,  22]
  const gateways = [114, 180, 258]

  return (
    <svg viewBox="0 0 240 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto lg:max-w-sm">
      <circle cx="120" cy="200" r="170" stroke="#C99A2E" strokeWidth="0.4" opacity="0.25" />
      <circle cx="120" cy="200" r="130" stroke="#5B8A5E" strokeWidth="0.4" opacity="0.18" />
      <line x1="120" y1="48" x2="120" y2="352" stroke="#C99A2E" strokeWidth="0.6" opacity="0.3" />
      {vertebrae.map((y, i) => (
        <ellipse
          key={i}
          cx="120"
          cy={y}
          rx={widths[i]}
          ry="5"
          stroke="#5B8A5E"
          strokeWidth="0.9"
          fill="none"
          opacity={gateways.includes(y) ? 0.9 : 0.45}
        />
      ))}
      {gateways.map((y) => (
        <circle key={y} cx="120" cy={y} r="3.5" fill="#C99A2E" opacity="0.75" />
      ))}
      <circle cx="120" cy="180" r="5.5" fill="none" stroke="#C99A2E" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    setMenuOpen(false)
    document.getElementById(id.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ backgroundColor: '#F6F1E6', color: '#2E4A3B', fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)' }} className="min-h-screen">

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(246,241,230,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(46,74,59,0.1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
            {/* Logo */}
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <LogoMark size={36} />
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 18, fontWeight: 500, color: '#2E4A3B', lineHeight: 1.1 }}>Rit-Spanda</div>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: '#5B8A5E', textTransform: 'uppercase', fontWeight: 500 }}>Wellness Studio</div>
              </div>
            </a>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
              {NAV_LINKS.map(l => (
                <button key={l.href} onClick={() => scrollTo(l.href)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#2E4A3B', fontWeight: 400, letterSpacing: '0.01em', opacity: 0.8 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
                >
                  {l.label}
                </button>
              ))}
              <Link href="/portal-login" style={{
                fontSize: 14, color: '#2E4A3B', fontWeight: 500,
                border: '1px solid rgba(46,74,59,0.3)', borderRadius: 24,
                padding: '7px 18px', textDecoration: 'none', letterSpacing: '0.01em',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2E4A3B'; e.currentTarget.style.color = '#F6F1E6' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2E4A3B' }}
              >
                Login →
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {menuOpen ? (
                  <>
                    <line x1="3" y1="3" x2="19" y2="19" stroke="#2E4A3B" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="19" y1="3" x2="3" y2="19" stroke="#2E4A3B" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="7" x2="19" y2="7" stroke="#2E4A3B" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="13" x2="19" y2="13" stroke="#2E4A3B" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: '#F6F1E6', borderTop: '1px solid rgba(46,74,59,0.1)', padding: '16px 24px 24px' }} className="md:hidden">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#2E4A3B', padding: '10px 0', borderBottom: '1px solid rgba(46,74,59,0.08)' }}
              >
                {l.label}
              </button>
            ))}
            <Link href="/portal-login" onClick={() => setMenuOpen(false)}
              style={{ display: 'block', marginTop: 16, textAlign: 'center', fontSize: 15, color: '#2E4A3B', fontWeight: 500, border: '1px solid rgba(46,74,59,0.3)', borderRadius: 24, padding: '10px 0', textDecoration: 'none' }}
            >
              Client Login →
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="grid-cols-1 md:grid-cols-2">

          {/* Left */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 28 }}>
              Meru Chikitsa · Network Spinal · North Bangalore
            </p>
            <h1 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 300, lineHeight: 1.1, color: '#2E4A3B', marginBottom: 28 }}>
              Where the spine<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400 }}>remembers</em><br />
              its order
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#2E4A3B', opacity: 0.75, maxWidth: 420, marginBottom: 40 }}>
              Rit-Spanda Wellness Studio offers Meru Chikitsa — a gentle, contact-based healing practice that helps your nervous system release tension and return to its innate intelligence.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <button onClick={() => scrollTo('#sessions')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#5B8A5E', fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                Explore Sessions
              </button>
              <button onClick={() => scrollTo('#about')}
                style={{
                  background: 'none', border: '1.5px solid #2E4A3B', borderRadius: 28,
                  padding: '12px 24px', cursor: 'pointer', fontSize: 14,
                  color: '#2E4A3B', fontWeight: 500, letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2E4A3B'; e.currentTarget.style.color = '#F6F1E6' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2E4A3B' }}
              >
                What is Meru Chikitsa?
              </button>
            </div>
          </div>

          {/* Right — spine illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.9 }} className="hidden md:flex">
            <SpineIllustration />
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ backgroundColor: '#EDE8D8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>The Practice</p>
          <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#2E4A3B', marginBottom: 24, maxWidth: 600 }}>
            What is Meru Chikitsa?
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: '#2E4A3B', opacity: 0.75, maxWidth: 700, marginBottom: 64 }}>
            Meru Chikitsa is the Indian name for Network Spinal — a pioneering healing system developed by Dr. Donald Epstein. Through gentle, precise contacts along the spine, it invites the body to develop new strategies for releasing tension and accessing greater energy and ease.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURE_CARDS.map((c) => (
              <div key={c.title} style={{
                backgroundColor: '#F6F1E6', borderRadius: 16,
                border: '1px solid rgba(46,74,59,0.12)',
                padding: '32px 28px',
              }}>
                <div style={{ color: '#5B8A5E', marginBottom: 20 }}>{c.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 22, fontWeight: 500, color: '#2E4A3B', marginBottom: 12 }}>{c.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#2E4A3B', opacity: 0.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section id="philosophy" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 24, textAlign: 'center' }}>Our Philosophy</p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 300, lineHeight: 1.2,
            color: '#2E4A3B', textAlign: 'center',
            marginBottom: 32,
          }}>
            <em style={{ fontStyle: 'italic' }}>Ṛta</em> — cosmic order.<br />
            <em style={{ fontStyle: 'italic' }}>Spanda</em> — the pulse of life.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#2E4A3B', opacity: 0.7, maxWidth: 680, margin: '0 auto 64px', textAlign: 'center' }}>
            Rit-Spanda holds that the body is not a machine to be fixed — it is a living mandala of rhythm and order. When the spine flows freely, when the nervous system finds its natural wave, the whole being reorients toward health, clarity, and joy.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {PHILOSOPHY_CARDS.map((c) => (
              <div key={c.title} style={{
                border: '1px solid rgba(46,74,59,0.12)',
                borderRadius: 4,
                padding: '36px 32px',
                backgroundColor: '#F6F1E6',
              }}>
                <p style={{ fontSize: 10, letterSpacing: '0.16em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>{c.label}</p>
                <h3 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 26, fontWeight: 400, color: '#2E4A3B', marginBottom: 14 }}>{c.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#2E4A3B', opacity: 0.68 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SESSIONS & PACKAGES ── */}
      <section id="sessions" style={{ backgroundColor: '#EDE8D8', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>Sessions &amp; Packages</p>
          <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#2E4A3B', marginBottom: 20 }}>
            Your healing journey
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#2E4A3B', opacity: 0.7, maxWidth: 680, marginBottom: 56 }}>
            Meru Chikitsa works progressively over multiple sessions. We offer packages so you can commit to a complete arc of care — from first contact to lasting reorganisation. All sessions are held in North Bangalore (Vidyaranyapura area).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} style={{
                backgroundColor: '#F6F1E6',
                border: pkg.popular ? '1.5px solid #5B8A5E' : '1px solid rgba(46,74,59,0.12)',
                borderRadius: 16,
                padding: '32px 28px',
                position: 'relative',
              }}>
                {pkg.popular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#5B8A5E', color: '#F6F1E6',
                    fontSize: 10, letterSpacing: '0.1em', fontWeight: 600,
                    padding: '4px 14px', borderRadius: '0 0 8px 8px',
                    textTransform: 'uppercase',
                  }}>Popular</div>
                )}
                <h3 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 24, fontWeight: 400, color: '#2E4A3B', marginBottom: 4 }}>{pkg.name}</h3>
                <p style={{ fontSize: 13, color: '#5B8A5E', marginBottom: 20, opacity: 0.9 }}>{pkg.sessions}</p>
                <div style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 36, fontWeight: 500, color: '#2E4A3B', marginBottom: 4, letterSpacing: '-0.01em' }}>{pkg.price}</div>
                <p style={{ fontSize: 12, color: '#2E4A3B', opacity: 0.55, marginBottom: 20 }}>{pkg.per}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#2E4A3B', opacity: 0.68 }}>{pkg.body}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, textAlign: 'center', color: '#2E4A3B', opacity: 0.55, marginTop: 40, lineHeight: 1.8 }}>
            All packages are for use within 6 months. Sessions by appointment only.<br />
            Existing clients:{' '}
            <Link href="/portal-login" style={{ color: '#5B8A5E', fontWeight: 500 }}>log in</Link>
            {' '}to book, track sessions, and pay online.
          </p>
        </div>
      </section>

      {/* ── FIND US ── */}
      <section id="find-us" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#C99A2E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>Find Us</p>
          <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#2E4A3B', marginBottom: 48 }}>
            North Bangalore
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="grid-cols-1 md:grid-cols-2">
            {/* Details card */}
            <div style={{ backgroundColor: '#EDE8D8', borderRadius: 16, border: '1px solid rgba(46,74,59,0.1)', padding: '40px 36px' }}>
              <InfoRow icon="📍" label="Studio Address" value="Vidyaranyapura / Jalahalli area" sub="North Bangalore, Karnataka" />
              <InfoRow icon="🗓" label="Appointments" value="By appointment only" sub="Mon – Sat, 7 AM – 7 PM" />
              <InfoRow icon="💬" label="WhatsApp / Contact" value="+91 89510 65367" sub="Message to enquire or book" link={`https://wa.me/918951065367?text=Hello%2C%20I%27d%20like%20to%20enquire%20about%20Meru%20Chikitsa%20sessions`} />
              <InfoRow icon="🔵" label="Catchment Area" value="Within ~5 km of the studio" sub="Sessions are regular &amp; progressive" />
            </div>

            {/* Map card */}
            <div style={{
              backgroundColor: '#EDE8D8', borderRadius: 16,
              border: '1px solid rgba(46,74,59,0.1)',
              padding: '40px 36px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 260, gap: 20, textAlign: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#5B8A5E" strokeWidth="1.5" className="h-12 w-12" style={{ width: 48, height: 48 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 20, color: '#2E4A3B', marginBottom: 4 }}>Vidyaranyapura / Jalahalli</p>
                <p style={{ fontSize: 14, color: '#2E4A3B', opacity: 0.6 }}>North Bangalore</p>
              </div>
              <a
                href="https://maps.google.com/?q=Vidyaranyapura+North+Bangalore+Karnataka"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', fontSize: 14, color: '#5B8A5E', fontWeight: 500,
                  border: '1px solid #5B8A5E', borderRadius: 24,
                  padding: '9px 20px', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#5B8A5E'; e.currentTarget.style.color = '#F6F1E6' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5B8A5E' }}
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#EDE8D8', borderTop: '1px solid rgba(46,74,59,0.1)', padding: '56px 24px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: 26, fontWeight: 400, color: '#2E4A3B', marginBottom: 8 }}>Rit-Spanda Wellness Studio</div>
          <p style={{ fontSize: 13, color: '#5B8A5E', letterSpacing: '0.08em', marginBottom: 36 }}>ऋतस्पन्द · Cosmic Order · Living Pulse · North Bangalore</p>

          <nav style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 40 }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '#about' },
              { label: 'Philosophy', href: '#philosophy' },
              { label: 'Sessions', href: '#sessions' },
              { label: 'Find Us', href: '#find-us' },
              { label: 'Client Login', href: '/portal-login' },
            ].map(l => (
              l.href.startsWith('#') ? (
                <button key={l.label} onClick={() => scrollTo(l.href)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#2E4A3B', opacity: 0.65, padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
                >
                  {l.label}
                </button>
              ) : (
                <Link key={l.label} href={l.href} style={{ fontSize: 14, color: '#2E4A3B', opacity: 0.65, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
                >
                  {l.label}
                </Link>
              )
            ))}
          </nav>

          <div style={{ width: 40, height: 1, backgroundColor: 'rgba(46,74,59,0.2)', margin: '0 auto 28px' }} />

          {/* AoL donation */}
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#2E4A3B', opacity: 0.6 }}>A portion of our earnings supports the</span>
            <a
              href="https://www.artofliving.online/donate.php?nca_id=969567"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#C99A2E', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Art of Living Foundation ↗
            </a>
          </div>

          <p style={{ fontSize: 12, color: '#2E4A3B', opacity: 0.45, marginBottom: 6 }}>
            © 2026 Rit-Spanda Wellness Studio · All rights reserved
          </p>
          <Link href="/login" style={{ fontSize: 11, color: '#2E4A3B', opacity: 0.3, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          >
            Practitioner login
          </Link>
        </div>
      </footer>

    </div>
  )
}

function InfoRow({ icon, label, value, sub, link }: { icon: string; label: string; value: string; sub: string; link?: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
      <div style={{ fontSize: 18, marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5B8A5E', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: '#2E4A3B', fontWeight: 500, textDecoration: 'none' }}>{value}</a>
        ) : (
          <p style={{ fontSize: 15, color: '#2E4A3B', fontWeight: 500 }}>{value}</p>
        )}
        <p style={{ fontSize: 13, color: '#2E4A3B', opacity: 0.55, marginTop: 2 }} dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
    </div>
  )
}
