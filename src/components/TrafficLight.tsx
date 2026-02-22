import { LightColor } from "@/hooks/useTrafficController";
import { cn } from "@/lib/utils";

interface TrafficLightProps {
  color: LightColor;
  direction: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

const TrafficLight = ({ color, direction, className, orientation = "vertical" }: TrafficLightProps) => {
  const lights: LightColor[] = ["red", "yellow", "green"];
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "bg-card rounded-lg p-1.5 border border-border flex gap-1",
          isHorizontal ? "flex-row" : "flex-col"
        )}
      >
        {lights.map((l) => (
          <div
            key={l}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300",
              l === "red" && "bg-traffic-red",
              l === "yellow" && "bg-traffic-yellow",
              l === "green" && "bg-traffic-green",
              color === l && l === "red" && "glow-red",
              color === l && l === "yellow" && "glow-yellow animate-pulse-light",
              color === l && l === "green" && "glow-green",
              color !== l && "light-off"
            )}
          />
        ))}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{direction}</span>
    </div>
  );
};

export default TrafficLight;
