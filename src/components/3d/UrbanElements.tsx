const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.1, 0.15, 2.4, 6]} />
      <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3, 0]}>
      <coneGeometry args={[1.2, 2.5, 8]} />
      <meshStandardMaterial color="#1e6b30" roughness={0.8} />
    </mesh>
    <mesh position={[0, 2.3, 0]}>
      <coneGeometry args={[1.4, 1.8, 8]} />
      <meshStandardMaterial color="#237a36" roughness={0.8} />
    </mesh>
  </group>
);

const Building = ({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) => (
  <group position={position}>
    <mesh position={[0, size[1] / 2, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    {Array.from({ length: Math.floor(size[1] / 1.5) }).map((_, row) =>
      Array.from({ length: Math.floor(size[0] / 1.2) }).map((_, col) => (
        <mesh key={`${row}-${col}`} position={[-size[0] / 2 + 0.8 + col * 1.2, 1 + row * 1.5, size[2] / 2 + 0.01]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial color="#aaccee" emissive="#4488aa" emissiveIntensity={0.2} />
        </mesh>
      ))
    )}
  </group>
);

const StreetLight = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 2.5, 0]}>
      <cylinderGeometry args={[0.05, 0.07, 5, 6]} />
      <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[0.4, 5, 0]}>
      <boxGeometry args={[1, 0.08, 0.3]} />
      <meshStandardMaterial color="#555555" metalness={0.7} />
    </mesh>
    <mesh position={[0.8, 4.9, 0]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={1} />
    </mesh>
    <pointLight position={[0.8, 4.8, 0]} color="#ffffcc" intensity={2} distance={10} />
  </group>
);

const UrbanElements = () => {
  const treePositions: [number, number, number][] = [
    [-12, 0, -12], [-18, 0, -15], [12, 0, -12], [18, 0, -15],
    [-12, 0, 12], [-18, 0, 15], [12, 0, 12], [18, 0, 15],
    [-15, 0, -8], [15, 0, 8], [-8, 0, -15], [8, 0, 15],
  ];

  return (
    <group>
      {treePositions.map((pos, i) => <Tree key={i} position={pos} />)}
      <Building position={[-18, 0, -18]} size={[6, 8, 5]} color="#7a6a5a" />
      <Building position={[18, 0, -18]} size={[5, 12, 6]} color="#5a6a7a" />
      <Building position={[-18, 0, 18]} size={[7, 6, 5]} color="#6a7a5a" />
      <Building position={[18, 0, 18]} size={[5, 10, 5]} color="#8a7a6a" />
      <Building position={[-25, 0, -10]} size={[4, 5, 4]} color="#6a5a7a" />
      <Building position={[25, 0, 10]} size={[4, 7, 4]} color="#5a7a6a" />
      <StreetLight position={[-5.5, 0, -6]} />
      <StreetLight position={[5.5, 0, -6]} />
      <StreetLight position={[-5.5, 0, 6]} />
      <StreetLight position={[5.5, 0, 6]} />
    </group>
  );
};

export default UrbanElements;
