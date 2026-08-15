"use client";
import { useEffect, useRef, useCallback } from "react";

// ─── Public types ──────────────────────────────────────────
export type AuraState = "idle" | "listening" | "processing" | "speaking" | "error";
export type AuraEmotion = "neutral" | "anger" | "sadness";

interface AuraProps {
  state: AuraState;
  urgency?: boolean;
  transcript?: string;
  isDark?: boolean;
  audioLevel?: number;
  emotion?: AuraEmotion;
}

// ─── Colour palettes ───────────────────────────────────────
const PALETTE = {
  neutral: { r: 0, g: 240, b: 255 }, // Electric cyan/teal ambient glow
  anger: { r: 255, g: 65, b: 65 },
  sadness: { r: 70, g: 220, b: 255 },
  white: { r: 0, g: 255, b: 255 }, // Electric cyan/teal for particles
  fireWhite: { r: 0, g: 255, b: 255 },
} as const;

// ─── Helpers ───────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${a})`;
}
function lerpColor(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── Particle interface ────────────────────────────────────
interface Particle {
  x: number; y: number; z: number;
  baseX: number; baseY: number; baseZ: number;
  radius: number;
  phase: number;
  glowIntensity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  orbitSpeedX: number; orbitSpeedY: number; orbitSpeedZ: number;
  orbitAmpX: number; orbitAmpY: number; orbitAmpZ: number;
}

interface Thread {
  from: number;
  to: number;
  baseOpacity: number;
  curvature: number;
  sparks: { t: number; speed: number; brightness: number; size: number }[];
}

// ─── Particle field generator ─────────────────────────────
function generateParticles(count: number, seed: number) {
  const rand = seededRandom(seed);
  const particles: Particle[] = [];
  const minDist = 0.018;

  for (let i = 0; i < count; i++) {
    let nx = 0, ny = 0, nz = 0;
    let attempts = 0;
    let valid = false;

    do {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = Math.pow(rand(), 0.5) * 0.48;
      nx = 0.5 + Math.sin(phi) * Math.cos(theta) * r;
      ny = 0.5 + Math.sin(phi) * Math.sin(theta) * r;
      nz = 0.5 + Math.cos(phi) * r;

      let tooClose = false;
      const curMin = Math.max(0.004, minDist - (attempts / 500) * 0.014);
      for (const p of particles) {
        const dx = p.baseX - nx, dy = p.baseY - ny, dz = p.baseZ - nz;
        if (dx * dx + dy * dy + dz * dz < curMin * curMin) { tooClose = true; break; }
      }
      if (!tooClose) valid = true;
      attempts++;
    } while (!valid && attempts < 500);

    particles.push({
      x: nx, y: ny, z: nz,
      baseX: nx, baseY: ny, baseZ: nz,
      radius: 0.2 + rand() * 0.65,
      phase: rand() * Math.PI * 2,
      glowIntensity: 0.2 + rand() * 0.5,
      twinkleSpeed: 0.004 + rand() * 0.014,
      twinklePhase: rand() * Math.PI * 2,
      orbitSpeedX: 0.0005 + rand() * 0.0012,
      orbitSpeedY: 0.0005 + rand() * 0.0012,
      orbitSpeedZ: 0.0005 + rand() * 0.0012,
      orbitAmpX: 0.005 + rand() * 0.02,
      orbitAmpY: 0.005 + rand() * 0.02,
      orbitAmpZ: 0.005 + rand() * 0.02,
    });
  }

  const threads: Thread[] = [];
  const maxDist = 0.1;
  const maxThreadsPerParticle = 2;
  const threadCount = new Array(count).fill(0);

  for (let i = 0; i < count; i++) {
    const dists: { idx: number; dist: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = particles[i].baseX - particles[j].baseX;
      const dy = particles[i].baseY - particles[j].baseY;
      const dz = particles[i].baseZ - particles[j].baseZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < maxDist) dists.push({ idx: j, dist });
    }
    dists.sort((a, b) => a.dist - b.dist);

    for (const { idx: j } of dists) {
      if (threadCount[i] >= maxThreadsPerParticle) break;
      if (threadCount[j] >= maxThreadsPerParticle) continue;
      const exists = threads.some(t => (t.from === i && t.to === j) || (t.from === j && t.to === i));
      if (exists) continue;

      threads.push({
        from: i, to: j,
        baseOpacity: 0.02 + rand() * 0.04,
        curvature: (rand() - 0.5) * 0.25,
        sparks: [],
      });
      threadCount[i]++;
      threadCount[j]++;
    }
  }

  return { particles, threads };
}

