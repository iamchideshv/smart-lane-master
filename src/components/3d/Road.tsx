const Road = () => {
  const roadWidth = 8;
  const roadLength = 30;
  const sidewalkWidth = 1.5;
  const sidewalkHeight = 0.15;

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1a5c2a" roughness={1} />
      </mesh>

      {/* North-South road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roadWidth, roadLength * 2 + roadWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* East-West road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roadLength * 2 + roadWidth, roadWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>

      {/* Center lane markings - North */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`ns-n-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -(roadWidth / 2 + 2 + i * 3)]}>
          <planeGeometry args={[0.15, 1.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}
      {/* Center lane markings - South */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`ns-s-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, roadWidth / 2 + 2 + i * 3]}>
          <planeGeometry args={[0.15, 1.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}
      {/* Center lane markings - East */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`ew-e-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[roadWidth / 2 + 2 + i * 3, 0.01, 0]}>
          <planeGeometry args={[1.8, 0.15]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}
      {/* Center lane markings - West */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`ew-w-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-(roadWidth / 2 + 2 + i * 3), 0.01, 0]}>
          <planeGeometry args={[1.8, 0.15]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}

      {/* Edge lines - NS road */}
      {[-(roadWidth / 2 - 0.2), roadWidth / 2 - 0.2].map((x, idx) => (
        <group key={`edge-ns-${idx}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -(roadWidth / 2 + roadLength / 2)]}>
            <planeGeometry args={[0.12, roadLength]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, roadWidth / 2 + roadLength / 2]}>
            <planeGeometry args={[0.12, roadLength]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Edge lines - EW road */}
      {[-(roadWidth / 2 - 0.2), roadWidth / 2 - 0.2].map((z, idx) => (
        <group key={`edge-ew-${idx}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(roadWidth / 2 + roadLength / 2), 0.01, z]}>
            <planeGeometry args={[roadLength, 0.12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadWidth / 2 + roadLength / 2, 0.01, z]}>
            <planeGeometry args={[roadLength, 0.12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Zebra crossings - North */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`zn-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-3.2 + i * 0.9, 0.015, -(roadWidth / 2 + 0.8)]}>
          <planeGeometry args={[0.5, 1.4]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.5} />
        </mesh>
      ))}
      {/* South */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`zs-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-3.2 + i * 0.9, 0.015, roadWidth / 2 + 0.8]}>
          <planeGeometry args={[0.5, 1.4]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.5} />
        </mesh>
      ))}
      {/* East */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`ze-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[roadWidth / 2 + 0.8, 0.015, -3.2 + i * 0.9]}>
          <planeGeometry args={[1.4, 0.5]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.5} />
        </mesh>
      ))}
      {/* West */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`zw-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-(roadWidth / 2 + 0.8), 0.015, -3.2 + i * 0.9]}>
          <planeGeometry args={[1.4, 0.5]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.5} />
        </mesh>
      ))}

      {/* Sidewalks - corners */}
      {[
        [-roadWidth / 2 - sidewalkWidth / 2, -(roadWidth / 2 + sidewalkWidth / 2)],
        [roadWidth / 2 + sidewalkWidth / 2, -(roadWidth / 2 + sidewalkWidth / 2)],
        [-roadWidth / 2 - sidewalkWidth / 2, roadWidth / 2 + sidewalkWidth / 2],
        [roadWidth / 2 + sidewalkWidth / 2, roadWidth / 2 + sidewalkWidth / 2],
      ].map(([x, z], i) => (
        <mesh key={`sw-${i}`} position={[x, sidewalkHeight / 2, z]}>
          <boxGeometry args={[sidewalkWidth + 0.5, sidewalkHeight, sidewalkWidth + 0.5]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>
      ))}

      {/* Sidewalk strips - NS */}
      {[-roadWidth / 2 - sidewalkWidth / 2, roadWidth / 2 + sidewalkWidth / 2].map((x, i) => (
        <group key={`sw-ns-${i}`}>
          <mesh position={[x, sidewalkHeight / 2, -(roadWidth / 2 + sidewalkWidth + roadLength / 2)]}>
            <boxGeometry args={[sidewalkWidth, sidewalkHeight, roadLength - sidewalkWidth]} />
            <meshStandardMaterial color="#888888" roughness={0.8} />
          </mesh>
          <mesh position={[x, sidewalkHeight / 2, roadWidth / 2 + sidewalkWidth + roadLength / 2]}>
            <boxGeometry args={[sidewalkWidth, sidewalkHeight, roadLength - sidewalkWidth]} />
            <meshStandardMaterial color="#888888" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Sidewalk strips - EW */}
      {[-roadWidth / 2 - sidewalkWidth / 2, roadWidth / 2 + sidewalkWidth / 2].map((z, i) => (
        <group key={`sw-ew-${i}`}>
          <mesh position={[roadWidth / 2 + sidewalkWidth + roadLength / 2, sidewalkHeight / 2, z]}>
            <boxGeometry args={[roadLength - sidewalkWidth, sidewalkHeight, sidewalkWidth]} />
            <meshStandardMaterial color="#888888" roughness={0.8} />
          </mesh>
          <mesh position={[-(roadWidth / 2 + sidewalkWidth + roadLength / 2), sidewalkHeight / 2, z]}>
            <boxGeometry args={[roadLength - sidewalkWidth, sidewalkHeight, sidewalkWidth]} />
            <meshStandardMaterial color="#888888" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Road;
