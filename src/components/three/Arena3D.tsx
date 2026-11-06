"use client";

/**
 * Real-time 3D for the landing page.
 * One shared WebGL canvas (<ArenaCanvas/>) renders every <Scene3D/> viewport via
 * drei's <View>, so seven models cost a single GL context.
 * Lighting is a local studio rig of Lightformers — no HDR downloads.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import {
  View,
  PerspectiveCamera,
  Environment,
  Lightformer,
  Float,
  RoundedBox,
  useTexture,
  ContactShadows,
  AdaptiveDpr,
} from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";

/* ───────────────────────── materials ───────────────────────── */

function Gold({ rough = 0.22 }: { rough?: number }) {
  return <meshStandardMaterial color="#F2C14E" metalness={1} roughness={rough} envMapIntensity={1.4} />;
}
function DarkGold() {
  return <meshStandardMaterial color="#9A6A12" metalness={1} roughness={0.35} envMapIntensity={1.1} />;
}
function Steel() {
  return <meshStandardMaterial color="#f4f4f8" metalness={0.9} roughness={0.18} envMapIntensity={2.2} />;
}
function Obsidian() {
  return <meshStandardMaterial color="#20202a" metalness={0.65} roughness={0.3} envMapIntensity={1.2} />;
}

/* ───────────────────────── shared rig ───────────────────────── */

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);
}

/** Studio lighting: warm key, cool rim, gold bounce — reflections make metal read as metal. */
function Studio() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1d6" />
      <directionalLight position={[-4, 1, -2]} intensity={1.2} color="#9fb4ff" />
      <pointLight position={[0, -2, 3]} intensity={6} color="#F2C14E" distance={8} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} color="#fff3dc" position={[0, 3, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#F2C14E" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#c9d4ff" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 0, -6]} scale={4} />
        <Lightformer form="rect" intensity={0.6} color="#3a2a08" position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
    </>
  );
}

/** Rotates children slowly and leans toward the pointer. */
function Turntable({ children, speed = 0.35, lean = 0.45, still = false }: { children: ReactNode; speed?: number; lean?: number; still?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const base = useRef(0);
  useEffect(() => {
    base.current = Math.random() * Math.PI * 2; // random start phase per model
  }, []);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!still) base.current += dt * speed;
    const targetY = (still ? 0 : Math.sin(base.current) * 0.6) + state.pointer.x * lean;
    const targetX = -state.pointer.y * lean * 0.5;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.06);
  });
  return <group ref={ref}>{children}</group>;
}

/** A viewport. Place it inside any positioned element; the shared canvas draws into it. */
export function Scene3D({ children, className = "absolute inset-0", z = 5, fov = 32, shadow = true }: { children: ReactNode; className?: string; z?: number; fov?: number; shadow?: boolean }) {
  const reduce = usePrefersReducedMotion();
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0.2, z]} fov={fov} />
      <Studio />
      <Suspense fallback={null}>
        <Float speed={reduce ? 0 : 1.6} rotationIntensity={reduce ? 0 : 0.15} floatIntensity={reduce ? 0 : 0.5}>
          <Turntable still={reduce}>{children}</Turntable>
        </Float>
      </Suspense>
      {shadow ? <ContactShadows frames={1} position={[0, -1.35, 0]} opacity={0.55} scale={6} blur={2.6} far={3} color="#000000" /> : null}
    </View>
  );
}

/** Mount once per page, after the content. */
export function ArenaCanvas() {
  return (
    <Canvas
      className="!pointer-events-none !fixed !inset-0 !z-40"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <View.Port />
      <AdaptiveDpr />
    </Canvas>
  );
}

/* ───────────────────────── models ───────────────────────── */

/** Gold coin medallion with the Community Heroes logo on both faces. */
export function LogoMedallion() {
  const tex = useTexture("/ch-logo.png", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  return (
    <group scale={1.05}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.5, 1.5, 0.2, 96]} />
        <Obsidian />
      </mesh>
      {/* outer rim */}
      <mesh>
        <torusGeometry args={[1.5, 0.11, 32, 128]} />
        <Gold rough={0.18} />
      </mesh>
      {/* inner rings, both faces */}
      {[0.105, -0.105].map((zz) => (
        <mesh key={zz} position-z={zz}>
          <torusGeometry args={[1.28, 0.035, 16, 128]} />
          <DarkGold />
        </mesh>
      ))}
      {/* notches around the rim */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.62, Math.sin(a) * 1.62, 0]} rotation-z={a}>
            <boxGeometry args={[0.08, 0.08, 0.16]} />
            <Gold />
          </mesh>
        );
      })}
      {/* logo faces */}
      <mesh position-z={0.112}>
        <planeGeometry args={[2.25, 2.25]} />
        <meshStandardMaterial map={tex} transparent metalness={0.35} roughness={0.45} envMapIntensity={0.9} />
      </mesh>
      <mesh position-z={-0.112} rotation-y={Math.PI}>
        <planeGeometry args={[2.25, 2.25]} />
        <meshStandardMaterial map={tex} transparent metalness={0.35} roughness={0.45} envMapIntensity={0.9} />
      </mesh>
    </group>
  );
}

