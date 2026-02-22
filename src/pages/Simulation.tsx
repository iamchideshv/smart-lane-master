import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import TrafficScene from "@/components/3d/TrafficScene";
import { useTrafficController, Direction } from "@/hooks/useTrafficController";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, SkipForward, Clock, Siren, TrafficCone, Users, Activity, Scan, Brain, BarChart3, Wind, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Simulation = () => {
  const controller = useTrafficController();
  const [selectedAmbulanceDir, setSelectedAmbulanceDir] = useState<Direction>("north");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const highestDensity = Math.max(...(["north", "south", "east", "west"] as Direction[]).map(d => controller.mlAnalytics[d].densityPercent));

  // Compute total aggregates safely
  const totalThroughput = controller.totalCrossed;
  const totalCo2 = controller.totalCo2;

  // AI Insights Engine
  const aiInsights = useMemo(() => {
    const insights = [];
    if (highestDensity > 70) {
      const busyLanes = (["north", "south", "east", "west"] as Direction[]).filter(d => controller.mlAnalytics[d].densityPercent > 70);
      insights.push(`High congestion detected in ${busyLanes.join(', ')} lane(s).`);
    }
    if (controller.activeAmbulance.active) {
      insights.push(`Emergency corridor activated for ${controller.activeAmbulance.direction} bound traffic.`);
    }
    if (controller.efficiencyScore > 50) {
      insights.push(`Adaptive cycle is highly efficient, reducing waits by ${Math.round(controller.efficiencyScore)}%.`);
    } else if (controller.efficiencyScore > 0) {
      insights.push(`Adaptive cycle is reducing waits by ${Math.round(controller.efficiencyScore)}%.`);
    }
    if (controller.pollutionIndex > 70) {
      insights.push("High pollution index warning due to idling vehicles.");
    }
    if (insights.length === 0) {
      insights.push("Traffic flowing smoothly. AI monitoring active.");
    }
    return insights;
  }, [highestDensity, controller.activeAmbulance, controller.efficiencyScore, controller.pollutionIndex, controller.mlAnalytics]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 justify-center py-4 border-b border-border bg-card/50">
        <TrafficCone className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-bold tracking-wide uppercase">
          Smart Traffic Control System
        </h1>
        <span
          className={cn(
            "text-xs font-bold tracking-wide px-2 py-0.5 rounded ml-2",
            controller.isEmergency
              ? "bg-destructive/20 text-destructive animate-pulse"
              : controller.activeAmbulance.active
                ? "bg-accent/20 text-accent animate-pulse"
                : "bg-primary/10 text-primary"
          )}
        >
          {controller.phaseLabel}
        </span>
        {controller.autoMode && !controller.isEmergency && !controller.activeAmbulance.active && (
          <span className="text-lg font-bold tabular-nums text-primary">{controller.timeLeft}s</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <TrafficScene
            lights={controller.lights}
            volumes={controller.volumes}
            ambulancePriority={controller.activeAmbulance.active}
            ambulanceDirection={controller.activeAmbulance.direction}
            onAmbulanceCleared={controller.onAmbulanceCleared}
            onVehicleExit={controller.onVehicleExit}
          />

          {/* AI Floating Global Label */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-blue-950/80 border border-blue-500/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] pointer-events-none z-10 transition-all">
            <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-bold text-blue-100 tracking-wider uppercase">AI Traffic Analysis Active</span>
          </div>

          {/* Direction labels - North */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-card/80 px-3 py-1 rounded mb-1 border border-primary/20 flex items-center gap-1">
              <Scan className="w-3 h-3 text-primary animate-pulse" /> North
            </div>
            <div className="text-[10px] font-mono text-primary bg-card/80 px-2 py-0.5 rounded flex gap-2 border border-primary/10">
              <span>Den: {controller.mlAnalytics.north.densityPercent}%</span>
              <span>Pri: {Math.round(controller.priorities.north)}</span>
            </div>
          </div>
          {/* Direction labels - South */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="text-[10px] font-mono text-primary bg-card/80 px-2 py-0.5 rounded mb-1 flex gap-2 border border-primary/10">
              <span>Den: {controller.mlAnalytics.south.densityPercent}%</span>
              <span>Pri: {Math.round(controller.priorities.south)}</span>
            </div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-card/80 px-3 py-1 rounded border border-primary/20 flex items-center gap-1">
              <Scan className="w-3 h-3 text-primary animate-pulse" /> South
            </div>
          </div>
          {/* Direction labels - West */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-start px-2">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-card/80 px-3 py-1 rounded mb-1 border border-primary/20 flex items-center gap-1">
              <Scan className="w-3 h-3 text-primary animate-pulse" /> West
            </div>
            <div className="text-[10px] font-mono text-primary bg-card/80 px-2 py-0.5 rounded flex flex-col items-start border border-primary/10">
              <span>Den: {controller.mlAnalytics.west.densityPercent}%</span>
              <span>Pri: {Math.round(controller.priorities.west)}</span>
            </div>
          </div>
          {/* Direction labels - East */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-end px-2">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-card/80 px-3 py-1 rounded mb-1 border border-primary/20 flex items-center gap-1">
              East <Scan className="w-3 h-3 text-primary animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-primary bg-card/80 px-2 py-0.5 rounded flex flex-col items-end border border-primary/10">
              <span>Den: {controller.mlAnalytics.east.densityPercent}%</span>
              <span>Pri: {Math.round(controller.priorities.east)}</span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-[340px] bg-card border-l border-border p-4 space-y-4 overflow-y-auto">

          {/* Ambulance Manual Trigger */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-accent">
              <Siren className="w-3.5 h-3.5" /> Manual Ambulance Trigger
            </h3>
            <div className="flex items-center gap-2">
              <Select value={selectedAmbulanceDir} onValueChange={(v) => setSelectedAmbulanceDir(v as Direction)} disabled={controller.activeAmbulance.active}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => controller.triggerManualAmbulance(selectedAmbulanceDir)}
                disabled={controller.activeAmbulance.active}
              >
                Dispatch
              </Button>
            </div>
            {controller.activeAmbulance.active && (
              <p className="text-[10px] text-accent animate-pulse font-bold bg-accent/10 px-2 py-1 rounded">
                Emergency Active: Reserving {controller.activeAmbulance.direction?.toUpperCase()}
              </p>
            )}
          </div>

          {/* AI Traffic Analytics */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex justify-between items-center">
              <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-blue-400" /> AI ML Analytics</span>
              <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-primary">Live Scan</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["north", "south", "east", "west"] as Direction[]).map((dir) => {
                const light = controller.lights[dir];
                const analytics = controller.mlAnalytics[dir];
                const isHighest = analytics.densityPercent === highestDensity && highestDensity > 0;
                const isHighDensity = analytics.densityPercent > 70;

                return (
                  <div key={dir} className={cn(
                    "rounded-lg p-2 text-center flex flex-col items-center justify-between border transition-all duration-500",
                    isHighest ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-card border-border/50",
                    isHighDensity && "shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/50 relative overflow-hidden"
                  )}>
                    {isHighDensity && (
                      <div className="absolute inset-0 bg-red-500/5 animate-pulse mix-blend-screen pointer-events-none" />
                    )}
                    <div className="flex justify-between w-full items-center mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{dir}</span>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        light === "red" && "bg-traffic-red glow-red",
                        light === "yellow" && "bg-traffic-yellow glow-yellow",
                        light === "green" && "bg-traffic-green glow-green",
                      )} />
                    </div>

                    <div className="flex flex-col text-[9px] text-muted-foreground font-mono w-full items-start mt-1 gap-[2px]">
                      <div className="flex justify-between w-full"><span>Cars</span><span className="text-foreground transition-all duration-300">{analytics.cars}</span></div>
                      <div className="flex justify-between w-full"><span>Bus</span><span className="text-foreground transition-all duration-300">{analytics.buses}</span></div>
                      <div className="flex justify-between w-full"><span>Moto</span><span className="text-foreground transition-all duration-300">{analytics.motorcycles}</span></div>
                      <div className="flex justify-between w-full border-t border-border/50 pt-[2px] mt-[1px]">
                        <span>Density</span>
                        <span className={cn(
                          "font-bold transition-all duration-300",
                          analytics.densityPercent < 40 ? "text-green-400" : analytics.densityPercent < 70 ? "text-yellow-400" : "text-red-400"
                        )}>{analytics.densityPercent}%</span>
                      </div>
                      <div className="flex justify-between w-full border-t border-border/50 pt-[2px] mt-[1px]">
                        <span className="text-primary font-bold">Priority</span>
                        <span className="text-primary font-bold transition-all duration-300">{Math.round(controller.priorities[dir])}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Volumes (Sim Inputs) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground font-bold">
              <Users className="w-3.5 h-3.5" /> Traffic Density
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* NS Volumes */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>North</span><span className="font-mono text-primary">{controller.volumes.north}</span></div>
                  <Slider value={[controller.volumes.north]} max={2000} step={50} onValueChange={([v]) => controller.setVolumes(p => ({ ...p, north: v }))} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>South</span><span className="font-mono text-primary">{controller.volumes.south}</span></div>
                  <Slider value={[controller.volumes.south]} max={2000} step={50} onValueChange={([v]) => controller.setVolumes(p => ({ ...p, south: v }))} />
                </div>
              </div>
              {/* EW Volumes */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>East</span><span className="font-mono text-primary">{controller.volumes.east}</span></div>
                  <Slider value={[controller.volumes.east]} max={2000} step={50} onValueChange={([v]) => controller.setVolumes(p => ({ ...p, east: v }))} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>West</span><span className="font-mono text-primary">{controller.volumes.west}</span></div>
                  <Slider value={[controller.volumes.west]} max={2000} step={50} onValueChange={([v]) => controller.setVolumes(p => ({ ...p, west: v }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Signal Timings */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground font-bold">
              <Clock className="w-3.5 h-3.5" /> Signal Timings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]"><span>Green</span><span className="font-mono text-traffic-green">{controller.greenDuration}s</span></div>
                <Slider value={[controller.greenDuration]} max={30} min={1} step={1} onValueChange={([v]) => controller.setGreenDuration(v)} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]"><span>Yellow</span><span className="font-mono text-traffic-yellow">{controller.yellowDuration}s</span></div>
                <Slider value={[controller.yellowDuration]} max={10} min={1} step={1} onValueChange={([v]) => controller.setYellowDuration(v)} />
              </div>
            </div>
          </div>

          {/* Auto Mode & Action Buttons */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Auto Adaptive Cycle
              </label>
              <Switch
                checked={controller.autoMode}
                onCheckedChange={controller.setAutoMode}
                disabled={controller.isEmergency || controller.activeAmbulance.active}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={showAnalytics ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1 text-xs h-8"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-3 h-3" /> Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 text-xs h-8"
                onClick={controller.advancePhase}
                disabled={controller.isEmergency || controller.activeAmbulance.active}
              >
                <SkipForward className="w-3 h-3" /> Force Eval
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={controller.isEmergency ? "destructive" : "outline"}
                size="sm"
                className="flex-1 gap-1 text-xs h-8"
                onClick={controller.toggleEmergency}
                disabled={controller.activeAmbulance.active}
              >
                <AlertTriangle className="w-3 h-3" />
                {controller.isEmergency ? "Resume" : "Stop All"}
              </Button>
            </div>
          </div>

        </div>

        {/* Advanced Analytics Overlay Panel */}
        {showAnalytics && (
          <div className="absolute right-[340px] top-0 bottom-0 w-[450px] bg-card/95 backdrop-blur-md border-l border-border p-6 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right-10 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" /> Advanced Data Analytics
            </h2>

            {/* AI Insights Panel */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" /> AI Engine Insights
              </h3>
              <ul className="space-y-2">
                {aiInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm font-medium text-blue-100 flex gap-2">
                    <span className="text-blue-500">•</span> {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Throughput</div>
                <div className="text-2xl font-bold font-mono text-primary">{totalThroughput}</div>
                <div className="text-[10px] text-muted-foreground">Vehicles Crossed</div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Wind className="w-3 h-3" /> Est. Emissions</div>
                <div className="text-2xl font-bold font-mono text-amber-500">{(totalCo2 / 1000).toFixed(1)} <span className="text-sm">kg</span></div>
                <div className="text-[10px] text-muted-foreground">CO₂ Generated</div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pollution Index</div>
                <div className="text-2xl font-bold font-mono" style={{ color: controller.pollutionIndex > 70 ? '#ef4444' : controller.pollutionIndex > 40 ? '#eab308' : '#22c55e' }}>
                  {Math.round(controller.pollutionIndex)}
                </div>
                <div className="text-[10px] text-muted-foreground">{controller.pollutionIndex > 70 ? 'High' : controller.pollutionIndex > 40 ? 'Moderate' : 'Low'} Levels</div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Efficiency Gain</div>
                <div className="text-2xl font-bold font-mono text-green-500">+{Math.max(0, Math.round(controller.efficiencyScore))}%</div>
                <div className="text-[10px] text-muted-foreground">vs Fixed Timing</div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="space-y-6">

              {/* Throughput Area Chart */}
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Network Throughput Profile</h3>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={controller.analyticsHistory}>
                      <defs>
                        <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} itemStyle={{ color: '#3b82f6' }} />
                      <Area type="monotone" dataKey="throughput" stroke="#3b82f6" fillOpacity={1} fill="url(#colorThroughput)" animationDuration={300} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CO2 Emissions Line Chart */}
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Carbon Emission Trend (g)</h3>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={controller.analyticsHistory}>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} itemStyle={{ color: '#f59e0b' }} />
                      <Line type="monotone" dataKey="co2Emissions" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={300} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Wait Time vs Speed Comparison */}
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Wait Time & Speed Ratio</h3>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={controller.analyticsHistory}>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="avgWait" stroke="#ef4444" name="Avg Wait (s)" strokeWidth={2} dot={false} animationDuration={300} />
                      <Line type="monotone" dataKey="avgSpeed" stroke="#10b981" name="Avg Speed" strokeWidth={2} dot={false} animationDuration={300} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Simulation;
