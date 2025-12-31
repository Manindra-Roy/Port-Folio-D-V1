import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";

export function MathClock(props) {
  // 1. Responsive Checks
  const isMobileXs = useMediaQuery({ maxWidth: 360 });
  const isMobileSm = useMediaQuery({ minWidth: 361, maxWidth: 640 });
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const isDeviceLg = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDeviceXl = useMediaQuery({ minWidth: 1025, maxWidth: 1280 });

  // 2. Load Model Data
  const { nodes, materials } = useGLTF("/models/MathClock.glb");

  // 3. Refs for Animation
  const group = useRef(null);
  const hourHand = useRef(null);
  const minuteHand = useRef(null);
  const secondHand = useRef(null);

  // 4. GSAP Entrance Animation
  useGSAP(
    () => {
      if (materials.scene_material) {
        materials.scene_material.transparent = true;
        materials.scene_material.opacity = 0;

        gsap.to(materials.scene_material, {
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    },
    { scope: group, dependencies: [materials.scene_material] }
  );

  // 5. MATERIAL TEXT GLOW FIX
  useEffect(() => {
    const mat = materials.Clock_face;

    if (mat) {
      // Step A: Use the existing texture as the "Glow Mask"
      // This ensures ONLY the white text glows, not the black background.
      mat.emissiveMap = mat.map;

      // Step B: Set the glow color
      mat.emissive.set("white");

      // Step C: Brightness intensity (Increase this if text is still dim)
      mat.emissiveIntensity = 1.5;

      // Step D: Ensure background stays matte black
      mat.roughness = 1;
      mat.metalness = 0;

      // Force update the material
      mat.needsUpdate = true;
    }

    // Optional: Slight visibility boost for hands
    if (materials.Clock_hands) {
      materials.Clock_hands.emissive.set("#dddddd");
      materials.Clock_hands.emissiveIntensity = 0.5;
    }
  }, [materials]);

  // 6. Optimized Animation Loop
  useFrame(() => {
    const now = new Date();

    // Smooth rotation calculation
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
  });

  // Performance: Disable casting shadows on mobile
  const castShadows = !isMobile;

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={
        isMobileXs
          ? 1.5
          : isMobileSm
          ? 1.5
          : isMobileMd
          ? 1
          : isDeviceLg
          ? 1.5
          : // : isMobile
            // ? 0.7
            0.3
      }
      position={[
        0,
        isMobileXs
          ? 0
          : isMobileSm
          ? 0
          : isMobileMd
          ? 0
          : isDeviceLg
          ? 0
          : // : isMobile
            // ? 2.55
            0.7,
        0,
      ]}
      rotation={[0, Math.PI, 0]}
    >
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" position={[0, -0.128, 0.128]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Clock_Armature_13">
                {/* Static Parts */}
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
