import React, { useRef, useEffect } from "react";
import { useGLTF, Center } from "@react-three/drei"; // Import Center
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";

export function CodeM(props) {
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const group = useRef(null);
  const { nodes, materials } = useGLTF("/models/CodeM.glb");

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
          duration: 0.5,
          delay: 0,
          ease: "power3.out",
        });
      }
    },
    { scope: group }
  );

  return (
    <group
      {...props}
      ref={group}
      dispose={null}
      scale={isMobile ? 0.4 : 0.2}
      position={[-1.875, isMobileMd ? 1.25 : isMobile ? 2.4 : 0.7, 1]}
      rotation={[0, Math.PI / 1, 0]}
    >
      <Center>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_2.geometry}
            material={materials.scene_material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_3.geometry}
            material={materials.scene_material}
          />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload("/models/CodeM.glb");