import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';
import { resolveContactEmailForReveal } from '@/utils/contactEmailObfuscated';

const DEV_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
const MIN_MS_BEFORE_CAPTCHA = 2800;
const FALLBACK_PHRASE = 'COLLAB';

function getTurnstileSiteKey(): string {
  const k = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  if (k) return k;
  if (import.meta.env.DEV) return DEV_TURNSTILE_SITE_KEY;
  return '';
}

/**
 * Multi-step email reveal: honeypot, attestation checkbox, math, min delay,
 * Cloudflare Turnstile (or production fallback friction), then tap-to-reveal.
 * Email never mounts in the DOM until the final intentional tap.
 */
export const ProtectedEmailReveal = () => {
  const siteKey = useMemo(() => getTurnstileSiteKey(), []);
  const useTurnstile = Boolean(siteKey);
  const [honeypot, setHoneypot] = useState('');
  const [humanAttest, setHumanAttest] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [phraseInput, setPhraseInput] = useState('');
  const [slider, setSlider] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [elapsedOk, setElapsedOk] = useState(false);
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [turnstileKey, setTurnstileKey] = useState(0);

  const math = useRef({ a: 0, b: 0 });
  if (math.current.a === 0 && math.current.b === 0) {
    math.current = {
      a: 4 + Math.floor(Math.random() * 6),
      b: 4 + Math.floor(Math.random() * 6),
    };
  }
  const expectedSum = math.current.a + math.current.b;
  const mathOk = mathAnswer.trim() !== '' && Number.parseInt(mathAnswer, 10) === expectedSum;
  const botHoney = honeypot.trim().length > 0;

  useEffect(() => {
    const t = window.setTimeout(() => setElapsedOk(true), MIN_MS_BEFORE_CAPTCHA);
    return () => window.clearTimeout(t);
  }, []);

  const fallbackFrictionOk =
    !useTurnstile &&
    slider >= 98 &&
    phraseInput.trim().toUpperCase() === FALLBACK_PHRASE;

  const gatesOk =
    humanAttest &&
    !botHoney &&
    mathOk &&
    elapsedOk &&
    (useTurnstile ? Boolean(turnstileToken) : fallbackFrictionOk);

  const handleReveal = useCallback(() => {
    if (!gatesOk) return;
    const addr = resolveContactEmailForReveal();
    setRevealedEmail(addr || null);
  }, [gatesOk]);

  const handleCopy = useCallback(async () => {
    if (!revealedEmail) return;
    try {
      await navigator.clipboard.writeText(revealedEmail);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2500);
    }
  }, [revealedEmail]);

  const handleMailto = useCallback(() => {
    if (!revealedEmail) return;
    window.location.href = `mailto:${encodeURIComponent(revealedEmail)}`;
  }, [revealedEmail]);

  return (
    <motion.div
      className="relative border-2 border-white/20 bg-black/40 p-6 md:p-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <p className="text-zinc-300 text-sm md:text-base uppercase tracking-wider leading-relaxed mb-8">
        Email is not published as plain text. Complete the steps below if you’re reaching out about a
        real project or collaboration.
      </p>

      {/* Honeypot — must stay empty */}
      <div
        className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-6 md:space-y-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 border-2 border-white/40 bg-black accent-white"
            checked={humanAttest}
            onChange={(e) => setHumanAttest(e.target.checked)}
          />
          <span className="text-sm md:text-base text-white/90 uppercase tracking-wider leading-snug">
            I’m a human inquiring about working together — not scraping or automated traffic.
          </span>
        </label>

        <div>
          <label
            htmlFor="contact-math"
            className="block text-xs font-black uppercase tracking-wider text-white mb-2"
          >
            Quick check: {math.current.a} + {math.current.b} = ?
          </label>
          <input
            id="contact-math"
            inputMode="numeric"
            autoComplete="off"
            value={mathAnswer}
            onChange={(e) => setMathAnswer(e.target.value.replace(/\D/g, ''))}
            className="w-full max-w-[200px] bg-black border-2 border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white text-base min-h-[44px]"
            placeholder="Answer"
          />
        </div>

        {!elapsedOk && humanAttest && mathOk && !botHoney && (
          <p className="text-zinc-500 text-xs uppercase tracking-wider animate-pulse">
            Preparing security check…
          </p>
        )}

        <AnimatePresence mode="wait">
          {humanAttest && mathOk && !botHoney && elapsedOk && (
            <motion.div
              key={useTurnstile ? 'ts' : 'fb'}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {useTurnstile ? (
                <>
                  <p className="text-zinc-400 text-xs uppercase tracking-wider">
                    Cloudflare Turnstile — helps block automated harvesting.
                  </p>
                  <div className="cf-turnstile-wrap">
                    <Turnstile
                      key={turnstileKey}
                      siteKey={siteKey}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => {
                        setTurnstileToken(null);
                        setTurnstileKey((k) => k + 1);
                      }}
                      onError={() => {
                        setTurnstileToken(null);
                        setTurnstileKey((k) => k + 1);
                      }}
                      options={{ theme: 'dark' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-amber-200/90 text-xs uppercase tracking-wider border border-amber-500/40 bg-amber-500/5 p-3">
                    Set a production{' '}
                    <code className="text-white">VITE_TURNSTILE_SITE_KEY</code> from Cloudflare
                    Turnstile for stronger bot resistance. Without it, this fallback confirmation runs
                    instead.
                  </p>
                  <div>
                    <label
                      htmlFor="contact-slide"
                      className="block text-xs font-black uppercase tracking-wider text-white mb-2"
                    >
                      Slide to the end to confirm intent
                    </label>
                    <input
                      id="contact-slide"
                      type="range"
                      min={0}
                      max={100}
                      value={slider}
                      onChange={(e) => setSlider(Number(e.target.value))}
                      className="w-full max-w-md accent-white h-3"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phrase"
                      className="block text-xs font-black uppercase tracking-wider text-white mb-2"
                    >
                      Type <span className="text-white">{FALLBACK_PHRASE}</span> (caps)
                    </label>
                    <input
                      id="contact-phrase"
                      autoComplete="off"
                      value={phraseInput}
                      onChange={(e) => setPhraseInput(e.target.value)}
                      className="w-full max-w-md bg-black border-2 border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white text-base min-h-[44px]"
                      placeholder={FALLBACK_PHRASE}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {botHoney && (
          <p className="text-zinc-600 text-xs uppercase tracking-wider">
            Unable to verify. If you’re human, reload and try again.
          </p>
        )}

        <div className="pt-2 border-t border-white/10">
          <motion.button
            type="button"
            disabled={!gatesOk || Boolean(revealedEmail)}
            onClick={handleReveal}
            className="w-full md:w-auto bg-white disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed text-black font-black px-8 py-4 text-sm md:text-base uppercase tracking-tighter min-h-[48px] transition-colors"
            whileHover={gatesOk && !revealedEmail ? { scale: 1.02 } : undefined}
            whileTap={gatesOk && !revealedEmail ? { scale: 0.98 } : undefined}
          >
            {revealedEmail ? 'Email revealed' : 'Tap to reveal email'}
          </motion.button>

          <AnimatePresence>
            {revealedEmail && (
              <motion.div
                className="mt-8 space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                aria-live="polite"
              >
                <p className="text-xs uppercase tracking-widest text-zinc-500">Work email</p>
                <p className="text-xl md:text-2xl font-black text-white break-all select-all tracking-tight">
                  {revealedEmail}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-6 py-3 border-2 border-white/40 text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors min-h-[44px]"
                  >
                    {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy blocked' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleMailto}
                    className="px-6 py-3 border-2 border-white text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors min-h-[44px]"
                  >
                    Open in mail app
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
