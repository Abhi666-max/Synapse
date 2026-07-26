import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

const Z_SPAWN_START = -50;
const Z_SPAWN_END = -200;
const TRAFFIC_COUNT = 20;

export default function Obstacles() {
  const gameState = useGameStore((state) => state.gameState);
  const playerSpeed = useGameStore((state) => state.speed);
  
  const [traffic, setTraffic] = useState(() => generateTraffic());

  function generateTraffic() {
    return Array.from({ length: TRAFFIC_COUNT }).map((_, i) => {
      // Pick a random X within the road boundaries (-14 to 14)
      const xPos = (Math.random() - 0.5) * 28; 
      return {
        id: i,
        x: xPos,
        z: Z_SPAWN_START - Math.random() * 150,
        // Traffic speed (some are fast, some are slow)
        speed: 20 + Math.random() * 40, 
        color: `hsl(${Math.random() * 360}, 80%, 50%)`
      };
    });
  }

  React.useEffect(() => {
    if (gameState === 'playing') {
      setTraffic(generateTraffic());
    }
  }, [gameState]);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    
    setTraffic((prev) => 
      prev.map((car) => {
        // The perceived speed of the traffic car relative to the player
        // If player is faster, traffic comes towards the camera (positive Z)
        // If traffic is faster, it moves away (negative Z)
        const relativeSpeed = playerSpeed - car.speed;
        
        let newZ = car.z + (relativeSpeed * delta * 0.5);
        
        // If car is too far behind or too far ahead, respawn
        if (newZ > 20 || newZ < Z_SPAWN_END - 50) {
          newZ = Z_SPAWN_END;
          car.x = (Math.random() - 0.5) * 28;
          car.speed = 20 + Math.random() * 40;
        }
        
        return { ...car, z: newZ };
      })
    );
  });

  return (
    <group>
      {traffic.map((car) => (
        <RigidBody 
          key={car.id} 
          type="kinematicPosition" 
          position={[car.x, 0, car.z]}
          name="traffic"
        >
          {/* Simple Traffic Car Mesh */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.8, 1, 4]} />
            <meshStandardMaterial color={car.color} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.2, 0.5]} castShadow>
            <boxGeometry args={[1.6, 0.5, 2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
