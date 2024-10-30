import { Bot } from "lucide-react";

export const NoSessionView = () => (
  <div className="relative flex items-center justify-center h-full bg-gradient-to-b from-background to-background/50 overflow-hidden">
    {/* Animated background grid using pseudo-elements and Tailwind classes */}
    <div className="absolute inset-0 bg-[length:40px_40px] animate-grid-move opacity-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.15)_1px,transparent_1px)]" />
    </div>

    {/* Main content container */}
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Outer rotating circle */}
      <div className="absolute w-80 h-80 rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/60 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-10rem)`,
            }}
          />
        ))}
      </div>

      {/* Middle rotating elements */}
      <div className="absolute w-64 h-64 rounded-full animate-[spin_15s_linear_infinite_reverse]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 border-2 border-primary/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${i * 60}deg) translateY(-8rem) rotate(45deg)`,
            }}
          />
        ))}
      </div>

      {/* Center orb container */}
      <div className="relative w-48 h-48">
        {/* Glowing background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl animate-pulse" />

        {/* Main orb */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-lg border border-primary/20">
          {/* Holographic wave effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-full animate-[bounce_4s_ease-in-out_infinite]" />

          {/* Center bot icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Bot className="w-16 h-16 text-primary animate-bounce" />
              <div className="absolute inset-0 blur-xl bg-primary/20 scale-150 animate-pulse" />
            </div>
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/60 rounded-full blur-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `rotate(${i * 120}deg) translateY(-3rem)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-[-100%]">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scanner effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scanner" />
      </div>
    </div>

    {/* Bottom text */}
    <div className="absolute bottom-12 text-center z-10">
      <h2 className="relative text-2xl font-bold">
        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse">
          No Active Session
        </span>
        <div className="absolute inset-0 blur-xl bg-primary/20 scale-150 -z-10" />
      </h2>
      <p className="text-muted-foreground mt-2 animate-pulse">
        Create a new chat to begin the conversation
      </p>
    </div>
  </div>
);