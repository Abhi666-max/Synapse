import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export default function Environment() {
  const gridRef = useRef();
  
  useFrame((state, delta) => {
    if (gridRef.current) {
      // Simulate moving forward by sliding the texture
      gridRef.current.material.map.offset.y -= delta * 2;
    }
  });

  // Create a glowing grid texture dynamically
  const createGridTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    context.fillStyle = '#050505';
    context.fillRect(0, 0, 512, 512);

    context.strokeStyle = '#ff00ff';
    context.lineWidth = 4;
    
    context.beginPath();
    context.moveTo(256, 0);
    context.lineTo(256, 512);
    context.moveTo(0, 256);
    context.lineTo(512, 256);
    context.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 100);
    return texture;
  };

  const gridTexture = createGridTexture();

  return (
    <group>
      {/* Synthwave Sun */}
      <mesh position={[0, 10, -50]}>
        <circleGeometry args={[15, 64]} />
        <meshBasicMaterial color="#ff00a0" />
      </mesh>

      {/* Grid Floor with Physics */}
      <RigidBody type="fixed" position={[0, -0.49, -20]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow ref={gridRef}>
          <planeGeometry args={[100, 200]} />
          <meshStandardMaterial 
            map={gridTexture}
            emissive="#ff00ff"
            emissiveIntensity={0.5}
            emissiveMap={gridTexture}
          />
        </mesh>
      </RigidBody>
    </group>
  );
}
