import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, TrendingUp, Users, GraduationCap, Church, Eye, UserCheck, X, Trophy, Construction } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProgressRing from "@/components/church/ProgressRing";
import StatsCard from "@/components/church/StatsCard";
import LeaderboardItem from "@/components/church/LeaderboardItem";
import Header from "@/components/church/Header";
import { ChuoKikuuFriendsCard, ImpactCard, CallToActionCard, CurrentProjectsCard } from "@/components/church/ExpandableCard";
import { usePublicDashboard } from "@/hooks/useChurchData";

const ANNUAL_GOAL = 500000; // Configurable church annual goal

const CATEGORIES = [
  { id: "church_member", label: "Church Member", icon: Church, description: "Registered church member", requiresAuth: true },
  { id: "student", label: "Student", icon: GraduationCap, description: "Student member", requiresAuth: true },
  { id: "visitor", label: "Visitor", icon: Eye, description: "First-time or occasional visitor", requiresAuth: false },
  { id: "regular", label: "Regular", icon: UserCheck, description: "Regular attendee", requiresAuth: false },
];

const Index = () => {
  const { data, isLoading } = usePublicDashboard();
  const [showPicker, setShowPicker] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleCardToggle = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const totalCollected = data?.total_collected ?? 0;
  const percentage = ANNUAL_GOAL > 0 ? (totalCollected / ANNUAL_GOAL) * 100 : 0;
  const currentProject = data?.current_project;
  const projectPercentage = currentProject
    ? (currentProject.collected_amount / currentProject.target_amount) * 100
    : 0;
  const bestGroup = data?.best_group;
  const groups = data?.groups_leaderboard ?? [];
  const activeMembers = data?.active_members ?? 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Right Sidebar - SDA Logo */}
      <aside className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-16 lg:w-64 bg-church-blue z-40 flex flex-col items-center pt-4 lg:pt-6 pb-4 lg:pb-8 px-2 lg:px-4 shadow-xl">
        {/* SDA Logo - Rounded */}
        <div className="w-10 h-10 lg:w-32 lg:h-32 rounded-full bg-white p-1 lg:p-2 shadow-lg mb-2 lg:mb-6">
          <img 
            src="/sda_clean_super.png" 
            alt="SDA Logo" 
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        
        {/* Church Name - Hidden on mobile */}
        <div className="text-center mt-2 lg:mt-4 hidden lg:block">
          <h3 className="text-white font-display text-xl mb-2">SDA Church</h3>
          <p className="text-white/60 text-sm">Building God's Kingdom</p>
        </div>

        {/* Decorative separator - Hidden on mobile */}
        <div className="w-16 h-0.5 bg-gold mt-6 lg:mt-8 mb-4 lg:mb-6 rounded-full hidden lg:block" />

        {/* Quick Links or Info - Hidden on mobile */}
        <div className="text-center mt-auto hidden lg:block">
          <p className="text-white/50 text-xs">© 2026 SDA Church</p>
        </div>
      </aside>

      {/* Main Content with right padding for sidebar */}
      <div className="pr-16 lg:pr-64">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-hero py-16 sm:py-24">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: 80 + i * 50,
                height: 80 + i * 50,
                top: `${15 + i * 12}%`,
                left: `${5 + i * 17}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Church Name Label - Top Left */}
          <div className="absolute top-0 left-4 sm:left-8 md:left-12">
            <p className="text-white/70 text-xs sm:text-sm font-light uppercase tracking-widest">
              Chuo Kikuu SDA Church
            </p>
          </div>

          {/* Main Content - Centered */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center pt-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display text-white mb-6 leading-tight"
            >
              Resource Mobilization
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/80 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Supporting the Mission of Chuo Kikuu SDA Church by strengthening ministry, empowering spiritual growth, and advancing the work of God through unity, generosity, and faithful service.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => setShowPicker(true)}
              className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-gold via-amber-500 to-gold bg-size-200 animate-gradient font-bold text-lg text-white shadow-2xl hover:shadow-gold/40 transition-all duration-300 hover:bg-position-100 hover:-translate-y-2"
              style={{
                backgroundSize: '200% 100%',
                boxShadow: '0 10px 30px rgba(212, 160, 23, 0.4), 0 0 20px rgba(212, 160, 23, 0.2)',
              }}
            >
              {/* Animated shine effect */}
              <span className="absolute inset-0 rounded-2xl overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </span>
              
              {/* Glow effect behind button */}
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-300" />
              
              {/* Button content */}
              <span className="relative flex items-center gap-3">
                <span className="p-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Heart className="w-6 h-6" />
                </span>
                <span className="tracking-wide">Press Here to Contribute</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>
        </div>
      </section>
      </div>

      {/* Expandable Cards Section */}
      <section className="container mx-auto px-4 py-16 pr-16 lg:pr-64">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <ChuoKikuuFriendsCard 
            isExpanded={expandedCard === 0} 
            onToggle={() => handleCardToggle(0)} 
            index={0}
          />
          <ImpactCard 
            isExpanded={expandedCard === 1} 
            onToggle={() => handleCardToggle(1)} 
            index={1}
            totalContributed={totalCollected} 
            activeMembers={activeMembers} 
          />
          <CallToActionCard 
            isExpanded={expandedCard === 2} 
            onToggle={() => handleCardToggle(2)} 
            index={2}
            onContributeClick={() => setShowPicker(true)} 
          />
          <CurrentProjectsCard 
            isExpanded={expandedCard === 3} 
            onToggle={() => handleCardToggle(3)} 
            index={3}
          />
        </motion.div>
      </section>

      {/* Category Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display text-foreground">I am a...</h2>
                <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => {
                      setShowPicker(false);
                      if (cat.requiresAuth) {
                        navigate(`/auth?category=${cat.id}`);
                      } else {
                        navigate(`/guest-dashboard?category=${cat.id}`);
                      }
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:border-church-blue hover:bg-slate-50 transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-church-blue/10 flex items-center justify-center group-hover:bg-church-blue/20 transition-colors">
                      <cat.icon className="w-6 h-6 text-church-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-church-blue transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-church-blue border-t border-church-blue-dark py-8 pr-16 lg:pr-64">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-white font-display text-lg mb-2">Seventh Day Adventist Church CHUO KIKUU</h3>
            <p className="text-white/70 text-sm">
              © Copyright @2026 by CHUO KIKUU SDA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
