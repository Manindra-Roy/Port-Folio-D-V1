import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";
import * as THREE from "three";

export function MathClock(props) {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isCompactDesktop = useMediaQuery({ minWidth: 854, maxWidth: 1200 });

  const { viewport } = useThree();
  const { nodes, materials } = useGLTF("/models/MathClock.glb");

  const group = useRef(null);
  const outerRing = useRef(null);
  const hourHand = useRef(null);
  const minuteHand = useRef(null);
  const secondHand = useRef(null);

  // Mobile: viewport-adaptive scale tuned to the visible dial so the clock feels bold & balanced on every phone/tablet (360px–853px)
  const mobileMinDim = Math.min(viewport.width, viewport.height);
  const mobileScale = Math.min(
    Math.max((mobileMinDim * 0.84) / 3.45, 0.95),
    2.2
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

  // Material polish: luminous white dial numbers + champagne-gold accents
  useEffect(() => {
    const mat = materials.Clock_face;
    if (mat) {
      mat.emissiveMap = mat.map;
      mat.emissive.set("#f5f0e6");
      mat.emissiveIntensity = 1.35;
      mat.roughness = 0.92;
      mat.metalness = 0.05;
      mat.needsUpdate = true;
    }

    if (materials.Clock_hands) {
      materials.Clock_hands.emissive.set("#e7c582");
      materials.Clock_hands.emissiveIntensity = 0.7;
      materials.Clock_hands.needsUpdate = true;
    }

    if (materials.Gold) {
      materials.Gold.color.set("#cfa355");
      materials.Gold.metalness = 0.9;
      materials.Gold.roughness = 0.22;
      materials.Gold.needsUpdate = true;
    }
  }, [materials]);

  // Real-time clock hands + smooth psychological gaze-following tilt & parallax on desktop
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

    if (outerRing.current) {
      outerRing.current.rotation.z = state.clock.elapsedTime * 0.14;
      const ringTargetX =
        Math.sin(state.clock.elapsedTime * 0.35) * 0.18 +
        (isMobile ? 0 : pointerRef.current.y * 0.12);
      outerRing.current.rotation.x = THREE.MathUtils.lerp(
        outerRing.current.rotation.x,
        ringTargetX,
        smooth
      );
    }

    if (group.current) {
      const { x: px, y: py } = pointerRef.current;
      const [bx, by, bz] = basePositionRef.current;

      if (isMobile) {
        // Subtle tactile touch-reactive tilt on mobile, gently relaxing back to face-on
        const targetRotY = Math.PI + px * 0.16;
        const targetRotX = py * 0.1;
        group.current.rotation.y = THREE.MathUtils.lerp(
          group.current.rotation.y,
          targetRotY,
          smooth
        );
        group.current.rotation.x = THREE.MathUtils.lerp(
          group.current.rotation.x,
          targetRotX,
          smooth
        );
        group.current.position.set(bx, by, bz);
      } else {
        // Subtle living gaze: clock face gently orients toward the user's cursor
        const targetRotY = Math.PI + px * 0.24;
        const targetRotX = py * 0.16;

        group.current.rotation.y = THREE.MathUtils.lerp(
          group.current.rotation.y,
          targetRotY,
          smooth
        );
        group.current.rotation.x = THREE.MathUtils.lerp(
          group.current.rotation.x,
          targetRotX,
          smooth
        );

        // Gentle magnetic spatial drift toward cursor (remember -X is screen right)
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
      {/* Delicate orbital champagne-gold halo ring */}
      <mesh ref={outerRing} position={[0, 0, -0.35]}>
        <torusGeometry args={[1.55, 0.012, 16, 96]} />
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
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Clock_Armature_13">
                <group name="Clock_Battery_2">
                  <mesh
                    name="Object_5"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_5.geometry}
                    material={materials.Clock_hook}
                  />
                </group>
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
                <group name="Clock_hooK_5">
                  <mesh
                    name="Object_12"
                    castShadow={castShadows}
                    receiveShadow={castShadows}
                    geometry={nodes.Object_12.geometry}
                    material={materials.Clock_hook}
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
