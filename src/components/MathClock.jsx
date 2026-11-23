import React, { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";
import * as THREE from "three";
import { playClickSound } from "../utils/sound";

const FRONT_HOLD_SECONDS = 5.5;
const BACK_HOLD_SECONDS = 4.5;
const FLIP_DURATION_SECONDS = 1.35;
const EXTRUSION_LAYERS = [0.036, 0.048, 0.06, 0.072, 0.084];

// 12 precision outer baton hour markers (12/3/6/9 slightly bolder cardinal markers)
const HOUR_INDICES = Array.from({ length: 12 }, (_, i) => {
  const angle = Math.PI / 2 - (i / 12) * Math.PI * 2;
  const isCardinal = i % 3 === 0;
  return {
    index: i,
    angle,
    isCardinal,
    x: Math.cos(angle) * 1.815,
    y: Math.sin(angle) * 1.815,
  };
});

const SHARED_UV_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LOGO_SHIMMER_FRAGMENT = `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uTiltX;
  uniform float uTiltY;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.05) discard;

    // Warm champagne-to-pearl gradient across the sculpted emblem
    vec3 pearl = vec3(0.98, 0.96, 0.92);
    vec3 champagne = vec3(0.89, 0.74, 0.46);
    vec3 baseColor = mix(champagne, pearl, smoothstep(0.16, 0.84, vUv.y));

    // Diagonal metallic foil light-sweep (periodic + reactive to cursor/touch tilt)
    float diag = vUv.x * 0.78 + vUv.y * 0.62;
    float sweepPos = mod(uTime * 0.44, 2.3) - 0.6 + uTiltX * 0.32 + uTiltY * 0.18;
    float sheen = exp(-pow((diag - sweepPos) * 8.2, 2.0));

    // Subtle rhythmic breathing golden luminance
    float pulse = 0.5 + 0.5 * sin(uTime * 1.9);
    vec3 goldFlash = vec3(1.0, 0.92, 0.72);
    vec3 finalColor = baseColor + goldFlash * (sheen * 0.58 + pulse * 0.06);

    gl_FragColor = vec4(finalColor, tex.a);
  }
`;

const SECOND_COMET_FRAGMENT = `
  uniform float uSec;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    if (r < 0.84 || r > 0.99) discard;

    // Clockwise normalized angle from 12 o'clock [0..1)
    float cw = fract((1.5707963 - atan(p.y, p.x)) / 6.2831853);
    float behind = fract(uSec - cw);

    // Silky fading golden comet tail trailing ~55 degrees behind the live second hand
    float tail = (1.0 - smoothstep(0.0, 0.155, behind)) * smoothstep(0.0, 0.004, behind);
    float head = exp(-pow(min(behind, 1.0 - behind) * 110.0, 2.0));

    float ringBand = smoothstep(0.905, 0.928, r) * (1.0 - smoothstep(0.95, 0.972, r));
    float headGlow = exp(-pow((r - 0.938) * 34.0, 2.0)) * head;

    float alpha = ringBand * tail * 0.58 + headGlow * 0.88;
    if (alpha < 0.01) discard;

    vec3 champagne = vec3(0.84, 0.66, 0.35);
    vec3 brightGold = vec3(1.0, 0.93, 0.74);
    vec3 col = mix(champagne, brightGold, clamp(head + (1.0 - behind * 6.0) * 0.45, 0.0, 1.0));

    gl_FragColor = vec4(col, alpha);
  }
`;

const SAPPHIRE_GLARE_FRAGMENT = `
  uniform float uTime;
  uniform float uTiltX;
  uniform float uTiltY;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    if (r > 1.0) discard;

    // Subtle anti-reflective sapphire crystal sheen reacting to cursor tilt
    float diag = p.x * 0.72 + p.y * 0.69;
    float glintPos = -0.18 + uTiltX * 0.48 + uTiltY * 0.32 + sin(uTime * 0.45) * 0.08;
    float primaryGlint = exp(-pow((diag - glintPos) * 4.4, 2.0)) * 0.11;
    float secondaryGlint = exp(-pow((diag - (glintPos + 0.23)) * 12.0, 2.0)) * 0.065;

    // Delicate domed sapphire edge reflection
    float rim = smoothstep(0.84, 0.99, r) * 0.12;
    float edgeMask = 1.0 - smoothstep(0.97, 1.0, r);

    float alpha = (primaryGlint + secondaryGlint + rim) * edgeMask;
    if (alpha < 0.005) discard;

    vec3 tint = mix(vec3(1.0, 0.97, 0.91), vec3(0.91, 0.77, 0.51), rim * 2.2);
    gl_FragColor = vec4(tint, alpha);
  }
`;

function drawCurvedText(ctx, text, cx, cy, radius, centerAngle, letterStep, isBottom) {
  ctx.save();
  const chars = text.split("");
  const totalSpan = (chars.length - 1) * letterStep;

  chars.forEach((char, i) => {
    const angle = isBottom
      ? centerAngle + totalSpan / 2 - i * letterStep
      : centerAngle - totalSpan / 2 + i * letterStep;

    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(isBottom ? angle - Math.PI / 2 : angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/**
 * Builds the bespoke Swiss-watchmaker obsidian sunburst caseback dial:
 * - Subtle radial guilloché rings
 * - 60 precision perimeter ticks
 * - Curved engraved brand signature ("MANINDRA ROY" / "FULL-STACK ARCHITECT")
 */
function createCasebackDialTexture() {
  const size = 1024;
  const cx = size / 2;
  const cy = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bgGrad = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, size * 0.5);
  bgGrad.addColorStop(0, "#191713");
  bgGrad.addColorStop(0.45, "#100f0d");
  bgGrad.addColorStop(1, "#080807");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * size * 0.08, cy + Math.sin(a) * size * 0.08);
    ctx.lineTo(cx + Math.cos(a) * size * 0.46, cy + Math.sin(a) * size * 0.46);
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(207, 163, 85, 0.035)" : "rgba(255, 255, 255, 0.015)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  [0.18, 0.27, 0.345, 0.365, 0.455].forEach((rRatio, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, size * rRatio, 0, Math.PI * 2);
    ctx.strokeStyle =
      idx === 3 ? "rgba(207, 163, 85, 0.24)" : "rgba(207, 163, 85, 0.09)";
    ctx.lineWidth = idx === 3 ? 1.8 : 1.1;
    ctx.stroke();
  });
  ctx.restore();

  ctx.save();
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const isMajor = i % 5 === 0;
    const rOuter = size * 0.478;
    const rInner = isMajor ? size * 0.456 : size * 0.468;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
    ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
    ctx.strokeStyle = isMajor
      ? "rgba(231, 197, 130, 0.75)"
      : "rgba(207, 163, 85, 0.32)";
    ctx.lineWidth = isMajor ? 3 : 1.4;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.font = '400 31px "Amiamie", "Segoe UI", sans-serif';
  ctx.fillStyle = "rgba(231, 197, 130, 0.88)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawCurvedText(ctx, "MANINDRA ROY", cx, cy, size * 0.408, -Math.PI / 2, 0.088, false);

  ctx.font = '300 25px "Amiamie", "Segoe UI", sans-serif';
  ctx.fillStyle = "rgba(245, 240, 230, 0.65)";
  drawCurvedText(
    ctx,
    "FULL-STACK ARCHITECT",
    cx,
    cy,
    size * 0.412,
    Math.PI / 2,
    0.068,
    true
  );

  ctx.fillStyle = "rgba(207, 163, 85, 0.85)";
  [0, Math.PI].forEach((a) => {
    const dx = cx + Math.cos(a) * size * 0.408;
    const dy = cy + Math.sin(a) * size * 0.408;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  });
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Extracts clean anti-aliased alpha textures from /ms-icon-310x310.png:
 * 1. Crisp front logo mask (for the live metallic shimmer shader)
 * 2. Brushed champagne-gold extrusion silhouette (for stacked 3D depth relief)
 * 3. Soft recessed shadow + warm gold aura halo behind the floating emblem
 */
function createLogoLayerTextures(img) {
  const size = 1024;

  const keyCanvas = document.createElement("canvas");
  keyCanvas.width = 512;
  keyCanvas.height = 512;
  const kctx = keyCanvas.getContext("2d");
  if (!kctx) return null;

  kctx.drawImage(img, 0, 0, 512, 512);
  const imgData = kctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  const goldCanvas = document.createElement("canvas");
  goldCanvas.width = 512;
  goldCanvas.height = 512;
  const gctx = goldCanvas.getContext("2d");
  const goldData = gctx.createImageData(512, 512);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 512;
  shadowCanvas.height = 512;
  const sctx = shadowCanvas.getContext("2d");
  const shadowData = sctx.createImageData(512, 512);

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const alpha = Math.max(0, Math.min(1, (lum - 68) / 145));
    const aByte = Math.round(alpha * 255);

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = aByte;

    goldData.data[i] = 196;
    goldData.data[i + 1] = 148;
    goldData.data[i + 2] = 68;
    goldData.data[i + 3] = aByte;

    shadowData.data[i] = 5;
    shadowData.data[i + 1] = 5;
    shadowData.data[i + 2] = 4;
    shadowData.data[i + 3] = aByte;
  }

  kctx.putImageData(imgData, 0, 0);
  gctx.putImageData(goldData, 0, 0);
  sctx.putImageData(shadowData, 0, 0);

  const logoDrawSize = size * 0.56;
  const offset = (size - logoDrawSize) / 2;

  const frontCanvas = document.createElement("canvas");
  frontCanvas.width = size;
  frontCanvas.height = size;
  const fctx = frontCanvas.getContext("2d");
  fctx.drawImage(keyCanvas, offset, offset + size * 0.015, logoDrawSize, logoDrawSize);

  const extrudeCanvas = document.createElement("canvas");
  extrudeCanvas.width = size;
  extrudeCanvas.height = size;
  const ectx = extrudeCanvas.getContext("2d");
  ectx.drawImage(goldCanvas, offset, offset + size * 0.015, logoDrawSize, logoDrawSize);

  const auraCanvas = document.createElement("canvas");
  auraCanvas.width = size;
  auraCanvas.height = size;
  const actx = auraCanvas.getContext("2d");

  const glow = actx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.02,
    size / 2,
    size / 2,
    size * 0.36
  );
  glow.addColorStop(0, "rgba(207, 163, 85, 0.34)");
  glow.addColorStop(0.55, "rgba(207, 163, 85, 0.1)");
  glow.addColorStop(1, "rgba(207, 163, 85, 0)");
  actx.fillStyle = glow;
  actx.fillRect(0, 0, size, size);

  actx.save();
  actx.filter = "blur(16px)";
  actx.globalAlpha = 0.72;
  actx.drawImage(
    shadowCanvas,
    offset + 10,
    offset + size * 0.015 + 16,
    logoDrawSize,
    logoDrawSize
  );
  actx.restore();

  const makeTex = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  };

  return {
    frontTex: makeTex(frontCanvas),
    extrudeTex: makeTex(extrudeCanvas),
    auraTex: makeTex(auraCanvas),
  };
}

