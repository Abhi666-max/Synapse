import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Environment() {
  const roadRef = useRef();
  
  const speed = useGameStore((state) => state.speed);
  
  useFrame((state, delta) => {
    if (roadRef.current && speed > 0) {
      // Move texture to simulate driving forward
      roadRef.current.material.map.offset.y -= delta * (speed / 100);
      
      // Update distance in store
      useGameStore.getState().addDistance(speed * delta * 0.1);
    }
  });

  // Create Asphalt Texture with Lane Markings
  const createRoadTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Asphalt background
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add some noise for asphalt realism
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#2a2a2a';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 4, 4);
    }

    // Lane Markings (White dashed lines)
    ctx.fillStyle = '#ffffff';
    // Left Lane Divider
    for (let y = 0; y < 1024; y += 128) {
      ctx.fillRect(341 - 10, y + 32, 20, 64);
    }
    // Right Lane Divider
    for (let y = 0; y < 1024; y += 128) {
      ctx.fillRect(682 - 10, y + 32, 20, 64);
    }

    // Yellow solid boundary lines
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(20, 0, 15, 1024);
    ctx.fillRect(1024 - 35, 0, 15, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 20); // Repeat along Y axis
    return texture;
  };

  const roadTexture = React.useMemo(() => createRoadTexture(), []);

  return (
    <group>
      {/* City Sky / Ambient Box */}
      <mesh position={[0, 50, -200]}>
        <boxGeometry args={[400, 100, 10]} />
        <meshBasicMaterial color="#87CEEB" /> {/* Day Sky */}
      </mesh>

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
