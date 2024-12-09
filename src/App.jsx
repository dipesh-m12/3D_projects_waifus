import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useThree, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three-stdlib";
import {
  SpotLightHelper,
  PointLightHelper,
  AxesHelper,
  CameraHelper,
} from "three";

const useShadowConfig = (scene) => {
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [scene]);
};

const Model = React.memo(({ position, rotation, scale, castShadow }) => {
  const gltf = useLoader(GLTFLoader, "/nami/scene.gltf");
  const modelRef = useRef();

  // Apply shadow configuration
  useShadowConfig(gltf.scene);

  // Rotate the model
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
    />
  );
});

const StaticPointLight = React.memo(() => {
  const lightRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const helper = new PointLightHelper(lightRef.current, 0.5);
    // scene.add(helper);
    return () => {
      scene.remove(helper);
      helper.dispose();
    };
  }, [scene]);

  return (
    <pointLight
      ref={lightRef}
      castShadow
      position={[3, 6, 3]}
      intensity={30}
      color="#ffffff"
    />
  );
});

const StaticSpotLight = React.memo(() => {
  const lightRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const helper = new SpotLightHelper(lightRef.current);
    // scene.add(helper);
    return () => {
      scene.remove(helper);
      helper.dispose();
    };
  }, [scene]);

  return (
    <spotLight
      ref={lightRef}
      position={[0, 10, 10]}
      angle={Math.PI / 6}
      penumbra={0.5}
      intensity={350}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.001}
    />
  );
});

const SceneHelpers = React.memo(() => {
  const { scene, camera } = useThree();

  useEffect(() => {
    const axesHelper = new AxesHelper(5);
    const cameraHelper = new CameraHelper(camera);

    scene.add(axesHelper, cameraHelper);

    return () => {
      scene.remove(axesHelper, cameraHelper);
      axesHelper.dispose();
      cameraHelper.dispose();
    };
  }, [scene, camera]);

  return null;
});

const ShadowPlane = React.memo(() => {
  const planeGeometry = useMemo(() => <planeGeometry args={[100, 100]} />, []);
  const material = useMemo(() => <meshStandardMaterial color="#ffffff" />, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8.1, 0]} receiveShadow>
      {planeGeometry}
      {material}
    </mesh>
  );
});

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Canvas
        shadows
        style={{ backgroundColor: "#000000" }}
        camera={{ position: [0, 3, 13], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Environment files="/spaceSky.exr" background />
          <Model
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            castShadow={true}
          />
        </Suspense>
        <ShadowPlane />
        <StaticSpotLight />
        <StaticPointLight />
        {/* <SceneHelpers /> */}
        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={5}
          maxDistance={30}
          minPolarAngle={0.5}
          maxPolarAngle={2.5}
        />
      </Canvas>
    </div>
  );
}

export default App;
