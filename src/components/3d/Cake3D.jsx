import React, { useRef, useMemo, useState, useEffect, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// 1. Procedural Flickering Candle Flame Component
const CandleFlame = ({ position }) => {
  const lightRef = useRef();
  const flameMeshRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * 9;
    const flicker = Math.sin(t) * 0.15 + Math.cos(t * 1.7) * 0.1;
    if (lightRef.current) {
      lightRef.current.intensity = 1.4 + flicker;
    }
    if (flameMeshRef.current) {
      flameMeshRef.current.scale.set(
        1 + flicker * 0.25,
        1 + flicker * 0.45,
        1 + flicker * 0.25
      );
    }
  });

  return (
    <group position={position}>
      {/* Candle stick with gold base ring */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.065, 0.04, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.4, 16]} />
        <meshStandardMaterial color="#FFFBEB" roughness={0.3} />
      </mesh>
      {/* Candle wick */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.06, 8]} />
        <meshBasicMaterial color="#1E1B4B" />
      </mesh>
      {/* Flame mesh */}
      <mesh ref={flameMeshRef} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.048, 0.13, 12]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>
      {/* Warm candlelight point light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.52, 0]}
        color="#FEF08A"
        intensity={1.4}
        distance={2.4}
      />
    </group>
  );
};

const CharacterEarsTopper = ({ topTierRadius = 0.75, earColor = '#1C1917', creamColor = '#FFFDF7', accentColor = '#FFD700' }) => {
  const earSeparation = Math.min(0.38, topTierRadius * 0.48);
  const earSize = 0.32;

  return (
    <group position={[0, 0.28, 0]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * earSeparation, 0, 0]} rotation={[0.05, 0, side * 0.15]}>
          <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[earSize, earSize, 0.038, 36]} />
            <meshStandardMaterial color={earColor} roughness={0.7} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[earSize - 0.04, earSize - 0.04, 0.02, 36]} />
            <meshStandardMaterial color={creamColor} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.28, 8]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.04, 0.08]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={accentColor} metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  );
};

const DollFigurine = ({ accentColor = '#FFD700', standColor = '#FFFFFF', hairColor = '#3F2A20' }) => (
  <group position={[0, 0.12, 0]} scale={[0.62, 0.62, 0.62]}>
    {/* Low metallic display pedestal */}
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.28, 0.31, 0.06, 32]} />
      <meshStandardMaterial color={standColor} roughness={0.22} metalness={0.45} />
    </mesh>
    <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.25, 0.018, 12, 32]} />
      <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.85} />
    </mesh>

    {/* Tapered dress / torso */}
    <mesh position={[0, 0.35, 0]}>
      <coneGeometry args={[0.3, 0.7, 32]} />
      <meshStandardMaterial color={accentColor} roughness={0.32} metalness={0.08} />
    </mesh>
    <mesh position={[0, 0.68, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.09, 20]} />
      <meshStandardMaterial color="#FFE0BD" roughness={0.4} />
    </mesh>

    {/* Head and hair cap */}
    <mesh position={[0, 0.91, 0]}>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshStandardMaterial color="#FFE0BD" roughness={0.38} />
    </mesh>
    <mesh position={[0, 1.02, -0.015]} rotation={[0, 0, 0]}>
      <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      <meshStandardMaterial color={hairColor} roughness={0.45} />
    </mesh>
    <mesh position={[-0.19, 0.91, 0]} scale={[0.55, 1.1, 0.7]}>
      <sphereGeometry args={[0.1, 20, 20]} />
      <meshStandardMaterial color={hairColor} roughness={0.45} />
    </mesh>
    <mesh position={[0.19, 0.91, 0]} scale={[0.55, 1.1, 0.7]}>
      <sphereGeometry args={[0.1, 20, 20]} />
      <meshStandardMaterial color={hairColor} roughness={0.45} />
    </mesh>

    {/* Face: glossy eyes and soft blush cheeks, facing the camera (+Z) */}
    {[-1, 1].map((side) => (
      <group key={side}>
        <mesh position={[side * 0.075, 0.94, 0.205]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#24150F" roughness={0.12} metalness={0.25} />
        </mesh>
        <mesh position={[side * 0.105, 0.86, 0.198]} scale={[1.15, 0.55, 0.35]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#FFB6C1" roughness={0.35} />
        </mesh>
      </group>
    ))}

    {/* Tiny gold crown accessory */}
    <mesh position={[0, 1.25, 0]}>
      <cylinderGeometry args={[0.09, 0.12, 0.045, 6]} />
      <meshStandardMaterial color={accentColor} roughness={0.18} metalness={0.9} />
    </mesh>
    {[-1, 0, 1].map((side) => (
      <mesh key={side} position={[side * 0.07, 1.34, 0]}>
        <coneGeometry args={[0.025, 0.12, 6]} />
        <meshStandardMaterial color={accentColor} roughness={0.16} metalness={0.9} />
      </mesh>
    ))}
  </group>
);

const UnicornTopper = ({ accentColor = '#FDE047', maneColor = '#C084FC', bodyColor = '#FFFFFF' }) => (
  <group position={[0, 0.18, 0]}>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.27, 0.3, 0.06, 32]} />
      <meshStandardMaterial color={bodyColor} roughness={0.24} metalness={0.25} />
    </mesh>
    <mesh position={[0, 0.23, 0]} scale={[0.72, 1.1, 0.72]}>
      <sphereGeometry args={[0.2, 24, 20]} />
      <meshStandardMaterial color={bodyColor} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.48, 0.01]}>
      <sphereGeometry args={[0.17, 24, 20]} />
      <meshStandardMaterial color={bodyColor} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.69, 0.01]} rotation={[0, 0, Math.PI / 10]}>
      <coneGeometry args={[0.045, 0.22, 12]} />
      <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.2} />
    </mesh>
    {[-1, 1].map((side) => (
      <mesh key={side} position={[side * 0.1, 0.61, 0]} rotation={[0, 0, side * 0.35]}>
        <coneGeometry args={[0.055, 0.14, 12]} />
        <meshStandardMaterial color={maneColor} roughness={0.35} />
      </mesh>
    ))}
    <mesh position={[0, 0.48, 0.16]}>
      <sphereGeometry args={[0.025, 12, 12]} />
      <meshStandardMaterial color={maneColor} emissive={maneColor} emissiveIntensity={0.15} />
    </mesh>
  </group>
);

