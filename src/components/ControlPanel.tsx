import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, SkipForward, Zap, Clock, Timer } from "lucide-react";

interface ControlPanelProps {
  phaseLabel: string;
  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  greenDuration: number;
  setGreenDuration: (v: number) => void;
  yellowDuration: number;
  setYellowDuration: (v: number) => void;
  timeLeft: number;
  nextPhase: () => void;
  isEmergency: boolean;
  toggleEmergency: () => void;
}

const ControlPanel = ({
  phaseLabel,
  autoMode,
  setAutoMode,
  greenDuration,
  setGreenDuration,
  yellowDuration,
  setYellowDuration,
  timeLeft,
  nextPhase,
  isEmergency,
  toggleEmergency,
}: ControlPanelProps) => {
  return (
    <div className="w-full max-w-sm space-y-5">
      {/* Status */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Zap className="w-3.5 h-3.5" /> System Status
        </div>
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-lg font-bold tracking-wide",
              isEmergency && "text-destructive animate-pulse"
            )}
          >
            {phaseLabel}
          </span>
          {autoMode && !isEmergency && (
            <span className="text-2xl font-bold tabular-nums text-primary">{timeLeft}s</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Auto mode toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-secondary-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" /> Auto Cycle
          </label>
          <Switch checked={autoMode} onCheckedChange={setAutoMode} disabled={isEmergency} />
        </div>

        {/* Green duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-secondary-foreground">
              <Timer className="w-4 h-4 text-traffic-green" /> Green
            </span>
            <span className="text-primary font-mono">{greenDuration}s</span>
          </div>
          <Slider
            value={[greenDuration]}
            onValueChange={([v]) => setGreenDuration(v)}
            min={3}
            max={15}
            step={1}
            disabled={isEmergency}
          />
        </div>

        {/* Yellow duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-secondary-foreground">
              <Timer className="w-4 h-4 text-traffic-yellow" /> Yellow
            </span>
            <span className="text-accent font-mono">{yellowDuration}s</span>
          </div>
          <Slider
            value={[yellowDuration]}
            onValueChange={([v]) => setYellowDuration(v)}
            min={1}
            max={5}
            step={1}
            disabled={isEmergency}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={nextPhase}
            disabled={isEmergency}
          >
            <SkipForward className="w-3.5 h-3.5" /> Next Phase
          </Button>
          <Button
            variant={isEmergency ? "destructive" : "outline"}
            size="sm"
            className="flex-1 gap-1.5"
            onClick={toggleEmergency}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isEmergency ? "Resume" : "Emergency"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