/** Championship trophy (lathe-turned cup, handles, stepped base). */
export function Trophy() {
  const cup = useMemo(() => {
    const pts = [
      [0.0, 0.0],
      [0.16, 0.0],
      [0.18, 0.05],
      [0.1, 0.18],
      [0.09, 0.55],
      [0.16, 0.66],
      [0.42, 0.78],
      [0.62, 1.05],
      [0.7, 1.4],
      [0.72, 1.62],
      [0.66, 1.62],
      [0.63, 1.42],
      [0.55, 1.1],
      [0.0, 0.9],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  return (
    <group position-y={-0.95} scale={0.95}>
      <mesh geometry={cup} position-y={0.55}>
        <Gold rough={0.16} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.72, 1.75, 0]} rotation-z={s * -0.1}>
          <torusGeometry args={[0.28, 0.05, 16, 48, Math.PI * 1.1]} />
          <Gold />
        </mesh>
      ))}
      <mesh position-y={0.42}>
        <cylinderGeometry args={[0.38, 0.42, 0.18, 64]} />
        <DarkGold />
      </mesh>
      <mesh position-y={0.18}>
        <boxGeometry args={[1.0, 0.36, 0.7]} />
        <Obsidian />
      </mesh>
      <mesh position={[0, 0.18, 0.352]}>
        <boxGeometry args={[0.56, 0.12, 0.01]} />
        <Gold rough={0.3} />
      </mesh>
    </group>
  );
}

function Sword({ flip = 1 }: { flip?: 1 | -1 }) {
  return (
    <group rotation-z={flip * (Math.PI / 4)}>
      {/* blade */}
      <mesh position-y={0.55}>
        <boxGeometry args={[0.24, 2.0, 0.05]} />
        <Steel />
      </mesh>
      <mesh position-y={1.55} rotation-z={Math.PI / 4} scale={[1, 1, 0.3]}>
        <boxGeometry args={[0.17, 0.17, 0.16]} />
        <Steel />
      </mesh>
      {/* fuller groove */}
      <mesh position={[0, 0.5, 0.019]}>
        <boxGeometry args={[0.03, 1.7, 0.002]} />
        <Gold />
      </mesh>
      {/* guard */}
      <mesh position-y={-0.48}>
        <boxGeometry args={[0.7, 0.09, 0.12]} />
        <Gold />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.37, -0.48, 0]}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <Gold />
        </mesh>
      ))}
      {/* grip */}
      <mesh position-y={-0.78}>
        <cylinderGeometry args={[0.055, 0.055, 0.5, 24]} />
        <Obsidian />
      </mesh>
      <mesh position-y={-1.06}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <Gold />
      </mesh>
    </group>
  );
}

/** Crossed swords for scrimmages. */
export function CrossedSwords() {
  return (
    <group scale={1.05} position-y={-0.05}>
      <Sword flip={1} />
      <group position-z={0.06}>
        <Sword flip={-1} />
      </group>
    </group>
  );
}

/** Heraldic squad shield with a five-point star. */
export function SquadShield() {
  const { shield, inner, star } = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1, 1);
    s.lineTo(1, 1);
    s.lineTo(1, 0.1);
    s.bezierCurveTo(1, -0.7, 0.4, -1.15, 0, -1.35);
    s.bezierCurveTo(-0.4, -1.15, -1, -0.7, -1, 0.1);
    s.closePath();
    const shield = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6, curveSegments: 48 });
    shield.center();

    const i = new THREE.Shape();
    i.moveTo(-0.78, 0.8);
    i.lineTo(0.78, 0.8);
    i.lineTo(0.78, 0.08);
    i.bezierCurveTo(0.78, -0.55, 0.3, -0.92, 0, -1.08);
    i.bezierCurveTo(-0.3, -0.92, -0.78, -0.55, -0.78, 0.08);
    i.closePath();
    const inner = new THREE.ExtrudeGeometry(i, { depth: 0.05, bevelEnabled: false, curveSegments: 48 });
    inner.center();

    const st = new THREE.Shape();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? 0.5 : 0.21;
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = -Math.sin(a) * r;
      if (k === 0) st.moveTo(x, y);
      else st.lineTo(x, y);
    }
    st.closePath();
    const star = new THREE.ExtrudeGeometry(st, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 });
    star.center();
    return { shield, inner, star };
  }, []);
  return (
    <group scale={0.95}>
      <mesh geometry={shield}>
        <Gold rough={0.2} />
      </mesh>
      <mesh geometry={inner} position-z={0.16}>
        <Obsidian />
      </mesh>
      <mesh geometry={star} position={[0, 0.05, 0.24]}>
        <Gold rough={0.15} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62 + 0.02, 0.21]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 6]} />
            <DarkGold />
          </mesh>
        );
      })}
    </group>
  );
}