const CrownTopper = ({ accentColor = '#FFD700' }) => (
  <group position={[0, 0.12, 0]}>
    <mesh>
      <cylinderGeometry args={[0.18, 0.2, 0.08, 6]} />
      <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.16, 0.12, Math.sin(a) * 0.16]}>
          <coneGeometry args={[0.04, 0.16, 6]} />
          <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.18} />
        </mesh>
      );
    })}
  </group>
);

const StarsBurstTopper = ({ accentColor = '#FFD700' }) => (
  <group position={[0, 0.16, 0]}>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.16, 0.08 + (i % 2) * 0.08, Math.sin(a) * 0.16]} rotation={[0.4, a, 0.2]}>
          <octahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.22} emissive={accentColor} emissiveIntensity={0.2} />
        </mesh>
      );
    })}
  </group>
);

const RibbonBowTopper = ({ accentColor = '#F43F5E', creamColor = '#FFFFFF' }) => (
  <group position={[0, 0.12, 0]}>
    <mesh position={[-0.14, 0.04, 0]} rotation={[0, 0, 0.4]} scale={[1, 0.45, 0.55]}>
      <sphereGeometry args={[0.14, 18, 18]} />
      <meshStandardMaterial color={accentColor} roughness={0.35} />
    </mesh>
    <mesh position={[0.14, 0.04, 0]} rotation={[0, 0, -0.4]} scale={[1, 0.45, 0.55]}>
      <sphereGeometry args={[0.14, 18, 18]} />
      <meshStandardMaterial color={accentColor} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.05, 0.04]}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color={creamColor} roughness={0.3} />
    </mesh>
  </group>
);

const EdibleImagePlaqueTopper = ({ plaqueText = 'Photo Print', accentColor = '#FFD700', creamColor = '#FFFFFF' }) => (
  <group position={[0, 0.22, 0]}>
    <mesh>
      <boxGeometry args={[0.55, 0.42, 0.04]} />
      <meshStandardMaterial color={creamColor} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0, -0.008]}>
      <boxGeometry args={[0.6, 0.46, 0.03]} />
      <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.25} />
    </mesh>
    <Text position={[0, 0, 0.03]} fontSize={0.07} color="#0F172A" anchorX="center" anchorY="middle" maxWidth={0.5}>
      {plaqueText || 'Edible Print'}
    </Text>
  </group>
);

