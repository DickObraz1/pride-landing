'use client';

import { useState } from 'react';
import Image from 'next/image';
import { strings, type Lang } from '@/lib/strings';

type Gender = 'guy' | 'girl' | 'other';

const RAINBOW_CONFETTI = [
  '#E40303',
  '#FF8C00',
  '#FFED00',
  '#008026',
  '#004DFF',
  '#750787',
  '#ffffff',
];

const PRODUCTS = [
  { key: 'fillmein', label: 'FILL ME IN', file: 'fillmein.webp' },
  { key: 'yoni', label: 'YONI', file: 'yoni.webp' },
  { key: 'kamasutra', label: 'Kama Sutra', file: 'kamasutra.webp' },
  { key: 'bdsm', label: 'BDSM', file: 'bdsm.webp' },
  { key: 'fmn', label: 'Fuck Mě Neser', file: 'fmn.webp' },
] as const;

function ProductCard({ label, file }: { label: string; file: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="product-card">
      {failed ? (
        <div className="product-placeholder">
          <span>{label}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/${file}`}
          alt={label}
          loading="lazy"
          width={140}
          height={196}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function HeroImage() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="hero-img-wrap">
        <span className="hero-img-placeholder">FILL ME IN</span>
      </div>
    );
  }
  return (
    <div className="hero-img-wrap">
      <Image
        src="/images/fillmein-hero.webp"
        alt="FILL ME IN coloring book"
        fill
        priority
        sizes="(max-width: 480px) 100vw, 448px"
        style={{ objectFit: 'cover' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function PrideLanding() {
  const [lang, setLang] = useState<Lang>('en');
  const [gender, setGender] = useState<Gender | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = strings[lang];

  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL ?? '/privacy';

  function toggleLang() {
    setLang(l => (l === 'en' ? 'cs' : 'en'));
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'en' ? 'cs' : 'en';
    }
  }

  function toggleGender(g: Gender) {
    setGender(prev => (prev === g ? null : g));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg(t.errorEmail);
      return;
    }
    if (!consent) {
      setStatus('error');
      setErrorMsg(t.errorConsent);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim(), gender, lang }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Failed');
      }

      setStatus('success');
      fireConfetti();
    } catch {
      setStatus('error');
      setErrorMsg(t.errorGeneric);
    }
  }

  function fireConfetti() {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: RAINBOW_CONFETTI,
        ticks: 300,
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { x: 0.1, y: 0.6 },
          colors: RAINBOW_CONFETTI,
          angle: 60,
        });
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { x: 0.9, y: 0.6 },
          colors: RAINBOW_CONFETTI,
          angle: 120,
        });
      }, 300);
    });
  }

  return (
    <main style={{ minHeight: '100dvh' }}>
      {/* Thin rainbow stripe at very top */}
      <div className="rainbow-top" aria-hidden="true" />

      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '0 20px 48px',
        }}
      >
        {/* Language toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <button onClick={toggleLang} className="lang-btn" aria-label="Switch language">
            {t.langToggle}
          </button>
        </div>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          <HeroImage />

          {/* Diagonal rainbow band below image */}
          <div className="rainbow-band-wrap" style={{ margin: '0 -20px 0' }}>
            <div className="rainbow-band" />
          </div>

          <div style={{ paddingTop: 20, paddingBottom: 20, background: 'white', borderRadius: '0 0 4px 4px' }}>
            <h1
              className="font-display"
              style={{ fontSize: 'clamp(3rem, 14vw, 5rem)', lineHeight: 0.95, marginBottom: 12 }}
            >
              {t.heroHeadline}
            </h1>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.55, color: '#333', marginBottom: 10 }}>
              {t.heroSubhead}
            </p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#555', fontStyle: 'italic' }}>
              {t.heroTagline}
            </p>
          </div>
        </section>

        {/* ── Offer ────────────────────────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          <div className="offer-card">
            <p className="offer-text">{t.offerText}</p>
          </div>
        </section>

        {/* ── Identity selector ────────────────────────────── */}
        <section style={{ marginBottom: 28, background: 'white', borderRadius: 4, padding: '20px' }}>
          <p className="section-label">{t.identityPrompt}</p>
          <div className="identity-grid">
            {(['guy', 'girl', 'other'] as Gender[]).map(g => (
              <button
                key={g}
                onClick={() => toggleGender(g)}
                className={`identity-card${gender === g ? ' identity-card--active' : ''}`}
                aria-pressed={gender === g}
              >
                {g === 'guy' ? t.identityGuy : g === 'girl' ? t.identityGirl : t.identityOther}
              </button>
            ))}
          </div>
        </section>

        {/* ── Form / Success ────────────────────────────────── */}
        {status === 'success' ? (
          <section style={{ marginBottom: 28, background: 'white', borderRadius: 4, padding: '20px' }} role="alert" aria-live="polite">
            <div className="success-block">
              <h2 className="success-title">{t.successTitle}</h2>
              <p className="success-text">{t.successText}</p>
            </div>
          </section>
        ) : (
          <section style={{ marginBottom: 28, background: 'white', borderRadius: 4, padding: '20px' }}>
            <form onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="form-field"
                style={{ marginBottom: 12 }}
                autoComplete="given-name"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="form-field"
                style={{ marginBottom: 12 }}
                autoComplete="email"
                inputMode="email"
                required
              />
              <label className="consent-row" style={{ marginBottom: 16 }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="consent-box"
                />
                <span className="consent-text">
                  {t.consentText}{' '}
                  <a href={privacyUrl} className="consent-text" style={{ fontWeight: 700 }}>
                    {t.consentPrivacy}
                  </a>
                </span>
              </label>

              <p style={{ fontSize: '0.8125rem', color: '#888', marginBottom: 14, textAlign: 'center' }}>
                {t.formMicrocopy}
              </p>

              {status === 'error' && errorMsg && (
                <p className="error-msg" style={{ marginBottom: 12 }} role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="submit-btn rainbow-wave"
              >
                {status === 'loading' ? t.submitting : t.submitButton}
              </button>
              <p style={{ fontSize: '0.8125rem', color: '#888', marginTop: 8, textAlign: 'center' }}>
                {t.submitMicrocopy}
              </p>
            </form>
          </section>
        )}

        {/* ── Product strip ─────────────────────────────────── */}
        <section style={{ marginBottom: 28, background: 'white', borderRadius: 4, padding: '20px' }}>
          <p className="section-label">{t.productHeading}</p>
          {/* TODO: Drop WebP images into /public/images/ — names must match:
               fillmein.webp, yoni.webp, kamasutra.webp, bdsm.webp, fmn.webp
               fillmein-hero.webp (hero above) */}
          <div className="product-scroll">
            {PRODUCTS.map(p => (
              <ProductCard key={p.key} label={p.label} file={p.file} />
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer style={{ textAlign: 'center', paddingTop: 8 }}>
          <p className="footer-text">
            {t.footerBrand} · {t.footerHandle}
          </p>
        </footer>
      </div>
    </main>
  );
}
