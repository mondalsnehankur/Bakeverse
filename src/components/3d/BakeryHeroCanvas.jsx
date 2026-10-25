import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  CupcakeModel,
  DonutModel,
  CakeSliceModel,
  IcedDrinkModel,
  MacaronModel,
  CookieModel,
} from './BakeryItems';
import ParticleBurst from './ParticleBurst';
import { playBakeryChime } from './AudioChime';

// Whimsical quotes for the Cute Thinking Cloud
const BAKERY_QUOTES = [
  "Donut worry, be happy! 🍩",
  "You're batch made in heaven! 🧁",
  "Bake it till you make it! ✨",
  "Whisking you endless joy today! 🍓",
  "Life is what you bake of it! 🍰",
  "Sweet moments are meant to be shared! 🌸",
  "Stay fresh, stay sweet! 🍵",
];

// Interactive Floating Item Wrapper
const FloatingBakeryItem = ({
  ItemComponent,
  position,
  scale = 1,
  rotationSpeed = 0.5,
  floatIntensity = 1.2,
  onItemClick,
  name,
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Slow continuous rotation
    meshRef.current.rotation.y += 0.008 * rotationSpeed;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

    // Mouse parallax subtle tilt
    const targetX = (state.mouse.x * 0.3);
    const targetY = (state.mouse.y * 0.3);
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0] + targetX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + targetY, 0.05);
  });

  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={floatIntensity}
      floatingRange={[-0.15, 0.15]}
    >
      <group
        ref={meshRef}
        position={position}
        scale={hovered ? scale * 1.15 : scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onItemClick(position, name);
        }}
      >
        <ItemComponent isHovered={hovered} />
      </group>
    </Float>
  );
};

// Scene containing all 5-6 scattered items & lighting
const SceneContent = ({ onTreatClick, activeBurst }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={50} />

      {/* Boutique Soft Studio Lighting */}
      <ambientLight intensity={1.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow color="#FFFDF9" />
      <directionalLight position={[-5, -4, 3]} intensity={0.8} color="#E9D5FF" />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#FDE047" />

      {/* Scattered 3D Items Framing Central Typography */}
      {/* 1. Top Left: Cupcake */}
      <FloatingBakeryItem
        ItemComponent={CupcakeModel}
        position={[-3.3, 1.8, 0]}
        scale={1.05}
        rotationSpeed={0.8}
        name="Pastel Violet Cupcake"
        onItemClick={onTreatClick}
      />

      {/* 2. Top Right: Glazed Donut */}
      <FloatingBakeryItem
        ItemComponent={DonutModel}
        position={[3.3, 1.8, 0]}
        scale={1.1}
        rotationSpeed={1.1}
        name="Strawberry Glaze Donut"
        onItemClick={onTreatClick}
      />

      {/* 3. Bottom Left: Macaron */}
      <FloatingBakeryItem
        ItemComponent={MacaronModel}
        position={[-3.4, -1.6, 0]}
        scale={1.15}
        rotationSpeed={0.7}
        name="Lavender Cloud Macaron"
        onItemClick={onTreatClick}
      />

      {/* 4. Bottom Right: Cake Slice */}
      <FloatingBakeryItem
        ItemComponent={CakeSliceModel}
        position={[3.4, -1.5, 0]}
        scale={1.0}
        rotationSpeed={0.9}
        name="Berry Mascarpone Cake Slice"
        onItemClick={onTreatClick}
      />

      {/* 5. Top Center Offset: Chocolate Chip Cookie */}
      <FloatingBakeryItem
        ItemComponent={CookieModel}
        position={[0.2, 2.5, -0.4]}
        scale={0.95}
        rotationSpeed={0.6}
        name="Artisan Choco Cookie"
        onItemClick={onTreatClick}
      />

      {/* 6. Bottom Center Offset: Iced Boba Drink */}
      <FloatingBakeryItem
        ItemComponent={IcedDrinkModel}
        position={[-0.2, -2.4, -0.2]}
        scale={0.9}
        rotationSpeed={0.5}
        name="Iced Lavender Cloud Latte"
        onItemClick={onTreatClick}
      />

      {/* 3D Particle Burst Explosion on Click */}
      {activeBurst && (
        <ParticleBurst
          key={activeBurst.id}
          origin={activeBurst.origin}
        />
      )}
    </>
  );
};

const BakeryHeroCanvas = () => {
  const [activeBurst, setActiveBurst] = useState(null);
  const [thoughtBubble, setThoughtBubble] = useState(null);

  const handleTreatClick = (pos, name) => {
    // 1. Audio Feedback: Web Audio API chime
    playBakeryChime();

    // 2. Particle Burst: Spawn 3D particles
    setActiveBurst({
      id: Date.now(),
      origin: pos,
    });

    // 3. Cute Thinking Cloud: Speech bubble pop up
    const randomQuote = BAKERY_QUOTES[Math.floor(Math.random() * BAKERY_QUOTES.length)];
    setThoughtBubble({
      quote: randomQuote,
      name,
      // Map 3D pos [-3.5..3.5, -2.5..2.5] roughly to screen %
      x: 50 + (pos[0] / 4.2) * 42,
      y: 50 - (pos[1] / 3.0) * 40,
    });

    // Auto-dismiss bubble after 3.5 seconds
    setTimeout(() => {
      setThoughtBubble(null);
    }, 3500);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] overflow-hidden select-none">
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas gl={{ alpha: true, antialias: true }}>
          <SceneContent onTreatClick={handleTreatClick} activeBurst={activeBurst} />
        </Canvas>
      </div>

      {/* Cute Thinking Cloud Floating Bubble Overlay */}
      {thoughtBubble && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-300 animate-pop-in"
          style={{
            left: `${Math.max(15, Math.min(85, thoughtBubble.x))}%`,
            top: `${Math.max(15, Math.min(85, thoughtBubble.y))}%`,
          }}
        >
          <div className="relative bg-white/95 dark:bg-mocha-900/95 backdrop-blur-md px-5 py-3 rounded-3xl shadow-xl border-2 border-lavender-300 dark:border-lavender-700 text-berry-950 dark:text-purple-100 text-sm font-semibold max-w-[240px] sm:max-w-[280px] text-center">
            <div className="text-xs text-lavender-700 dark:text-purple-300 uppercase tracking-widest font-bold mb-1">
              {thoughtBubble.name} says:
            </div>
            <p className="leading-snug">{thoughtBubble.quote}</p>

            {/* Cloud puff little tail circles */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-mocha-900 rounded-full border-r border-b border-lavender-300 dark:border-lavender-700"></div>
            <div className="absolute -bottom-3.5 left-[54%] w-1.5 h-1.5 bg-white dark:bg-mocha-900 rounded-full border-r border-b border-lavender-300 dark:border-lavender-700"></div>
          </div>
        </div>
      )}

      {/* Hint Badge in bottom corner */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/80 dark:bg-mocha-800/80 backdrop-blur-sm border border-lavender-200 dark:border-lavender-700 text-xs font-semibold text-lavender-800 dark:text-purple-200 shadow-xs">
        <span>✨ Click any floating treat for sweet magic</span>
      </div>
    </div>
  );
};

export default BakeryHeroCanvas;
