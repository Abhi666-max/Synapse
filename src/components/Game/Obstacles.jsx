import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const Z_SPAWN_START = -50;
const Z_SPAWN_END = -150;
const OBSTACLE_COUNT = 15;
const LANES = [-4.5, 0, 4.5];

export default function Obstacles() {
  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const timeDilation = useGameStore((state) => state.timeDilation);
  
  const [obstacles, setObstacles] = useState(() => generateInitialObstacles());

  function generateInitialObstacles() {
    return Array.from({ length: OBSTACLE_COUNT }).map((_, i) => {
      const type = Math.random() > 0.3 ? 'train' : 'ramp';
      return {
        id: i,
        laneIndex: Math.floor(Math.random() * 3), // 0, 1, or 2
        z: Z_SPAWN_START - Math.random() * 100,
        type: type,
      };
    });
  }

  React.useEffect(() => {
    if (gameState === 'playing') {
      setObstacles(generateInitialObstacles());
    }
  }, [gameState]);

  const groupRef = useRef();

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    
    // Move obstacles towards the player
    setObstacles((prev) => 
      prev.map((obs) => {
        let newZ = obs.z + speed * timeDilation * delta;
        // If it passes behind the camera, respawn it far ahead
        if (newZ > 10) {
          newZ = Z_SPAWN_END - Math.random() * 50;
          obs.laneIndex = Math.floor(Math.random() * 3);
          obs.type = Math.random() > 0.3 ? 'train' : 'ramp';
        }
        return { ...obs, z: newZ };
      })
    );
  });

  return (
    <group ref={groupRef}>
      {obstacles.map((obs) => {
        const xPos = LANES[obs.laneIndex];
        
        if (obs.type === 'train') {
          return (
            <RigidBody 
              key={obs.id} 
              type="kinematicPosition" 
              position={[xPos, 2, obs.z]}
              name="obstacle"
            >
              {/* Indian Railways Train Engine/Bogey */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[3.8, 4, 15]} />
                <meshStandardMaterial color="#003399" />
              </mesh>
              {/* Yellow Stripe */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.85, 0.5, 15.01]} />
                <meshStandardMaterial color="#ffcc00" />
              </mesh>
              {/* Windows */}
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[3.9, 1, 12]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
            </RigidBody>
          );
        }

        if (obs.type === 'ramp') {
          return (
            <RigidBody 
              key={obs.id} 
              type="kinematicPosition" 
              position={[xPos, 0, obs.z]}
              name="ramp"
              friction={0}
            >
              {/* A rotated box acting as a ramp */}
              <mesh rotation={[-Math.PI / 8, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[4, 1, 8]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
              </mesh>
            </RigidBody>
          );
        }

        return null;
      })}
    </group>
  );
}
