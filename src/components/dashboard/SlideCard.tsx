import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideCardProps {
  children: ReactNode;
  onClick?: () => void;
  bgImage?: string;
  className?: string;
}

const SlideCard = ({ children, onClick, bgImage, className = "" }: SlideCardProps) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl p-8 text-white cursor-pointer min-h-[40vh] sm:min-h-[50vh] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      style={{
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* background image zoom layer */}
      {bgImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
      )}

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/10 to-transparent rounded-full blur-2xl" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default SlideCard;
