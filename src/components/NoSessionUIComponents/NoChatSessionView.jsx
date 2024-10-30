import { Search } from "lucide-react";

const NoChatSessionView = () => {
	return (
    <div className="relative flex flex-col items-center justify-center p-4 h-[780px] overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,var(--primary)_50%,transparent_100%)] opacity-[0.03] bg-[length:200%_100%] animate-shimmer" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)] bg-[size:20px_20px] opacity-[0.03]" />
      </div>

      {/* Central circular element */}
      <div className="relative">
        {/* Rotating rings */}
        <div className="absolute -inset-6 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute -inset-4 border border-primary/30 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
        <div className="absolute -inset-2 border border-primary/40 rounded-full animate-[spin_6s_linear_infinite]" />

        {/* Center content */}
        <div className="relative w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <Search className="w-8 h-8 text-primary/60" />

          {/* Pulsing dots */}
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-ping"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 90}deg) translateY(-12px)`,
                animationDuration: "1.5s",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Text content */}
      <div className="mt-6 text-center space-y-2 relative">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary-foreground">
          No Chats Found
        </h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Try a different search term or start a new chat
        </p>

        {/* Accent line */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Scanner effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent absolute animate-scanner" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float-random"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
export default NoChatSessionView