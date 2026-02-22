import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import Road from "./Road";
import TrafficPole from "./TrafficPole";
import Vehicles from "./Vehicles";
import UrbanElements from "./UrbanElements";
import { TrafficState, Direction, LightColor } from "@/hooks/useTrafficController"; // Added LightColor import

interface TrafficSceneProps {
  lights: TrafficState; // Kept original TrafficState type, assuming it matches the structure in the instruction
  volumes: { [key in Direction]: number }; // Kept original type
  ambulancePriority: boolean;
  ambulanceDirection: Direction | null;
  onAmbulanceCleared: () => void;
  onVehicleExit?: (lane: Direction, type: string, waitTime: number, totalTime: number) => void; // Added new prop
}

const MLDetectionZone = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  const scanRef = useRef<THREE.Mesh>(null);
  const zoneRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (zoneRef.current) {
      const material = zoneRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(t * 4) * 0.1;
    }
    if (scanRef.current) {
      scanRef.current.position.z = Math.sin(t * 3) * 2;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={zoneRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={scanRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 0.2]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const AIFloatingLabel = () => {
  const textRef = useRef<any>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (textRef.current) {
      textRef.current.position.y = 8 + Math.sin(t * 2) * 0.5;
    }
  });
  return (
    <Text
      ref={textRef}
      position={[0, 8, 0]}
      rotation={[0, -Math.PI / 4, 0]}
      fontSize={1.2}
      color="#60a5fa"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.04}
      outlineColor="#000000"
    >
      AI Traffic Analysis Active
    </Text>
  );
};

const TrafficScene = ({ lights, volumes, ambulancePriority, ambulanceDirection,
  onAmbulanceCleared,
  onVehicleExit,
}: TrafficSceneProps) => {
  // Use the lights passed down from the Controller directly, it handles the transitions.
  const effectiveLights: TrafficState = lights;

  return (
    <Canvas
      camera={{ position: [25, 30, 25], fov: 45, near: 0.1, far: 200 }}
      shadows
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #1a2a4a 50%, #0d1b2a 100%)" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[20, 30, 10]} intensity={0.8} castShadow color="#aabbdd" />
      <directionalLight position={[-10, 20, -10]} intensity={0.3} color="#4466aa" />
      <hemisphereLight args={["#1a2a4a", "#0a0a0a", 0.4]} />

      {/* Fog for depth */}
      <fog attach="fog" args={["#0d1b2a", 40, 80]} />

      {/* Scene elements */}
      <Road />
      <UrbanElements />

      {/* Traffic poles at each corner */}
      <TrafficPole position={[5, 0, -5]} rotation={[0, Math.PI, 0]} color={effectiveLights.north} />
      <TrafficPole position={[-5, 0, 5]} rotation={[0, 0, 0]} color={effectiveLights.south} />
      <TrafficPole position={[5, 0, 5]} rotation={[0, -Math.PI / 2, 0]} color={effectiveLights.east} />
      <TrafficPole position={[-5, 0, -5]} rotation={[0, Math.PI / 2, 0]} color={effectiveLights.west} />

      {/* AI ML Detection Zones */}
      <MLDetectionZone position={[1.5, 0, -8]} rotation={[0, 0, 0]} />       {/* North */}
      <MLDetectionZone position={[-1.5, 0, 8]} rotation={[0, 0, 0]} />        {/* South */}
      <MLDetectionZone position={[8, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} /> {/* East */}
      <MLDetectionZone position={[-8, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} /> {/* West */}

      <Vehicles
        lights={effectiveLights}
        volumes={volumes}
        activeAmbulance={{ active: ambulancePriority, direction: ambulanceDirection }}
        onAmbulanceCleared={onAmbulanceCleared}
        onVehicleExit={onVehicleExit}
      />

      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={15}
        maxDistance={60}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

export default TrafficScene;
