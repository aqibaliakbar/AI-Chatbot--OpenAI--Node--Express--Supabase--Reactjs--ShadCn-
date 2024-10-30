import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const FeatureShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      icon: "📌",
      title: "Pin Important Chats",
      description:
        "Keep your important conversations easily accessible at the top",
      visual: (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                <div className="h-2 bg-primary/30 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: "🤖",
      title: "AI Personalities",
      description:
        "Switch between different AI roles for specialized assistance",
      visual: (
        <div className="flex justify-center gap-4">
          {["👔", "🎨", "⚡", "📚"].map((emoji, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: "⌨️",
      title: "Keyboard Shortcuts",
      description: "Press ⌘K to quickly search through your chats",
      visual: (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {["⌘", "K"].map((key, i) => (
              <div
                key={i}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary animate-pulse"
              >
                {key}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: "🔍",
      title: "Quick Search",
      description: "Instantly find any conversation or content",
      visual: (
        <div className="relative w-full">
          <div className="w-full h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center px-3">
            <div className="w-24 h-2 bg-primary/30 rounded animate-pulse" />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-background/40 backdrop-blur-sm border border-primary/20">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)] bg-[length:20px_20px] opacity-[0.15]" />

      {/* Animated scanner line */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scanner" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <span className="text-4xl">{features[activeIndex].icon}</span>
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            {features[activeIndex].title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {features[activeIndex].description}
          </p>
          <div className="h-24 flex items-center justify-center">
            {features[activeIndex].visual}
          </div>
        </motion.div>

        {/* Navigation dots */}
        <div className="absolute bottom-4 flex gap-2">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeIndex ? "bg-primary" : "bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40" />
    </div>
  );
};
