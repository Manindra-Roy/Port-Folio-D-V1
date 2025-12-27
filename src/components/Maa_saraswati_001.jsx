import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMediaQuery } from "react-responsive";

export function Maa_saraswati_001(props) {
  const isMobileMd = useMediaQuery({ minWidth: 641, maxWidth: 768 });
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const group = useRef(null);
  const { nodes, materials } = useGLTF("/models/Maa_saraswati_001.glb");

  useEffect(() => {
    if (materials.lambert1) {
      materials.lambert1.transparent = true;
    }
  }, [materials.lambert1]);

  useGSAP(
    () => {
      if (group.current) {
        gsap.from(group.current.children[0].material, {
          opacity: 0,
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
      dispose={null}
      scale={isMobile ? 1.75 : 1 }
      position={[0, isMobileMd ? 1.25 : isMobile ? 2.25 : 0.6, 0]}
      rotation={[0, Math.PI / 1, 0]}
    >
      <group scale={0.01}>
        <group scale={[100, 100, 213.636]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_1.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_2.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_3.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_4.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_5.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_6.geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane_Material_0_7.geometry}
            material={materials.Material}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Maa_saraswati_001.glb");