const CakeTopper = ({ type, topTierRadius, palette, plaqueText, themeName = '' }) => {
  if (themeName.toLowerCase().includes('unicorn') && (type === 'doll_figurine' || type === 'figurine_stand')) {
    return <UnicornTopper accentColor={palette.accentColor} maneColor={palette.dripColor} bodyColor={palette.frostingColor} />;
  }
  if (type === 'doll_figurine' || type === 'figurine_stand') {
    return <DollFigurine standColor={palette.standColor} accentColor={palette.accentColor} hairColor={palette.dripColor || '#3F2A20'} />;
  }
  if (type === 'crown') return <CrownTopper accentColor={palette.accentColor} />;
  if (type === 'stars_burst') return <StarsBurstTopper accentColor={palette.accentColor} />;
  if (type === 'ribbon_bow') return <RibbonBowTopper accentColor={palette.dripColor || palette.accentColor} creamColor={palette.frostingColor} />;
  if (type === 'edible_image_plaque') {
    return <EdibleImagePlaqueTopper plaqueText={plaqueText} accentColor={palette.accentColor} creamColor={palette.frostingColor} />;
  }
  if (type === 'character_ears') {
    return (
      <CharacterEarsTopper
        topTierRadius={topTierRadius}
        earColor={palette.baseColor}
        creamColor={palette.frostingColor}
        accentColor={palette.accentColor}
      />
    );
  }
  if (type === 'bat_emblem') {
    return (
      <group position={[0, 0.28, 0]} scale={[0.72, 0.72, 0.72]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[0.38, 10]} />
          <meshStandardMaterial color={palette.baseColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.03]} scale={[1.2, 0.52, 1]}>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshStandardMaterial color={palette.accentColor} roughness={0.2} metalness={0.65} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.22, 0.2, 0.04]} rotation={[0, 0, side * 0.28]}>
            <coneGeometry args={[0.11, 0.3, 4]} />
            <meshStandardMaterial color={palette.accentColor} roughness={0.2} metalness={0.65} />
          </mesh>
        ))}
      </group>
    );
  }
  return null;
};

// Pulsing 3D pin marker — must be defined BEFORE SpatialAnnotationPins
const PulsingPinMarker = ({ color = '#7C3AED' }) => {
  const ref = useRef();
  useFrame((state) => {
    const s = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.22;
    if (ref.current) ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} />
    </mesh>
  );
};

