import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

type WordWeight = {
  word: string;
  weight: number;
};

type Props = {
  words: WordWeight[];
};

type PositionedWord = WordWeight & {
  position: [number, number, number];
  color: string;
  size: number;
};

function WordBillboard({ word }: { word: PositionedWord }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.5}>
      <Text
        position={word.position}
        fontSize={hovered ? word.size * 1.15 : word.size}
        color={hovered ? "#fffbe6" : word.color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {word.word}
      </Text>
    </Float>
  );
}

function SceneContent({ words }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const positionedWords = useMemo<PositionedWord[]>(() => {
    if (!words.length) {
      return [];
    }

    const radius = 6;
    return words.map((entry, index) => {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / words.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const hue = Math.round(210 + entry.weight * 120);
      return {
        ...entry,
        position: [x, y, z],
        color: `hsl(${hue}, 85%, 70%)`,
        size: 0.2 + entry.weight * 0.55,
      };
    });
  }, [words]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[12, 8, 5]} intensity={1.2} />
      <pointLight position={[-8, -4, -6]} intensity={0.8} color="#8bf5ff" />
      <Sparkles count={140} scale={16} speed={0.35} size={2.5} color="#9be7ff" />
      <group ref={groupRef}>
        {positionedWords.map((word) => (
          <WordBillboard key={word.word} word={word} />
        ))}
      </group>
      {!positionedWords.length ? (
        <Text position={[0, 0, 0]} fontSize={0.6} color="#f0f3ff">
          Analyze an article to begin
        </Text>
      ) : null}
      <OrbitControls enablePan={false} minDistance={5} maxDistance={22} />
    </>
  );
}

export function WordCloudScene({ words }: Props) {
  return (
    <div className="canvas-wrap">
      <Canvas camera={{ position: [0, 0, 14], fov: 58 }}>
        <color attach="background" args={["#0f1329"]} />
        <fog attach="fog" args={["#0f1329", 8, 24]} />
        <SceneContent words={words} />
      </Canvas>
    </div>
  );
}
