import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

const OBSTACLE_COUNT = 15;
const Z_SPAWN_START = -50;
const Z_SPAWN_END = -100;

export default function Obstacles() {
  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const timeDilation = useGameStore((state) => state.timeDilation);
  
  // Store obstacles in state
  const [obstacles, setObstacles] = useState(() => 
    Array.from({ length: OBSTACLE_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 16, // random x between -8 and 8
      z: Z_SPAWN_START - Math.random() * 50,
      width: Math.random() * 3 + 1,
      isMoving: Math.random() > 0.7,
      moveSpeed: (Math.random() - 0.5) * 10
    }))
  );

  const groupRef = useRef();

  useFrame((state, delta) => {
    if (gameState !== 'playing' || !groupRef.current) return;

    const actualSpeed = speed * timeDilation * delta;
    
    // Move obstacles towards player
    setObstacles((prev) => 
      prev.map((obs) => {
        let newZ = obs.z + actualSpeed;
        let newX = obs.x;
        
        if (obs.isMoving) {
          newX += obs.moveSpeed * delta * timeDilation;
          if (newX > 8 || newX < -8) obs.moveSpeed *= -1; // bounce off invisible walls
        }

        // Reset obstacle if it passes the player
        if (newZ > 5) {
          newZ = Z_SPAWN_START - Math.random() * 20;
          newX = (Math.random() - 0.5) * 16;
          // Increase score slightly for passing an obstacle
          useGameStore.getState().addScore(10);
        }

        return { ...obs, z: newZ, x: newX };
      })
    );
  });

  return (
    <group ref={groupRef}>
      {obstacles.map((obs) => (
        <RigidBody 
          key={obs.id} 
          type="kinematicPosition" 
          position={[obs.x, 0.5, obs.z]}
          name="obstacle"
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[obs.width, 2, 1]} />
            <meshStandardMaterial 
              color="#ff0044" 
              emissive="#ff0044" 
              emissiveIntensity={1.5} 
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
