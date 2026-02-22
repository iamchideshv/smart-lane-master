import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export type LightColor = "red" | "yellow" | "green";
export type Direction = "north" | "south" | "east" | "west";

export interface TrafficState {
  north: LightColor;
  south: LightColor;
  east: LightColor;
  west: LightColor;
}

export interface AnalyticsData {
  throughput: number;
  avgSpeed: number;
  avgWait: number;
  co2Emissions: number;
  pollutionIndex: number;
  efficiencyScore: number;
  timestamp: string;
}

// Phase definitions: NS green, NS yellow, EW green, EW yellow
export const PHASES: { state: TrafficState; label: string }[] = [
  { state: { north: "green", south: "green", east: "red", west: "red" }, label: "N-S Green" },
  { state: { north: "yellow", south: "yellow", east: "red", west: "red" }, label: "N-S Yellow" },
  { state: { north: "red", south: "red", east: "green", west: "green" }, label: "E-W Green" },
  { state: { north: "red", south: "red", east: "yellow", west: "yellow" }, label: "E-W Yellow" },
];

const STARVATION_THRESHOLD = 30; // Max wait time before serious penalty to greedy phase

export function useTrafficController() {
  const [phase, setPhase] = useState(0); // 0: NS Green, 1: NS Yellow, 2: EW Green, 3: EW Yellow
  const [autoMode, setAutoMode] = useState(true);

  // Traffic Volumes (Controls spawn rate simulation)
  const [volumes, setVolumes] = useState<{ [key in Direction]: number }>({
    north: 600,
    south: 700,
    east: 400,
    west: 500
  });

  // Adaptive Metrics
  const [queues, setQueues] = useState<{ [key in Direction]: number }>({ north: 0, south: 0, east: 0, west: 0 });
  const [waitingTimes, setWaitingTimes] = useState<{ [key in Direction]: number }>({ north: 0, south: 0, east: 0, west: 0 });
  const [priorities, setPriorities] = useState<{ [key in Direction]: number }>({ north: 0, south: 0, east: 0, west: 0 });

  // Simulated ML Analytics
  const [mlAnalytics, setMlAnalytics] = useState<{ [key in Direction]: { cars: number; buses: number; motorcycles: number; densityPercent: number } }>({
    north: { cars: 0, buses: 0, motorcycles: 0, densityPercent: 0 },
    south: { cars: 0, buses: 0, motorcycles: 0, densityPercent: 0 },
    east: { cars: 0, buses: 0, motorcycles: 0, densityPercent: 0 },
    west: { cars: 0, buses: 0, motorcycles: 0, densityPercent: 0 },
  });

  // Customizable Durations
  const [greenDuration, setGreenDuration] = useState(8);
  const [yellowDuration, setYellowDuration] = useState(3);

  const [timeLeft, setTimeLeft] = useState(greenDuration);

  // Advanced Traffic Analytics Accumulators (for the 5s window)
  const windowCountsRef = useRef({ crossed: 0, speed: 0, wait: 0, co2: 0 });
  const mlAnalyticsRef = useRef(mlAnalytics);
  const avgWaitRef = useRef(0);
  const avgSpeedRef = useRef(0);

  // Update ref when mlAnalytics changes so we don't trigger the interval rebuild
  useEffect(() => { mlAnalyticsRef.current = mlAnalytics; }, [mlAnalytics]);

  // Persistent Display Metrics
  const [totalCrossed, setTotalCrossed] = useState(0);
  const [totalCo2, setTotalCo2] = useState(0);
  const [targetCo2, setTargetCo2] = useState(0);
  const [pollutionIndex, setPollutionIndex] = useState(0);
  const [efficiencyScore, setEfficiencyScore] = useState(0);

  // Historical Analytics (for Charts)
  const [analyticsHistory, setAnalyticsHistory] = useState<AnalyticsData[]>([]);

  // Emergency Override Options
  const [isEmergency, setIsEmergency] = useState(false);
  const [activeAmbulance, setActiveAmbulance] = useState<{ active: boolean, direction: Direction | null }>({ active: false, direction: null });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = PHASES[phase];

  // Resolution of active lights
  let lights: TrafficState = currentPhase.state;
  if (isEmergency) {
    lights = { north: "red", south: "red", east: "red", west: "red" };
  } else if (activeAmbulance.active) {
    // Determine target phase for ambulance based on direction (e.g., North/South phase or East/West phase).
    // The exact requirement: Finish current safely -> yellow -> ambulance dir green, others red.
    // For simplicity, we just freeze the lights safely if it passed the transition:
    const dir = activeAmbulance.direction;
    if (phase === 1 || phase === 3) {
      // In Yellow transition, keep normal yellow lights
      lights = currentPhase.state;
    } else {
      lights = {
        north: dir === 'north' ? 'green' : 'red',
        south: dir === 'south' ? 'green' : 'red',
        east: dir === 'east' ? 'green' : 'red',
        west: dir === 'west' ? 'green' : 'red'
      };
    }
  }

  // Next Phase logic based on priority fairness
  const evaluateNextPhase = useCallback(() => {
    // If we just finished a green phase (NS 0, or EW 2), we MUST go to yellow
    if (phase === 0) return 1;
    if (phase === 2) return 3;

    // If we just finished a yellow phase (NS 1, or EW 3), we evaluate priority to choose the next Green
    // NS Phase Priority vs EW Phase Priority
    let nsScore = priorities.north + priorities.south;
    let ewScore = priorities.east + priorities.west;

    // Starvation Prevention (Fairness constraint)
    const nsStarving = waitingTimes.north > STARVATION_THRESHOLD || waitingTimes.south > STARVATION_THRESHOLD;
    const ewStarving = waitingTimes.east > STARVATION_THRESHOLD || waitingTimes.west > STARVATION_THRESHOLD;

    if (nsStarving && !ewStarving) nsScore += 1000;
    if (ewStarving && !nsStarving) ewScore += 1000;

    return nsScore >= ewScore ? 0 : 2;
  }, [phase, priorities, waitingTimes]);

  const timeLeftRef = useRef(greenDuration);

  const advancePhase = useCallback(() => {
    if (isEmergency) return;

    if (activeAmbulance.active) {
      if (phase === 1 || phase === 3) {
        setPhase(activeAmbulance.direction === "north" || activeAmbulance.direction === "south" ? 0 : 2);
        timeLeftRef.current = 999;
        setTimeLeft(999);
      }
      return;
    }

    setPhase((prevPhase) => {
      const isFinishingGreen = prevPhase === 0 || prevPhase === 2;

      let nextPhase;
      if (isFinishingGreen) {
        nextPhase = prevPhase + 1; // 0->1, 2->3
      } else {
        // Priorities Evaluation Check
        let nsScore = priorities.north + priorities.south;
        let ewScore = priorities.east + priorities.west;
        const nsStarving = waitingTimes.north > STARVATION_THRESHOLD || waitingTimes.south > STARVATION_THRESHOLD;
        const ewStarving = waitingTimes.east > STARVATION_THRESHOLD || waitingTimes.west > STARVATION_THRESHOLD;
        if (nsStarving && !ewStarving) nsScore += 1000;
        if (ewStarving && !nsStarving) ewScore += 1000;
        nextPhase = nsScore >= ewScore ? 0 : 2;
      }

      const targetDuration = nextPhase === 0 || nextPhase === 2 ? greenDuration : yellowDuration;
      timeLeftRef.current = targetDuration;
      setTimeLeft(targetDuration);

      return nextPhase;
    });
  }, [isEmergency, activeAmbulance, priorities, waitingTimes, greenDuration, yellowDuration, phase]);

  // Sync manual slider changes to the live timer if they adjust the current phase type's duration
  useEffect(() => {
    const isGreen = phase === 0 || phase === 2;
    const staticMax = isGreen ? greenDuration : yellowDuration;
    // Allow the live timer to stretch if the user slides it higher than the current time left
    if (timeLeftRef.current > staticMax || (timeLeftRef.current < 5 && staticMax > 5)) {
      // Adjust logic here can be tricky mid-flight, so we just let the next phase dictate the exact new time safely
    }
  }, [greenDuration, yellowDuration, phase]);

  // Main Loop
  useEffect(() => {
    if (!autoMode || isEmergency) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const isYellowTransition = activeAmbulance.active && (phase === 1 || phase === 3);

      if (!activeAmbulance.active || isYellowTransition) {
        if (timeLeftRef.current <= 1) {
          advancePhase();
        } else {
          timeLeftRef.current -= 1;
          setTimeLeft(timeLeftRef.current);
        }
      }

      // Simulation Details Update (Every 1s)
      const phaseState = PHASES[phase].state;
      const isYellow = phase === 1 || phase === 3;

      const nextQueues = { ...queues };
      const nextWaitTimes = { ...waitingTimes };
      const nextPriorities = { ...priorities };
      const nextMlAnalytics = { ...mlAnalytics };

      const DEPARTURE_RATE = 2000 / 3600; // ~0.55 cars per second
      const MAX_LANE_CAPACITY = 30;

      (["north", "south", "east", "west"] as const).forEach(dir => {
        // Resolve exactly what the *current literal light* rule is right this frame
        const currentLightRule = lights[dir];
        const isActuallyGreen = currentLightRule === "green" && !isYellow;

        if (!isActuallyGreen) {
          nextWaitTimes[dir] += 1;
        } else {
          // Instantly resolve to 0 to remove UI visual lag
          nextWaitTimes[dir] = 0;
        }

        // Update Queues (Density)
        const arrivalRate = volumes[dir] / 3600;
        const arrivals = Math.random() < arrivalRate ? 1 : 0;

        let departures = 0;
        if (isActuallyGreen && nextQueues[dir] > 0) {
          departures = Math.random() < (activeAmbulance.active && activeAmbulance.direction === dir ? DEPARTURE_RATE * 1.5 : DEPARTURE_RATE) ? 1 : 0;
        }
        nextQueues[dir] = Math.max(0, nextQueues[dir] + arrivals - departures);

        // Generate simulated ML detection based on the queue/volume
        const baseVehicles = Math.floor(nextQueues[dir]);
        const cars = Math.max(0, Math.floor(baseVehicles * 0.7) + (Math.random() > 0.5 ? 1 : 0));
        const buses = Math.max(0, Math.floor(baseVehicles * 0.1) + (Math.random() > 0.8 ? 1 : 0));
        const motorcycles = Math.max(0, Math.floor(baseVehicles * 0.2) + (Math.random() > 0.5 ? 1 : 0));

        const densityRaw = (cars * 1) + (buses * 3) + (motorcycles * 0.5);
        const densityPercent = Math.min(100, Math.round((densityRaw / MAX_LANE_CAPACITY) * 100));

        nextMlAnalytics[dir] = { cars, buses, motorcycles, densityPercent };

        // Update Priority calculations: P = 0.7*Density% + 0.3*Waiting Time
        nextPriorities[dir] = (0.7 * densityPercent) + (0.3 * nextWaitTimes[dir]);
      });

      setQueues(nextQueues);
      setWaitingTimes(nextWaitTimes);
      setPriorities(nextPriorities);
      setMlAnalytics(nextMlAnalytics);

    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoMode, isEmergency, phase, queues, waitingTimes, priorities, mlAnalytics, advancePhase, volumes, activeAmbulance, lights]);

  const toggleEmergency = () => setIsEmergency((e) => !e);

  const triggerManualAmbulance = (dir: Direction) => {
    if (activeAmbulance.active) return;

    toast.error(`Emergency Override! Ambulance approaching from ${dir.toUpperCase()}.`);

    setActiveAmbulance({ active: true, direction: dir });

    // If we are currently GREEN on conflicting roads, safely transition to YELLOW immediately
    const isConflicting = (dir === 'north' || dir === 'south') ? (phase === 2) : (phase === 0);
    if (isConflicting) {
      setPhase(phase === 2 ? 3 : 1);
      timeLeftRef.current = yellowDuration;
      setTimeLeft(yellowDuration);
    }
  };

  const onAmbulanceCleared = () => {
    toast.success("Ambulance passed! Resuming adaptive traffic logic.");
    setActiveAmbulance({ active: false, direction: null });
    // Force a yellow transition from the stopped state back to normal flow evaluation
    setPhase(activeAmbulance.direction === 'north' || activeAmbulance.direction === 'south' ? 1 : 3);
    timeLeftRef.current = yellowDuration;
    setTimeLeft(yellowDuration);
  };

  const onVehicleExit = useCallback((lane: Direction, type: string, waitTime: number, totalTime: number) => {
    // Distance from start to end in simulation is roughly 55-60 units
    const distanceTravelled = 60;
    const speed = totalTime > 0 ? (distanceTravelled / totalTime) : 0;

    // CO2 emission factors (g/km) -> adapted for our arbitrary distance scale
    const EMISSION_FACTORS: Record<string, number> = {
      car: 120,
      bus: 800,
      bike: 70,
      ambulance: 200,
    };

    // Base emission
    let emission = EMISSION_FACTORS[type] || 120;

    // Idle penalty: if waitTime is high, add idle emissions
    if (waitTime > 5) {
      emission += (waitTime * 10); // arbitrary idle penalty scalar
    }

    // Accumulate locally for the interval window (no instant state updates -> better perf)
    windowCountsRef.current.crossed += 1;
    windowCountsRef.current.speed += speed;
    windowCountsRef.current.wait += waitTime;
    windowCountsRef.current.co2 += emission;
  }, []);

  // Analytics batching interval (e.g. 5 seconds)
  useEffect(() => {
    const analyticsInterval = setInterval(() => {
      const counts = windowCountsRef.current;

      const intervalCrossed = counts.crossed;
      const intervalCo2 = counts.co2;
      const intervalSpeed = counts.speed;
      const intervalWait = counts.wait;

      // Reset accumulators for next interval
      windowCountsRef.current = { crossed: 0, speed: 0, wait: 0, co2: 0 };

      // Update total displays
      if (intervalCrossed > 0 || intervalCo2 > 0) {
        setTotalCrossed(prev => prev + intervalCrossed);
        setTargetCo2(prev => prev + intervalCo2);
      }

      // Add logical variation for the interval throughput chart (makes it look like live traffic sensors)
      const variation = Math.floor(Math.random() * 5) - 2;
      const graphCrossed = Math.max(0, intervalCrossed + variation);

      // Averages calc
      let currentAvgWait = avgWaitRef.current;
      let currentAvgSpeed = avgSpeedRef.current;

      if (intervalCrossed > 0) {
        currentAvgWait = intervalWait / intervalCrossed;
        currentAvgSpeed = intervalSpeed / intervalCrossed;
        avgWaitRef.current = currentAvgWait;
        avgSpeedRef.current = currentAvgSpeed;
      }

      // Calculate Pollution Index logically
      const currentMl = mlAnalyticsRef.current;
      const avgDensity = Object.values(currentMl).reduce((a, b) => a + b.densityPercent, 0) / 4;
      const idleCountEstimate = avgDensity * 0.5;
      const rawPollution = (0.5 * avgDensity) + (0.3 * currentAvgWait) + (0.2 * idleCountEstimate);
      const clampedPollution = Math.min(100, Math.max(0, rawPollution));

      setPollutionIndex(prev => prev + (clampedPollution - prev) * 0.2); // Smooth update

      // Efficiency Score
      const FIXED_BASELINE_WAIT = 20;
      let effScore = 0;
      if (currentAvgWait > 0) {
        effScore = ((FIXED_BASELINE_WAIT - currentAvgWait) / FIXED_BASELINE_WAIT) * 100;
      }
      setEfficiencyScore(effScore);

      // Snapshot for Charts
      setAnalyticsHistory(prev => {
        const next = [...prev, {
          throughput: graphCrossed,
          avgSpeed: currentAvgSpeed,
          avgWait: currentAvgWait,
          co2Emissions: intervalCo2,
          pollutionIndex: clampedPollution,
          efficiencyScore: effScore,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }),
        }];
        // Keep last 30 snapshots
        if (next.length > 30) return next.slice(next.length - 30);
        return next;
      });

    }, 5000); // 5s interval

    return () => clearInterval(analyticsInterval);
  }, []); // No dependencies needed for simple interval since we use refs

  // Smooth lerping loop for CO2 display visual
  useEffect(() => {
    const lerpInterval = setInterval(() => {
      setTotalCo2(prev => {
        const diff = targetCo2 - prev;
        if (Math.abs(diff) < 0.5) return targetCo2;
        return prev + diff * 0.1; // lerp 10% per frame
      });
    }, 100);
    return () => clearInterval(lerpInterval);
  }, [targetCo2]);

  return {
    lights,
    phase,
    phaseLabel: isEmergency ? "SYSTEM HALTED" : activeAmbulance.active ? "🚑 EMERGENCY PRIORITY" : currentPhase.label,
    autoMode,
    setAutoMode,
    timeLeft,
    advancePhase,
    isEmergency,
    toggleEmergency,
    activeAmbulance,
    triggerManualAmbulance,
    onAmbulanceCleared,
    onVehicleExit,
    volumes,
    setVolumes,
    queues,
    waitingTimes,
    priorities,
    mlAnalytics,
    greenDuration,
    setGreenDuration,
    yellowDuration,
    setYellowDuration,
    totalCrossed,
    totalCo2,
    pollutionIndex,
    efficiencyScore,
    analyticsHistory,
  };
}
