import { LightColor } from "@/hooks/useTrafficController";

interface TrafficPoleProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: LightColor;
}

const TrafficPole = ({ position, rotation = [0, 0, 0], color }: TrafficPoleProps) => {
  const lightColors = {
    red: { r: "#ff2222", y: "#332200", g: "#003300" },
    yellow: { r: "#330000", y: "#ffcc00", g: "#003300" },
    green: { r: "#330000", y: "#332200", g: "#00dd44" },
  };

  const intensities = {
    red: { r: 2, y: 0, g: 0 },
    yellow: { r: 0, y: 2, g: 0 },
    green: { r: 0, y: 0, g: 2 },
  };

  const c = lightColors[color];
  const inten = intensities[color];

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Signal housing */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[0.5, 1.5, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Hood */}
      <mesh position={[0, 4.3, -0.22]}>
        <boxGeometry args={[0.55, 1.55, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Red light */}
      <mesh position={[0, 4.75, 0.18]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={c.r} emissive={c.r} emissiveIntensity={inten.r} />
      </mesh>
      {inten.r > 0 && <pointLight position={[0, 4.75, 0.5]} color="#ff2222" intensity={3} distance={5} />}

      {/* Yellow light */}
      <mesh position={[0, 4.3, 0.18]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={c.y} emissive={c.y} emissiveIntensity={inten.y} />
      </mesh>
      {inten.y > 0 && <pointLight position={[0, 4.3, 0.5]} color="#ffcc00" intensity={3} distance={5} />}

      {/* Green light */}
      <mesh position={[0, 3.85, 0.18]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={c.g} emissive={c.g} emissiveIntensity={inten.g} />
      </mesh>
      {inten.g > 0 && <pointLight position={[0, 3.85, 0.5]} color="#00dd44" intensity={3} distance={5} />}
    </group>
  );
};

export default TrafficPole;
