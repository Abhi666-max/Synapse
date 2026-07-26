import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Player() {
  const rigidBody = useRef();
  const playerMesh = useRef();
  
  const gameState = useGameStore((state) => state.gameState);
  const endGame = useGameStore((state) => state.endGame);
  const currentLane = useGameStore((state) => state.currentLane);
  const moveLane = useGameStore((state) => state.moveLane);

  // Load the BMW GLB (we added to public/bmw.glb)
  // If it fails to load (file missing), React Suspense will throw, so ensure file is there.
  const { scene } = useGLTF('/bmw.glb');
  const bmwModel = React.useMemo(() => scene.clone(), [scene]);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      // Lane Switching
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLane(-1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveLane(1);
      
      // Jump Mechanic
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (rigidBody.current) {
           const rbPosition = rigidBody.current.translation();
           // Only jump if we are near the ground (y < 2) to prevent double jumps
           if (rbPosition.y < 2) {
             rigidBody.current.applyImpulse({ x: 0, y: 18, z: 0 }, true);
           }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLane]);

  useFrame((state, delta) => {
    if (gameState !== 'playing' || !rigidBody.current) return;

    // Smoothly interpolate position towards the target lane
    const targetX = currentLane * 4.5; // Lanes at -4.5, 0, 4.5
    
    const currentTrans = rigidBody.current.translation();
    const newX = THREE.MathUtils.lerp(currentTrans.x, targetX, 15 * delta);
    
    // Maintain the Y (gravity/jumping) and keep Z fixed at 0
    rigidBody.current.setTranslation({ x: newX, y: currentTrans.y, z: 0 }, true);

    // Add a slight banking tilt based on distance to target
    if (playerMesh.current) {
      const tilt = (currentTrans.x - targetX) * 0.05;
      playerMesh.current.rotation.z = THREE.MathUtils.lerp(playerMesh.current.rotation.z, tilt, 10 * delta);
      // Ensure it faces forward (many Sketchfab cars face the wrong way, we rotate it 180 deg)
      playerMesh.current.rotation.y = Math.PI;
    }
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      position={[0, 1, 0]} 
      colliders="hull" // 'hull' wraps complex models better than a box
      lockRotations
      onCollisionEnter={({ other }) => {
        // Game Over logic
        // Hit a train or an obstacle. (Ramps are named "ramp" and don't end the game)
        if (other.rigidBodyObject?.name === 'obstacle') {
          endGame();
        }
      }}
    >
      <mesh ref={playerMesh} castShadow>
        <primitive object={bmwModel} scale={[0.02, 0.02, 0.02]} position={[0, -0.8, 0]} />
        {/* Note: The scale 0.02 is a guess for standard huge GLTFs. Might need adjustment! */}
      </mesh>
    </RigidBody>
  );
}

useGLTF.preload('/bmw.glb');
