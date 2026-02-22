import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LightColor, Direction } from "@/hooks/useTrafficController";

export type VehicleData = {
  id: string;
  lane: Direction;
  axis: "x" | "z";
  dir: number;
  pos: number;
  length: number;
  speed: number;
};

interface VehicleProps {
  id: string;
  lane: Direction;
  type: "car" | "bus" | "bike" | "ambulance";
  color: string;
  startPos: [number, number, number];
  direction: [number, number, number];
  signal: LightColor;
  stopPosition: number;
  axis: "x" | "z";
  speed?: number;
  isAmbulancePriority?: boolean;
  onCleared?: () => void;
  onVehicleExit?: (lane: Direction, type: string, waitTime: number, totalTime: number) => void;
  globalVehiclesRef: React.MutableRefObject<{ [id: string]: VehicleData }>;
}

const Vehicle = ({ id, lane, type, color, startPos, direction, signal, stopPosition, axis, speed = 2, isAmbulancePriority, onCleared, onVehicleExit, globalVehiclesRef }: VehicleProps) => {
  const ref = useRef<THREE.Group>(null);
  const posRef = useRef<[number, number, number]>([...startPos]);
  const hasClearedRef = useRef(false);
  const currentSpeedRef = useRef(speed);
  const mountTimeRef = useRef(-1);
  const stoppedTimeRef = useRef(0);

  const dims = {
    car: { w: 1.6, h: 0.7, l: 3.2 },
    bus: { w: 2, h: 1.2, l: 6 },
    bike: { w: 0.5, h: 0.5, l: 1.5 },
    ambulance: { w: 1.8, h: 1, l: 4 },
  }[type];

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (mountTimeRef.current === -1) {
      mountTimeRef.current = state.clock.elapsedTime;
    }

    const pos = posRef.current;
    const idx = axis === "x" ? 0 : 2;
    const dir = direction[idx];
    const currentPos = pos[idx];

    // Update global registry instantly
    globalVehiclesRef.current[id] = { id, lane, axis, dir, pos: currentPos, length: dims.l, speed: currentSpeedRef.current };

    // Find car ahead in the same lane
    let minDistance = Infinity;
    let leaderSpeed = speed;

    Object.values(globalVehiclesRef.current).forEach(v => {
      if (v.lane === lane && v.id !== id) {
        // Is it ahead of us?
        const isAhead = dir > 0 ? (v.pos > currentPos) : (v.pos < currentPos);
        // Distance considering vehicle lengths
        const dist = Math.abs(v.pos - currentPos) - (dims.l / 2 + v.length / 2);

        // Due to loop resets, dist might be negative if they just warped behind. 
        // Only consider valid physical distances ahead.
        if (isAhead && dist > 0 && dist < minDistance) {
          minDistance = dist;
          leaderSpeed = v.speed;
        }
      }
    });

    // Check intersection clearance for Ambulance specially
    let blockedByCrossTraffic = false;
    if (isAmbulancePriority) {
      // If ambulance is approaching the intersection (-12 to -5 or 12 to 5 depending on dir)
      const distanceToIntersection = Math.abs(currentPos);
      const approachingIntersection = distanceToIntersection > 5 && distanceToIntersection < 15;

      if (approachingIntersection) {
        Object.values(globalVehiclesRef.current).forEach(v => {
          if (v.axis !== axis) { // Perpendicular traffic
            // Is the cross-traffic vehicle actually inside the crossing square?
            // Safe waiting limit is 5 and -5.
            if (Math.abs(v.pos) < 4.5) {
              blockedByCrossTraffic = true;
            }
          }
        });
      }
    }

    // Determine target speed based on obstacles
    const safeDistance = 1.5;
    let targetSpeed = speed;

    if (minDistance < safeDistance) {
      targetSpeed = 0; // Stop if too close
    } else if (minDistance < safeDistance + 5) {
      targetSpeed = Math.min(speed, leaderSpeed); // Match speed if getting close
    }

    // Stop at light logic
    const shouldStop = (signal === "red" || signal === "yellow") && !isAmbulancePriority;
    // We only stop at the light if we haven't crossed the stop line yet
    const beforeStopLine = dir > 0 ? currentPos <= stopPosition : currentPos >= stopPosition;
    const nearStop = beforeStopLine && Math.abs(currentPos - stopPosition) < 1.0;

    if ((shouldStop && nearStop) || blockedByCrossTraffic) {
      targetSpeed = 0;
    }

    if (targetSpeed < 0.1) {
      stoppedTimeRef.current += delta;
    }

    // Apply speed
    currentSpeedRef.current = targetSpeed;
    pos[idx] += dir * targetSpeed * delta;

    // Trigger intersection cleared early so traffic can resume immediately!
    if (isAmbulancePriority && onCleared && !hasClearedRef.current) {
      if ((dir > 0 && pos[idx] > 10) || (dir < 0 && pos[idx] < -10)) {
        hasClearedRef.current = true;
        onCleared();
      }
    }

    // Reset when past bounds
    // We adjust the boundary slightly inwards from 35 to 25 so they register exits faster on screen
    if (pos[idx] > 25 || pos[idx] < -25) {
      if (onVehicleExit && !hasClearedRef.current) {
        onVehicleExit(lane, type, stoppedTimeRef.current, state.clock.elapsedTime - mountTimeRef.current);
      }
      pos[idx] = startPos[idx];
      mountTimeRef.current = state.clock.elapsedTime;
      stoppedTimeRef.current = 0;
      hasClearedRef.current = false;
    }

    ref.current.position.set(pos[0], pos[1], pos[2]);
  });

  const rotY = direction[0] !== 0 ? (direction[0] > 0 ? 0 : Math.PI) : (direction[2] > 0 ? Math.PI / 2 : -Math.PI / 2);

  return (
    <group ref={ref} position={startPos} rotation={[0, rotY, 0]}>
      {/* Body */}
      <mesh position={[0, dims.h / 2 + 0.1, 0]}>
        <boxGeometry args={[dims.l, dims.h, dims.w]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Roof/cabin */}
      {type !== "bike" && (
        <mesh position={[type === "bus" ? 0 : -0.3, dims.h + 0.35, 0]}>
          <boxGeometry args={[dims.l * (type === "bus" ? 0.9 : 0.55), dims.h * 0.5, dims.w * 0.85]} />
          <meshStandardMaterial color={type === "ambulance" ? "#ffffff" : color} metalness={0.2} roughness={0.6} />
        </mesh>
      )}

      {/* Wheels */}
      {type !== "bike" ? (
        <>
          {[[-dims.l * 0.3, 0.15, dims.w / 2 + 0.05], [-dims.l * 0.3, 0.15, -(dims.w / 2 + 0.05)],
          [dims.l * 0.3, 0.15, dims.w / 2 + 0.05], [dims.l * 0.3, 0.15, -(dims.w / 2 + 0.05)]
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.1, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {[[-0.5, 0.2, 0], [0.5, 0.2, 0]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.08, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          ))}
        </>
      )}

      {/* Ambulance siren */}
      {type === "ambulance" && (
        <group>
          <mesh position={[0, dims.h + 0.7, 0]}>
            <boxGeometry args={[0.8, 0.2, 0.3]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, dims.h + 1, 0]} color="#ff0000" intensity={5} distance={8} />
          {/* Red cross */}
          <mesh position={[0, dims.h / 2 + 0.35, dims.w / 2 + 0.01]}>
            <boxGeometry args={[0.6, 0.15, 0.01]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0, dims.h / 2 + 0.35, dims.w / 2 + 0.01]}>
            <boxGeometry args={[0.15, 0.6, 0.01]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      {/* Headlights */}
      {type !== "bike" && (
        <>
          <mesh position={[dims.l / 2, dims.h / 2, dims.w / 4]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[dims.l / 2, dims.h / 2, -dims.w / 4]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
};

interface VehiclesProps {
  lights: { north: LightColor; south: LightColor; east: LightColor; west: LightColor };
  volumes: { north: number; south: number; east: number; west: number };
  activeAmbulance: { active: boolean; direction: Direction | null };
  onAmbulanceCleared: () => void;
  onVehicleExit?: (lane: Direction, type: string, waitTime: number, totalTime: number) => void;
}

const getVehicleCount = (volume: number) => {
  // Max 2000 Volume -> Returns max of 6 vehicles, min of 1
  return Math.max(1, Math.min(6, Math.ceil(volume / 333)));
};

const colors = ["#3366cc", "#cc3333", "#44aa44", "#eeeeee", "#9933cc", "#cc6633", "#666666"];

const Vehicles = ({ lights, volumes, activeAmbulance, onAmbulanceCleared, onVehicleExit }: VehiclesProps) => {
  const globalVehiclesRef = useRef<{ [id: string]: VehicleData }>({});

  return (
    <group>
      {/* North lane - going south (positive Z) */}
      {Array.from({ length: getVehicleCount(volumes.north) }).map((_, i) => (
        <Vehicle key={`n-${i}`} id={`n-${i}`} lane="north" globalVehiclesRef={globalVehiclesRef} type={i % 3 === 0 ? "car" : "car"} color={colors[i % colors.length]} startPos={[1.5, 0, -20 - i * 6]} direction={[0, 0, 1]} signal={lights.north} stopPosition={-5 - i * 4} axis="z" speed={3} onVehicleExit={onVehicleExit} />
      ))}

      {/* South lane - going north (negative Z) */}
      {Array.from({ length: getVehicleCount(volumes.south) }).map((_, i) => (
        <Vehicle key={`s-${i}`} id={`s-${i}`} lane="south" globalVehiclesRef={globalVehiclesRef} type={i === 0 ? "bus" : "car"} color={colors[(i + 2) % colors.length]} startPos={[-1.5, 0, 20 + i * 6]} direction={[0, 0, -1]} signal={lights.south} stopPosition={5 + i * 4} axis="z" speed={3} onVehicleExit={onVehicleExit} />
      ))}

      {/* East lane - going west (negative X) */}
      {Array.from({ length: getVehicleCount(volumes.east) }).map((_, i) => (
        <Vehicle key={`e-${i}`} id={`e-${i}`} lane="east" globalVehiclesRef={globalVehiclesRef} type={i % 4 === 0 ? "bike" : "car"} color={colors[(i + 4) % colors.length]} startPos={[20 + i * 6, 0, 1.5]} direction={[-1, 0, 0]} signal={lights.east} stopPosition={5 + i * 4} axis="x" speed={3} onVehicleExit={onVehicleExit} />
      ))}

      {/* West lane - going east (positive X) */}
      {Array.from({ length: getVehicleCount(volumes.west) }).map((_, i) => (
        <Vehicle key={`w-${i}`} id={`w-${i}`} lane="west" globalVehiclesRef={globalVehiclesRef} type={i % 2 === 0 ? "bike" : "car"} color={colors[(i + 6) % colors.length]} startPos={[-20 - i * 6, 0, -1.5]} direction={[1, 0, 0]} signal={lights.west} stopPosition={-5 - i * 4} axis="x" speed={3} onVehicleExit={onVehicleExit} />
      ))}

      {/* Dynamic Ambulance Spawner */}
      {activeAmbulance.active && activeAmbulance.direction === "north" && (
        <Vehicle key="amb-n" id="amb-n" lane="north" globalVehiclesRef={globalVehiclesRef} type="ambulance" color="#ffffff" startPos={[1.5, 0, -25]} direction={[0, 0, 1]} signal="green" stopPosition={-5} axis="z" speed={12} isAmbulancePriority={true} onCleared={onAmbulanceCleared} onVehicleExit={onVehicleExit} />
      )}
      {activeAmbulance.active && activeAmbulance.direction === "south" && (
        <Vehicle key="amb-s" id="amb-s" lane="south" globalVehiclesRef={globalVehiclesRef} type="ambulance" color="#ffffff" startPos={[-1.5, 0, 25]} direction={[0, 0, -1]} signal="green" stopPosition={5} axis="z" speed={12} isAmbulancePriority={true} onCleared={onAmbulanceCleared} onVehicleExit={onVehicleExit} />
      )}
      {activeAmbulance.active && activeAmbulance.direction === "east" && (
        <Vehicle key="amb-e" id="amb-e" lane="east" globalVehiclesRef={globalVehiclesRef} type="ambulance" color="#ffffff" startPos={[25, 0, 1.5]} direction={[-1, 0, 0]} signal="green" stopPosition={5} axis="x" speed={12} isAmbulancePriority={true} onCleared={onAmbulanceCleared} onVehicleExit={onVehicleExit} />
      )}
      {activeAmbulance.active && activeAmbulance.direction === "west" && (
        <Vehicle key="amb-w" id="amb-w" lane="west" globalVehiclesRef={globalVehiclesRef} type="ambulance" color="#ffffff" startPos={[-25, 0, -1.5]} direction={[1, 0, 0]} signal="green" stopPosition={-5} axis="x" speed={12} isAmbulancePriority={true} onCleared={onAmbulanceCleared} onVehicleExit={onVehicleExit} />
      )}
    </group>
  );
};

export default Vehicles;
