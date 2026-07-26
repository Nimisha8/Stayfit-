import { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Dumbbell, ChevronDown, Info } from 'lucide-react';

const TABS = [
  { key: 'diet', label: 'Diet Plans' },
  { key: 'workout', label: 'Workout Videos' },
];

const dietPlans = [
  {
    title: 'Balanced Plan',
    tag: 'General everyday eating',
    accent: '#0F6E56',
    image: 'balanced.jpg',
    meals: {
      Breakfast: 'Vegetable poha or oats with fruit',
      Lunch: 'Roti, dal, a vegetable sabzi, and salad',
      Dinner: 'Grilled paneer or fish with sautéed vegetables',
      Snacks: 'A handful of nuts or a piece of fruit',
    },
  },
  {
    title: 'High-Protein Plan',
    tag: 'For muscle-building focus',
    accent: '#4F46E5',
    image: 'high-protein.jpg',
    meals: {
      Breakfast: 'Besan chilla or eggs with whole-grain toast',
      Lunch: 'Grilled chicken or rajma with brown rice',
      Dinner: 'Paneer bhurji or dal with quinoa',
      Snacks: 'Greek yogurt or a protein shake',
    },
  },
  {
    title: 'Vegetarian Plan',
    tag: 'Plant-based, no meat or fish',
    accent: '#185FA5',
    image: 'vegetarian.jpg',
    meals: {
      Breakfast: 'Idli or upma with sambar',
      Lunch: 'Chole with roti and cucumber salad',
      Dinner: 'Mixed vegetable curry with brown rice',
      Snacks: 'Roasted chana or sprouts chaat',
    },
  },
  {
    title: 'Vegan Plan',
    tag: 'No animal products at all',
    accent: '#3B6D11',
    image: 'vegan.jpg',
    meals: {
      Breakfast: 'Oats with almond milk, banana, and seeds',
      Lunch: 'Chickpea and vegetable buddha bowl',
      Dinner: 'Tofu stir-fry with brown rice',
      Snacks: 'Roasted peanuts or a handful of dates',
    },
  },
  {
    title: 'Low-Carb Plan',
    tag: 'Lower grains, more vegetables',
    accent: '#B45309',
    image: 'low-carb.jpg',
    meals: {
      Breakfast: 'Vegetable omelette or moong dal chilla',
      Lunch: 'Grilled vegetables with a small portion of dal',
      Dinner: 'Clear vegetable soup with grilled paneer or tofu',
      Snacks: 'Cucumber or carrot sticks with hummus',
    },
  },
  {
    title: 'Mediterranean-Style Plan',
    tag: 'Olive oil, fish, whole grains',
    accent: '#0E7490',
    image: 'mediterranean.jpg',
    meals: {
      Breakfast: 'Greek yogurt with honey and walnuts',
      Lunch: 'Grilled fish with a chickpea and vegetable salad',
      Dinner: 'Whole-grain pasta with olive oil and vegetables',
      Snacks: 'Hummus with pita or fresh fruit',
    },
  },
  {
    title: 'South Indian Plan',
    tag: 'Regional, home-style meals',
    accent: '#DC2626',
    image: 'south-indian.jpg',
    meals: {
      Breakfast: 'Dosa or idli with coconut chutney',
      Lunch: 'Sambar rice with a vegetable poriyal',
      Dinner: 'Curd rice with pickle and papad',
      Snacks: 'Roasted makhana or murukku (in moderation)',
    },
  },
  {
    title: 'Post-Workout Recovery',
    tag: 'For after a workout day',
    accent: '#6D28D9',
    image: 'post-workout.jpg',
    meals: {
      Breakfast: 'Banana smoothie with peanut butter and oats',
      Lunch: 'Grilled chicken or paneer with sweet potato',
      Dinner: 'Dal with rice and a side of curd',
      Snacks: 'A protein shake or boiled eggs',
    },
  },
];

const workoutCategories = [
  {
    title: 'Full Body',
    accent: '#0F6E56',
    videos: [
      { id: 'xCSaHRtgw1w', label: '15 Min Total Beginner Full Body Workout' },
    ],
  },
  {
    title: 'Cardio & Weight Loss (HIIT)',
    accent: '#DC2626',
    videos: [
      { id: 'vnBXaCsoEPU', label: '20 Min Beginner Cardio Workout for Fat Burn' },
      { id: 'Hc7V7MJCTc8', label: 'Full Body Fat Burn HIIT (No Equipment)' },
    ],
  },
  {
    title: 'Abs & Core',
    accent: '#B91C1C',
    videos: [
      { id: 'n0gpwgEgCBk', label: '6 Min Flat Abs Workout' },
      { id: '---k1vFBbWw', label: '12 Min Slow & Intense Abs' },
      { id: 'pKhKqYBP7qQ', label: '30 Min Abs & Booty (No Repeat)' },
    ],
  },
  {
    title: 'Legs & Lower Body',
    accent: '#B45309',
    videos: [
      { id: 'QA-PDrlWPNw', label: '10 Min Leg / Butt / Thigh Workout' },
      { id: 'OLn3xfavAlw', label: '20 Min At-Home Leg / Butt / Thigh Workout' },
    ],
  },
  {
    title: 'Arms & Upper Body',
    accent: '#6D28D9',
    videos: [
      { id: 'ESkI_WR1qqc', label: '15 Min Upper Body Workout (No Equipment)' },
      { id: 'L_Y9xspaU7I', label: 'Full Upper Body Workout (With Dumbbells)' },
    ],
  },
  {
    title: 'Yoga',
    accent: '#4F46E5',
    videos: [
      { id: 'r7xsYgTeM2Q', label: '15 Min Sunrise Morning Yoga' },
    ],
  },
];

function Trainer() {
  const [activeTab, setActiveTab] = useState('diet');
  const [openPlan, setOpenPlan] = useState(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Trainer</h1>
          <p className="text-gray-500">Diet ideas and home workouts to go with your check-ins.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-2.5 mb-8">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            This section is general inspiration, not personalized medical or nutrition advice. If you have a health condition or specific dietary needs, please check with a doctor or registered dietitian before starting something new.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Diet plans */}
        {activeTab === 'diet' && (
          <motion.div key="diet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {dietPlans.map((plan) => {
                const isOpen = openPlan === plan.title;
                return (
                  <div
                    key={plan.title}
                    onClick={() => setOpenPlan(isOpen ? null : plan.title)}
                    className={`bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 ${
                      isOpen ? 'shadow-lg scale-[1.01] border-2' : 'border border-gray-200 hover:border-gray-300'
                    }`}
                    style={isOpen ? { borderColor: plan.accent } : undefined}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${plan.accent}1A`, color: plan.accent }}
                          >
                            <Utensils size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{plan.title}</h3>
                            <p className="text-xs text-gray-400">{plan.tag}</p>
                          </div>
                        </div>
                        <ChevronDown size={18} className={`text-gray-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>

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
                              {Object.entries(plan.meals).map(([label, value]) => (
                                <div key={label} className="text-sm">
                                  <span className="font-semibold text-gray-900">{label}: </span>
                                  <span className="text-gray-600">{value}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Workout videos */}
        {activeTab === 'workout' && (
          <motion.div key="workout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-10">
            {workoutCategories.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.accent}1A`, color: cat.accent }}
                  >
                    <Dumbbell size={16} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg">{cat.title}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {cat.videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${video.id}`}
                          title={video.label}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 text-sm">{video.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default Trainer;