/** Three-step podium with a crown hovering over first place. */
export function Podium() {
  const crown = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (crown.current) crown.current.rotation.y = s.clock.elapsedTime * 0.9;
  });
  const steps = [
    { x: -0.82, h: 0.75 },
    { x: 0, h: 1.15 },
    { x: 0.82, h: 0.5 },
  ];
  return (
    <group position-y={-1.2}>
      {steps.map((s, i) => (
        <group key={i} position-x={s.x}>
          <RoundedBox args={[0.78, s.h, 0.78]} radius={0.04} smoothness={4} position-y={s.h / 2}>
            <Obsidian />
          </RoundedBox>
          <mesh position-y={s.h + 0.01}>
            <boxGeometry args={[0.8, 0.03, 0.8]} />
            {i === 1 ? <Gold /> : i === 0 ? <Steel /> : <meshStandardMaterial color="#b0702a" metalness={1} roughness={0.3} />}
          </mesh>
        </group>
      ))}
      <group ref={crown} position-y={1.75}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.3, 0.2, 48, 1, true]} />
          <meshStandardMaterial color="#F2C14E" metalness={1} roughness={0.18} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 0.31, 0.2, Math.sin(a) * 0.31]}>
              <mesh>
                <coneGeometry args={[0.07, 0.22, 16]} />
                <Gold />
              </mesh>
              <mesh position-y={0.13}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <Gold />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/** Phone with a glowing feed and floating reaction tokens. */
export function FeedPhone() {
  const tokens = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!tokens.current) return;
    tokens.current.children.forEach((c, i) => {
      c.position.y = ((s.clock.elapsedTime * 0.35 + i * 0.33) % 1) * 2.2 - 0.8;
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = Math.sin((((s.clock.elapsedTime * 0.35 + i * 0.33) % 1)) * Math.PI);
    });
  });
  return (
    <group rotation-z={-0.12}>
      <RoundedBox args={[1.25, 2.4, 0.12]} radius={0.12} smoothness={6}>
        <meshStandardMaterial color="#0d0d12" metalness={0.8} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={[1.31, 2.46, 0.08]} radius={0.14} smoothness={6} position-z={-0.03}>
        <Gold rough={0.25} />
      </RoundedBox>
      <mesh position-z={0.065}>
        <planeGeometry args={[1.1, 2.2]} />
        <meshStandardMaterial color="#1a1408" emissive="#2a1f06" emissiveIntensity={1} />
      </mesh>
      {[0.65, 0.05, -0.55].map((y, i) => (
        <group key={y} position={[0, y, 0.07]}>
          <RoundedBox args={[0.96, 0.48, 0.02]} radius={0.06}>
            <meshStandardMaterial color={i === 1 ? "#3a2a0a" : "#17171d"} emissive={i === 1 ? "#F2C14E" : "#000000"} emissiveIntensity={i === 1 ? 0.15 : 0} />
          </RoundedBox>
          <mesh position={[-0.34, 0.06, 0.02]}>
            <circleGeometry args={[0.09, 24]} />
            <meshStandardMaterial color="#F2C14E" emissive="#F2C14E" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.08, 0.1, 0.02]}>
            <planeGeometry args={[0.5, 0.05]} />
            <meshBasicMaterial color="#d9d6cf" />
          </mesh>
          <mesh position={[0.02, -0.02, 0.02]}>
            <planeGeometry args={[0.38, 0.04]} />
            <meshBasicMaterial color="#5d5b66" />
          </mesh>
        </group>
      ))}
      <group ref={tokens} position={[0.95, 0, 0.3]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position-x={i % 2 ? 0.15 : -0.05}>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#F2C14E" metalness={1} roughness={0.2} transparent emissive="#7a520c" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Floating dashboard plate with animated gold bar chart. */
export function DashboardBars() {
  const bars = useRef<THREE.Group>(null);
  const heights = [0.45, 0.8, 0.6, 1.05, 0.85, 1.3];
  useFrame((s) => {
    if (!bars.current) return;
    bars.current.children.forEach((c, i) => {
      const h = heights[i] * (0.85 + Math.sin(s.clock.elapsedTime * 1.2 + i) * 0.15);
      c.scale.y = h;
      c.position.y = h / 2;
    });
  });
  return (
    <group rotation-x={-0.35} position-y={-0.55}>
      <RoundedBox args={[2.6, 0.12, 1.4]} radius={0.05} smoothness={4}>
        <Obsidian />
      </RoundedBox>
      <mesh position-y={0.065}>
        <boxGeometry args={[2.62, 0.01, 1.42]} />
        <DarkGold />
      </mesh>
      <group ref={bars} position={[-1.0, 0.07, 0]}>
        {heights.map((_, i) => (
          <mesh key={i} position-x={i * 0.4}>
            <boxGeometry args={[0.24, 1, 0.24]} />
            {i === heights.length - 1 ? <Gold rough={0.12} /> : <meshStandardMaterial color="#c9952a" metalness={1} roughness={0.32} />}
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Map a landing tile key to its 3D model. */
export function TileModel({ variant }: { variant: string }) {
  switch (variant) {
    case "tournaments":
      return <Trophy />;
    case "scrims":
      return <CrossedSwords />;
    case "squads":
      return <SquadShield />;
    case "leaderboard":
      return <Podium />;
    case "feed":
      return <FeedPhone />;
    default:
      return <DashboardBars />;
  }
}
