import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

const LANES = [-9, 0, 9];
const OBSTACLE_COUNT = 15;
const Z_SPAWN_START = -50;

export default function Obstacles() {
  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const groupRef = useRef();
  
  // Use state only for initial render, then mutate for performance
  const [obstaclesList, setObstaclesList] = useState([]);
  const obstaclesData = useRef([]);

  function generateObstacles() {
    let obs = [];
    let currentZ = Z_SPAWN_START;
    
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      // Pick 1 or 2 lanes to block, leaving at least 1 lane open
      const blockedLanesCount = Math.random() > 0.5 ? 2 : 1;
      let availableLanes = [0, 1, 2];
      
      // Shuffle array
      for (let j = availableLanes.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [availableLanes[j], availableLanes[k]] = [availableLanes[k], availableLanes[j]];
      }
      
      for (let j = 0; j < blockedLanesCount; j++) {
        obs.push({
          id: `${i}-${j}`,
          laneIndex: availableLanes[j],
          x: LANES[availableLanes[j]],
          z: currentZ,
          type: Math.random() > 0.5 ? 'cow' : 'rock'
        });
      }
      
      currentZ -= 40 + Math.random() * 60; // Space between obstacle rows
    }
    return obs;
  }

  useEffect(() => {
    if (gameState === 'playing') {
      const newObs = generateObstacles();
      obstaclesData.current = newObs;
      setObstaclesList(newObs);
      useGameStore.getState().obstacles = newObs; // Mutate store directly for bots to read without re-renders
    } else {
      setObstaclesList([]);
    }
  }, [gameState]);

  useFrame((state, delta) => {
    if (gameState !== 'playing' || speed === 0) return;

    for (let obs of obstaclesData.current) {
      // Move obstacles towards player (since player is static Z=0)
      // 0.3 factor syncs with the ground texture movement
      obs.z += speed * delta * 0.3; 
      
      // Respawn when behind camera
      if (obs.z > 20) {
        obs.z -= (300 + Math.random() * 100);
        obs.laneIndex = Math.floor(Math.random() * 3);
        obs.x = LANES[obs.laneIndex];
        obs.type = Math.random() > 0.5 ? 'cow' : 'rock';
      }
    }

    // Update meshes visually
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const data = obstaclesData.current[index];
        if (data && child) {
          // Update Kinematic body translation directly
          child.position.set(data.x, 0.5, data.z);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {obstaclesList.map((obs, i) => (
        <group key={obs.id} name="obstacle" position={[obs.x, 0.5, obs.z]}>
          {/* We use a simple group with name="obstacle" for collision detection via distance, 
              or we can attach a RigidBody. Using RigidBody for everything is fine too. */}
          <RigidBody 
            type="kinematicPosition" 
            name="obstacle"
            colliders={false}
          >
            <CuboidCollider args={[1.5, 1, 1.5]} sensor />
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[3, 2, 3]} />
              {/* Brown for cow/buffalo, Grey for rocks */}
              <meshStandardMaterial color={obs.type === 'cow' ? '#5c3a21' : '#666666'} />
            </mesh>
          </RigidBody>
        </group>
      ))}
    </group>
  );
}
