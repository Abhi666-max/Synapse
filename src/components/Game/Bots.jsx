import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const LANES = [-9, 0, 9];

export default function Bots() {
  const gameState = useGameStore((state) => state.gameState);
  const playerSpeed = useGameStore((state) => state.speed);
  
  const { scene } = useGLTF('/bmw.glb');
  
  // Create 5 bots
  const initialBots = [
    { id: 'b1', lane: 0, z: -15, speed: 120, x: LANES[0], crashed: false },
    { id: 'b2', lane: 2, z: -15, speed: 110, x: LANES[2], crashed: false },
    { id: 'b3', lane: 0, z: 15, speed: 130, x: LANES[0], crashed: false },
    { id: 'b4', lane: 1, z: 15, speed: 115, x: LANES[1], crashed: false },
    { id: 'b5', lane: 2, z: 15, speed: 125, x: LANES[2], crashed: false }
  ];
  
  const botsRef = useRef(initialBots);
  const groupRef = useRef();
  const laneChangeCooldowns = useRef([0, 0, 0, 0, 0]);

  // Clone materials to give bots different colors (optional, but since bmw model is complex, we just clone scene)
  const botModels = React.useMemo(() => {
    return Array(5).fill(0).map(() => scene.clone());
  }, [scene]);

  useEffect(() => {
    if (gameState === 'playing') {
      botsRef.current = JSON.parse(JSON.stringify(initialBots));
    }
  }, [gameState]);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const obstacles = useGameStore.getState().obstacles || [];
    
    botsRef.current.forEach((bot, idx) => {
      if (bot.crashed) {
        bot.z += playerSpeed * delta * 0.3;
        return;
      }

      if (laneChangeCooldowns.current[idx] > 0) {
        laneChangeCooldowns.current[idx] -= delta;
      } else {
        const obstacleAhead = obstacles.find(
          o => o.laneIndex === bot.lane && o.z < bot.z && o.z > bot.z - 80
        );

        if (obstacleAhead) {
          let possibleLanes = [];
          if (bot.lane > 0) possibleLanes.push(bot.lane - 1);
          if (bot.lane < 2) possibleLanes.push(bot.lane + 1);
          
          possibleLanes = possibleLanes.filter(l => {
             return !obstacles.some(o => o.laneIndex === l && o.z < bot.z + 20 && o.z > bot.z - 60);
          });
          
          if (possibleLanes.length > 0) {
            bot.lane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
            laneChangeCooldowns.current[idx] = 1.0; 
          }
        }
      }

      const targetX = LANES[bot.lane];
      bot.x = THREE.MathUtils.lerp(bot.x, targetX, 5 * delta);

      if (bot.z < -150) {
        bot.speed = THREE.MathUtils.lerp(bot.speed, Math.min(playerSpeed * 0.8, 80), delta);
      } else if (bot.z > 50) {
        bot.speed = THREE.MathUtils.lerp(bot.speed, Math.max(playerSpeed * 1.2, 140), delta);
      } else {
        bot.speed = THREE.MathUtils.lerp(bot.speed, 120, delta * 0.5);
      }

      bot.z += (playerSpeed - bot.speed) * delta * 0.3;

      const hitObstacle = obstacles.find(
        o => o.laneIndex === bot.lane && Math.abs(o.z - bot.z) < 6
      );
      if (hitObstacle) {
        bot.crashed = true;
      }
    });

    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const data = botsRef.current[index];
        if (data && child) {
          child.position.set(data.x, 0.5, data.z);
          if (data.crashed) {
            // Spin out of control
            child.rotation.y += delta * 10;
          } else {
            child.rotation.y = Math.PI; // Face forward. BMW model is backwards by default (needs Math.PI). Wait, Player model uses Math.PI.
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {botsRef.current.map((bot, i) => (
        <RigidBody 
          key={bot.id}
          type="kinematicPosition" 
          name="bot"
          colliders={false}
        >
          <CuboidCollider args={[1.5, 1, 3]} sensor 
             onIntersectionEnter={({ other }) => {
                if (other.rigidBodyObject?.name === 'player') {
                   // If player hits bot, game over!
                   useGameStore.getState().endGame();
                }
             }}
          />
          <mesh castShadow>
            <primitive object={botModels[i]} scale={[0.18, 0.18, 0.18]} position={[0, -0.6, 0]} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