// ─── Component ─────────────────────────────────────────────
export default function Aura({ state, urgency, isDark = true, audioLevel = 0, emotion = "neutral" }: AuraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const fieldRef = useRef<ReturnType<typeof generateParticles> | null>(null);
  const timeRef = useRef(0);
  const colorRef = useRef<{ r: number; g: number; b: number }>({ ...PALETTE.neutral });
  const audioRef = useRef(0);

  const getField = useCallback(() => {
    if (!fieldRef.current) fieldRef.current = generateParticles(800, 23);
    return fieldRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const { particles, threads } = getField();

    const draw = () => {
      const dpr = devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const t = timeRef.current;
      timeRef.current += 1;

      const targetAudio = state === "listening" ? audioLevel : 0;
      audioRef.current = lerp(audioRef.current, targetAudio, 0.12);
      const audio = audioRef.current;

      const targetCol = emotion === "anger" ? PALETTE.anger : emotion === "sadness" ? PALETTE.sadness : PALETTE.neutral;
      colorRef.current = lerpColor(colorRef.current, targetCol, 0.04);
      const col = colorRef.current;

      for (const p of particles) {
        p.x = p.baseX + Math.sin(t * p.orbitSpeedX + p.phase) * p.orbitAmpX;
        p.y = p.baseY + Math.cos(t * p.orbitSpeedY + p.phase) * p.orbitAmpY;
        p.z = p.baseZ + Math.sin(t * p.orbitSpeedZ + p.phase + 1) * p.orbitAmpZ;
      }

      const cyclePeriod = state === "processing" ? 200 : 999999;
      const phaseInCycle = (t % cyclePeriod) / cyclePeriod;
      const pulse = Math.sin(phaseInCycle * Math.PI);

      ctx.clearRect(0, 0, w, h);

      // Intense ambient glow
      const glowY = h / 2;
      const glowR = Math.min(w, h) * 0.44;
      const amb = ctx.createRadialGradient(w / 2, glowY, 0, w / 2, glowY, glowR);
      const ambAlpha = 0.08 + audio * 0.12 + pulse * 0.08;
      amb.addColorStop(0, rgba(col, ambAlpha * 1.2));
      amb.addColorStop(0.3, rgba(col, ambAlpha * 0.5));
      amb.addColorStop(1, "transparent");
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, w, h);

      const scale = Math.min(w, h) * 0.54;
      const ox = (w - scale) / 2;
      const oy = (h - scale) / 2 - h * 0.06;
      const toX = (nx: number) => ox + nx * scale;
      const toY = (ny: number) => oy + ny * scale;

      let brightness = 1.0, sparkRate = 0, sparkSpeed = 0.008, pulseAmp = 0;

      switch (state) {
        case "idle":
          brightness = 1 + Math.sin(t * 5) * 0.15;
          sparkRate = 3; sparkSpeed = 5; pulseAmp = 2; break;
        case "listening":
          brightness = 0.75 + audio * 0.5;
          sparkRate = 0.008 + audio * 0.06; sparkSpeed = 0.007 + audio * 0.025; pulseAmp = 0.12 + audio * 0.4; break;
        case "processing":
          brightness = 0.95 + Math.sin(t * 0.08) * 0.15;
          sparkRate = 0.06; sparkSpeed = 0.022; pulseAmp = 0.35; break;
        case "speaking":
          brightness = 0.8 + Math.sin(t * 0.04) * 0.15;
          sparkRate = 0.012; sparkSpeed = 0.009; pulseAmp = 0.2 + Math.sin(t * 0.08) * 0.1; break;
        case "error":
          brightness = 0.35 + Math.random() * 0.25;
          sparkRate = 0.001; sparkSpeed = 0.003; pulseAmp = 0.05; break;
      }

      const errorCol = { r: 255, g: 50, b: 50 };
      const drawCol = state === "error" ? lerpColor(col, errorCol, 0.6 + Math.random() * 0.3) : col;

      for (const thread of threads) {
        const p1 = particles[thread.from], p2 = particles[thread.to];
        const x1 = toX(p1.x), y1 = toY(p1.y);
        const x2 = toX(p2.x), y2 = toY(p2.y);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1;
        const cpx = mx + dy * thread.curvature;
        const cpy = my - dx * thread.curvature;

        let opacity = thread.baseOpacity * brightness;
        if (pulse > 0.2) opacity += pulse * 0.15;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        ctx.strokeStyle = rgba(drawCol, clamp(opacity, 0, 0.4));
        ctx.lineWidth = 0.35;
        ctx.stroke();

        if (Math.random() < sparkRate) {
          const dir = Math.random() > 0.5 ? 1 : -1;
          thread.sparks.push({
            t: dir > 0 ? 0 : 1,
            speed: sparkSpeed * dir * (0.7 + Math.random() * 0.6),
            brightness: 0.6 + Math.random() * 0.4,
            size: 0.5 + Math.random() * 0.8,
          });
        }

        for (let si = thread.sparks.length - 1; si >= 0; si--) {
          const spark = thread.sparks[si];
          spark.t += spark.speed;
          if (spark.t < -0.05 || spark.t > 1.05) { thread.sparks.splice(si, 1); continue; }
          const st = clamp(spark.t, 0, 1), mt = 1 - st;
          const sx = mt * mt * x1 + 2 * mt * st * cpx + st * st * x2;
          const sy = mt * mt * y1 + 2 * mt * st * cpy + st * st * y2;
          const alpha = spark.brightness * brightness * (1 - Math.abs(spark.t - 0.5) * 0.5);
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, spark.size * 3);
          glow.addColorStop(0, rgba(PALETTE.white, alpha));
          glow.addColorStop(0.3, rgba(drawCol, alpha * 0.6));
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(sx - spark.size * 3, sy - spark.size * 3, spark.size * 6, spark.size * 6);
          ctx.beginPath();
          ctx.arc(sx, sy, spark.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(PALETTE.white, alpha * 1.1);
          ctx.fill();
        }
        if (thread.sparks.length > 5) thread.sparks.splice(0, thread.sparks.length - 5);
      }

      const sorted = [...particles].sort((a, b) => a.z - b.z);

      for (const p of sorted) {
        const twinkle = Math.sin(t * p.twinkleSpeed + p.twinklePhase) * 0.5 + 0.5;
        let intensity = p.glowIntensity * brightness * (0.3 + twinkle * 0.7);

        if (pulse > 0.05) {
          const distFromCenter = Math.sqrt((p.baseX - 0.5) ** 2 + (p.baseY - 0.5) ** 2 + (p.baseZ - 0.5) ** 2);
          const waveDelay = distFromCenter * 0.35;
          const localPhase = clamp((phaseInCycle - waveDelay + 1) % 1, 0, 1);
          const localPulse = Math.sin(localPhase * Math.PI);
          intensity += localPulse * 0.7;
        }

        intensity = clamp(intensity, 0.1, 3.0);
        const r = p.radius * (1 + pulse * 0.2);
        const depth = clamp((p.z - 0.2) / 0.6, 0, 1);
        const alpha = intensity * (1 - depth * 0.4);
        const sizeScale = 1 - depth * 0.3;

        const px = toX(p.x), py = toY(p.y);
        const scaledR = r * sizeScale;

        // Outer glow — much more intense for shine
        const haloR = scaledR * 5;
        const halo = ctx.createRadialGradient(px, py, 0, px, py, haloR);
        halo.addColorStop(0, rgba(PALETTE.white, alpha * 1.5));
        halo.addColorStop(0.15, rgba(PALETTE.white, alpha * 0.5));
        halo.addColorStop(0.4, rgba(PALETTE.white, alpha * 0.15));
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.fillRect(px - haloR, py - haloR, haloR * 2, haloR * 2);

        // Inner bright glow
        const innerGlow = ctx.createRadialGradient(px, py, 0, px, py, scaledR * 1.5);
        innerGlow.addColorStop(0, rgba(PALETTE.white, alpha * 1.0));
        innerGlow.addColorStop(0.5, rgba(PALETTE.white, alpha * 0.6));
        innerGlow.addColorStop(1, "transparent");
        ctx.fillStyle = innerGlow;
        ctx.fillRect(px - scaledR * 2, py - scaledR * 2, scaledR * 4, scaledR * 4);

        // Body
        ctx.beginPath();
        ctx.arc(px, py, scaledR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(PALETTE.white, alpha * 1.5);
        ctx.fill();

        // Ultra-bright hot core
        ctx.beginPath();
        ctx.arc(px, py, scaledR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, alpha * 1.0);
        ctx.fill();

        // Specular highlight (tiny bright spot offset from center)
        ctx.beginPath();
        ctx.arc(px - scaledR * 0.15, py - scaledR * 0.15, scaledR * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, alpha * 0.8);
        ctx.fill();
      }

      // Ripple effect removed as requested

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [state, audioLevel, emotion, isDark, urgency, getField]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl pointer-events-none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}