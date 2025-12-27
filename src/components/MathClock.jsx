// import React, { useRef, useEffect } from "react";
// import { useGLTF, Center } from "@react-three/drei";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { useMediaQuery } from "react-responsive";

// export function MathClock(props) {
//   const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
//   const isMobile = useMediaQuery({ maxWidth: 853 });
//   const group = useRef(null);
//   const { nodes, materials } = useGLTF("/models/MathClock.glb");

//   useEffect(() => {
//     if (materials.scene_material) {
//       materials.scene_material.transparent = true;
//       materials.scene_material.opacity = 0;
//     }
//   }, [materials.scene_material]);

//   useGSAP(
//     () => {
//       if (materials.scene_material) {
//         gsap.to(materials.scene_material, {
//           opacity: 1,
//           duration: 0.5,
//           delay: 0,
//           ease: "power3.out",
//         });
//       }
//     },
//     { scope: group }
//   );

//   return (
//     <group
//       ref={group}
//       {...props}
//       dispose={null}
//       scale={isMobile ? 0.4 : 0.3}
//       position={[1.875, isMobileMd ? 1.25 : isMobile ? 2.4 : 0.7, 1]}
//       rotation={[0, Math.PI / 1, 0]}
//     >
//       <group name="Sketchfab_Scene">
//         <group name="Sketchfab_model" position={[0, -0.128, 0.128]}>
//           <group name="root">
//             <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
//               <group name="Clock_Armature_13">
//                 <group name="Clock_Battery_2">
//                   <mesh
//                     name="Object_5"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_5.geometry}
//                     material={materials.Clock_hook}
//                   />
//                 </group>
//                 <group name="Clock_face_3">
//                   <mesh
//                     name="Object_7"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_7.geometry}
//                     material={materials.Clock_face}
//                   />
//                   <mesh
//                     name="Object_8"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_8.geometry}
//                     material={materials.Clock_Back}
//                   />
//                 </group>
//                 <group name="Clock_face_glass_4">
//                   <mesh
//                     name="Object_10"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_10.geometry}
//                     material={materials.Glass}
//                   />
//                 </group>
//                 <group name="Clock_hooK_5">
//                   <mesh
//                     name="Object_12"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_12.geometry}
//                     material={materials.Clock_hook}
//                   />
//                 </group>
//                 <group name="Knob_6">
//                   <mesh
//                     name="Object_14"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_14.geometry}
//                     material={materials.Clock_hands}
//                   />
//                   <mesh
//                     name="Object_15"
//                     castShadow
//                     receiveShadow
//                     geometry={nodes.Object_15.geometry}
//                     material={materials.Gold}
//                   />
//                 </group>
//                 <group
//                   name="Minute_hand_8"
//                   rotation={[-Math.PI / 2, 0, -0.002]}
//                 >
//                   <group name="Minute_hand_7" rotation={[Math.PI / 2, 0, 0]}>
//                     <mesh
//                       name="Object_18"
//                       castShadow
//                       receiveShadow
//                       geometry={nodes.Object_18.geometry}
//                       material={materials.Clock_hands}
//                     />
//                   </group>
//                 </group>
//                 <group name="Hour_hand_10" rotation={[-Math.PI / 2, 0, 0]}>
//                   <group name="Hour_hand_9" rotation={[Math.PI / 2, 0, 0]}>
//                     <mesh
//                       name="Object_21"
//                       castShadow
//                       receiveShadow
//                       geometry={nodes.Object_21.geometry}
//                       material={materials.Clock_hands}
//                     />
//                   </group>
//                 </group>
//                 <group
//                   name="Second_hand_12"
//                   rotation={[-Math.PI / 2, 0, -0.105]}
//                 >
//                   <group name="Second_hand_11" rotation={[Math.PI / 2, 0, 0]}>
//                     <mesh
//                       name="Object_24"
//                       castShadow
//                       receiveShadow
//                       geometry={nodes.Object_24.geometry}
//                       material={materials.Clock_hands}
//                     />
//                   </group>
//                 </group>
//               </group>
//             </group>
//           </group>
//         </group>
//       </group>
//     </group>
//   );
// }

// useGLTF.preload("/models/MathClock.glb");

import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";

export function MathClock(props) {
  // 1. Responsive Settings
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 853 });

  // 2. Refs for the group and hands
  const group = useRef(null);
  const hourHand = useRef(null);
  const minuteHand = useRef(null);
  const secondHand = useRef(null);

  // 3. Load the model
  const { scene, materials } = useGLTF("/models/MathClock.glb");

  // 4. Map the internal nodes to our refs once the model loads
  useMemo(() => {
    scene.traverse((obj) => {
      if (obj.name === "Hour_hand_10") hourHand.current = obj;
      if (obj.name === "Minute_hand_8") minuteHand.current = obj;
      if (obj.name === "Second_hand_12") secondHand.current = obj;
    });
  }, [scene]);

  // 5. GSAP Entrance Animation
  useEffect(() => {
    if (materials.scene_material) {
      materials.scene_material.transparent = true;
      materials.scene_material.opacity = 0;
    }
  }, [materials.scene_material]);

  useGSAP(
    () => {
      if (materials.scene_material) {
        gsap.to(materials.scene_material, {
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    },
    { scope: group }
  );

  // 6. The Clock Logic (useFrame runs 60fps)
  useFrame(() => {
    const now = new Date();
    
    // Calculate fractional values for smooth "sweeping" motion
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    // Based on the GLTF structure provided:
    // The hands need to rotate on the LOCAL Z-axis because of the 
    // root rotation [Math.PI/2, 0, 0] applied in the GLTF scene.
    if (secondHand.current) {
      secondHand.current.rotation.z = -(seconds / 60) * Math.PI * 2;
    }
    if (minuteHand.current) {
      minuteHand.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    }
    if (hourHand.current) {
      hourHand.current.rotation.z = -(hours / 12) * Math.PI * 2;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={isMobile ? 0.6 : 0.3}
      // Using your original responsive position logic
      position={[0, isMobileMd ? 1.25 : isMobile ? 2.4 : 0.7, 0]}
      // Rotating the group 180 degrees so the clock faces the camera
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

// Preload the model to prevent lag
useGLTF.preload("/models/MathClock.glb");