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
  const speed = useGameStore((state) => state.speed);
  const setSpeed = useGameStore((state) => state.setSpeed);

  // Load the BMW GLB
  const { scene } = useGLTF('/bmw.glb');
  const bmwModel = React.useMemo(() => scene.clone(), [scene]);

  // Input state
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.forward = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.backward = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Local variables for smooth arcade physics
  const carRotation = useRef(0);
  const currentX = useRef(0);

  useFrame((state, delta) => {
    if (gameState !== 'playing' || !rigidBody.current) return;

    // 1. Handle Acceleration / Braking
    let targetSpeed = speed;
    if (keys.current.forward) {
      targetSpeed += 40 * delta; // Accelerate
    } else if (keys.current.backward) {
      targetSpeed -= 80 * delta; // Brake hard
    } else {
      targetSpeed -= 15 * delta; // Coasting drag
    }
    
    // Clamp speed between 0 and 200 km/h
    targetSpeed = Math.max(0, Math.min(targetSpeed, 200));
    setSpeed(targetSpeed);

    // 2. Handle Steering
    // Steering is only effective if moving
    const steerFactor = Math.min(targetSpeed / 50, 1.5);
    const turnSpeed = 2.0 * delta * steerFactor;

    if (keys.current.left) {
      carRotation.current += turnSpeed;
    } else if (keys.current.right) {
      carRotation.current -= turnSpeed;
    } else {
      // Auto-center steering smoothly
      carRotation.current = THREE.MathUtils.lerp(carRotation.current, 0, 5 * delta);
    }
    
    // Limit maximum turn angle
    carRotation.current = Math.max(-0.6, Math.min(carRotation.current, 0.6));

    // Calculate sideways movement based on steering angle and speed
    const sidewayVelocity = Math.sin(carRotation.current) * targetSpeed * delta * 0.2;
    currentX.current += sidewayVelocity;

    // Boundary check (sidewalks are at x = 15 and -15)
    // If you hit the sidewalk, crash!
    if (currentX.current > 14 || currentX.current < -14) {
      endGame();
    }

    // Apply translation and rotation to kinematic body
    rigidBody.current.setTranslation({ x: currentX.current, y: 0.5, z: 0 }, true);
    
    const euler = new THREE.Euler(0, carRotation.current, 0);
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    rigidBody.current.setRotation(quaternion, true);

    // 3. Chase Camera
    const carPos = rigidBody.current.translation();
    
    // Position camera behind and slightly above the car
    const cameraOffset = new THREE.Vector3(
      Math.sin(carRotation.current) * 2, 
      3.5, 
      8
    );
    cameraOffset.add(carPos);
    
    const lookAtPos = new THREE.Vector3(
      carPos.x - Math.sin(carRotation.current) * 10,
      carPos.y,
      carPos.z - 10
    );

    // Smoothly interpolate camera position and lookAt
    state.camera.position.lerp(cameraOffset, 0.1);
    
    // We can't lerp lookAt easily without an intermediate vector, so we just set it
    state.camera.lookAt(lookAtPos);
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      type="kinematicPosition"
      position={[0, 0.5, 0]} 
      colliders="cuboid" 
      onCollisionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'traffic') {
          endGame();
        }
      }}
    >
      <mesh ref={playerMesh} castShadow>
        {/* The BMW Model */}
        <primitive object={bmwModel} scale={[0.02, 0.02, 0.02]} position={[0, -0.5, 0]} rotation={[0, Math.PI, 0]} />
      </mesh>
    </RigidBody>
  );
}

useGLTF.preload('/bmw.glb');
