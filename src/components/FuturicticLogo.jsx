import { motion } from "framer-motion";
import { Bot } from "lucide-react";


export const FuturisticLogo = () => (
  <div className="flex items-center space-x-3 relative group">
    {/* Animated Bot Icon Container */}
    <div className="relative">
      {/* Glowing background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary-foreground/50 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-75 group-hover:opacity-100" />

      {/* Rotating rings */}
      <div className="absolute -inset-2 rounded-full border border-primary/20 animate-[spin_3s_linear_infinite]" />
      <div className="absolute -inset-2 rounded-full border border-primary/20 animate-[spin_4s_linear_infinite_reverse]" />

      {/* Bot Icon with effects */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative w-8 h-8 bg-background rounded-full flex items-center justify-center"
        style={{ boxShadow: "0 0 20px rgba(var(--primary), 0.3)" }}
      >
        <Bot className="h-6 w-6 text-primary relative z-10" />

        {/* Particle effects */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full animate-ping"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 90}deg) translateX(12px)`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>

    {/* Text with effects */}
    <div className="relative">
      {/* Glowing text effect */}
      <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <h1 className="relative text-2xl font-bold">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary-foreground animate-gradient-shift">
          Insight
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground via-primary/80 to-primary animate-gradient-shift-reverse">
          Bot
        </span>

        {/* Futuristic accents */}
        <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <span className="absolute -top-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </h1>
    </div>

    {/* Scanner effect */}
    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scanner" />
    </div>
  </div>
);
