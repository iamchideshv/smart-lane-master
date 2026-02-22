import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Radio, TrafficCone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "Simulation",
      description: "Interactive 3D Traffic Control System with adaptive engine and manual triggers.",
      icon: Radio,
      path: "/simulation",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-500",
      borderColor: "hover:border-blue-500/50",
    },
    {
      title: "Analyser",
      description: "Advanced traffic pattern analysis and real-time performance metrics.",
      icon: BarChart3,
      path: "/analyser",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
      borderColor: "hover:border-emerald-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,25,1),rgba(10,10,12,1))]">
      <div className="mb-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <TrafficCone className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase sm:text-5xl">
            Smart Traffic <span className="text-primary">Control</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Select an engine to begin managing and analyzing urban traffic flow with AI-powered precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {options.map((option) => (
          <div
            key={option.title}
            onClick={() => navigate(option.path)}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 cursor-pointer backdrop-blur-xl",
              "hover:bg-white/[0.04] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]",
              option.borderColor
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              option.color
            )} />

            <div className="relative z-10 flex flex-col h-full space-y-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 transition-transform duration-500 group-hover:scale-110",
                option.iconColor
              )}>
                <option.icon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{option.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>

              <div className="pt-4 mt-auto">
                <div className="flex items-center text-sm font-semibold transition-all duration-300 group-hover:gap-2">
                  Launch {option.title}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-16 text-muted-foreground text-sm font-medium">
        © 2024 Smart Traffic AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
