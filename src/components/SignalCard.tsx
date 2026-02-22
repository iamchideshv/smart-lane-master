import { useTrafficController } from "@/hooks/useTrafficController";
import Intersection from "./Intersection";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, SkipForward, Clock, Timer } from "lucide-react";

interface SignalCardProps {
  id: number;
  label: string;
}

const SignalCard = ({ id, label }: SignalCardProps) => {
  const controller = useTrafficController();

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
            {id}
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-bold tracking-wide px-2 py-0.5 rounded",
              controller.isEmergency
                ? "bg-destructive/20 text-destructive animate-pulse"
                : "bg-primary/10 text-primary"
            )}
          >
            {controller.phaseLabel}
          </span>
          {controller.autoMode && !controller.isEmergency && (
            <span className="text-lg font-bold tabular-nums text-primary">{controller.timeLeft}s</span>
          )}
        </div>
      </div>

      {/* Intersection visual - scaled down */}
      <div className="flex justify-center">
        <div className="transform scale-[0.6] origin-center -my-[68px]">
          <Intersection lights={controller.lights} />
        </div>
      </div>

      {/* Compact controls */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Auto
          </label>
          <Switch
            checked={controller.autoMode}
            onCheckedChange={controller.setAutoMode}
            disabled={controller.isEmergency}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-secondary-foreground">
              <Timer className="w-3 h-3 text-traffic-green" /> Green
            </span>
            <span className="text-primary font-mono text-xs">{controller.greenDuration}s</span>
          </div>
          <Slider
            value={[controller.greenDuration]}
            onValueChange={([v]) => controller.setGreenDuration(v)}
            min={3}
            max={15}
            step={1}
            disabled={controller.isEmergency}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-secondary-foreground">
              <Timer className="w-3 h-3 text-traffic-yellow" /> Yellow
            </span>
            <span className="text-accent font-mono text-xs">{controller.yellowDuration}s</span>
          </div>
          <Slider
            value={[controller.yellowDuration]}
            onValueChange={([v]) => controller.setYellowDuration(v)}
            min={1}
            max={5}
            step={1}
            disabled={controller.isEmergency}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 text-xs h-8"
            onClick={controller.nextPhase}
            disabled={controller.isEmergency}
          >
            <SkipForward className="w-3 h-3" /> Next
          </Button>
          <Button
            variant={controller.isEmergency ? "destructive" : "outline"}
            size="sm"
            className="flex-1 gap-1 text-xs h-8"
            onClick={controller.toggleEmergency}
          >
            <AlertTriangle className="w-3 h-3" />
            {controller.isEmergency ? "Resume" : "Stop"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