export function MathClock(props) {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isCompactDesktop = useMediaQuery({ minWidth: 854, maxWidth: 1200 });

  const { viewport, camera, size: canvasSize } = useThree();
  const { nodes, materials } = useGLTF("/models/MathClock.glb");

  const group = useRef(null);
  const outerRing = useRef(null);
  const frontEscapementRef = useRef(null);
  const tourbillonOuterRef = useRef(null);
  const tourbillonInnerRef = useRef(null);
  const logoAuraRef = useRef(null);
  const hourHand = useRef(null);
  const minuteHand = useRef(null);
  const secondHand = useRef(null);

  const [casebackTex, setCasebackTex] = useState(null);
  const [logoLayers, setLogoLayers] = useState(null);

  // Horizontal 180-degree coin-flip state (runs purely in refs for 0 React re-renders)
  const flipState = useRef({
    baseAngle: Math.PI, // Math.PI = clock front, 0 = logo back
    currentAngle: Math.PI,
    fromAngle: Math.PI,
    toAngle: Math.PI,
    isFlipping: false,
    flipProgress: 0,
    showingBack: false,
    holdElapsed: 0,
  });

  // Front shader 1: Live golden comet trail locked to the sweeping second hand
  const secondCometMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uSec: { value: 0 },
        },
        vertexShader: SHARED_UV_VERTEX,
        fragmentShader: SECOND_COMET_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // Front shader 2: Subtle anti-reflective sapphire crystal diagonal glare reacting to cursor tilt
  const sapphireGlareMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTiltX: { value: 0 },
          uTiltY: { value: 0 },
        },
        vertexShader: SHARED_UV_VERTEX,
        fragmentShader: SAPPHIRE_GLARE_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // Reverse shader: Live metallic foil sheen across the sculpted emblem face
  const shimmerMaterial = useMemo(() => {
    if (!logoLayers?.frontTex) return null;
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: logoLayers.frontTex },
        uTime: { value: 0 },
        uTiltX: { value: 0 },
        uTiltY: { value: 0 },
      },
      vertexShader: SHARED_UV_VERTEX,
      fragmentShader: LOGO_SHIMMER_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
  }, [logoLayers]);

  useEffect(() => {
    return () => {
      secondCometMaterial.dispose();
      sapphireGlareMaterial.dispose();
    };
  }, [secondCometMaterial, sapphireGlareMaterial]);

  useEffect(() => {
    return () => {
      shimmerMaterial?.dispose();
    };
  }, [shimmerMaterial]);

  // Build bespoke caseback dial & extract 3D logo layer textures
  useEffect(() => {
    let active = true;
    const dialTex = createCasebackDialTexture();
    if (dialTex) setCasebackTex(dialTex);

    let builtLayers = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/ms-icon-310x310.png";
    img.onload = () => {
      if (!active) return;
      builtLayers = createLogoLayerTextures(img);
      if (builtLayers) setLogoLayers(builtLayers);
    };

    return () => {
      active = false;
      dialTex?.dispose();
      builtLayers?.frontTex?.dispose();
      builtLayers?.extrudeTex?.dispose();
      builtLayers?.auraTex?.dispose();
    };
  }, []);

  // Mobile: account for full medallion + gold halo diameter (~4.10) plus 3D flip perspective so it never clips outside the stage
  const mobileMinDim = Math.min(viewport.width, viewport.height);
  const mobileScale = Math.min(
    Math.max((mobileMinDim * 0.78) / 4.15, 0.72),
    1.85
  );

  const targetScale = isMobile
    ? mobileScale
    : isCompactDesktop
    ? 0.72
    : 0.84;

  // Note: Camera is at -Z looking toward +Z, so world -X is SCREEN RIGHT and +Y is SCREEN UP.
  // Keep desktop clock bold while clearing the top header border cleanly across all desktop heights.
  const visualRadius = 1.85 * targetScale;
  const maxDesktopRightX = Math.max(
    0.9,
    viewport.width / 2 - visualRadius - viewport.width * 0.04
  );
  const desktopX = -Math.min(viewport.width * 0.25, maxDesktopRightX);

  // On mobile, offset +0.128 * scale to compensate for GLB's local -0.128 Y offset so the dial sits dead-center.
  const targetPosition = isMobile
    ? [0, 0.128 * mobileScale, 0]
    : isCompactDesktop
    ? [desktopX, 0.44, 0]
    : [desktopX, 0.36, 0];

  // Track window pointer (desktop) and gentle passive touch tilt (mobile)
  const pointerRef = useRef({ x: 0, y: 0 });
  const basePositionRef = useRef(targetPosition);
  basePositionRef.current = targetPosition;
  const scaleRef = useRef(targetScale);
  scaleRef.current = targetScale;

  // Trigger an instant horizontal flip when clicking/tapping directly on the clock circle
  useEffect(() => {
    const projected = new THREE.Vector3();
    const edgeProjected = new THREE.Vector3();

    const triggerManualFlip = () => {
      const f = flipState.current;
      f.fromAngle = f.currentAngle;
      f.showingBack = !f.showingBack;
      const nextTarget = f.baseAngle + Math.PI;
      f.toAngle = nextTarget;
      f.baseAngle = nextTarget;
      f.isFlipping = true;
      f.flipProgress = 0;
      f.holdElapsed = 0;
      playClickSound(f.showingBack ? 560 : 480, 0.035);
    };

    const handleCanvasRegionClick = (e) => {
      if (!group.current) return;
      const target = e.target;
      if (
        target &&
        typeof target.closest === "function" &&
        target.closest("a, button, input, textarea, [role='button'], nav")
      ) {
        return;
      }

      const heroEl = document.getElementById("home");
      if (!heroEl) return;
      const heroRect = heroEl.getBoundingClientRect();
      if (
        e.clientX < heroRect.left ||
        e.clientX > heroRect.right ||
        e.clientY < heroRect.top ||
        e.clientY > heroRect.bottom
      ) {
        return;
      }

      group.current.getWorldPosition(projected);
      edgeProjected.copy(projected);
      edgeProjected.x += 1.96 * scaleRef.current;

      projected.project(camera);
      edgeProjected.project(camera);

      const figureEl = heroEl.querySelector("figure");
      const rect = figureEl ? figureEl.getBoundingClientRect() : heroRect;
      const cx = rect.left + (projected.x * 0.5 + 0.5) * rect.width;
      const cy = rect.top + (-projected.y * 0.5 + 0.5) * rect.height;
      const ex = rect.left + (edgeProjected.x * 0.5 + 0.5) * rect.width;
      const hitRadius = Math.abs(ex - cx);

      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist <= hitRadius) {
        triggerManualFlip();
      }
    };

    window.addEventListener("click", handleCanvasRegionClick);
    return () => window.removeEventListener("click", handleCanvasRegionClick);
  }, [camera, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (isMobile) {
      const handleTouchMove = (e) => {
        const touch = e.touches?.[0];
        if (!touch) return;
        pointerRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
        pointerRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      };
      const handleTouchEnd = () => {
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
      };
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("touchcancel", handleTouchEnd);
      };
    }

    const handlePointerMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handlePointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [isMobile]);

  useGSAP(
    () => {
      if (!group.current) return;
      gsap.fromTo(
        group.current.scale,
        {
          x: targetScale * 0.85,
          y: targetScale * 0.85,
          z: targetScale * 0.85,
        },
        {
          x: targetScale,
          y: targetScale,
          z: targetScale,
          duration: 1.2,
          ease: "power3.out",
        }
      );
    },
    { scope: group, dependencies: [targetScale] }
  );

  // Material polish: luminous white math dial + rich brushed champagne-gold hands & case accents
  useEffect(() => {
    const mat = materials.Clock_face;
    if (mat) {
      mat.emissiveMap = mat.map;
      mat.emissive.set("#f7f1e5");
      mat.emissiveIntensity = 1.42;
      mat.roughness = 0.88;
      mat.metalness = 0.08;
      mat.needsUpdate = true;
    }

    if (materials.Clock_Back) {
      materials.Clock_Back.color.set("#0c0c0b");
      materials.Clock_Back.roughness = 0.72;
      materials.Clock_Back.metalness = 0.25;
      materials.Clock_Back.needsUpdate = true;
    }

    if (materials.Clock_hands) {
      materials.Clock_hands.color.set("#f0d7a3");
      materials.Clock_hands.emissive.set("#cfa355");
      materials.Clock_hands.emissiveIntensity = 0.78;
      materials.Clock_hands.metalness = 0.88;
      materials.Clock_hands.roughness = 0.2;
      materials.Clock_hands.needsUpdate = true;
    }

    if (materials.Gold) {
      materials.Gold.color.set("#cfa355");
      materials.Gold.emissive.set("#cfa355");
      materials.Gold.emissiveIntensity = 0.35;
      materials.Gold.metalness = 0.94;
      materials.Gold.roughness = 0.18;
      materials.Gold.needsUpdate = true;
    }
  }, [materials]);

  // Real-time clock hands + live second comet + sapphire glare + horizontal medallion flip + logo shimmer
  useFrame((state, delta) => {
    const now = new Date();
    const secondsRatio = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
    const minutesRatio = (now.getMinutes() + secondsRatio) / 60;
    const hoursRatio = ((now.getHours() % 12) + minutesRatio) / 12;

    if (secondHand.current) {
      secondHand.current.rotation.z = -secondsRatio * Math.PI * 2;
    }
    if (minuteHand.current) {
      minuteHand.current.rotation.z = -minutesRatio * Math.PI * 2;
    }
    if (hourHand.current) {
      hourHand.current.rotation.z = -hoursRatio * Math.PI * 2;
    }

    const dt = Math.min(delta, 0.05);
    const smooth = 1 - Math.exp(-5.2 * dt);
    const elapsed = state.clock.elapsedTime;

    // Front dial live second-hand comet trail + reactive sapphire glass reflection
    secondCometMaterial.uniforms.uSec.value = secondsRatio;
    sapphireGlareMaterial.uniforms.uTime.value = elapsed;
    sapphireGlareMaterial.uniforms.uTiltX.value = THREE.MathUtils.lerp(
      sapphireGlareMaterial.uniforms.uTiltX.value,
      pointerRef.current.x,
      smooth
    );
    sapphireGlareMaterial.uniforms.uTiltY.value = THREE.MathUtils.lerp(
      sapphireGlareMaterial.uniforms.uTiltY.value,
      pointerRef.current.y,
      smooth
    );

    if (frontEscapementRef.current) {
      frontEscapementRef.current.rotation.z = -elapsed * 0.18;
    }

    // Reverse logo live metallic foil shimmer uniforms
    if (shimmerMaterial) {
      shimmerMaterial.uniforms.uTime.value = elapsed;
      shimmerMaterial.uniforms.uTiltX.value = THREE.MathUtils.lerp(
        shimmerMaterial.uniforms.uTiltX.value,
        pointerRef.current.x,
        smooth
      );
      shimmerMaterial.uniforms.uTiltY.value = THREE.MathUtils.lerp(
        shimmerMaterial.uniforms.uTiltY.value,
        pointerRef.current.y,
        smooth
      );
    }

    // Counter-rotating Swiss tourbillon gimbal rings around the reverse emblem
    if (tourbillonOuterRef.current) {
      tourbillonOuterRef.current.rotation.z = elapsed * 0.22;
    }
    if (tourbillonInnerRef.current) {
      tourbillonInnerRef.current.rotation.z = -elapsed * 0.34;
    }
    if (logoAuraRef.current) {
      logoAuraRef.current.opacity = 0.72 + Math.sin(elapsed * 2.1) * 0.16;
    }

    // Advance natural horizontal 180-degree medallion flip cycle
    const f = flipState.current;
    if (f.isFlipping) {
      f.flipProgress = Math.min(1, f.flipProgress + dt / FLIP_DURATION_SECONDS);
      const t = f.flipProgress;
      const eased =
        t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
      f.currentAngle = THREE.MathUtils.lerp(f.fromAngle, f.toAngle, eased);

      if (f.flipProgress >= 1) {
        f.isFlipping = false;
        const normalized = f.showingBack ? 0 : Math.PI;
        f.currentAngle = normalized;
        f.baseAngle = normalized;
        f.fromAngle = normalized;
        f.toAngle = normalized;
        if (group.current) {
          group.current.rotation.y =
            normalized +
            (isMobile
              ? pointerRef.current.x * 0.16
              : pointerRef.current.x * 0.24);
        }
      }
    } else {
      f.holdElapsed += dt;
      const holdDuration = f.showingBack
        ? BACK_HOLD_SECONDS
        : FRONT_HOLD_SECONDS;
      if (f.holdElapsed >= holdDuration) {
        f.holdElapsed = 0;
        f.showingBack = !f.showingBack;
        f.fromAngle = f.baseAngle;
        f.toAngle = f.baseAngle + Math.PI;
        f.baseAngle = f.toAngle;
        f.isFlipping = true;
        f.flipProgress = 0;
      }
    }

    if (outerRing.current) {
      outerRing.current.rotation.z = elapsed * 0.14;
      const ringTargetX =
        Math.sin(elapsed * 0.35) * 0.16 +
        (isMobile ? 0 : pointerRef.current.y * 0.1);
      outerRing.current.rotation.x = THREE.MathUtils.lerp(
        outerRing.current.rotation.x,
        ringTargetX,
        smooth
      );
    }

    if (group.current) {
      const { x: px, y: py } = pointerRef.current;
      const [bx, by, bz] = basePositionRef.current;

      const gazeOffsetY = isMobile ? px * 0.16 : px * 0.24;
      const targetRotX = isMobile ? py * 0.1 : py * 0.16;

      if (f.isFlipping) {
        const gazeBlend = 1 - Math.sin(f.flipProgress * Math.PI) * 0.65;
        group.current.rotation.y = f.currentAngle + gazeOffsetY * gazeBlend;
      } else {
        const targetRotY = f.baseAngle + gazeOffsetY;
        group.current.rotation.y = THREE.MathUtils.lerp(
          group.current.rotation.y,
          targetRotY,
          smooth
        );
      }

      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        targetRotX,
        smooth
      );

      if (isMobile) {
        group.current.position.set(bx, by, bz);
      } else {
        const driftX = bx - px * 0.14;
        const driftY = by + py * 0.06;
        group.current.position.x = THREE.MathUtils.lerp(
          group.current.position.x,
          driftX,
          smooth
        );
        group.current.position.y = THREE.MathUtils.lerp(
          group.current.position.y,
          driftY,
          smooth
        );
        group.current.position.z = bz;
      }
    }
  });

  const castShadows = !isMobile;

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={targetScale}
      position={targetPosition}
      rotation={[0, Math.PI, 0]}
    >
      {/* Delicate orbital champagne-gold halo ring framing both front clock & reverse logo */}
      <mesh ref={outerRing} position={[0, -0.128, 0.05]}>
        <torusGeometry args={[2.03, 0.012, 16, 96]} />
        <meshStandardMaterial
          color="#cfa355"
          emissive="#cfa355"
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.55}
        />
      </mesh>

      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" position={[0, -0.128, 0.128]}>
          {/* SOLID METALLIC CHAMPAGNE-GOLD SIDE CASE BAND (connects front & back bezels during 3D flip) */}
          <mesh position={[0, 0, -0.044]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.965, 1.965, 0.088, 96, 1, true]} />
            <meshStandardMaterial
              color="#cfa355"
              emissive="#cfa355"
              emissiveIntensity={0.3}
              metalness={0.96}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* FRONT HOROLOGY ENHANCEMENTS: Bezel + 12 Gold Batons + Live Second Comet + Center Jewel + Sapphire Glare */}
          <group>
            {/* Matching Chamfered Metallic Champagne-Gold Front Bezel Rim */}
            <mesh position={[0, 0, -0.008]}>
              <torusGeometry args={[1.95, 0.038, 24, 96]} />
              <meshStandardMaterial
                color="#cfa355"
                emissive="#cfa355"
                emissiveIntensity={0.38}
                metalness={0.95}
                roughness={0.18}
              />
            </mesh>

            {/* Inner Architectural Chapter Hairline */}
            <mesh position={[0, 0, -0.062]}>
              <torusGeometry args={[1.88, 0.006, 12, 96]} />
              <meshStandardMaterial
                color="#e7c582"
                emissive="#e7c582"
                emissiveIntensity={0.45}
                metalness={0.9}
                roughness={0.22}
                transparent
                opacity={0.65}
              />
            </mesh>

            {/* Subtle Slow-Rotating Center Skeleton Escapement Ring (echoes reverse tourbillon) */}
            <group ref={frontEscapementRef} position={[0, 0, -0.063]}>
              <mesh>
                <torusGeometry args={[0.52, 0.006, 12, 48, Math.PI * 0.65]} />
                <meshStandardMaterial
                  color="#cfa355"
                  emissive="#cfa355"
                  emissiveIntensity={0.5}
                  metalness={0.9}
                  roughness={0.24}
                  transparent
                  opacity={0.42}
                />
              </mesh>
              <mesh rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[0.52, 0.006, 12, 48, Math.PI * 0.65]} />
                <meshStandardMaterial
                  color="#cfa355"
                  emissive="#cfa355"
                  emissiveIntensity={0.5}
                  metalness={0.9}
                  roughness={0.24}
                  transparent
                  opacity={0.42}
                />
              </mesh>
            </group>

            {/* 12 Faceted 3D Metallic Gold Outer Hour Batons */}
            {HOUR_INDICES.map(({ index, angle, isCardinal, x, y }) => (
              <mesh
                key={index}
                position={[x, y, -0.056]}
                rotation={[0, 0, angle]}
              >
                <boxGeometry
                  args={[
                    isCardinal ? 0.14 : 0.085,
                    isCardinal ? 0.032 : 0.018,
                    0.022,
                  ]}
                />
                <meshStandardMaterial
                  color={isCardinal ? "#f0d7a3" : "#cfa355"}
                  emissive={isCardinal ? "#e7c582" : "#cfa355"}
                  emissiveIntensity={isCardinal ? 0.65 : 0.42}
                  metalness={0.94}
                  roughness={0.18}
                />
              </mesh>
            ))}

            {/* Live Sweeping Golden Second-Hand Comet Trail */}
            <mesh position={[0, 0, -0.052]} material={secondCometMaterial}>
              <circleGeometry args={[1.86, 96]} />
            </mesh>

            {/* Sculpted Champagne-Gold Center Hub Cap & Luminous Jewel */}
            <group position={[0, 0, 0.086]}>
              <mesh>
                <torusGeometry args={[0.072, 0.016, 16, 36]} />
                <meshStandardMaterial
                  color="#e7c582"
                  emissive="#cfa355"
                  emissiveIntensity={0.55}
                  metalness={0.95}
                  roughness={0.15}
                />
              </mesh>
              <mesh position={[0, 0, 0.006]}>
                <sphereGeometry args={[0.052, 24, 24]} />
                <meshStandardMaterial
                  color="#fff3d6"
                  emissive="#e7c582"
                  emissiveIntensity={0.9}
                  metalness={0.85}
                  roughness={0.12}
                />
              </mesh>
            </group>

            {/* Reactive Anti-Reflective Sapphire Crystal Glare Sweep */}
            <mesh position={[0, 0, 0.098]} material={sapphireGlareMaterial}>
              <circleGeometry args={[1.92, 96]} />
            </mesh>
          </group>

          {/* REVERSE LUXURY HOROLOGY MEDALLION FACE: Sunburst Caseback + 3D Layered Sculpted Logo */}
          <group position={[0, 0, -0.082]} rotation={[0, Math.PI, 0]}>
            {/* Layer 0: Bespoke Sunburst Guilloché Obsidian Dial with Curved Engraved Signature */}
            <mesh>
              <circleGeometry args={[1.955, 96]} />
              <meshStandardMaterial
                map={casebackTex || undefined}
                emissiveMap={casebackTex || undefined}
                emissive="#f5e6c8"
                emissiveIntensity={casebackTex ? 0.55 : 0}
                color={casebackTex ? "#ffffff" : "#0b0b0a"}
                roughness={0.68}
                metalness={0.28}
              />
            </mesh>

            {/* Outer Chamfered Metallic Champagne-Gold Coin Rim (flashes warm gold during flip) */}
            <mesh position={[0, 0, 0.014]}>
              <torusGeometry args={[1.95, 0.036, 24, 96]} />
              <meshStandardMaterial
                color="#cfa355"
                emissive="#cfa355"
                emissiveIntensity={0.38}
                metalness={0.95}
                roughness={0.18}
              />
            </mesh>

            {/* Layer 1: Recessed Depth Shadow & Breathing Champagne Aura Behind Floating Emblem */}
            {logoLayers?.auraTex && (
              <mesh position={[0, 0, 0.014]}>
                <circleGeometry args={[1.82, 64]} />
                <meshBasicMaterial
                  ref={logoAuraRef}
                  map={logoLayers.auraTex}
                  transparent
                  opacity={0.8}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Layer 2: Counter-Rotating Swiss Tourbillon Gimbal Arcs */}
            <group ref={tourbillonOuterRef} position={[0, 0, 0.026]}>
              <mesh>
                <torusGeometry args={[1.38, 0.01, 14, 64, Math.PI * 0.72]} />
                <meshStandardMaterial
                  color="#e7c582"
                  emissive="#e7c582"
                  emissiveIntensity={0.65}
                  metalness={0.92}
                  roughness={0.2}
                />
              </mesh>
              <mesh rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[1.38, 0.01, 14, 64, Math.PI * 0.72]} />
                <meshStandardMaterial
                  color="#e7c582"
                  emissive="#e7c582"
                  emissiveIntensity={0.65}
                  metalness={0.92}
                  roughness={0.2}
                />
              </mesh>
            </group>

            <group ref={tourbillonInnerRef} position={[0, 0, 0.032]}>
              <mesh>
                <torusGeometry args={[1.24, 0.007, 12, 48, Math.PI * 0.48]} />
                <meshStandardMaterial
                  color="#cfa355"
                  emissive="#cfa355"
                  emissiveIntensity={0.45}
                  metalness={0.9}
                  roughness={0.24}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              <mesh rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[1.24, 0.007, 12, 48, Math.PI * 0.48]} />
                <meshStandardMaterial
                  color="#cfa355"
                  emissive="#cfa355"
                  emissiveIntensity={0.45}
                  metalness={0.9}
                  roughness={0.24}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </group>

            {/* Layer 3A: Stacked 3D Brushed Champagne-Gold Extrusion Relief (real depth on tilt & flip) */}
            {logoLayers?.extrudeTex &&
              EXTRUSION_LAYERS.map((zDepth) => (
                <mesh key={zDepth} position={[0, 0, zDepth]}>
                  <circleGeometry args={[1.82, 64]} />
                  <meshStandardMaterial
                    map={logoLayers.extrudeTex}
                    emissiveMap={logoLayers.extrudeTex}
                    emissive="#cfa355"
                    emissiveIntensity={0.32}
                    transparent
                    alphaTest={0.2}
                    metalness={0.92}
                    roughness={0.26}
                  />
                </mesh>
              ))}

            {/* Layer 3B: Top Sculpted Emblem Face with Real-Time Reactive Metallic Foil Sheen */}
            {shimmerMaterial && (
              <mesh position={[0, 0, 0.096]} material={shimmerMaterial}>
                <circleGeometry args={[1.82, 64]} />
              </mesh>
            )}
          </group>

          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Clock_Armature_13">
                {/* Front Clock Dial & Back Plate (battery box & hook removed for clean double-sided medallion) */}
                <group name="Clock_face_3">
                  <mesh
                    name="Object_7"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_7.geometry}
                    material={materials.Clock_face}
                  />
                  <mesh
                    name="Object_8"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_8.geometry}
                    material={materials.Clock_Back}
                  />
                </group>
                <group name="Clock_face_glass_4">
                  <mesh
                    name="Object_10"
                    castShadow={false}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_10.geometry}
                    material={materials.Glass}
                  />
                </group>
                <group name="Knob_6">
                  <mesh
                    name="Object_14"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_14.geometry}
                    material={materials.Clock_hands}
                  />
                  <mesh
                    name="Object_15"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_15.geometry}
                    material={materials.Gold}
                  />
                </group>

                {/* Animated Hands */}
                <group
                  ref={minuteHand}
                  name="Minute_hand_8"
                  rotation={[-Math.PI / 2, 0, -0.002]}
                >
                  <group name="Minute_hand_7" rotation={[Math.PI / 2, 0, 0]}>
                    <mesh
                      name="Object_18"
                      castShadow={castShadows}
                      receiveShadow={castShadows}
                      geometry={nodes.Object_18.geometry}
                      material={materials.Clock_hands}
                    />
                  </group>
                </group>

                <group
                  ref={hourHand}
                  name="Hour_hand_10"
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <group name="Hour_hand_9" rotation={[Math.PI / 2, 0, 0]}>
                    <mesh
                      name="Object_21"
                      castShadow={castShadows}
                      receiveShadow={castShadows}
                      geometry={nodes.Object_21.geometry}
                      material={materials.Clock_hands}
                    />
                  </group>
                </group>

                <group
                  ref={secondHand}
                  name="Second_hand_12"
                  rotation={[-Math.PI / 2, 0, -0.105]}
                >
                  <group name="Second_hand_11" rotation={[Math.PI / 2, 0, 0]}>
                    <mesh
                      name="Object_24"
                      castShadow={castShadows}
                      receiveShadow={castShadows}
                      geometry={nodes.Object_24.geometry}
                      material={materials.Clock_hands}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/MathClock.glb");
