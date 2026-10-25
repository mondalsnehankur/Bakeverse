import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleBurst = ({ origin = [0, 0, 0], onComplete }) => {
  const pointsRef = useRef();
  const count = 36;

  // Initialize random outward velocities and colors
  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('#451A03'), // Liquid chocolate
      new THREE.Color('#C084FC'), // Lavender
      new THREE.Color('#F43F5E'), // Strawberry glaze
      new THREE.Color('#FDE047'), // Lemon sprinkle
      new THREE.Color('#38BDF8'), // Pastel mint
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = origin[0];
      pos[i * 3 + 1] = origin[1];
      pos[i * 3 + 2] = origin[2];

      // Random spherical outward direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 1.2 + Math.random() * 2.2;

      vel[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      vel[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta) + 1.0; // slight upward bounce
      vel[i * 3 + 2] = speed * Math.cos(phi);

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, [origin]);

  const lifeRef = useRef(0);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    lifeRef.current += delta;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;

    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3] += velocities[i * 3] * delta;
      posAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      posAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Gravity effect
      velocities[i * 3 + 1] -= 3.5 * delta;
    }

    posAttr.needsUpdate = true;

    if (lifeRef.current > 1.2 && onComplete) {
      onComplete();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleBurst;
