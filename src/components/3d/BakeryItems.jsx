import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Cupcake Model
export const CupcakeModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Paper Cup base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.65, 0.45, 0.7, 24]} />
        <meshPhysicalMaterial
          color="#FDE047"
          roughness={0.6}
          clearcoat={0.1}
        />
      </mesh>
      {/* Baked sponge peek */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.7, 0.63, 0.25, 24]} />
        <meshPhysicalMaterial
          color="#D97706"
          roughness={0.8}
        />
      </mesh>
      {/* Swirled Frosting */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshPhysicalMaterial
          color="#C084FC"
          roughness={0.25}
          clearcoat={0.7}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshPhysicalMaterial
          color="#E9D5FF"
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      {/* Top Berry / Cherry */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial
          color="#E11D48"
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
};

// 2. Glazed Donut Model
export const DonutModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Dough ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.7, 0.35, 24, 36]} />
        <meshPhysicalMaterial
          color="#EAB308"
          roughness={0.65}
        />
      </mesh>
      {/* Glossy Strawberry Glaze */}
      <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, 0.08, 0.08]} scale={[1.02, 1.02, 0.85]}>
        <torusGeometry args={[0.7, 0.33, 24, 36, Math.PI * 1.8]} />
        <meshPhysicalMaterial
          color="#F43F5E"
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Mini sprinkles */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.3 + i * 0.05, 0.4]} rotation={[0.4, 0.8 * i, 0.5]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color={i === 0 ? '#38BDF8' : i === 1 ? '#FEF08A' : '#A855F7'} />
        </mesh>
      ))}
    </group>
  );
};

// 3. Cake Slice Model
export const CakeSliceModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Main triangular cake wedge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.8, 3, 1]} />
        <meshPhysicalMaterial
          color="#FFFBEB"
          roughness={0.7}
        />
      </mesh>
      {/* Berry Jam Middle Layer */}
      <mesh position={[0, 0, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.12, 3, 1]} />
        <meshPhysicalMaterial
          color="#BE185D"
          roughness={0.2}
          clearcoat={0.6}
        />
      </mesh>
      {/* Back Crust / Icing */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.1, 3, 1]} />
        <meshPhysicalMaterial
          color="#C084FC"
          roughness={0.2}
          clearcoat={0.9}
        />
      </mesh>
      {/* Strawberry Topper */}
      <mesh position={[0.1, 0.6, 0.1]}>
        <coneGeometry args={[0.2, 0.35, 16]} />
        <meshPhysicalMaterial color="#E11D48" roughness={0.2} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

// 4. Iced Boba Drink Model
export const IcedDrinkModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Translucent Cup */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.4, 1.2, 24]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.85}
          opacity={0.85}
          transparent
          roughness={0.08}
          ior={1.4}
        />
      </mesh>
      {/* Pastel Lavender Tea Liquid inside */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.52, 0.38, 1.0, 24]} />
        <meshPhysicalMaterial
          color="#D8B4FE"
          roughness={0.2}
          clearcoat={0.6}
        />
      </mesh>
      {/* Boba pearls at bottom */}
      {[-0.15, 0.15, 0, -0.1].map((pos, i) => (
        <mesh key={i} position={[pos, -0.4 + (i % 2) * 0.08, (i % 2 === 0 ? 0.12 : -0.12)]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#2E1065" roughness={0.3} />
        </mesh>
      ))}
      {/* Fluffy Whipped Cream Lid */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.55, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#FFFDF9" roughness={0.4} />
      </mesh>
      {/* Pastel Straw */}
      <mesh position={[0.15, 0.75, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 16]} />
        <meshStandardMaterial color="#F472B6" />
      </mesh>
    </group>
  );
};

// 5. Macaron Model
export const MacaronModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Top Shell */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#FBCFE8"
          roughness={0.4}
          clearcoat={0.4}
        />
      </mesh>
      {/* Cream Filling */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.18, 24]} />
        <meshPhysicalMaterial
          color="#C084FC"
          roughness={0.2}
          clearcoat={0.6}
        />
      </mesh>
      {/* Bottom Shell */}
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#FBCFE8"
          roughness={0.4}
          clearcoat={0.4}
        />
      </mesh>
    </group>
  );
};

// 6. Chocolate Chip Cookie Model
export const CookieModel = ({ isHovered, ...props }) => {
  const group = useRef();
  return (
    <group ref={group} {...props}>
      {/* Golden Baked Cookie Base */}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.68, 0.72, 0.22, 20]} />
        <meshPhysicalMaterial
          color="#D97706"
          roughness={0.85}
          clearcoat={0.1}
        />
      </mesh>
      {/* Chocolate Chunks */}
      {[
        [-0.25, 0.1, 0.1],
        [0.2, 0.12, -0.15],
        [0.05, 0.12, 0.25],
        [-0.15, 0.1, -0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.15, 0.08, 0.14]} />
          <meshPhysicalMaterial color="#3B1D0E" roughness={0.2} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
};
