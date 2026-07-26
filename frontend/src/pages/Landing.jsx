import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Users, Users2, TrendingUp, ShieldAlert, ArrowRight,
  UserPlus, CheckCircle2, Trophy, ChevronDown, Quote, Star ,Lock, X, Check
} from 'lucide-react';
import CountUp from '../components/CountUp';

const features = [
  {
    icon: Flame,
    title: 'Streaks & Points',
    description: 'Check in daily and watch your streak grow. Miss a day, and it resets — real stakes keep you honest.',
    color: 'text-orange-600 bg-orange-50',
    accent: '#0cabea',
    steps: [
      'Check in each day to add to your streak',
      'Earn points for every goal you complete',
      'Miss a day and your streak resets to zero',
    ],
  },
  {
    icon: Users,
    title: 'Accountability Groups',
    description: 'Team up with friends. See everyone\'s progress on a shared leaderboard, sorted by who\'s actually showing up.',
    color: 'text-indigo-600 bg-indigo-50',
    accent: '#6646e5',
    steps: [
      'Create a group, or join one using its ID',
      'Everyone\'s points appear on a live leaderboard',
      'See who\'s actually consistent, not just who joined',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Log your weight, track your BMI, and watch your journey unfold on a visual timeline — photos included.',
    color: 'text-emerald-600 bg-emerald-50',
    accent: '#0F6E56',
    steps: [
      'Log your weight whenever you check in',
      'Your BMI updates automatically from height + weight',
      'Add progress photos to see the change over time',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Real Penalties',
    description: 'Miss a check-in, lose points automatically. No excuses, no manual tracking — the system holds you to it.',
    color: 'text-red-600 bg-red-50',
    accent: '#DC2626',
    steps: [
      'Miss a check-in and your streak resets',
      'Points are deducted automatically, overnight',
      'No manual tracking — a background job checks daily',
    ],
  },
];

const stats = [
  { value: 200, label: 'Members', icon: Users, color: '#4F46E5' },
  { value: 5000, label: 'Check-ins Logged', icon: CheckCircle2, color: '#0F6E56' },
  { value: 50, label: 'Groups', icon: Users2, color: '#3B6D11' },
];

const steps = [
  {
    icon: UserPlus,
    title: 'Sign up',
    description: 'Create your account in under a minute — no credit card, no fuss.',
  },
  {
    icon: CheckCircle2,
    title: 'Check in daily',
    description: 'Log your workout, diet, water, and steps each day to build your streak.',
  },
  {
    icon: Trophy,
    title: 'Stay accountable',
    description: 'Team up in a group, track real progress, and let penalties keep you honest.',
  },
];

const testimonials = [
  {
    name: 'Priya Mathai.',
    quote: 'Knowing I\'ll actually lose points for skipping made a bigger difference than any app I\'ve tried before. My streak is at 34 days now.',
    color: 'bg-cyan-100 text-cyan-800',
    accent: '#0E7490',
    rating: 5,
  },
  {
    name: 'Rohan Kshirsagar.',
    quote: 'My group\'s leaderboard turned this into a friendly competition. I check in every morning now just to stay ahead of my friends.',
    color: 'bg-emerald-100 text-emerald-700',
    accent: '#0F6E56',
    rating: 5,
  },
  {
    name: 'Ananya Sharma.',
    quote: 'The progress timeline is what sold me. Being able to see my weight trend and photos side by side actually keeps me motivated.',
    color: 'bg-teal-100 text-teal-700',
    accent: '#0D9488',
    rating: 5,
  },
];
const comparison = {
  without: [
    'Vague goals with no real deadline',
    'No one notices if you skip a day',
    'Progress lives in a notes app you forget to open',
    'One missed day quietly turns into a month',
  ],
  with: [
    'Daily streaks with real stakes attached',
    'Automatic penalties keep you honest — no excuses',
    'Weight, BMI, and photos tracked on one visual timeline',
    'A group watching your leaderboard, not just yourself',
  ],
};

const faqs = [
  {
    question: 'Is StayFit free to use?',
    answer: 'Yes — creating an account, logging check-ins, joining groups, and tracking your progress are all free.',
  },
  {
    question: 'What happens if I miss a day?',
    answer: 'Missing a check-in resets your current streak and deducts points automatically. It\'s the core of how StayFit keeps you accountable — no manual tracking required.',
  },
  {
    question: 'Can I use StayFit with friends?',
    answer: 'Yes — create or join a group, and everyone\'s check-ins and points show up on a shared leaderboard.',
  },
  {
    question: 'Do I need to track my weight to use the app?',
    answer: 'No — Progress Tracking (weight, BMI, photos) is optional. Daily check-ins and streaks work independently of it.',
  },
  {
    question: 'Is my data private?',
    answer: 'Only your group members can see your check-ins and leaderboard position. Your weight, BMI, and progress photos are visible only to you.',
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm">{faq.question}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

function Landing() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [openFeature, setOpenFeature] = useState(null);

  function toggleFeature(title) {
    setOpenFeature((prev) => (prev === title ? null : title));
  }
  // Briefly auto-opens the first feature card so first-time visitors see the
  // click-to-expand interaction happen once, instead of needing to discover
  // it themselves. Backs off entirely if the visitor has already clicked
  // something by the time this fires.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenFeature((prev) => (prev !== null ? prev : features[0].title));
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Tracks whether the visitor has scrolled past the hero, so the sticky
  // header bar only appears once the original "Get Started" button (in the
  // hero) has scrolled out of view.
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    function handleScroll() {
      setShowStickyBar(window.scrollY > 500);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
return (
    <div className="min-h-screen">
      {/* Sticky bar — appears once the hero's own CTA has scrolled out of view */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100"
          >
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center">
                  <Flame size={16} />
                </div>
                <span className="font-bold text-sm text-gray-900">StayFit</span>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white w-9 h-9 rounded-xl flex items-center justify-center">
            <Flame size={20} />
          </div>
          <span className="font-bold text-lg text-gray-900">StayFit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Flame size={14} /> Built for people who need real accountability
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            Stay accountable to<br />your fitness goals — together.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Daily check-ins, real penalties for missed days, and group leaderboards
            that keep you (and your friends) actually consistent.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition text-base"
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-100">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center py-10 px-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}1A`, color: stat.color }}
                >
                  <Icon size={20} />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  <CountUp value={stat.value} />
                  <span style={{ color: stat.color }}>+</span>
                </p>
                <p className="text-sm text-gray-500 mt-1.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Everything you need to actually stick with it
            </h2>
            <p className="text-gray-500">No fluff — just the tools that make consistency easier.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isOpen = openFeature === feature.title;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div
                    onClick={() => toggleFeature(feature.title)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFeature(feature.title);
                      }
                    }}
                    className={`bg-white rounded-3xl p-6 cursor-pointer transition-all duration-200 ${
                      isOpen
                        ? 'shadow-lg scale-[1.02] border-2'
                        : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    style={isOpen ? { borderColor: feature.accent } : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                        <Icon size={22} />
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                            <p
                              className="text-xs font-semibold uppercase tracking-wide"
                              style={{ color: feature.accent }}
                            >
                              How it works
                            </p>
                            {feature.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <span
                                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                                  style={{ backgroundColor: feature.accent }}
                                >
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Without vs With */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Why accountability actually works</h2>
            <p className="text-gray-500">The difference isn't motivation. It's consequences.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-50 border border-gray-200 rounded-3xl p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-5">Without StayFit</p>
              <div className="space-y-4">
                {comparison.without.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                      <X size={12} className="text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-5">With StayFit</p>
              <div className="space-y-4">
                {comparison.with.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-500">Three steps. No complicated setup.</p>
          </div>

          <div className="relative">
            {/* Static faint track, sits behind everything */}
            <div
              className="hidden sm:block absolute left-1/2 -translate-x-1/2 w-2/3 border-t-2 border-dashed border-gray-200"
              style={{ top: 28 }}
            />
            {/* Animated line that draws itself in left-to-right as the section scrolls into view */}
            <motion.div
              className="hidden sm:block absolute left-1/2 -translate-x-1/2 w-2/3 border-t-2 border-dashed origin-left"
              style={{ top: 28, borderColor: '#4F46E5' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.2 }}
            />

            <div className="grid sm:grid-cols-3 gap-8 relative">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="text-center"
                  >
                    <motion.div
                      whileHover={{ y: -6, scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 cursor-default"
                    >
                      <Icon size={24} />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What people are saying</h2>
            <p className="text-gray-500">Real accountability, real results.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-100 transition-shadow"
              >
                <div className="h-1.5" style={{ backgroundColor: t.accent }} />
                <div className="p-6">
                  <Quote className="text-indigo-200 mb-3" size={28} />
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={14} fill="#F59E0B" className="text-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>
                      {t.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.question}
                faq={faq}
                isOpen={openFaqIndex === i}
                onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
 {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Ready to build a streak worth keeping?
        </h2>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition"
        >
          Create your account <ArrowRight size={18} />
        </Link>
        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-5">
          <Lock size={12} />
          Your weight and progress photos are private — only you can see them.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-indigo-600" />
            <span className="font-semibold text-gray-600">StayFit</span>
          </div>
          <p>© 2026 StayFit. Built for staying consistent.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;