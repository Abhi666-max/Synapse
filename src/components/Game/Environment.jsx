import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const SEGMENT_LENGTH = 300;

function EnvironmentSegment({ zOffset }) {
  const groupRef = useRef();
  const speed = useGameStore((state) => state.speed);
  const gameState = useGameStore((state) => state.gameState);

  const trees = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      x: (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 50),
      z: -Math.random() * SEGMENT_LENGTH,
      scale: 1 + Math.random() * 2,
    }));
  }, []);
  
  const markers = useMemo(() => {
    return Array.from({ length: Math.floor(SEGMENT_LENGTH / 100) }).map((_, i) => ({
      z: -(i * 100)
    }));
  }, []);

  // Reset position when game restarts
  useEffect(() => {
    if (gameState === 'playing' && groupRef.current) {
      groupRef.current.position.z = zOffset;
    }
  }, [gameState, zOffset]);

  useFrame((state, delta) => {
    if (gameState === 'playing' && speed > 0 && groupRef.current) {
      // 0.3 factor matches the road texture offset visual speed
      groupRef.current.position.z += speed * delta * 0.3; 
      if (groupRef.current.position.z > SEGMENT_LENGTH) {
        groupRef.current.position.z -= SEGMENT_LENGTH;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, zOffset]}>
      {/* Ground Grass */}
      <mesh position={[0, -0.9, -SEGMENT_LENGTH/2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, SEGMENT_LENGTH]} />
        <meshStandardMaterial color="#2d4c1e" roughness={1} />
      </mesh>
      
      {/* Trees */}
      {trees.map((tree, i) => (
        <group key={i} position={[tree.x, -0.6, tree.z]} scale={tree.scale}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.5, 2]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.8, 4]} />
            <meshStandardMaterial color="#1f3d0c" />
          </mesh>
        </group>
      ))}

      {/* 100m Distance Markers & Start Line equivalents */}
      {markers.map((marker, i) => (
        <group key={i} position={[16, -0.5, marker.z]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 4]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <mesh position={[-1, 3.5, 0]}>
            <boxGeometry args={[3, 1.5, 0.2]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Environment() {
  const roadRef = useRef();
  const speed = useGameStore((state) => state.speed);
  const gameState = useGameStore((state) => state.gameState);
  const distanceAccumulator = useRef(0);
  
  useFrame((state, delta) => {
    if (gameState === 'playing' && roadRef.current && speed > 0) {
      roadRef.current.material.map.offset.y -= delta * (speed / 100);
      
      const dist = speed * delta * 0.1;
      distanceAccumulator.current += dist;
      if (distanceAccumulator.current > 1) {
        useGameStore.getState().addDistance(distanceAccumulator.current);
        distanceAccumulator.current = 0;
      }
    }
  });

  const createRoadTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dirt/Asphalt base (Dark Brown/Grey)
    ctx.fillStyle = '#3a3028';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add cracked/muddy noise
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#2c231c' : '#453a30';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 6, 6);
    }

    // Faded, broken lane dividers
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    for (let y = 0; y < 1024; y += 256) {
      if (Math.random() > 0.3) ctx.fillRect(341 - 8, y + 64, 16, 96);
      if (Math.random() > 0.3) ctx.fillRect(682 - 8, y + 64, 16, 96);
    }

    // Rough edges instead of solid yellow lines
    ctx.fillStyle = 'rgba(100, 80, 50, 0.8)'; // muddy edge
    for (let y = 0; y < 1024; y += 32) {
      ctx.fillRect(0, y, 20 + Math.random() * 15, 32);
      ctx.fillRect(1024 - (20 + Math.random() * 15), y, 35, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 20);
    return texture;
  };

  const roadTexture = React.useMemo(() => createRoadTexture(), []);

  return (
    <group>
      {/* Evening Sky */}
      <mesh position={[0, 80, -400]}>
        <boxGeometry args={[800, 300, 10]} />
        <meshBasicMaterial color="#ff7a00" />
      </mesh>
      
      {/* Glowing Moon */}
      <mesh position={[60, 120, -350]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#ffebb5" />
      </mesh>

      {/* 2 Scrolling Environment Segments for seamless looping */}
      <EnvironmentSegment zOffset={0} />
      <EnvironmentSegment zOffset={-SEGMENT_LENGTH} />

      {/* Road with Physics */}
      <RigidBody type="fixed" position={[0, -0.99, -50]}>
        <mesh receiveShadow ref={roadRef}>
          <boxGeometry args={[30, 1, 300]} />
          <meshStandardMaterial 
            map={roadTexture}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Sidewalks/Curbs */}
      <RigidBody type="fixed" position={[-16, -0.5, -50]}>
        <mesh receiveShadow>
          <boxGeometry args={[2, 1, 300]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[16, -0.5, -50]}>
        <mesh receiveShadow>
          <boxGeometry args={[2, 1, 300]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  );
}
