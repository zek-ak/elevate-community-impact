import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Heart, ArrowRight } from "lucide-react";

interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  onContributeClick?: () => void;
}

// Animated gradient background component
const AnimatedGradient = ({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) => (
  <div 
    className="absolute inset-0 rounded-2xl transition-all duration-500"
    style={{
      background: isActive || isHovered
        ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(212, 160, 23, 0.9) 50%, rgba(59, 130, 246, 0.85) 100%)'
        : 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(59, 130, 246, 0.75) 50%, rgba(212, 160, 23, 0.7) 100%)',
    }}
  />
);

// Floating motion component
const FloatingMotion = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{ 
      y: [0, -8, 0],
    }}
    transition={{ 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay,
    }}
  >
    {children}
  </motion.div>
);

const ExpandableCard = ({ title, icon, children, isExpanded, onToggle, index, onContributeClick }: ExpandableCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <FloatingMotion delay={index * 0.2}>
      <motion.div
        className="relative overflow-hidden cursor-pointer"
        initial={false}
        animate={{ 
          y: isHovered ? -8 : 0,
          scale: isExpanded ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onToggle}
        style={{
          boxShadow: isHovered || isExpanded 
            ? '0 20px 40px rgba(30, 58, 138, 0.3), 0 0 30px rgba(212, 160, 23, 0.15)' 
            : '0 10px 25px rgba(30, 58, 138, 0.15), 0 0 15px rgba(212, 160, 23, 0.08)',
        }}
      >
        {/* Animated Gradient Background */}
        <AnimatedGradient isHovered={isHovered} isActive={isExpanded} />
        
        {/* Animated Border Glow */}
        <div 
          className="absolute inset-0 rounded-2xl transition-all duration-500"
          style={{
            border: isHovered || isExpanded 
              ? '2px solid rgba(212, 160, 23, 0.6)' 
              : '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isHovered || isExpanded
              ? 'inset 0 0 20px rgba(212, 160, 23, 0.1)'
              : 'none',
          }}
        />

        {/* Card Content */}
        <div className="relative z-10">
          {/* Card Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="text-white"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
              <h3 className="text-white font-display text-lg font-semibold">{title}</h3>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-white/80"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Card Content - Expandable */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-white/20 pt-4">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </FloatingMotion>
  );
};

// Card 1: Chuo Kikuu Friends
export const ChuoKikuuFriendsCard = ({ isExpanded, onToggle, index }: { isExpanded: boolean; onToggle: () => void; index: number }) => {
  const whatsAppLink = "https://chat.whatsapp.com/example"; // Replace with actual WhatsApp group link

  return (
    <ExpandableCard
      title="Chuo Kikuu Friends"
      icon={<Heart className="w-5 h-5" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      index={index}
    >
      <div className="space-y-4">
        <p className="text-white/90 leading-relaxed">
          Click to join the WhatsApp group for Chuo Kikuu Friends and stay connected with our community.
        </p>
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
          Join WhatsApp Group
        </a>
      </div>
    </ExpandableCard>
  );
};

// Card 2: Impact
export const ImpactCard = ({ 
  isExpanded, 
  onToggle, 
  index,
  totalContributed = 0, 
  activeMembers = 0 
}: { 
  isExpanded: boolean; 
  onToggle: () => void; 
  index: number;
  totalContributed?: number; 
  activeMembers?: number 
}) => {
  const impactPoints = [
    "Supporting weekly worship services and spiritual programs",
    "Funding educational initiatives and Bible study materials",
    "Helping community outreach and welfare programs",
    "Maintaining church facilities and grounds",
    "Supporting missionary work and evangelism efforts",
  ];

  return (
    <ExpandableCard
      title="Impact"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      }
      isExpanded={isExpanded}
      onToggle={onToggle}
      index={index}
    >
      <div className="space-y-4">
        <p className="text-white/90 leading-relaxed">
          Your contributions have made a significant difference in advancing the mission of Chuo Kikuu SDA Church. Here's how your generosity is helping:
        </p>
        <ul className="space-y-2">
          {impactPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/85">
              <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/70">
            Total contributed: <span className="font-semibold text-gold-light">KES {totalContributed.toLocaleString()}</span>
          </p>
        </div>
      </div>
    </ExpandableCard>
  );
};

// Card 3: Call to Action
export const CallToActionCard = ({ 
  isExpanded, 
  onToggle, 
  index,
  onContributeClick 
}: { 
  isExpanded: boolean; 
  onToggle: () => void; 
  index: number;
  onContributeClick?: () => void 
}) => {
  return (
    <ExpandableCard
      title="Call to Action"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      }
      isExpanded={isExpanded}
      onToggle={onToggle}
      index={index}
    >
      <div className="space-y-4">
        <p className="text-white/90 leading-relaxed">
          Join us in building God's kingdom through your generous support. Every contribution, no matter the size, makes a meaningful impact in our church community and beyond.
        </p>
        <p className="text-white/90 leading-relaxed">
          Your faithfulness in giving helps us continue our mission of sharing God's love and making a difference in the lives of others.
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onContributeClick) onContributeClick();
          }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gold text-white font-semibold text-base shadow-lg transition-all duration-300 hover:bg-gold-dark hover:shadow-xl hover:-translate-y-1 w-full justify-center"
        >
          <Heart className="w-5 h-5" />
          Press Here to Contribute
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </ExpandableCard>
  );
};

// Card 4: Current Projects
export const CurrentProjectsCard = ({ 
  isExpanded, 
  onToggle, 
  index,
  projects = [] 
}: { 
  isExpanded: boolean; 
  onToggle: () => void; 
  index: number;
  projects?: { name: string; description: string }[] 
}) => {
  const defaultProjects = [
    {
      name: "Church Building Fund",
      description: "Renovating and expanding our worship facility to serve more members",
    },
    {
      name: "Youth Ministry Program",
      description: "Supporting spiritual growth and leadership development for young people",
    },
    {
      name: "Community Outreach",
      description: "Reaching out to those in need with food, shelter, and spiritual support",
    },
    {
      name: "Digital Ministry",
      description: "Expanding our online presence to reach more people with the Gospel",
    },
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <ExpandableCard
      title="Current Projects"
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
      isExpanded={isExpanded}
      onToggle={onToggle}
      index={index}
    >
      <div className="space-y-4">
        <p className="text-white/90 leading-relaxed">
          Here are some of our current initiatives that your contributions support:
        </p>
        <div className="space-y-3">
          {displayProjects.slice(0, 4).map((project, idx) => (
            <div key={idx} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <h4 className="font-semibold text-gold-light mb-1">{project.name}</h4>
              <p className="text-sm text-white/80">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </ExpandableCard>
  );
};