const SpatialAnnotationPins = ({ annotations = [], positions = {}, accentColor = '#7C3AED' }) => {
  const [activeId, setActiveId] = useState(null);

  return (
    <group>
      {annotations.map((pin) => {
        const pos = positions[pin.id] || (Array.isArray(pin.position) ? pin.position : [0, 2.2, 0]);
        const open = activeId === pin.id;
        return (
          <group key={pin.id} position={pos}>
            <PulsingPinMarker color={accentColor} />
            <Html center sprite distanceFactor={4.6} zIndexRange={[80, 0]} style={{ pointerEvents: 'auto' }}>
              <div className="flex flex-col items-center select-none" onPointerDown={(e) => e.stopPropagation()}>
                {/* Compact, elegant beacon pin button */}
                <button
                  type="button"
                  className={`group relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${open
                    ? 'bg-lavender-600 text-white ring-2 ring-lavender-400 scale-110 shadow-glow'
                    : 'bg-white/95 dark:bg-mocha-800/95 text-lavender-700 dark:text-purple-300 hover:scale-110 shadow-md border border-lavender-300 dark:border-lavender-600'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId((curr) => (curr === pin.id ? null : pin.id));
                  }}
                  title={pin.label}
                  aria-label={pin.label}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span className="absolute inset-0 rounded-full bg-lavender-400 opacity-40 animate-ping pointer-events-none"></span>
                </button>

                {/* Styled Compact Glassmorphism Popover Card */}
                {open && (
                  <div className="relative mt-2 w-48 rounded-2xl bg-white/95 dark:bg-mocha-900/95 backdrop-blur-md shadow-2xl border border-lavender-300/80 dark:border-lavender-700/80 p-2.5 text-left animate-pop-in">
                    {/* Tooltip triangle caret */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white/95 dark:bg-mocha-900/95 border-l border-t border-lavender-300/80 dark:border-lavender-700/80"></div>

                    {/* Header Row: Category Badge + Dismiss Button */}
                    <div className="relative flex items-center justify-between gap-1 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-lavender-700 dark:text-purple-300 bg-lavender-100 dark:bg-mocha-800 px-2 py-0.5 rounded-full">
                        <span>📍</span> Spatial Cue
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(null);
                        }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-berry-900/60 dark:text-purple-300/60 hover:text-berry-950 dark:hover:text-white hover:bg-lavender-100 dark:hover:bg-mocha-800 transition"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Pin Label */}
                    <h5 className="relative font-bold text-xs text-berry-950 dark:text-white leading-snug">
                      {pin.label}
                    </h5>

                    {/* Detail Description */}
                    <p className="relative text-[11px] text-berry-900/80 dark:text-purple-200/80 mt-1 leading-relaxed">
                      {pin.detail}
                    </p>

                    {/* Coordinates & Guide Footer */}
                    <div className="relative mt-2 pt-1.5 border-t border-lavender-100 dark:border-lavender-800/80 flex items-center justify-between text-[10px] text-berry-900/60 dark:text-purple-300/70 font-mono">
                      <span>x:{pos[0]} y:{pos[1]} z:{pos[2]}</span>
                      <span className="font-sans font-semibold text-lavender-700 dark:text-purple-300">Baker Guide</span>
                    </div>
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// 3. Procedural Whipped Cream Rosette (Star-tip piping dollop)
const CreamRosette = ({ position, color = '#FAF5FF', scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Base swirled cream ball */}
      <mesh position={[0, 0.03, 0]} scale={[1, 0.72, 1]}>
        <sphereGeometry args={[0.08, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.02} />
      </mesh>
      {/* Fluted swirl peak */}
      <mesh position={[0, 0.085, 0]} rotation={[0.1, 0, 0.05]}>
        <coneGeometry args={[0.045, 0.09, 8]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.02} />
      </mesh>
    </group>
  );
};

// 4. Procedural French Scalloped Pearl Piping Border (Snugly encircles the base of each tier)
const ScallopedPearlBorder = ({ radius, yPosition, color = '#FAF5FF' }) => {
  const count = Math.max(16, Math.floor(radius * 24));
  const beads = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      list.push({
        x: Math.cos(angle) * (radius - 0.005),
        z: Math.sin(angle) * (radius - 0.005),
      });
    }
    return list;
  }, [count, radius]);

  return (
    <group position={[0, yPosition, 0]}>
      {beads.map((b, idx) => (
        <mesh key={idx} position={[b.x, 0, b.z]}>
          <sphereGeometry args={[0.042, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.02} />
        </mesh>
      ))}
      {/* Inner smooth horizontal sealing cord (rotated PI/2 to lie horizontally) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius - 0.02, 0.025, 12, 48]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

// 5. Realistic Glaze Drip Accent Component
// Strictly horizontal cap and subtle vertical droplets hugging the tier perimeter (NO vertical rings)
const RealisticGlazeDrips = ({ radius, height, yPosition, dripColor }) => {
  const dripCount = 10;
  const drips = useMemo(() => {
    const list = [];
    // Pseudorandom varied drip lengths that look natural and delicious
    const lengths = [0.18, 0.11, 0.24, 0.08, 0.21, 0.14, 0.26, 0.12, 0.19, 0.10];
    for (let i = 0; i < dripCount; i++) {
      const angle = (i / dripCount) * Math.PI * 2 + 0.15;
      const len = lengths[i % lengths.length];
      list.push({
        x: Math.cos(angle) * (radius + 0.006),
        z: Math.sin(angle) * (radius + 0.006),
        length: len,
      });
    }
    return list;
  }, [radius, dripCount]);

  const topEdgeY = yPosition + height / 2;

  return (
    <group>
      {/* Horizontal Glaze Rim (Strictly horizontal rotation PI/2) */}
      <mesh position={[0, topEdgeY - 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.002, 0.038, 16, 48]} />
        <meshStandardMaterial color={dripColor} roughness={0.16} metalness={0.08} />
      </mesh>

      {/* Gentle teardrop drips hugging tier side */}
      {drips.map((d, idx) => (
        <group key={idx} position={[d.x, topEdgeY - d.length / 2, d.z]}>
          {/* Drip body */}
          <mesh>
            <cylinderGeometry args={[0.026, 0.02, d.length, 12]} />
            <meshStandardMaterial color={dripColor} roughness={0.16} metalness={0.08} />
          </mesh>
          {/* Rounded drip teardrop bottom */}
          <mesh position={[0, -d.length / 2, 0]}>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshStandardMaterial color={dripColor} roughness={0.16} metalness={0.08} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 6. Procedural Cherry Topper
const Cherry = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.12, 22, 22]} />
        <meshStandardMaterial
          color="#BE123C"
          roughness={0.12}
          metalness={0.12}
        />
      </mesh>
      {/* Delicate green curved stem */}
      <mesh position={[0.03, 0.22, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>
    </group>
  );
};

// 7. Procedural Blueberry Topper
const Berry = ({ position }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial
        color="#3730A3"
        roughness={0.3}
        metalness={0.04}
      />
    </mesh>
  );
};

// 8. Procedural Flat Sprinkle (Lies naturally flat on top surface)
const Sprinkle = ({ position, rotation, color }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
};

// 9. Main 3D Cake Architectural Model
const CakeModel = ({
  tiers = 2,
  palette = { baseColor: '#C084FC', frostingColor: '#FAF5FF', dripColor: '#F472B6', accentColor: '#FFD700', standColor: '#FAFAFA' },
  toppings = { candles: true, cherries: true, berries: false, sprinkles: true },
  customText = '',
  themeName = '',
  textColor = '#FFFFFF',
  topperType = 'none',
  spatialAnnotations = [],
  showSpatialGuides = true,
}) => {
  const cakeGroup = useRef();
  const tierColor = palette.baseColor;
  const frostingColor = palette.frostingColor;
  const dripColor = palette.dripColor;

  // Determine tier geometries
  const tierConfigs = useMemo(() => {
    const numTiers = Math.max(1, Math.min(3, Number(tiers) || 2));
    const list = [];

    // Base Tier
    list.push({
      index: 0,
      radius: numTiers === 1 ? 1.38 : numTiers === 2 ? 1.48 : 1.58,
      height: 0.68,
      y: 0.34,
    });

    // Middle Tier
    if (numTiers >= 2) {
      list.push({
        index: 1,
        radius: numTiers === 2 ? 1.05 : 1.15,
        height: 0.64,
        y: 0.68 + 0.32,
      });
    }

    // Top Tier
    if (numTiers === 3) {
      list.push({
        index: 2,
        radius: 0.74,
        height: 0.58,
        y: 0.68 + 0.64 + 0.29,
      });
    }

    return list;
  }, [tiers]);

  const topTier = tierConfigs[tierConfigs.length - 1];
  const topSurfaceY = topTier.y + topTier.height / 2;
  const frontPlaqueY = tierConfigs[0].height / 2 + 0.06;
  const frontPlaqueRadius = tierConfigs[0].radius;
  const lowerTier = tierConfigs.length > 1 ? tierConfigs[0] : topTier;
  const tierJointY = lowerTier.y + lowerTier.height / 2;
  const snappedPinPositions = useMemo(() => ({
    top_topper: [0, topSurfaceY + 0.1, 0],
    front_plaque: [0, frontPlaqueY, frontPlaqueRadius + 0.05],
    tier_accent: [lowerTier.radius * 0.85, tierJointY + 0.02, lowerTier.radius * 0.4],
    tier_joint: [lowerTier.radius * 0.85, tierJointY + 0.02, lowerTier.radius * 0.4],
  }), [frontPlaqueRadius, frontPlaqueY, lowerTier, tierJointY, topSurfaceY]);

  // Whipped cream rosettes for top tier rim
  const topRimRosettes = useMemo(() => {
    const count = 12;
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      items.push({
        x: Math.cos(angle) * (topTier.radius - 0.08),
        z: Math.sin(angle) * (topTier.radius - 0.08),
      });
    }
    return items;
  }, [topTier]);

  // Sprinkles distributed flat on horizontal top surface
  const sprinkleList = useMemo(() => {
    const colors = ['#F43F5E', '#38BDF8', '#FBBF24', '#A855F7', '#34D399', '#FFFBEB'];
    const items = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.sin(i * 2.3);
      const dist = (topTier.radius * 0.15) + ((i % 5) / 5) * (topTier.radius * 0.52);
      items.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        // Lie flat in XZ plane with slight rotation
        rot: [Math.PI / 2, 0, (i * 0.7)],
        color: colors[i % colors.length],
      });
    }
    return items;
  }, [topTier]);

  // Clean ASCII inscription text
  const sanitizedText = useMemo(() => {
    if (!customText) return '';
    return customText.replace(/[^\x20-\x7E]/g, '').trim();
  }, [customText]);

  const hasTopper = topperType && topperType !== 'none';

  return (
    <group ref={cakeGroup} position={[0, -0.42, 0]}>
      {/* ================================================================= */}
      {/* 1. Luxurious Pedestal Stand & Cake Board                           */}
      {/* ================================================================= */}
      <group position={[0, -0.04, 0]}>
        {/* Porcelain / Marble Presentation Board */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.86, 1.86, 0.07, 64]} />
          <meshStandardMaterial
            color={palette.standColor || '#FAFAFA'}
            metalness={0.1}
            roughness={0.18}
          />
        </mesh>
        {/* Golden Board Perimeter Rim (Horizontal rotation PI/2) */}
        <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.86, 0.024, 16, 64]} />
          <meshStandardMaterial color={palette.accentColor || '#F59E0B'} metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Elegant Pedestal Tapered Pillar */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.34, 0.62, 0.38, 36]} />
          <meshStandardMaterial color="#F3F4F6" roughness={0.3} metalness={0.08} />
        </mesh>
        {/* Base Rim of Stand */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.72, 0.76, 0.05, 36]} />
          <meshStandardMaterial color={palette.accentColor || '#F59E0B'} metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 2. Cake Tiers Hierarchy with Realistic Piping & Glaze Drips      */}
      {/* ================================================================= */}
      {tierConfigs.map((tier) => (
        <group key={tier.index} position={[0, tier.y, 0]}>
          {/* Main Tier Sponge Body with rich velvety texture */}
          <mesh>
            <cylinderGeometry args={[tier.radius, tier.radius, tier.height, 64]} />
            <meshStandardMaterial
              color={tierColor}
              roughness={0.48}
              metalness={0.04}
            />
          </mesh>

          {/* Smooth Cream Top Cap Layer */}
          <mesh position={[0, tier.height / 2 + 0.008, 0]}>
            <cylinderGeometry args={[tier.radius - 0.01, tier.radius - 0.01, 0.03, 64]} />
            <meshStandardMaterial
              color={frostingColor}
              roughness={0.28}
              metalness={0.02}
            />
          </mesh>

          {/* Scalloped Pearl Piping at Tier Base (Encircles base horizontally) */}
          <ScallopedPearlBorder
            radius={tier.radius}
            yPosition={-tier.height / 2 + 0.025}
            color={frostingColor}
          />

          {/* Realistic Glaze Drips (Horizontal glaze lip + subtle vertical droplets) */}
          <RealisticGlazeDrips
            radius={tier.radius}
            height={tier.height}
            yPosition={0}
            dripColor={dripColor}
          />
        </group>
      ))}

      {/* Whipped Cream Rosettes around Top Tier Perimeter */}
      <group position={[0, topSurfaceY, 0]}>
        {topRimRosettes.map((r, idx) => (
          <CreamRosette
            key={idx}
            position={[r.x, 0, r.z]}
            color={frostingColor}
            scale={0.9}
          />
        ))}
      </group>

      {/* ================================================================= */}
      {/* 3. High-Contrast Fondant Inscription Plaque (White Text, 100% Legible) */}
      {/* ================================================================= */}
      {sanitizedText !== '' && (
        <group position={[0, frontPlaqueY, frontPlaqueRadius + 0.04]}>
          {/* Elegant Fondant Plaque Backing */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry
              args={[
                Math.min(2.4, Math.max(1.3, sanitizedText.length * 0.13 + 0.5)),
                0.32,
                0.035,
              ]}
            />
            <meshStandardMaterial
              color="#FFFDF7"
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
          {/* Subtle Golden Frame Trim */}
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry
              args={[
                Math.min(2.44, Math.max(1.34, sanitizedText.length * 0.13 + 0.54)),
                0.35,
                0.025,
              ]}
            />
            <meshStandardMaterial
              color="#F59E0B"
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>

          {/* Crystal Clear Inscription Text with Dark Outline for Maximum Legibility */}
          <Text
            position={[0, 0, 0.024]}
            fontSize={0.16}
            fontWeight={700}
            color={textColor || '#FFFFFF'}
            outlineWidth={0.016}
            outlineColor="#0F172A"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.3}
          >
            {sanitizedText}
          </Text>
        </group>
      )}

      {/* ================================================================= */}
      {/* 4. Top Surface Decorations & Themed Toppers                       */}
      {/* ================================================================= */}

      {hasTopper && (
        <group position={[0, topSurfaceY, 0]}>
          <CakeTopper
            type={topperType}
            topTierRadius={topTier.radius}
            palette={palette}
            plaqueText={sanitizedText}
            themeName={themeName}
          />
        </group>
      )}

      {toppings?.candles && (
        <group position={[0, topSurfaceY, 0]}>
          {hasTopper ? (
            <>
              <CandleFlame position={[-topTier.radius * 0.52, 0, 0.1]} />
              <CandleFlame position={[topTier.radius * 0.52, 0, 0.1]} />
            </>
          ) : (
            <>
              <CandleFlame position={[0, 0, 0]} />
              {tiers >= 2 && (
                <>
                  <CandleFlame position={[-topTier.radius * 0.45, 0, 0]} />
                  <CandleFlame position={[topTier.radius * 0.45, 0, 0]} />
                </>
              )}
            </>
          )}
        </group>
      )}

      {toppings?.cherries && (
        <group position={[0, topSurfaceY, 0]}>
          {tiers === 1 ? (
            <Cherry position={[0, 0, 0]} />
          ) : (
            <>
              <Cherry position={[0, 0, topTier.radius * 0.45]} />
              <Cherry position={[-topTier.radius * 0.42, 0, -topTier.radius * 0.25]} />
              <Cherry position={[topTier.radius * 0.42, 0, -topTier.radius * 0.25]} />
            </>
          )}
        </group>
      )}

      {toppings?.berries && (
        <group position={[0, topSurfaceY + 0.02, 0]}>
          <Berry position={[topTier.radius * 0.32, 0, topTier.radius * 0.32]} />
          <Berry position={[-topTier.radius * 0.32, 0, topTier.radius * 0.32]} />
          <Berry position={[0, 0, -topTier.radius * 0.44]} />
        </group>
      )}

      {toppings?.sprinkles && (
        <group position={[0, topSurfaceY + 0.016, 0]}>
          {sprinkleList.map((s, idx) => (
            <Sprinkle
              key={idx}
              position={[s.x, 0, s.z]}
              rotation={s.rot}
              color={s.color}
            />
          ))}
        </group>
      )}

      {showSpatialGuides && spatialAnnotations?.length > 0 && (
        <SpatialAnnotationPins
          annotations={spatialAnnotations}
          positions={snappedPinPositions}
          accentColor={palette.accentColor}
        />
      )}
    </group>
  );
};

// Fallback CSS 3D View if WebGL is unavailable
const FallbackCakeView = ({ tiers, tierColor, dripColor, customText, textColor }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex flex-col items-center justify-center space-y-1 my-auto">
        {tiers === 3 && (
          <div
            className="w-24 h-10 rounded-2xl shadow-md border-b-4 border-black/10 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: tierColor }}
          >
            <div className="w-full h-2 rounded-t-2xl opacity-80" style={{ backgroundColor: dripColor }} />
          </div>
        )}
        {tiers >= 2 && (
          <div
            className="w-36 h-12 rounded-2xl shadow-md border-b-4 border-black/10 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: tierColor }}
          >
            <div className="w-full h-2.5 rounded-t-2xl opacity-80" style={{ backgroundColor: dripColor }} />
          </div>
        )}
        <div
          className="w-48 h-14 rounded-2xl shadow-lg border-b-4 border-black/10 flex items-center justify-center transition-all duration-300 relative"
          style={{ backgroundColor: tierColor }}
        >
          <div className="w-full h-3 rounded-t-2xl opacity-80 absolute top-0" style={{ backgroundColor: dripColor }} />
          {customText && (
            <span
              className="text-[12px] font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-amber-400"
              style={{ color: textColor || '#FFFFFF' }}
            >
              {customText}
            </span>
          )}
        </div>
        {/* Pedestal Stand */}
        <div className="w-56 h-3 rounded-full bg-amber-400 shadow-md mt-1" />
        <div className="w-20 h-6 bg-amber-100 rounded-b-xl border border-amber-300 shadow-xs" />
      </div>
      <span className="text-xs font-bold text-lavender-600 mt-2">
        Artisanal 3D Architectural Preview
      </span>
    </div>
  );
};

// React Error Boundary for Three.js Canvas
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Canvas render error caught gracefully:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackCakeView
          tiers={this.props.tiers}
          tierColor={this.props.tierColor}
          dripColor={this.props.dripColor}
          customText={this.props.customText}
          textColor={this.props.textColor}
        />
      );
    }
    return this.props.children;
  }
}

// Canvas Wrapper Component with Boutique Lighting & Camera Calibration
const Cake3D = ({
  tiers = 2,
  tierColor,
  cakeColor,
  frostingColor = '#FAF5FF',
  dripColor = '#FAF5FF',
  palette,
  toppings,
  hasCandle,
  hasCherries,
  hasBerries,
  hasSprinkles,
  hasMickeyEars,
  customText = '',
  themeName = '',
  textColor = '#FFFFFF',
  topperType,
  spatialAnnotations = [],
  showSpatialGuides = true,
  interactive = true,
  autoRotate = false,
  className = 'w-full h-full min-h-[340px]',
}) => {
  const [guidesOn, setGuidesOn] = useState(Boolean(showSpatialGuides));

  useEffect(() => {
    setGuidesOn(Boolean(showSpatialGuides));
  }, [showSpatialGuides]);

  const effectivePalette = {
    baseColor: palette?.baseColor || tierColor || cakeColor || '#C084FC',
    frostingColor: palette?.frostingColor || frostingColor || '#FAF5FF',
    dripColor: palette?.dripColor || dripColor || '#F472B6',
    accentColor: palette?.accentColor || '#FFD700',
    standColor: palette?.standColor || '#FAFAFA',
  };

  const resolvedTopperType =
    topperType ||
    (toppings?.mickeyEars || hasMickeyEars ? 'character_ears' : 'none');

  const effectiveToppings = {
    candles: hasCandle !== undefined ? Boolean(hasCandle) : toppings?.candles !== undefined ? Boolean(toppings.candles) : true,
    cherries: hasCherries !== undefined ? Boolean(hasCherries) : toppings?.cherries !== undefined ? Boolean(toppings.cherries) : false,
    berries: hasBerries !== undefined ? Boolean(hasBerries) : toppings?.berries !== undefined ? Boolean(toppings.berries) : false,
    sprinkles: hasSprinkles !== undefined ? Boolean(hasSprinkles) : toppings?.sprinkles !== undefined ? Boolean(toppings.sprinkles) : true,
  };

  return (
    <div className={`relative ${className} min-h-[320px] w-full select-none`}>
      <button
        type="button"
        onClick={() => setGuidesOn((v) => !v)}
        className="absolute top-3 right-3 z-20 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wide bg-white/90 dark:bg-mocha-900/90 border border-lavender-200 dark:border-mocha-700 text-berry-950 dark:text-mocha-50 shadow-xs hover:bg-lavender-50 transition"
      >
        {guidesOn ? '📍 Hide Spatial Guides' : '📍 Show Spatial Guides'}
      </button>
      <CanvasErrorBoundary
        tiers={tiers}
        tierColor={effectivePalette.baseColor}
        dripColor={effectivePalette.dripColor}
        customText={customText}
        textColor={textColor}
      >
        <Canvas
          camera={{ position: [0, 2.5, 4.4], fov: 46 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.1} />
            <directionalLight position={[6, 9, 5]} intensity={1.8} castShadow color="#FFFDF9" />
            <directionalLight position={[-6, 4, 3]} intensity={0.7} color="#F3E8FF" />
            <directionalLight position={[0, 2, 5]} intensity={0.6} color="#FFFBEB" />
            <pointLight position={[0, 4.5, 2.5]} intensity={1.2} color="#FEF08A" />

            <Float
              speed={autoRotate ? 1.5 : 1.0}
              rotationIntensity={autoRotate ? 0.16 : 0}
              floatIntensity={0.35}
              floatingRange={[-0.04, 0.04]}
            >
              <CakeModel
                tiers={tiers}
                palette={effectivePalette}
                toppings={effectiveToppings}
                customText={customText}
                textColor={textColor}
                topperType={resolvedTopperType}
                themeName={themeName}
                spatialAnnotations={spatialAnnotations}
                showSpatialGuides={guidesOn}
              />
            </Float>

            <ContactShadows
              position={[0, -0.88, 0]}
              opacity={0.42}
              scale={5.6}
              blur={1.8}
              far={3}
            />

            {interactive && (
              <OrbitControls
                makeDefault
                enablePan={false}
                enableZoom={true}
                minDistance={2.8}
                maxDistance={7.2}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.05}
                autoRotate={autoRotate}
                autoRotateSpeed={1.2}
                dampingFactor={0.05}
              />
            )}
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default Cake3D;
