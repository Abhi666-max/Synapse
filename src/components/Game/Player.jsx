import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const LANES = [-9, 0, 9]; 

export default function Player() {
  const rigidBody = useRef();
  const playerMesh = useRef();
  
  const gameState = useGameStore((state) => state.gameState);
  const endGame = useGameStore((state) => state.endGame);
  const speed = useGameStore((state) => state.speed);
  const setSpeed = useGameStore((state) => state.setSpeed);

  const { scene } = useGLTF('/bmw.glb');
  const bmwModel = React.useMemo(() => scene.clone(), [scene]);

  const keys = useRef({ forward: false, backward: false });
  const currentLane = useRef(1); 
  const currentX = useRef(0);
  
  const [camView, setCamView] = useState(0); // 0=Third, 1=First, 2=Top

  useEffect(() => {
    if (gameState === 'playing') {
      currentLane.current = 1;
      currentX.current = 0;
      if (rigidBody.current) {
        rigidBody.current.setTranslation({ x: 0, y: 0.5, z: 0 }, true);
        rigidBody.current.setRotation(new THREE.Quaternion(), true);
      }
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = true;
      
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        currentLane.current = Math.max(0, currentLane.current - 1);
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        currentLane.current = Math.min(2, currentLane.current + 1);
      }
      if (e.code === 'KeyC') {
        setCamView((prev) => (prev + 1) % 3);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useFrame((state, delta) => {
    if (gameState !== 'playing' || !rigidBody.current) return;

    let targetSpeed = speed;
    if (keys.current.forward) targetSpeed += 40 * delta; 
    else if (keys.current.backward) targetSpeed -= 80 * delta; 
    else targetSpeed -= 15 * delta; 
    
    targetSpeed = Math.max(0, Math.min(targetSpeed, 200));
    setSpeed(targetSpeed);

    const targetX = LANES[currentLane.current];
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, 10 * delta);
    
    rigidBody.current.setTranslation({ x: currentX.current, y: 0.5, z: 0 }, true);
    rigidBody.current.setRotation(new THREE.Quaternion(), true);

    const carPos = rigidBody.current.translation();
    
    let cameraOffset, lookAtPos;
    if (camView === 0) { 
      // Third Person
      cameraOffset = new THREE.Vector3(carPos.x, 4, 10);
      lookAtPos = new THREE.Vector3(carPos.x, carPos.y, carPos.z - 20);
    } else if (camView === 1) { 
      // First Person (Inside Dashboard)
      cameraOffset = new THREE.Vector3(carPos.x, 1.2, 0); 
      lookAtPos = new THREE.Vector3(carPos.x, 1.2, carPos.z - 20);
    } else { 
      // Top Down
      cameraOffset = new THREE.Vector3(carPos.x, 15, 5);
      lookAtPos = new THREE.Vector3(carPos.x, carPos.y, carPos.z - 10);
    }

    state.camera.position.lerp(cameraOffset, 0.2); 
    state.camera.lookAt(lookAtPos);
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      type="kinematicPosition"
      position={[0, 0.5, 0]} 
      colliders="cuboid" 
      activeCollisionTypes={52224} 
      onCollisionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'traffic') {
          endGame();
        }
      }}
    >
      <mesh ref={playerMesh} castShadow>
        {/* Adjusted scale to 0.18 for better proportion with lanes */}
        <primitive object={bmwModel} scale={[0.18, 0.18, 0.18]} position={[0, -0.6, 0]} rotation={[0, Math.PI, 0]} />
      </mesh>
    </RigidBody>
  );
}

useGLTF.preload('/bmw.glb');
