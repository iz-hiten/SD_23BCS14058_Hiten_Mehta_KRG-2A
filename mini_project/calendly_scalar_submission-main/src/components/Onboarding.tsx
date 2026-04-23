import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Calendar, Clock, Link2, BarChart2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'calendly_onboarding_done';

// ── Step definitions ──────────────────────────────────────────────────────────
interface Step {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  // CSS selector of the element to spotlight (null = center modal, no spotlight)
  target: string | null;
  // Which side to place the tooltip relative to the target
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    icon: <Sparkles className="w-7 h-7 text-[#006BFF]" />,
    title: 'Welcome to Calendly',
    description:
      "You're about to see how effortless scheduling can be. Let's take a quick tour — we'll show you everything in under a minute.",
    target: null,
    placement: 'center',
  },
  {
    id: 'sidebar',
    icon: <Calendar className="w-7 h-7 text-[#006BFF]" />,
    title: 'Your navigation hub',
    description:
      'The sidebar gets you everywhere — Scheduling, Meetings, Availability, and more. Collapse it anytime to get more screen space.',
    target: 'aside',
    placement: 'right',
  },
  {
    id: 'create',
    icon: <Link2 className="w-7 h-7 text-[#006BFF]" />,
    title: 'Create event types',
    description:
      'Hit Create to set up a new event type — a 30-min call, a discovery session, whatever you need. Share the link and let people book themselves.',
    target: '[data-tour="create-btn"]',
    placement: 'bottom',
  },
  {
    id: 'event-cards',
    icon: <Calendar className="w-7 h-7 text-[#006BFF]" />,
    title: 'Your event types',
    description:
      'Each card is a bookable meeting. Copy the link, share it anywhere, and watch meetings land on your calendar automatically.',
    target: '[data-tour="event-list"]',
    placement: 'top',
  },
  {
    id: 'availability',
    icon: <Clock className="w-7 h-7 text-[#006BFF]" />,
    title: 'Set your availability',
    description:
      'Tell Calendly when you\'re free. Set working hours per day, add time-off, and pick your timezone — invitees only see slots that work for you.',
    target: '[data-tour="nav-availability"]',
    placement: 'right',
  },
  {
    id: 'meetings',
    icon: <BarChart2 className="w-7 h-7 text-[#006BFF]" />,
    title: 'Track your meetings',
    description:
      'The Meetings page shows every upcoming, past, and cancelled booking. Filter, search, and export — all in one place.',
    target: '[data-tour="nav-meetings"]',
    placement: 'right',
  },
  {
    id: 'chat',
    icon: <MessageCircle className="w-7 h-7 text-[#006BFF]" />,
    title: 'AI assistant',
    description:
      "Got a question? The AI chatbot in the bottom-right corner is always ready to help you get the most out of Calendly.",
    target: '[data-tour="chat-fab"]',
    placement: 'top',
  },
  {
    id: 'done',
    icon: <Sparkles className="w-7 h-7 text-[#006BFF]" />,
    title: "You're all set!",
    description:
      "That's the full picture. Start by creating your first event type and sharing the link. Happy scheduling!",
    target: null,
    placement: 'center',
  },
];

// ── Spotlight rect helper ─────────────────────────────────────────────────────
interface Rect { top: number; left: number; width: number; height: number }

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

// ── Tooltip positioning ───────────────────────────────────────────────────────
function tooltipStyle(rect: Rect | null, placement: Step['placement']): React.CSSProperties {
  const PAD = 16;
  const TIP_W = 340;

  if (!rect || placement === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TIP_W,
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0, left = 0;

  switch (placement) {
    case 'bottom':
      top = rect.top + rect.height + PAD;
      left = rect.left + rect.width / 2 - TIP_W / 2;
      break;
    case 'top':
      top = rect.top - PAD - 180; // approx tooltip height
      left = rect.left + rect.width / 2 - TIP_W / 2;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - 90;
      left = rect.left + rect.width + PAD;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - 90;
      left = rect.left - TIP_W - PAD;
      break;
  }

  // Clamp to viewport
  left = Math.max(PAD, Math.min(left, vw - TIP_W - PAD));
  top = Math.max(PAD, Math.min(top, vh - 220));

  return { position: 'fixed', top, left, width: TIP_W };
}

// ── Main component ────────────────────────────────────────────────────────────
export const Onboarding: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number>(0);

  // Show only once per browser
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the app has rendered
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const step = STEPS[stepIdx];

  // Track target element rect (re-measure on step change + resize)
  useEffect(() => {
    if (!visible) return;

    const measure = () => {
      if (step.target) {
        setRect(getTargetRect(step.target));
      } else {
        setRect(null);
      }
    };

    measure();
    // Keep measuring in case layout shifts
    rafRef.current = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
    };
  }, [visible, stepIdx, step.target]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;
  const PADDING = 10; // spotlight padding around target

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Dark overlay with SVG cutout spotlight ── */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] pointer-events-none"
          >
            {rect ? (
              // SVG mask: full screen dark minus a rounded rect cutout
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ display: 'block' }}
              >
                <defs>
                  <mask id="spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={rect.left - PADDING}
                      y={rect.top - PADDING}
                      width={rect.width + PADDING * 2}
                      height={rect.height + PADDING * 2}
                      rx="12"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.65)"
                  mask="url(#spotlight-mask)"
                />
                {/* Glowing border around spotlight */}
                <rect
                  x={rect.left - PADDING}
                  y={rect.top - PADDING}
                  width={rect.width + PADDING * 2}
                  height={rect.height + PADDING * 2}
                  rx="12"
                  fill="none"
                  stroke="#006BFF"
                  strokeWidth="2"
                  opacity="0.8"
                />
              </svg>
            ) : (
              // No target — plain dark backdrop
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            )}
          </motion.div>

          {/* Click-blocker (captures clicks outside tooltip) */}
          <div
            className="fixed inset-0 z-[81]"
            onClick={finish}
          />

          {/* ── Tooltip card ── */}
          <motion.div
            key={`step-${stepIdx}`}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={tooltipStyle(rect, step.placement)}
            className="z-[82] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-[#006BFF] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#006BFF] uppercase tracking-wider mb-0.5">
                      Step {stepIdx + 1} of {STEPS.length}
                    </p>
                    <h3 className="text-[17px] font-bold text-[#1a1a1a] leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={finish}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Step dots */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStepIdx(i)}
                      className={cn(
                        'rounded-full transition-all',
                        i === stepIdx
                          ? 'w-5 h-2 bg-[#006BFF]'
                          : i < stepIdx
                          ? 'w-2 h-2 bg-[#006BFF] opacity-40'
                          : 'w-2 h-2 bg-gray-200'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={prev}
                      className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#006BFF] text-white text-[13px] font-bold rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {isLast ? 'Get started' : 'Next'}
                    {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
